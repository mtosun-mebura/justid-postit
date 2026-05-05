package com.justid.postit.api.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String displayName,
        Instant createdAt
) {
}
