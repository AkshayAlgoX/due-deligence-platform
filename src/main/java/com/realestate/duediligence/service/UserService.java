package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ApiResponse;
import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;

public interface UserService {

    ApiResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}