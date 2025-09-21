package com.sentinova.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Robust NewsFetcher:
 *  - Maps `urlToImage` -> imageUrl and returns a list of RemoteArticleDto
 *  - Handles 429 Too Many Requests by inspecting Retry-After and backing off
 *  - Uses raw status codes to avoid HttpStatusCode -> HttpStatus mismatch
 *
 * Configure your API key in application.properties as:
 *   newsapi.key=YOUR_KEY
 */
@Component
public class NewsFetcher {

    private static final Logger log = LoggerFactory.getLogger(NewsFetcher.class);

    private final ArticleService articleService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${newsapi.key:}")
    private String newsApiKey;

    // Endpoint and defaults
    private static final String NEWSAPI_ENDPOINT = "https://newsapi.org/v2/top-headlines";
    private static final int DEFAULT_PAGE_SIZE = 20; // reduce to avoid hitting rate limits
    private static final int MAX_RETRIES = 3;
    private static final long BASE_BACKOFF_MS = 1000L; // exponential backoff base

    public NewsFetcher(ArticleService articleService) {
        this.articleService = articleService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Public method to fetch & save latest articles.
     */
    public void fetchAndSaveLatest() {
        List<RemoteArticleDto> remoteList = fetchFromProvider();

        if (remoteList == null || remoteList.isEmpty()) {
            log.info("No remote articles returned from provider (empty or rate-limited).");
            return;
        }

        log.info("Fetched {} remote articles. Upserting...", remoteList.size());

        for (RemoteArticleDto r : remoteList) {
            try {
                OffsetDateTime pub = r.getPublishedAt(); // may be null
                OffsetDateTime fetched = OffsetDateTime.now();

                articleService.upsertFromRemote(
                    /* remoteId */ null,
                    r.getTitle(),
                    r.getUrl(),
                    r.getSource(),
                    r.getCategory(),
                    r.getSummary(),
                    r.getContent(),
                    pub,
                    fetched,
                    r.getImageUrl()
                );
            } catch (Exception ex) {
                log.warn("Failed to upsert article '{}' from provider: {}", r.getTitle(), ex.getMessage(), ex);
            }
        }

        log.info("Upsert complete.");
    }

    /**
     * Calls NewsAPI.org and maps results into RemoteArticleDto list.
     * Gracefully handles 429 responses and returns an empty list if rate-limited or on error.
     */
    private List<RemoteArticleDto> fetchFromProvider() {
        List<RemoteArticleDto> list = new ArrayList<>();

        if (newsApiKey == null || newsApiKey.trim().isEmpty()) {
            log.warn("newsapi.key is not configured. Please add it to application.properties (newsapi.key=YOUR_KEY).");
            return list;
        }

        String url = NEWSAPI_ENDPOINT + "?pageSize=" + DEFAULT_PAGE_SIZE;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", newsApiKey.trim());
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.USER_AGENT, "SentinovaNewsFetcher/1.0");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        int attempt = 0;
        while (attempt < MAX_RETRIES) {
            attempt++;
            try {
                ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

                if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) {
                    log.warn("NewsAPI responded with status {}. Body empty? {}", resp.getStatusCode(), resp.getBody() == null);
                    // if it's 429 it would have thrown HttpStatusCodeException; handle other non-OK by returning empty
                    return list;
                }

                JsonNode root = objectMapper.readTree(resp.getBody());
                JsonNode articles = root.path("articles");
                if (!articles.isArray()) {
                    log.warn("NewsAPI response missing 'articles' array.");
                    return list;
                }

                for (JsonNode n : articles) {
                    try {
                        RemoteArticleDto dto = new RemoteArticleDto();

                        JsonNode titleNode = n.path("title");
                        if (!titleNode.isMissingNode() && !titleNode.isNull()) dto.setTitle(titleNode.asText());

                        JsonNode urlNode = n.path("url");
                        if (!urlNode.isMissingNode() && !urlNode.isNull()) dto.setUrl(urlNode.asText());

                        JsonNode sourceNode = n.path("source").path("name");
                        if (!sourceNode.isMissingNode() && !sourceNode.isNull()) dto.setSource(sourceNode.asText());

                        JsonNode descNode = n.path("description");
                        if (!descNode.isMissingNode() && !descNode.isNull()) dto.setSummary(descNode.asText());

                        JsonNode contentNode = n.path("content");
                        if (!contentNode.isMissingNode() && !contentNode.isNull()) dto.setContent(contentNode.asText());

                        JsonNode publishedAtNode = n.path("publishedAt");
                        if (!publishedAtNode.isMissingNode() && !publishedAtNode.isNull()) {
                            String publishedAtText = publishedAtNode.asText();
                            try {
                                dto.setPublishedAt(OffsetDateTime.parse(publishedAtText));
                            } catch (DateTimeParseException ex) {
                                log.debug("Failed to parse publishedAt '{}' for article '{}': {}", publishedAtText, dto.getTitle(), ex.getMessage());
                            }
                        }

                        // urlToImage -> imageUrl
                        JsonNode imageNode = n.path("urlToImage");
                        if (!imageNode.isMissingNode() && !imageNode.isNull()) dto.setImageUrl(imageNode.asText());

                        dto.setCategory("General");

                        if ((dto.getTitle() != null && !dto.getTitle().isEmpty())) {
                            list.add(dto);
                        }
                    } catch (Exception inner) {
                        log.warn("Failed to map one article from NewsAPI: {}", inner.getMessage(), inner);
                    }
                }

                // successful fetch -> return list
                return list;

            } catch (HttpStatusCodeException ex) {
                // Use raw int code to avoid HttpStatusCode -> HttpStatus mismatch across Spring versions
                int rawStatus = ex.getRawStatusCode();
                log.warn("NewsAPI HTTP error (attempt {}/{}): {} - {}", attempt, MAX_RETRIES, rawStatus, ex.getStatusText());

                // If rate-limited, look for Retry-After and back off
                if (rawStatus == HttpStatus.TOO_MANY_REQUESTS.value()) {
                    String retryAfter = ex.getResponseHeaders() != null ? ex.getResponseHeaders().getFirst("Retry-After") : null;
                    long waitMs = computeBackoffMs(attempt);
                    if (retryAfter != null) {
                        try {
                            // Retry-After may be seconds or HTTP-date. try parse as seconds first.
                            long seconds = Long.parseLong(retryAfter);
                            waitMs = Math.max(waitMs, TimeUnit.SECONDS.toMillis(seconds));
                        } catch (NumberFormatException ignored) {
                            // ignore parse failure (we'll use exponential backoff)
                        }
                    }
                    log.warn("Rate limited by provider. Waiting {} ms before next attempt (Retry-After: {}).", waitMs, retryAfter);
                    try {
                        Thread.sleep(waitMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.warn("Interrupted while waiting to retry NewsAPI");
                        return list;
                    }
                    // retry loop continues
                } else if (rawStatus >= 500 && rawStatus < 600) {
                    // server error: backoff then retry
                    long waitMs = computeBackoffMs(attempt);
                    log.warn("Server error from NewsAPI ({}). Backing off {} ms before retry.", rawStatus, waitMs);
                    try {
                        Thread.sleep(waitMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return list;
                    }
                } else {
                    // other client errors (4xx) - don't retry
                    log.warn("Non-retryable HTTP error from NewsAPI: {} - returning empty list.", rawStatus);
                    return list;
                }
            } catch (Exception ex) {
                // network or JSON parse errors - backoff and retry limited times
                long waitMs = computeBackoffMs(attempt);
                log.warn("Error fetching news (attempt {}/{}): {}. Backing off {} ms", attempt, MAX_RETRIES, ex.getMessage(), waitMs);
                try {
                    Thread.sleep(waitMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return list;
                }
            }
        }

        log.warn("Exceeded max retries ({}) when calling NewsAPI. Returning empty list.", MAX_RETRIES);
        return list;
    }

    private static long computeBackoffMs(int attempt) {
        // exponential backoff: base * 2^(attempt-1)
        return BASE_BACKOFF_MS * (1L << Math.max(0, attempt - 1));
    }

    /**
     * Simple DTO used to map provider fields.
     */
    public static class RemoteArticleDto {
        private String title;
        private String url;
        private String source;
        private String category;
        private String summary;
        private String content;
        private OffsetDateTime publishedAt;
        private String imageUrl;

        public RemoteArticleDto() {}

        // getters / setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public OffsetDateTime getPublishedAt() { return publishedAt; }
        public void setPublishedAt(OffsetDateTime publishedAt) { this.publishedAt = publishedAt; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}
