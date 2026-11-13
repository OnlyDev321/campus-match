package com.campusmatch.academic;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AcademicCatalogController {
    private final AcademicCatalogService service;

    @GetMapping("/api/academic-units")
    public ResponseEntity<AcademicCatalog> get() {
        return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(service.get());
    }
}
