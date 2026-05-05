package com.justid.postit.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreatePostItRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 255) String title,
        @Size(max = 4000) String description,
        @Size(max = 500) String tags,
        LocalDate deadlineDate,
        Double positionX,
        Double positionY,
        Integer zIndex,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Kleur moet een geldige hexwaarde zijn (#RRGGBB)")
        String colorHex
) {
}
