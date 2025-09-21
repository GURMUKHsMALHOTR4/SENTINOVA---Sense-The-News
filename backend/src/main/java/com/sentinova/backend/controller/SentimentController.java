package com.sentinova.backend.controller;

import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.model.Article;
import com.sentinova.backend.repository.SentimentRepository;
import com.sentinova.backend.repository.ArticleRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sentiments")
@CrossOrigin(origins = "*") // allow all origins for testing
public class SentimentController {

    private final SentimentRepository sentimentRepository;
    private final ArticleRepository articleRepository;

    public SentimentController(SentimentRepository sentimentRepository, ArticleRepository articleRepository) {
        this.sentimentRepository = sentimentRepository;
        this.articleRepository = articleRepository;
    }

    // ---------- Health ----------
    @GetMapping("/health")
    public Map<String, String> health() {
        return Collections.singletonMap("status", "UP");
    }

    // ---------- List all ----------
    @GetMapping
    public ResponseEntity<?> listAll() {
        return ResponseEntity.ok(sentimentRepository.findAll());
    }

    // ---------- Get by id ----------
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return sentimentRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok) // returns ResponseEntity<Sentiment>
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("error", "Sentiment not found for id: " + id))); // returns ResponseEntity<Map>
    }

    // ---------- Analyze (returns label + score; optionally saves if articleId provided) ----------
    @PostMapping(path = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> analyzeAndMaybeSave(@RequestBody Map<String, Object> payload) {
        String text = payload.getOrDefault("text", "").toString();
        String articleIdStr = payload.get("articleId") != null ? payload.get("articleId").toString() : null;

        // simple rule-based analysis
        String label = "NEUTRAL";
        double score = 0.5;
        if (!text.isBlank()) {
            String lower = text.toLowerCase(Locale.ROOT);
            if (lower.contains("good") || lower.contains("love") || lower.contains("great") || lower.contains("awesome")) {
                label = "POSITIVE"; score = 0.9;
            } else if (lower.contains("bad") || lower.contains("hate") || lower.contains("terrible") || lower.contains("awful")) {
                label = "NEGATIVE"; score = 0.9;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("label", label);
        result.put("score", score);
        result.put("text", text);

        if (articleIdStr != null && !articleIdStr.isBlank()) {
            try {
                UUID articleId = UUID.fromString(articleIdStr);
                Optional<Article> articleOpt = articleRepository.findById(articleId);
                if (articleOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Article not found for id: " + articleId));
                }

                Sentiment sentiment = new Sentiment(articleOpt.get(), label, score);
                Sentiment saved = sentimentRepository.save(sentiment);

                result.put("saved", true);
                result.put("sentiment", saved);
                return ResponseEntity.ok(result);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "articleId is not a valid UUID"));
            }
        }

        result.put("saved", false);
        return ResponseEntity.ok(result);
    }

    // ---------- Create ----------
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.ALL_VALUE})
    public ResponseEntity<?> create(
            @RequestParam(required = false) UUID articleId,
            @RequestParam(required = false) String sentimentLabel,
            @RequestParam(required = false) Double sentimentScore,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (body != null) {
            if (articleId == null && body.get("articleId") != null) {
                try { articleId = UUID.fromString(body.get("articleId").toString()); } catch (Exception ignored) {}
            }
            if (sentimentLabel == null && body.get("sentimentLabel") != null) {
                sentimentLabel = body.get("sentimentLabel").toString();
            }
            if (sentimentScore == null && body.get("sentimentScore") != null) {
                try { sentimentScore = Double.parseDouble(body.get("sentimentScore").toString()); } catch (Exception ignored) {}
            }
        }

        if (articleId == null || sentimentLabel == null || sentimentScore == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: articleId, sentimentLabel, sentimentScore"));
        }

        Optional<Article> articleOpt = articleRepository.findById(articleId);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Article with id " + articleId + " does not exist"));
        }

        Sentiment sentiment = new Sentiment(articleOpt.get(), sentimentLabel, sentimentScore);
        Sentiment saved = sentimentRepository.save(sentiment);
        return ResponseEntity.status(201).body(saved);
    }

    // ---------- Get sentiments for an article ----------
    @GetMapping("/article/{articleId}")
    public ResponseEntity<?> getByArticle(@PathVariable UUID articleId) {
        List<Sentiment> list = sentimentRepository.findByArticleIdOrderByCreatedAtDesc(articleId);
        if (list.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "No sentiments found for article id: " + articleId));
        }
        return ResponseEntity.ok(list);
    }
}
