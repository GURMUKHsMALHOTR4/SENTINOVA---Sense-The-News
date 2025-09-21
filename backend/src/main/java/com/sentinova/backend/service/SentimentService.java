package com.sentinova.backend.service;

import edu.stanford.nlp.pipeline.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Local sentiment analysis using Stanford CoreNLP.
 * Returns SentimentResult { label: "Positive" / "Negative" / "Neutral", score: double (0.0-1.0) }.
 */
@Service
public class SentimentService {

    private final StanfordCoreNLP pipeline;

    public SentimentService() {
        // Setup CoreNLP pipeline
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,parse,sentiment");
        this.pipeline = new StanfordCoreNLP(props);
    }

    public SentimentResult analyzeText(String text) {
        if (text == null || text.isBlank()) {
            return new SentimentResult("Neutral", 0.5); // default neutral
        }

        CoreDocument doc = new CoreDocument(text);
        pipeline.annotate(doc);

        int totalScore = 0;
        int count = 0;

        for (CoreSentence sentence : doc.sentences()) {
            String sentiment = sentence.sentiment();
            totalScore += mapSentimentToScore(sentiment);
            count++;
        }

        int avgScore = count > 0 ? Math.round((float) totalScore / count) : 2;
        String label = mapScoreToThreeClass(avgScore);
        double normalized = avgScore / 4.0; // 0.0–1.0

        return new SentimentResult(label, normalized);
    }

    private int mapSentimentToScore(String sentiment) {
        switch (sentiment) {
            case "Very negative": return 0;
            case "Negative": return 1;
            case "Neutral": return 2;
            case "Positive": return 3;
            case "Very positive": return 4;
            default: return 2;
        }
    }

    /**
     * Map fine-grained (0–4) to coarse 3-class labels.
     */
    private String mapScoreToThreeClass(int score) {
        if (score <= 1) return "Negative";
        if (score == 2) return "Neutral";
        return "Positive"; // 3 or 4
    }

    /**
     * Minimal POJO for sentiment results.
     */
    public static class SentimentResult {
        private final String label;
        private final Double score;

        public SentimentResult(String label, Double score) {
            this.label = label;
            this.score = score;
        }

        public String getLabel() { return label; }
        public Double getScore() { return score; }

        @Override
        public String toString() {
            return "SentimentResult{label='" + label + "', score=" + score + "}";
        }
    }
}
