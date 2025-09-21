package com.sentinova.backend.controller;

import com.sentinova.backend.model.Article;
import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.repository.ArticleRepository;
import com.sentinova.backend.repository.SentimentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import java.util.Map;

/**
 * Single-purpose endpoint to fetch the latest sentiment for an article.
 * Non-destructive — only reads from DB.
 */
@RestController
@RequestMapping("/api/articles")
public class ArticleSentimentController {

    private final ArticleRepository articleRepository;
    private final SentimentRepository sentimentRepository;

    public ArticleSentimentController(ArticleRepository articleRepository,
                                      SentimentRepository sentimentRepository) {
        this.articleRepository = articleRepository;
        this.sentimentRepository = sentimentRepository;
    }

    /**
     * GET /api/articles/{id}/sentiment
     * Returns latest sentiment for an article id (UUID).
     *
     * Example responses:
     *  - 200 OK -> { "label": "Positive", "score": 0.75 }
     *  - 404 Not Found -> { "error":"article not found" } or { "error":"no sentiment found" }
     */
    @GetMapping("/{id}/sentiment")
    public ResponseEntity<?> getLatestSentiment(@PathVariable("id") UUID id) {
        Optional<Article> aOpt = articleRepository.findById(id);
        if (aOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "article not found"));
        }

        Article article = aOpt.get();
        Optional<Sentiment> sOpt = sentimentRepository.findTopByArticleOrderByCreatedAtDesc(article);

        if (sOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "no sentiment found for this article"));
        }

        Sentiment s = sOpt.get();
        // return only required fields
        return ResponseEntity.ok(Map.of(
                "label", s.getSentimentLabel(),
                "score", s.getSentimentScore()
        ));
    }
}
