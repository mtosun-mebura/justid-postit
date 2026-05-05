package com.justid.postit.api.mapper;

import com.justid.postit.api.dto.PostItResponse;
import com.justid.postit.api.dto.UserResponse;
import com.justid.postit.domain.PostIt;
import com.justid.postit.domain.User;

public final class ApiMappers {

    private ApiMappers() {
    }

    public static UserResponse toResponse(User u) {
        return new UserResponse(
            u.id(), 
            u.username(), 
            u.displayName(), 
            u.createdAt()
        );
    }

    public static PostItResponse toResponse(PostIt p) {
        return new PostItResponse(
                p.id(),
                p.userId(),
                p.title(),
                p.description(),
                p.tags(),
                p.createdAt(),
                p.deadlineDate(),
                p.completed(),
                p.archived(),
                p.positionX(),
                p.positionY(),
                p.zIndex(),
                p.colorHex()
        );
    }
}
