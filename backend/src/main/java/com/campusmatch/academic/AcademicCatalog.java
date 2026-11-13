package com.campusmatch.academic;

import java.time.Instant;
import java.util.List;

public record AcademicCatalog(Integer schemaVersion, Instant syncedAt, String source, List<College> colleges) {
    public record College(String name, String sourceUrl, List<String> departments) {}
}
