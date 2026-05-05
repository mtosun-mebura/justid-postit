package com.justid.postit.api;

import com.justid.postit.service.PostItService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@Tag(name = "Statistieken")
public class StatsController {

    private final PostItService postItService;

    public StatsController(PostItService postItService) {
        this.postItService = postItService;
    }

    @GetMapping("/open-count")
    @Operation(summary = "Aantal openstaande post-its (niet afgerond, niet gearchiveerd) voor de header")
    public OpenCountResponse openCount(@RequestParam("userId") long userId) {
        return new OpenCountResponse(postItService.countOpen(userId));
    }

    public record OpenCountResponse(int openCount) {
    }
}
