package com.campusmatch.entity;

/**
 * Vai trò của thành viên trong nhóm học tập:
 * - LEADER: Trưởng nhóm (người tạo nhóm, có quyền duyệt/từ chối đơn)
 * - MEMBER: Thành viên chính thức trong nhóm
 */
public enum GroupRole {
    LEADER,
    MEMBER
}