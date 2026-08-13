package com.realestate.duediligence.service;

import reactor.core.publisher.Flux;

public interface AgentChatService {
    Flux<String> streamChat(Long propertyId, String question, java.util.List<MessageDto> history);

    record MessageDto(String role, String content) {}
}