package com.justid.postit.api;

import com.justid.postit.api.dto.CreateUserRequest;
import com.justid.postit.api.dto.UserResponse;
import com.justid.postit.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Gebruikers")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Alle gebruikers")
    public List<UserResponse> list() {
        return userService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Nieuwe gebruiker aanmaken")
    public UserResponse create(@Valid @RequestBody CreateUserRequest body) {
        return userService.create(body);
    }
}
