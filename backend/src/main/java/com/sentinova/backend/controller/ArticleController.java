package com.sentinova.backend.controller;

import com.sentinova.backend.model.Article;
import com.sentinova.backend.repository.ArticleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleRepository articleRepository;

    public ArticleController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // === Create article ===
    @PostMapping
    public ResponseEntity<Article> create(@RequestBody Article incoming) {
        Article saved = articleRepository.save(incoming);
        return ResponseEntity.created(URI.create("/api/articles/" + saved.getId())).body(saved);
    }

    // === List all articles ===
    @GetMapping
    public ResponseEntity<List<Article>> list() {
        return ResponseEntity.ok(articleRepository.findAll());
    }

    // === Get single article by UUID ===
    @GetMapping("/{id}")
    public ResponseEntity<Article> getById(@PathVariable UUID id) {
        return articleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
