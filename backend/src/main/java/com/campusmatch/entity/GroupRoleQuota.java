package com.campusmatch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupRoleQuota {
    @Column(name = "role_name", nullable = false, length = 100)
    private String role;

    @Column(name = "current_count", nullable = false)
    private Integer current;

    @Column(name = "max_count", nullable = false)
    private Integer max;

    @Column(name = "description", length = 500)
    private String description;
}
