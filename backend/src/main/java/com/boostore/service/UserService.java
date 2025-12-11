package com.boostore.service;

import com.boostore.dto.LoginRequest;
import com.boostore.dto.RegisterRequest;
import com.boostore.dto.UserDto;
import com.boostore.entity.User;

import java.util.List;

public interface UserService {
    UserDto register(RegisterRequest request);
    String login(LoginRequest request);
    UserDto getCurrentUser();
    List<UserDto> getAllUsers();
    UserDto updateUserStatus(Long userId, Boolean enabled);
    UserDto getUserById(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    long count();
} 