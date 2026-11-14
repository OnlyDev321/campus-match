package com.campusmatch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyRequest {

    @NotBlank(message = "Lời giới thiệu / nguyện vọng không được để trống")
    private String statement;

    private String desiredRole;
}

