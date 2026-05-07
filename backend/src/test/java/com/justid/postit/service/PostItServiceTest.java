package com.justid.postit.service;

import com.justid.postit.api.dto.CreatePostItRequest;
import com.justid.postit.api.dto.UpdatePostItRequest;
import com.justid.postit.domain.PostIt;
import com.justid.postit.domain.User;
import com.justid.postit.persistence.PostItJdbcRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostItServiceTest {

    @Mock
    private PostItJdbcRepository postItJdbcRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PostItService postItService;

    private PostIt sampleFromDb(long id, String colorHex) {
        return new PostIt(
                id,
                1L,
                "titel",
                "",
                "",
                Instant.parse("2026-01-01T12:00:00Z"),
                null,
                false,
                false,
                10,
                20,
                0,
                colorHex
        );
    }

    @BeforeEach
    void setUpUser() {
        lenient().when(userService.getExistingUser(anyLong())).thenReturn(
                new User(1L, "user", "User", Instant.parse("2026-01-01T12:00:00Z"))
        );
    }

    @Test
    void createTrimsColorHexAndPersists() {
        when(postItJdbcRepository.insert(anyLong(), anyString(), anyString(), anyString(),
                any(), anyDouble(), anyDouble(), anyInt(), anyString())).thenReturn(99L);
        when(postItJdbcRepository.findById(99L)).thenReturn(Optional.of(sampleFromDb(99L, "#C8E6C9")));

        CreatePostItRequest req = new CreatePostItRequest(
                1L,
                "Taak",
                "",
                "",
                null,
                0.0,
                0.0,
                0,
                "  #C8E6C9  "
        );

        postItService.create(req);

        ArgumentCaptor<String> colorCaptor = ArgumentCaptor.forClass(String.class);
        verify(postItJdbcRepository).insert(
                eq(1L),
                eq("Taak"),
                eq(""),
                eq(""),
                any(),
                anyDouble(),
                anyDouble(),
                anyInt(),
                colorCaptor.capture()
        );
        assertThat(colorCaptor.getValue()).isEqualTo("#C8E6C9");
    }

    @Test
    void createUsesDefaultWhenColorBlank() {
        when(postItJdbcRepository.insert(anyLong(), anyString(), anyString(), anyString(),
                any(), anyDouble(), anyDouble(), anyInt(), anyString())).thenReturn(1L);
        when(postItJdbcRepository.findById(1L)).thenReturn(Optional.of(sampleFromDb(1L, "#FFF59D")));

        CreatePostItRequest req = new CreatePostItRequest(
                1L,
                "Taak",
                "",
                "",
                null,
                0.0,
                0.0,
                0,
                null
        );

        postItService.create(req);

        verify(postItJdbcRepository).insert(
                eq(1L),
                eq("Taak"),
                eq(""),
                eq(""),
                any(),
                anyDouble(),
                anyDouble(),
                anyInt(),
                eq("#FFF59D")
        );
    }

    @Test
    void replacePassesTrimmedColorToRepository() {
        PostIt existing = sampleFromDb(5L, "#FFF59D");
        when(postItJdbcRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(postItJdbcRepository.update(
                eq(5L),
                anyString(),
                anyString(),
                anyString(),
                any(),
                anyBoolean(),
                anyBoolean(),
                anyDouble(),
                anyDouble(),
                anyInt(),
                anyString()
        )).thenReturn(true);

        LocalDate deadline = LocalDate.of(2026, 6, 1);
        UpdatePostItRequest req = new UpdatePostItRequest(
                "Titel",
                "desc",
                "tags",
                deadline,
                true,
                false,
                10,
                20,
                3,
                "  #E1BEE7 "
        );

        postItService.replace(5L, req);

        ArgumentCaptor<String> colorCaptor = ArgumentCaptor.forClass(String.class);
        verify(postItJdbcRepository).update(
                eq(5L),
                eq("Titel"),
                eq("desc"),
                eq("tags"),
                eq(deadline),
                eq(true),
                eq(false),
                eq(10.0),
                eq(20.0),
                eq(3),
                colorCaptor.capture()
        );
        assertThat(colorCaptor.getValue()).isEqualTo("#E1BEE7");
    }

    @Test
    void createTrimsTitleBeforeInsert() {
        when(postItJdbcRepository.insert(anyLong(), anyString(), anyString(), anyString(),
                any(), anyDouble(), anyDouble(), anyInt(), anyString())).thenReturn(44L);
        when(postItJdbcRepository.findById(44L)).thenReturn(Optional.of(sampleFromDb(44L, "#FFF59D")));

        CreatePostItRequest req = new CreatePostItRequest(
                1L,
                "  Nieuwe taak  ",
                "beschrijving",
                "werk",
                null,
                12.0,
                34.0,
                1,
                "#FFF59D"
        );

        postItService.create(req);

        verify(postItJdbcRepository).insert(
                eq(1L),
                eq("Nieuwe taak"),
                eq("beschrijving"),
                eq("werk"),
                any(),
                eq(12.0),
                eq(34.0),
                eq(1),
                eq("#FFF59D")
        );
    }

    @Test
    void getThrowsNotFoundWhenMissing() {
        when(postItJdbcRepository.findById(123L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postItService.get(123L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    void replaceThrowsNotFoundWhenPostItDoesNotExist() {
        when(postItJdbcRepository.findById(5L)).thenReturn(Optional.empty());
        UpdatePostItRequest req = new UpdatePostItRequest(
                "Titel",
                "",
                "",
                null,
                false,
                false,
                0,
                0,
                0,
                "#FFF59D"
        );

        assertThatThrownBy(() -> postItService.replace(5L, req))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    void replaceThrowsNotFoundWhenUpdateReturnsFalse() {
        when(postItJdbcRepository.findById(5L)).thenReturn(Optional.of(sampleFromDb(5L, "#FFF59D")));
        when(postItJdbcRepository.update(
                eq(5L),
                anyString(),
                anyString(),
                anyString(),
                any(),
                anyBoolean(),
                anyBoolean(),
                anyDouble(),
                anyDouble(),
                anyInt(),
                anyString()
        )).thenReturn(false);
        UpdatePostItRequest req = new UpdatePostItRequest(
                "Titel",
                "",
                "",
                null,
                false,
                false,
                0,
                0,
                0,
                "#FFF59D"
        );

        assertThatThrownBy(() -> postItService.replace(5L, req))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    void deleteCallsRepositoryWithId() {
        when(postItJdbcRepository.delete(7L)).thenReturn(true);

        postItService.delete(7L);

        verify(postItJdbcRepository).delete(7L);
    }

    @Test
    void deleteThrowsNotFoundWhenDeleteReturnsFalse() {
        when(postItJdbcRepository.delete(7L)).thenReturn(false);

        assertThatThrownBy(() -> postItService.delete(7L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }
}
