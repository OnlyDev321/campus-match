package com.campusmatch.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupRoleQuota {
    private String role;

    private Integer current;

    private Integer max;

    private String description;
}
