package com.justid.postit.service;

import com.justid.postit.api.dto.CreateUserRequest;
import com.justid.postit.api.dto.UserResponse;
import com.justid.postit.api.mapper.ApiMappers;
import com.justid.postit.domain.User;
import com.justid.postit.persistence.UserJdbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserJdbcRepository userJdbcRepository;

    public UserService(UserJdbcRepository userJdbcRepository) {
        this.userJdbcRepository = userJdbcRepository;
    }

    public List<UserResponse> list() {
        return userJdbcRepository.findAll().stream().map(ApiMappers::toResponse).toList();
    }

    public UserResponse create(CreateUserRequest request) {
        if (userJdbcRepository.findByUsername(request.username().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Gebruikersnaam bestaat al");
        }
        long id = userJdbcRepository.insert(request.username().trim(), request.displayName().trim());
        User u = userJdbcRepository.findById(id).orElseThrow();
        return ApiMappers.toResponse(u);
    }

    public User getExistingUser(long id) {
        return userJdbcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gebruiker niet gevonden"));
    }
}
