package com.justid.postit.domain;

import java.time.Instant;
import java.time.LocalDate;

public record PostIt(
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
        String colorHex
) {
}
