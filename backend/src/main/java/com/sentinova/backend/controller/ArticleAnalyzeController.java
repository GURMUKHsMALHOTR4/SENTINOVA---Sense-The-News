package com.sentinova.backend.controller;

import com.sentinova.backend.model.Article;
import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.repository.ArticleRepository;
import com.sentinova.backend.repository.SentimentRepository;
import com.sentinova.backend.service.SentimentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * One-off analyzer endpoint: POST /api/articles/{id}/analyze
 * - runs SentimentService on the article's title + content
 * - upserts (updates latest or inserts new) a row in sentiments
 * - returns the saved sentiment as JSON { "label": "...", "score": 0.x }
 *
 * Safe: it only writes a single sentiment row (or updates the existing latest),
 * non-destructive to other data.
 */
@RestController
@RequestMapping("/api/articles")
public class ArticleAnalyzeController {

    private final ArticleRepository articleRepository;
    private final SentimentRepository sentimentRepository;
    private final SentimentService sentimentService;

    public ArticleAnalyzeController(ArticleRepository articleRepository,
                                    SentimentRepository sentimentRepository,
                                    SentimentService sentimentService) {
        this.articleRepository = articleRepository;
        this.sentimentRepository = sentimentRepository;
        this.sentimentService = sentimentService;
    }

    /**
     * Trigger analysis for a single article and save/return the sentiment.
     * POST /api/articles/{id}/analyze
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeArticle(@PathVariable("id") UUID id) {
        Optional<Article> aOpt = articleRepository.findById(id);
        if (aOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "article not found"));
        }
        Article article = aOpt.get();

        // build text to analyze
        String textToAnalyze = (article.getTitle() == null ? "" : article.getTitle()) + ". "
                + (article.getContent() == null ? "" : article.getContent());

        // run sentiment analysis
        SentimentService.SentimentResult sr;
        try {
            sr = sentimentService.analyzeText(textToAnalyze);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "sentiment analysis failed", "details", e.getMessage()));
        }

        if (sr == null) {
            return ResponseEntity.status(500).body(Map.of("error", "sentiment service returned null"));
        }

        // upsert: update latest sentiment for this article if exists, otherwise insert
        try {
            Optional<Sentiment> existingOpt = sentimentRepository.findTopByArticleOrderByCreatedAtDesc(article);

            Sentiment saved;
            if (existingOpt.isPresent()) {
                Sentiment s = existingOpt.get();
                s.setLabel(sr.getLabel());           // DB column name: label
                s.setScore(sr.getScore());           // DB column name: score
                s.setCreatedAt(OffsetDateTime.now());
                saved = sentimentRepository.save(s);
            } else {
                Sentiment s = new Sentiment();
                s.setId(UUID.randomUUID());
                s.setArticle(article);
                s.setLabel(sr.getLabel());
                s.setScore(sr.getScore());
                s.setCreatedAt(OffsetDateTime.now());
                saved = sentimentRepository.save(s);
            }

            return ResponseEntity.ok(Map.of(
                    "label", saved.getLabel(),
                    "score", saved.getScore()
            ));
        } catch (Exception dbEx) {
            dbEx.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "failed to save sentiment", "details", dbEx.getMessage()));
        }
    }
}
