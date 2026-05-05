package com.justid.postit.api.dto;

import jakarta.validation.constraints.NotNull;

public record CompletedPatchRequest(
        @NotNull Boolean completed
) {
}
