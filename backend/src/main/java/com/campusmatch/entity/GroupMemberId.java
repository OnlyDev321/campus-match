package com.campusmatch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class GroupMemberId implements Serializable {

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "user_id")
    private Long userId;
}