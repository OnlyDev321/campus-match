package com.campusmatch.entity;

/**
 * Trạng thái của nhóm học tập/đồ án:
 * - RECRUITING: Đang tuyển thành viên
 * - COMPLETED : Đã đủ thành viên (tuyển thành công)
 * - CLOSED : Đã đóng / Hủy tuyển
 */
public enum GroupStatus {
    RECRUITING,
    COMPLETED,
    CLOSED
}