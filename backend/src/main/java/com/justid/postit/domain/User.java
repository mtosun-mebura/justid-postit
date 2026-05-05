package com.justid.postit.domain;

import java.time.Instant;

public record User(
        Long id,
        String username,
        String displayName,
        Instant createdAt
) {
}
