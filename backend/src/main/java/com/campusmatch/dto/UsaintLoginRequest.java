package com.campusmatch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsaintLoginRequest {

    @NotBlank(message = "studentId không được để trống")
    private String studentId;

    @NotBlank(message = "name không được để trống")
    private String name;

    private String department;
    private String faculty;
    private String email;
    private String academicYear;
    private String phoneNumber;
}
