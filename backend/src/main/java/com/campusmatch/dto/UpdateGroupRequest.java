package com.campusmatch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import com.campusmatch.entity.GroupRoleQuota;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateGroupRequest {
    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
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

    private List<GroupRoleQuota> rolesQuota;

    @NotNull
    @Min(2)
    @Max(20)
    private Integer maxMembers;
}
