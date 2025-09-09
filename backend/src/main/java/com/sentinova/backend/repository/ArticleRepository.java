package com.sentinova.backend.repository;

import com.sentinova.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> { }
