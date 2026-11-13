package com.campusmatch.controller;

import com.campusmatch.dto.PublicStatisticsResponse;
import com.campusmatch.service.StatisticsService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class StatisticsControllerTest {
    @Test
    void returnsOnlyAggregateCountsWithNoStaleCache() throws Exception {
        var service = mock(StatisticsService.class);
        when(service.getPublicStatistics()).thenReturn(new PublicStatisticsResponse(27, 8, 3));
        var mvc = MockMvcBuilders.standaloneSetup(new StatisticsController(service)).build();

        mvc.perform(get("/api/statistics"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().json("{\"verifiedStudents\":27,\"recruitingGroups\":8,\"fullGroups\":3}"));
    }
}
