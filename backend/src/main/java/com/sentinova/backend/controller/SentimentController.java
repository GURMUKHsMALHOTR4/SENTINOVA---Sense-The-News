package com.sentinova.backend.controller;

import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.model.Article;
import com.sentinova.backend.repository.SentimentRepository;
import com.sentinova.backend.repository.ArticleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/sentiments")
public class SentimentController {

    private final SentimentRepository sentimentRepository;
    private final ArticleRepository articleRepository;

    public SentimentController(SentimentRepository sentimentRepository, ArticleRepository articleRepository) {
        this.sentimentRepository = sentimentRepository;
        this.articleRepository = articleRepository;
    }

    // ✅ POST /api/sentiments
    @PostMapping
    public ResponseEntity<?> create(@RequestParam UUID articleId,
                                    @RequestParam String sentimentLabel,
                                    @RequestParam Double sentimentScore) {
        // check article exists
        Optional<Article> articleOpt = articleRepository.findById(articleId);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Article with id " + articleId + " does not exist");
        }

        // build new sentiment
        Sentiment sentiment = new Sentiment(articleOpt.get(), sentimentLabel, sentimentScore);
        Sentiment saved = sentimentRepository.save(sentiment);

        return ResponseEntity.ok(saved);
    }

    // ✅ GET /api/sentiments/article/{articleId}
    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<Sentiment>> getByArticle(@PathVariable UUID articleId) {
        List<Sentiment> list = sentimentRepository.findByArticleIdOrderByCreatedAtDesc(articleId);
        return ResponseEntity.ok(list);
    }
}
