package com.campusmatch.academic;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicCatalogService {
    private final AcademicCatalogRepository repository;
    private final SsuAcademicSource source;
    private final ObjectMapper mapper;

    public AcademicCatalog get() {
        return repository.findById(1L).map(row -> mapper.readValue(row.getPayload(), AcademicCatalog.class))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "CATALOG_UNAVAILABLE"));
    }

    // Retry an outdated/missing snapshot hourly if the daily refresh failed.
    @Scheduled(initialDelay = 1000, fixedDelay = 3600000)
    public void initialize() {
        if (!repository.existsById(1L) || !Integer.valueOf(1).equals(get().schemaVersion())) {
            // Verified public SSU snapshot: first deployment also works during a source outage.
            try (var input = new org.springframework.core.io.ClassPathResource("academic/ssu-catalog.json").getInputStream()) {
                var seed = mapper.readValue(input, AcademicCatalog.class);
                var row = new AcademicCatalogSnapshot();
                row.setPayload(mapper.writeValueAsString(seed));
                repository.saveAndFlush(row);
            } catch (Exception error) {
                log.warn("Could not initialize SSU catalog snapshot", error);
            }
        }
        try {
            var catalog = get();
            if (catalog.syncedAt().isAfter(java.time.Instant.now().minusSeconds(86400))) return;
        } catch (ResponseStatusException ignored) { }
        synchronize();
    }

    @Scheduled(cron = "${campusmatch.academic-sync.cron:0 0 4 * * *}", zone = "Asia/Seoul")
    public synchronized void synchronize() {
        try {
            var catalog = source.fetch();
            var row = new AcademicCatalogSnapshot();
            row.setPayload(mapper.writeValueAsString(catalog));
            repository.saveAndFlush(row);
            log.info("SSU academic catalog synchronized: {} units", catalog.colleges().size());
        } catch (Exception error) {
            log.warn("SSU academic sync failed; keeping last successful snapshot", error);
        }
    }
}
