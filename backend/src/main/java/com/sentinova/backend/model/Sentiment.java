package com.sentinova.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sentiments")
public class Sentiment {

    @Id
    @GeneratedValue
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", referencedColumnName = "id", columnDefinition = "uuid", nullable = false)
    @JsonBackReference
    private Article article;

    @Column(name = "label", length = 64, nullable = false)
    private String label; // e.g. "POSITIVE", "NEGATIVE", "NEUTRAL"

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Sentiment() {}

    public Sentiment(Article article, String label, Double score) {
        this.article = article;
        this.label = label;
        this.score = score;
    }

    // === Lifecycle hook ===
    @PrePersist
    public void prePersist() {
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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // === Backward compatibility (for old code using SentimentLabel/SentimentScore) ===
    public String getSentimentLabel() {
        return this.label;
    }

    public void setSentimentLabel(String sentimentLabel) {
        this.label = sentimentLabel;
    }

    public Double getSentimentScore() {
        return this.score;
    }

    public void setSentimentScore(Double sentimentScore) {
        this.score = sentimentScore;
    }
}
