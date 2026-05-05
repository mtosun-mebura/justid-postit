package com.justid.postit.api;

import com.justid.postit.api.dto.ArchivePatchRequest;
import com.justid.postit.api.dto.CompletedPatchRequest;
import com.justid.postit.api.dto.CreatePostItRequest;
import com.justid.postit.api.dto.PositionPatchRequest;
import com.justid.postit.api.dto.PostItResponse;
import com.justid.postit.api.dto.UpdatePostItRequest;
import com.justid.postit.service.PostItService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/post-its")
@Tag(name = "Post-its")
public class PostItController {

    private final PostItService postItService;

    public PostItController(PostItService postItService) {
        this.postItService = postItService;
    }

    @GetMapping
    @Operation(summary = "Post-its van een gebruiker")
    public List<PostItResponse> list(
            @Parameter(description = "Gebruiker wiens bord getoond wordt", required = true)
            @RequestParam("userId") long userId) {
        return postItService.listForUser(userId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Enkele post-it")
    public PostItResponse get(@PathVariable long id) {
        return postItService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Post-it aanmaken")
    public PostItResponse create(@Valid @RequestBody CreatePostItRequest body) {
        return postItService.create(body);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Post-it volledig bijwerken (CRUD update)")
    public PostItResponse replace(@PathVariable long id, @Valid @RequestBody UpdatePostItRequest body) {
        return postItService.replace(id, body);
    }

    @PatchMapping("/{id}/position")
    @Operation(summary = "Alleen positie (en optioneel z-index) bijwerken na slepen")
    public PostItResponse patchPosition(@PathVariable long id, @Valid @RequestBody PositionPatchRequest body) {
        return postItService.patchPosition(id, body);
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archiveren of terugzetten")
    public PostItResponse patchArchive(@PathVariable long id, @Valid @RequestBody ArchivePatchRequest body) {
        return postItService.patchArchive(id, body);
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Voltooid markeren of terugzetten")
    public PostItResponse patchComplete(@PathVariable long id, @Valid @RequestBody CompletedPatchRequest body) {
        return postItService.patchCompleted(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Post-it verwijderen")
    public void delete(@PathVariable long id) {
        postItService.delete(id);
    }
}
