package com.justid.postit.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.time.LocalDate;

public record PostItResponse(
        Long id,
        Long userId,
        String title,
        String description,
        String tags,
        Instant createdAt,
        LocalDate deadlineDate,
        boolean completed,
        boolean archived,
        double positionX,
        double positionY,
        int zIndex,
        @JsonProperty("colorHex")
        @JsonAlias({ "color_hex" })
        String colorHex
) {
}
