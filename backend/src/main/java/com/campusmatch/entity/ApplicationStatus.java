package com.campusmatch.entity;

/**
 * Trạng thái của đơn xin gia nhập nhóm học tập/đồ án:
 * - PENDING : Đang chờ trưởng nhóm phê duyệt
 * - ACCEPTED: Đã được chấp thuận tham gia nhóm
 * - REJECTED: Đã bị từ chối
 */
public enum ApplicationStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}