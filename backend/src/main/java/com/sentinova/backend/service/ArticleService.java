package com.sentinova.backend.service;

import com.sentinova.backend.model.Article;
import com.sentinova.backend.repository.ArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Service responsible for upserting articles fetched from remote providers.
 *
 * Notes:
 *  - This class accepts an incoming imageUrl and will persist it if it is a valid http/https URL.
 *  - It will not overwrite an existing DB imageUrl with an invalid incoming URL.
 */
@Service
public class ArticleService {

    private static final Logger log = LoggerFactory.getLogger(ArticleService.class);

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    /**
     * Validate remote URL to avoid storing placeholders (example.com, about:blank, #, empty)
     */
    private boolean isValidExternalUrl(String urlStr) {
        if (!StringUtils.hasText(urlStr)) return false;
        String trimmed = urlStr.trim();
        String lower = trimmed.toLowerCase();
        if (lower.equals("#") || lower.equals("about:blank")) return false;
        if (lower.contains("example.com")) return false; // avoid example domain
        try {
            URL url = new URL(trimmed); // throws if not a valid URL
            String protocol = url.getProtocol();
            return "http".equalsIgnoreCase(protocol) || "https".equalsIgnoreCase(protocol);
        } catch (MalformedURLException e) {
            return false;
        }
    }

    /**
     * Upsert article by URL when possible. If URL is missing or invalid, try to upsert by title+source.
     * This method also sets fetchedAt/publishedAt safely.
     *
     * NEW: accepts imageUrl (e.g., urlToImage from NewsAPI). If provided and valid (http/https), it will be saved.
     *
     * Parameter order:
     *  (remoteId, title, remoteUrl, source, category, summary, content, publishedAt, fetchedAt, imageUrl)
     */
    @Transactional
    public Article upsertFromRemote(
            String remoteId, // optional remote id if available
            String title,
            String remoteUrl,
            String source,
            String category,
            String summary,
            String content,
            OffsetDateTime publishedAt,
            OffsetDateTime fetchedAt,
            String imageUrl
    ) {
        // Normalize input strings (trim)
        String normalizedRemoteUrl = StringUtils.hasText(remoteUrl) ? remoteUrl.trim() : null;
        String normalizedImageUrl = StringUtils.hasText(imageUrl) ? imageUrl.trim() : null;
        String normalizedTitle = StringUtils.hasText(title) ? title.trim() : null;
        String normalizedSource = StringUtils.hasText(source) ? source.trim() : null;
        String normalizedCategory = StringUtils.hasText(category) ? category.trim() : null;

        // prefer to match by URL when valid
        Article article = null;
        if (normalizedRemoteUrl != null && isValidExternalUrl(normalizedRemoteUrl)) {
            Optional<Article> byUrl = articleRepository.findByUrl(normalizedRemoteUrl);
            if (byUrl.isPresent()) {
                article = byUrl.get();
            }
        }

        // fallback: try to find by title+source (avoid duplicates)
        if (article == null && normalizedTitle != null && normalizedSource != null) {
            Optional<Article> byTitle = articleRepository.findAll()
                    .stream()
                    .filter(a -> normalizedTitle.equalsIgnoreCase(a.getTitle()) && normalizedSource.equalsIgnoreCase(a.getSource()))
                    .findFirst();
            if (byTitle.isPresent()) article = byTitle.get();
        }

        // final fallback: create new
        if (article == null) article = new Article();

        // Only set URL if remote URL is valid OR currently unset (but do NOT set placeholder)
        if (normalizedRemoteUrl != null && isValidExternalUrl(normalizedRemoteUrl)) {
            article.setUrl(normalizedRemoteUrl);
        } else {
            // if current DB url is null, leave it null (prefer no URL to example.com placeholder)
            if (article.getUrl() == null || article.getUrl().isEmpty()) {
                article.setUrl(null);
            }
        }

        // update fields (careful with overwriting)
        if (normalizedTitle != null) article.setTitle(normalizedTitle);
        if (normalizedSource != null) article.setSource(normalizedSource);
        if (normalizedCategory != null) article.setCategory(normalizedCategory);
        if (StringUtils.hasText(summary)) article.setSummary(summary);
        if (StringUtils.hasText(content)) article.setContent(content);

        if (publishedAt != null) article.setPublishedAt(publishedAt);
        // always set latest fetchedAt
        article.setFetchedAt(fetchedAt != null ? fetchedAt : OffsetDateTime.now());

        // Set imageUrl only if it's a valid external URL (avoid placeholders)
        if (normalizedImageUrl != null) {
            if (isValidExternalUrl(normalizedImageUrl)) {
                article.setImageUrl(normalizedImageUrl);
                log.debug("Saved imageUrl for article (title='{}'): {}", article.getTitle(), normalizedImageUrl);
            } else {
                log.debug("Rejected invalid incoming imageUrl for '{}': {}", article.getTitle(), normalizedImageUrl);
                // intentional: do not overwrite existing DB imageUrl with an invalid incoming url
            }
        }

        // ensure we persist
        Article saved = articleRepository.save(article);
        log.debug("Upserted article (id={}, title='{}', url={})", saved.getId(), saved.getTitle(), saved.getUrl());
        return saved;
    }

    /**
     * Backwards-compatible overload for callers that still use the old signature.
     * Delegates to the new method with imageUrl = null.
     */
    @Transactional
    public Article upsertFromRemote(
            String remoteId,
            String title,
            String remoteUrl,
            String source,
            String category,
            String summary,
            String content,
            OffsetDateTime publishedAt,
            OffsetDateTime fetchedAt
    ) {
        return upsertFromRemote(remoteId, title, remoteUrl, source, category, summary, content, publishedAt, fetchedAt, null);
    }

    public Optional<Article> findById(java.util.UUID id) {
        return articleRepository.findById(id);
    }
}
