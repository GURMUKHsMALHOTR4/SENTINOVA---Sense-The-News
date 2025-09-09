package com.sentinova.backend.repository;

import com.sentinova.backend.model.Sentiment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface SentimentRepository extends JpaRepository<Sentiment, UUID> {

    // Get sentiments for a given article (direct FK lookup)
    List<Sentiment> findByArticleId(UUID articleId);

    // Get sentiments for a given article, newest first
    List<Sentiment> findByArticleIdOrderByCreatedAtDesc(UUID articleId);
}
