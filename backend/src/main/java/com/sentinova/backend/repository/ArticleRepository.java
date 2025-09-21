package com.sentinova.backend.repository;

import com.sentinova.backend.model.Article;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    Optional<Article> findByUrl(String url);

    /**
     * Fetch an Article along with its sentiments to avoid lazy-loading issues.
     * Make sure the Article entity has a collection mapped for sentiments (e.g. @OneToMany(mappedBy="article")).
     */
    @EntityGraph(attributePaths = {"sentiments"})
    Optional<Article> findWithSentimentsById(UUID id);
}
