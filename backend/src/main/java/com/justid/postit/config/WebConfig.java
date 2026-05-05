package com.justid.postit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origin-patterns}")
    private String allowedOriginPatterns;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] patterns = Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        registry.addMapping("/api/**")
                // Exacte origins: browser gebruikt vaak 127.0.0.1 i.p.v. localhost — die zijn verschillende origins.
                // allowedOriginPatterns("http://127.0.0.1:*") matcht dat IP + poort niet betrouwbaar → 403 zonder deze regel.
                .allowedOrigins("http://localhost:4200", "http://127.0.0.1:4200")
                .allowedOriginPatterns(patterns)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowCredentials(false);
    }
}
