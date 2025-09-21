package com.sentinova.backend.repository;

import com.sentinova.backend.model.Sentiment;
import com.sentinova.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface SentimentRepository extends JpaRepository<Sentiment, UUID> {

    // Get sentiments for a given article (direct FK lookup by article id)
    List<Sentiment> findByArticleId(UUID articleId);

    // Get sentiments for a given article, newest first (by article id)
    List<Sentiment> findByArticleIdOrderByCreatedAtDesc(UUID articleId);

    // Return the single latest sentiment entity for the given Article (if any).
    // This is used to "upsert" — update the latest sentiment instead of always inserting.
    Optional<Sentiment> findTopByArticleOrderByCreatedAtDesc(Article article);
}
