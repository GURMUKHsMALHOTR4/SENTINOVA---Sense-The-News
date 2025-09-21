package com.sentinova.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Article JPA entity. Keeps imageUrl as a nullable text column and instructs Jackson to
 * exclude null fields from JSON serialization to keep API responses compact.
 */
@Entity
@Table(name = "articles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_articles_url", columnNames = {"url"})
})
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Article {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", columnDefinition = "text")
    private String title;

    @Column(name = "url", columnDefinition = "text", unique = true)
    private String url;

    @Column(name = "summary", columnDefinition = "text")
    private String summary;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "source", columnDefinition = "text")
    private String source;

    @Column(name = "category", columnDefinition = "text")
    private String category;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "fetched_at")
    private OffsetDateTime fetchedAt;

    /**
     * New field to store article image URL. Nullable in DB.
     * Column name = image_url so it matches existing DB migration/SQL we used previously.
     */
    @Column(name = "image_url", columnDefinition = "text", nullable = true)
    private String imageUrl;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Sentiment> sentiments = new ArrayList<>();

    public Article() {
        // JPA
    }

    public Article(UUID id, String title, String url) {
        this.id = id;
        this.title = title;
        this.url = url;
    }

    // === Getters & Setters ===
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public OffsetDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(OffsetDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public OffsetDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(OffsetDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }

    /**
     * Expose imageUrl as "imageUrl" in JSON responses.
     */
    @JsonProperty("imageUrl")
    public String getImageUrl() {
        return imageUrl;
    }

    @JsonProperty("imageUrl")
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<Sentiment> getSentiments() {
        return sentiments;
    }

    public void setSentiments(List<Sentiment> sentiments) {
        this.sentiments = sentiments;
    }

    // Helper method to add a sentiment safely
    public void addSentiment(Sentiment sentiment) {
        sentiments.add(sentiment);
        sentiment.setArticle(this);
    }

    public void removeSentiment(Sentiment sentiment) {
        sentiments.remove(sentiment);
        sentiment.setArticle(null);
    }
}
