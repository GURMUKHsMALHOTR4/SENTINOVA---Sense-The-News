package com.sentinova.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sentiments")
public class Sentiment {

    @Id
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // Many sentiments can belong to one article
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", columnDefinition = "uuid", nullable = false)
    private Article article;

    @Column(name = "sentiment_label")
    private String sentimentLabel; // e.g., "POSITIVE", "NEGATIVE", "NEUTRAL"

    @Column(name = "sentiment_score")
    private Double sentimentScore; // e.g., a confidence score between 0.0 - 1.0

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Sentiment() {}

    public Sentiment(Article article, String sentimentLabel, Double sentimentScore) {
        this.article = article;
        this.sentimentLabel = sentimentLabel;
        this.sentimentScore = sentimentScore;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    // === Getters / Setters ===
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }

    public String getSentimentLabel() {
        return sentimentLabel;
    }

    public void setSentimentLabel(String sentimentLabel) {
        this.sentimentLabel = sentimentLabel;
    }

    public Double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(Double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
