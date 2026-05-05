package com.justid.postit.api.dto;

import jakarta.validation.constraints.NotNull;

public record ArchivePatchRequest(
        @NotNull Boolean archived
) {
}
