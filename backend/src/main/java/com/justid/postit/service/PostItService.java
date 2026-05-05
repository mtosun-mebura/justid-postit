package com.justid.postit.service;

import com.justid.postit.api.dto.ArchivePatchRequest;
import com.justid.postit.api.dto.CompletedPatchRequest;
import com.justid.postit.api.dto.CreatePostItRequest;
import com.justid.postit.api.dto.PositionPatchRequest;
import com.justid.postit.api.dto.PostItResponse;
import com.justid.postit.api.dto.UpdatePostItRequest;
import com.justid.postit.api.mapper.ApiMappers;
import com.justid.postit.domain.PostIt;
import com.justid.postit.persistence.PostItJdbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PostItService {

    private static final String DEFAULT_COLOR_HEX = "#FFF59D";

    private final PostItJdbcRepository postItJdbcRepository;
    private final UserService userService;

    public PostItService(PostItJdbcRepository postItJdbcRepository, UserService userService) {
        this.postItJdbcRepository = postItJdbcRepository;
        this.userService = userService;
    }

    public List<PostItResponse> listForUser(long userId) {
        userService.getExistingUser(userId);
        return postItJdbcRepository.findByUserId(userId).stream().map(ApiMappers::toResponse).toList();
    }

    public List<PostItResponse> listForTag(String tag) {
        return postItJdbcRepository.findByTag(tag).stream().map(ApiMappers::toResponse).toList();
    }

    public PostItResponse get(long id) {
        PostIt p = postItJdbcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden"));
        return ApiMappers.toResponse(p);
    }

    public PostItResponse create(CreatePostItRequest request) {
        userService.getExistingUser(request.userId());
        double x = request.positionX() != null ? request.positionX() : 48;
        double y = request.positionY() != null ? request.positionY() : 48;
        int z = request.zIndex() != null ? request.zIndex() : 0;
        String color = request.colorHex() != null && !request.colorHex().isBlank()
                ? request.colorHex().trim()
                : DEFAULT_COLOR_HEX;
        long id = postItJdbcRepository.insert(
                request.userId(),
                request.title().trim(),
                defaultString(request.description()),
                defaultString(request.tags()),
                request.deadlineDate(),
                x,
                y,
                z,
                color
        );
        return ApiMappers.toResponse(postItJdbcRepository.findById(id).orElseThrow());
    }

    public PostItResponse replace(long id, UpdatePostItRequest request) {
        PostIt existing = postItJdbcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden"));
        boolean ok = postItJdbcRepository.update(
                id,
                request.title().trim(),
                defaultString(request.description()),
                defaultString(request.tags()),
                request.deadlineDate(),
                request.completed(),
                request.archived(),
                request.positionX(),
                request.positionY(),
                request.zIndex(),
                request.colorHex().trim()
        );
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden");
        }
        return ApiMappers.toResponse(postItJdbcRepository.findById(id).orElse(existing));
    }

    @Transactional
    public PostItResponse patchPosition(long id, PositionPatchRequest request) {
        PostIt existing = postItJdbcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden"));
        boolean ok = postItJdbcRepository.updatePosition(id, request.x(), request.y(), request.zIndex());
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden");
        }
        return ApiMappers.toResponse(postItJdbcRepository.findById(id).orElse(existing));
    }

    @Transactional
    public PostItResponse patchArchive(long id, ArchivePatchRequest request) {
        PostIt existing = postItJdbcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden"));
        boolean ok = postItJdbcRepository.updateArchived(id, request.archived());
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden");
        }
        return ApiMappers.toResponse(postItJdbcRepository.findById(id).orElse(existing));
    }

    @Transactional
    public PostItResponse patchCompleted(long id, CompletedPatchRequest request) {
        PostIt existing = postItJdbcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden"));
        boolean ok = postItJdbcRepository.updateCompleted(id, request.completed());
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden");
        }
        return ApiMappers.toResponse(postItJdbcRepository.findById(id).orElse(existing));
    }

    public void delete(long id) {
        boolean ok = postItJdbcRepository.delete(id);
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post-it niet gevonden");
        }
    }

    public int countOpen(long userId) {
        userService.getExistingUser(userId);
        return postItJdbcRepository.countOpenForUser(userId);
    }

    private static String defaultString(String s) {
        return s == null ? "" : s;
    }
}
