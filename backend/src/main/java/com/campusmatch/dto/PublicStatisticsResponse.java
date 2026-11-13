package com.campusmatch.dto;

/** Các tổng số công khai, không bao gồm dữ liệu nhận dạng sinh viên. */
public record PublicStatisticsResponse(long verifiedStudents, long recruitingGroups, long fullGroups) {}
