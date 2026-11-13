package com.campusmatch.controller;

import com.campusmatch.dto.PublicStatisticsResponse;
import com.campusmatch.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/api/statistics")
    public ResponseEntity<PublicStatisticsResponse> getStatistics() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(statisticsService.getPublicStatistics());
    }
}
