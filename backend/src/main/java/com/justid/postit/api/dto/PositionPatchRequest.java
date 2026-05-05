package com.justid.postit.api.dto;

import jakarta.validation.constraints.NotNull;

public record PositionPatchRequest(
        @NotNull Double x,
        @NotNull Double y,
        Integer zIndex
) {
}
