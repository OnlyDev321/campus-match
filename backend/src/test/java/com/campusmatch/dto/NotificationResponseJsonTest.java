package com.campusmatch.dto;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

class NotificationResponseJsonTest {

    @Test
    void serializesReadStateWithFrontendFieldName() {
        var response = NotificationResponse.builder().id("1").isRead(true).build();
        var json = JsonMapper.builder().build().writeValueAsString(response);

        assertTrue(json.contains("\"isRead\":true"), json);
        assertFalse(json.contains("\"read\":"), json);
    }
}
