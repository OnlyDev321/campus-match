package com.campusmatch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGroupRequest {

    @NotBlank(message = "Tiêu đề nhóm không được để trống")
    private String title;

    @NotBlank(message = "Mô tả nhóm không được để trống")
    private String description;

    private String courseCode;
    private String courseName;

    @NotNull(message = "Số lượng thành viên tối đa không được để trống")
    @Min(value = 2, message = "Số lượng thành viên tối thiểu là 2")
    @Max(value = 20, message = "Số lượng thành viên tối đa là 20")
    private Integer maxMembers;
}

