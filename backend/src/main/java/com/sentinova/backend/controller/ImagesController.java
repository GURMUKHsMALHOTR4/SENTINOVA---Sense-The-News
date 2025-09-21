package com.sentinova.backend.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.time.Duration;
import java.util.Collections;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Image proxy controller:
 *   GET /api/images/proxy?url=<encoded-url>
 *
 * Purpose:
 *  - Fetch remote image bytes and stream them back (avoids CORS/blocked-by-origin issues).
 *  - Send a browser-friendly User-Agent header.
 *  - Return readable debug message on errors (for Postman/dev). For production you may want
 *    to return a placeholder image or a consistent error status.
 *
 * Important:
 *  If you have a duplicate controller elsewhere mapping the same path (e.g. ImageProxyController),
 *  remove or rename that class to avoid ambiguous mapping errors on startup.
 */
@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*") // allow from frontend during dev; tighten for prod
public class ImagesController {

    private static final Logger log = Logger.getLogger(ImagesController.class.getName());

    private final RestTemplate restTemplate;

    public ImagesController() {
        // Use the simple client factory and configure sensible timeouts
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        // connect and read timeouts in ms
        rf.setConnectTimeout((int) Duration.ofSeconds(8).toMillis());
        rf.setReadTimeout((int) Duration.ofSeconds(12).toMillis());
        this.restTemplate = new RestTemplate(rf);
    }

    /**
     * Proxy an external image URL and stream it back to the browser.
     *
     * Example:
     * GET /api/images/proxy?url=https%3A%2F%2Fexample.com%2Fimage.jpg
     *
     * Notes:
     *  - We set a browser-like User-Agent (many servers block missing UA).
     *  - We allow all origins (dev). For production restrict this.
     *  - Response streams the bytes to avoid large memory use.
     */
    @GetMapping(value = "/proxy")
    public ResponseEntity<InputStreamResource> proxy(@RequestParam("url") String url) {
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(new InputStreamResource(new ByteArrayInputStream("Missing 'url' parameter".getBytes())));
        }

        try {
            // Validate / normalize provided URL
            URI uri = URI.create(url.trim());

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.ALL));
            // Set common browser UA — some remote servers reject empty or non-browser UAs
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SentinovaProxy/1.0");
            // Optionally set a Referer if a remote host requires it. Uncomment and set to your frontend origin:
            // headers.set(HttpHeaders.REFERER, "http://localhost:3000");

            HttpEntity<Void> req = new HttpEntity<>(headers);

            ResponseEntity<byte[]> resp = restTemplate.exchange(uri, HttpMethod.GET, req, byte[].class);

            // If remote returned non-2xx, forward code + message for debugging
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null || resp.getBody().length == 0) {
                String msg = "Remote returned " + resp.getStatusCode() + " for " + url;
                log.log(Level.WARNING, msg);
                HttpHeaders outErr = new HttpHeaders();
                outErr.setContentType(MediaType.TEXT_PLAIN);
                outErr.setAccessControlAllowOrigin("*");
                return new ResponseEntity<>(new InputStreamResource(new ByteArrayInputStream(msg.getBytes())), outErr, resp.getStatusCode());
            }

            byte[] body = resp.getBody();

            HttpHeaders out = new HttpHeaders();
            MediaType contentType = resp.getHeaders().getContentType();
            if (contentType != null) out.setContentType(contentType);
            else out.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            out.setContentLength(body.length);
            // allow browser to use it across origins (dev)
            out.setAccessControlAllowOrigin("*");
            // cache for 1 hour in the browser/proxies
            out.setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());

            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(body));
            return new ResponseEntity<>(resource, out, HttpStatus.OK);
        } catch (IllegalArgumentException iae) {
            String msg = "Invalid url: " + iae.getMessage();
            log.log(Level.WARNING, msg, iae);
            HttpHeaders out = new HttpHeaders();
            out.setContentType(MediaType.TEXT_PLAIN);
            out.setAccessControlAllowOrigin("*");
            return new ResponseEntity<>(new InputStreamResource(new ByteArrayInputStream(msg.getBytes())), out, HttpStatus.BAD_REQUEST);
        } catch (RestClientException rce) {
            // remote host refused or timed out
            log.log(Level.WARNING, "Error fetching remote image: " + url, rce);
            String msg = "Failed fetching remote image: " + rce.getMessage();
            HttpHeaders out = new HttpHeaders();
            out.setContentType(MediaType.TEXT_PLAIN);
            out.setAccessControlAllowOrigin("*");
            return new ResponseEntity<>(new InputStreamResource(new ByteArrayInputStream(msg.getBytes())), out, HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            log.log(Level.SEVERE, "Unexpected error proxying image: " + url, e);
            String msg = "Unexpected proxy error: " + e.getMessage();
            HttpHeaders out = new HttpHeaders();
            out.setContentType(MediaType.TEXT_PLAIN);
            out.setAccessControlAllowOrigin("*");
            return new ResponseEntity<>(new InputStreamResource(new ByteArrayInputStream(msg.getBytes())), out, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
