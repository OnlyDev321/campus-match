package com.campusmatch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;
import com.campusmatch.entity.GroupRoleQuota;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGroupRequest {

    @NotBlank(message = "Tiêu đề nhóm không được để trống")
    @Size(max = 150)
    private String title;

    @NotBlank(message = "Mô tả nhóm không được để trống")
    private String description;

    @Size(max = 50)
    private String courseCode;

    @Size(max = 100)
    private String courseName;

    @Pattern(regexp = "Online|Offline|Hybrid")
    private String meetingFormat;

    @Size(max = 5)
    private List<@NotBlank @Size(max = 50) String> tags;

    @Email
    @Size(max = 254)
    private String contactEmail;

    @Pattern(regexp = "^[+0-9() .-]{7,25}$")
    private String contactPhone;

    @NotNull(message = "Số lượng thành viên tối đa không được để trống")
    @Min(value = 2, message = "Số lượng thành viên tối thiểu là 2")
    @Max(value = 20, message = "Số lượng thành viên tối đa là 20")
    private Integer maxMembers;

    private List<GroupRoleQuota> rolesQuota;
}

