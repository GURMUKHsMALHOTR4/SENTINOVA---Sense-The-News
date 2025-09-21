package com.sentinova.backend.controller;

import com.sentinova.backend.model.Article;
import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.repository.ArticleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleRepository articleRepository;

    public ArticleController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok("Article API is UP");
    }

    // Fetch article + sentiments
    @GetMapping("/{id}/with-sentiments")
    public ResponseEntity<?> getArticleWithSentiments(@PathVariable UUID id) {
        Optional<Article> articleOpt = articleRepository.findWithSentimentsById(id);

        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Will include imageUrl and sentiments automatically in JSON response
        return ResponseEntity.ok(articleOpt.get());
    }

    /**
     * List all articles.
     *
     * Query params:
     *  - shuffle=true|false  (optional, default=false) : shuffle the result order
     *  - sentiment=All|Positive|Neutral|Negative (optional, default=All) : filter by latest sentiment
     *
     * Example: GET /api/articles?shuffle=true&sentiment=All
     */
    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(
            @RequestParam(name = "shuffle", required = false, defaultValue = "false") boolean shuffle,
            @RequestParam(name = "sentiment", required = false, defaultValue = "All") String sentiment) {

        List<Article> all = articleRepository.findAll();

        // apply sentiment filter if requested
        if (sentiment != null && !"All".equalsIgnoreCase(sentiment.trim())) {
            String wanted = sentiment.trim();
            all = all.stream()
                    .filter(a -> {
                        String latest = latestSentimentLabel(a);
                        return latest != null && latest.equalsIgnoreCase(wanted);
                    })
                    .collect(Collectors.toList());
        }

        if (shuffle) {
            Collections.shuffle(all, new Random());
        }

        return ResponseEntity.ok(all);
    }

    /**
     * List recent N articles (by fetchedAt desc). If fetchedAt is null it will appear last.
     * Supports shuffle and sentiment filter via query params.
     *
     * Example: GET /api/articles/recent/20?shuffle=true&sentiment=All
     */
    @GetMapping("/recent/{count}")
    public ResponseEntity<List<Article>> getRecentArticles(
            @PathVariable int count,
            @RequestParam(name = "shuffle", required = false, defaultValue = "false") boolean shuffle,
            @RequestParam(name = "sentiment", required = false, defaultValue = "All") String sentiment) {

        if (count <= 0) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        List<Article> recent = articleRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(
                Article::getFetchedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
            ))
            .limit(count)
            .collect(Collectors.toList());

        // apply sentiment filter if requested
        if (sentiment != null && !"All".equalsIgnoreCase(sentiment.trim())) {
            String wanted = sentiment.trim();
            recent = recent.stream()
                    .filter(a -> {
                        String latest = latestSentimentLabel(a);
                        return latest != null && latest.equalsIgnoreCase(wanted);
                    })
                    .collect(Collectors.toList());
        }

        if (shuffle) {
            Collections.shuffle(recent, new Random());
        }

        return ResponseEntity.ok(recent);
    }

    // -------------------------
    // Helper: get the latest sentiment label for an article (if any)
    // -------------------------
    private String latestSentimentLabel(Article article) {
        if (article == null) return null;
        List<Sentiment> list = article.getSentiments();
        if (list == null || list.isEmpty()) return null;

        // find latest by createdAt
        return list.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparing(Sentiment::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                .map(Sentiment::getLabel)
                .orElse(null);
    }
}
