package com.sentinova.backend.service;

import com.sentinova.backend.model.Article;
import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.service.SentimentService.SentimentResult;
import com.sentinova.backend.repository.ArticleRepository;
import com.sentinova.backend.repository.SentimentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Sinks;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Polls NewsAPI, saves/updates Article entities and creates Sentiment entities using SentimentService.
 *
 * Changes in this version:
 *  - Do NOT assign UUID manually to Sentiment (let DB / JPA generate it). Manual setId was causing Hibernate
 *    to treat the entity as detached/merge target and produced StaleObjectStateException.
 *  - Normalize sentiment labels to "Positive" / "Negative" / "Neutral" before saving.
 *  - Tolerant error-handling around sentiment saving.
 */
@Service
public class NewsPollingService {

    private final ArticleRepository articleRepository;
    private final SentimentRepository sentimentRepository;
    private final WebClient webClient;
    private final Sinks.Many<Article> sink;
    private final SentimentService sentimentService;

    @Value("${newsapi.url}")
    private String newsApiUrl;

    @Value("${newsapi.key}")
    private String newsApiKey;

    @Value("${news.poll.maxArticlesPerPoll:50}")
    private int maxArticlesPerPoll;

    @Value("${app.polling.enabled:true}")
    private boolean pollingEnabled;

    public NewsPollingService(ArticleRepository articleRepository,
                              SentimentRepository sentimentRepository,
                              SentimentService sentimentService,
                              WebClient.Builder webClientBuilder) {
        this.articleRepository = articleRepository;
        this.sentimentRepository = sentimentRepository;
        this.sentimentService = sentimentService;
        this.webClient = webClientBuilder.build();
        this.sink = Sinks.many().multicast().onBackpressureBuffer();
    }

    public reactor.core.publisher.Flux<Article> getFlux() {
        return sink.asFlux();
    }

    @Scheduled(fixedDelayString = "${news.poll.interval.ms:45000}")
    public void pollNews() {
        if (!pollingEnabled) {
            System.out.println("ℹ️ Polling disabled via app.polling.enabled=false");
            return;
        }

        try {
            String url = newsApiUrl;
            if (url == null || url.isBlank()) {
                System.err.println("⚠️ newsapi.url is not configured.");
                return;
            }

            if (!url.contains("apiKey=") && newsApiKey != null && !newsApiKey.isBlank()) {
                url += (url.contains("?") ? "&" : "?") + "apiKey=" + newsApiKey;
            }

            Map response = webClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                System.err.println("⚠️ NewsAPI returned null response.");
                return;
            }

            System.out.println("🔍 NewsAPI raw response: status=" + response.get("status")
                    + ", totalResults=" + response.get("totalResults"));

            Object articlesObj = response.get("articles");
            if (!(articlesObj instanceof List)) {
                System.err.println("⚠️ NewsAPI response missing 'articles' array or it's not a list.");
                System.out.println("Raw response: " + response);
                return;
            }

            List<Map<String, Object>> articles = (List<Map<String, Object>>) articlesObj;

            int processed = 0;
            int index = 0;

            for (Map<String, Object> a : articles) {
                index++;
                if (processed >= maxArticlesPerPoll) break;

                try {
                    if (a == null) {
                        System.out.println("[" + index + "] skipped: article object null");
                        continue;
                    }

                    String articleUrl = safeToString(a.get("url"));
                    if (articleUrl.isBlank()) {
                        System.out.println("[" + index + "] skipped: url blank");
                        continue;
                    }

                    // Find existing or create new
                    Optional<Article> existingOpt = articleRepository.findByUrl(articleUrl);
                    Article article;
                    boolean isNew;

                    if (existingOpt.isPresent()) {
                        article = existingOpt.get();
                        isNew = false;
                    } else {
                        article = new Article();
                        article.setUrl(articleUrl);
                        isNew = true;
                    }

                    // Update fields (new or existing)
                    article.setTitle(safeToString(a.get("title"), "No title"));
                    String description = safeToString(a.get("description"));
                    article.setSummary(description);
                    String content = safeToString(a.get("content"), description);
                    article.setContent(content);

                    String imageUrl = safeToString(a.get("urlToImage"));
                    if (!imageUrl.isBlank()) {
                        article.setImageUrl(imageUrl);
                    }

                    Object srcObj = a.get("source");
                    if (srcObj instanceof Map<?, ?> srcMap) {
                        article.setSource(safeToString(srcMap.get("name")));
                    } else {
                        article.setSource("");
                    }

                    // category might not be present in NewsAPI; keep existing if blank
                    String category = safeToString(a.get("category"));
                    if (!category.isBlank()) {
                        article.setCategory(category);
                    } else if (article.getCategory() == null) {
                        article.setCategory("General");
                    }

                    String publishedAt = safeToString(a.get("publishedAt"));
                    if (!publishedAt.isBlank()) {
                        try {
                            article.setPublishedAt(OffsetDateTime.parse(publishedAt));
                        } catch (Exception ex) {
                            article.setPublishedAt(OffsetDateTime.now());
                        }
                    } else if (article.getPublishedAt() == null) {
                        article.setPublishedAt(OffsetDateTime.now());
                    }

                    article.setFetchedAt(OffsetDateTime.now());

                    // Save or update
                    Article saved = articleRepository.save(article);

                    if (isNew) {
                        System.out.println("[" + index + "] ✅ NEW article saved: '" + saved.getTitle() + "'");
                    } else {
                        System.out.println("[" + index + "] ♻️ UPDATED existing article: '" + saved.getTitle() + "'");
                    }

                    // Sentiment analysis (best-effort)
                    try {
                        SentimentResult sr = sentimentService.analyzeText(
                                (saved.getTitle() == null ? "" : saved.getTitle()) + ". " +
                                        (saved.getContent() == null ? "" : saved.getContent())
                        );

                        if (sr != null) {
                            // IMPORTANT: DO NOT set an ID manually. Let DB/JPA generate it (gen_random_uuid()).
                            Sentiment sentimentEntity = new Sentiment();
                            sentimentEntity.setArticle(saved);
                            sentimentEntity.setLabel(normalizeLabel(sr.getLabel()));
                            Double score = sr.getScore() != null ? sr.getScore() : 0.0;
                            sentimentEntity.setScore(score);
                            sentimentEntity.setCreatedAt(OffsetDateTime.now());

                            // Persist
                            sentimentRepository.save(sentimentEntity);

                            System.out.println("   ↳ Sentiment saved: " + sentimentEntity.getLabel() + " (" + sentimentEntity.getScore() + ")");
                        } else {
                            System.out.println("   ↳ Sentiment service returned null for this article.");
                        }
                    } catch (Exception se) {
                        System.err.println("⚠️ Sentiment analysis failed for article: " + saved.getTitle());
                        se.printStackTrace();
                    }

                    // Emit for SSE - best-effort (won't block polling)
                    try {
                        sink.tryEmitNext(saved);
                    } catch (Exception emitEx) {
                        System.err.println("⚠️ SSE emit failed: " + emitEx.getMessage());
                    }

                    processed++;

                } catch (Exception e) {
                    System.err.println("⚠️ Error processing article index " + index + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }

            System.out.println("✅ Poll cycle finished. Articles processed: " + processed);

        } catch (Exception e) {
            System.err.println("❌ Top-level polling error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // --- helpers ---
    private static String safeToString(Object obj) {
        return obj != null ? obj.toString().trim() : "";
    }

    private static String safeToString(Object obj, String fallback) {
        return obj != null ? obj.toString().trim() : fallback;
    }

    /**
     * Normalize various sentiment label shapes into a simple Positive/Negative/Neutral set.
     * Accepts variants like "Very positive", "Positive", "POSITIVE", "neg", etc.
     */
    private static String normalizeLabel(String raw) {
        if (raw == null) return "Neutral";
        String s = raw.trim().toLowerCase();
        if (s.contains("pos") || s.contains("very positive") || s.contains("positive")) return "Positive";
        if (s.contains("neg") || s.contains("very negative") || s.contains("negative")) return "Negative";
        // fallback: treat numeric or borderline values as Neutral if unclear
        if (s.matches("^[0-9]*(\\.[0-9]+)?$")) {
            try {
                double v = Double.parseDouble(s);
                if (v >= 0.66) return "Positive";
                if (v <= 0.33) return "Negative";
            } catch (Exception ignored) {}
        }
        return "Neutral";
    }
}
