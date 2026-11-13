package com.campusmatch.academic;

import org.jsoup.Jsoup;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import tools.jackson.databind.json.JsonMapper;
import java.nio.file.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AcademicCatalogTest {
    @Test void extractsOnlyCollegeNavigation() {
        var doc = Jsoup.parse("<div class='currents'><a href='" + SsuAcademicSource.ROOT +
            "it대학/'>IT대학</a><a href='https://example.com/'>Other</a><a href='" +
            SsuAcademicSource.ROOT + "it대학/컴퓨터학부/'>컴퓨터학부</a></div>");
        assertEquals(List.of("IT대학"), List.copyOf(SsuAcademicSource.collegeLinks(doc).keySet()));
    }
    @Test void extractsDepartmentCardsWithoutProseOrDuplicateLinks() {
        var url = SsuAcademicSource.SOURCE;
        var doc = Jsoup.parse("<div id='contents'><a class='btn' href='"+url+"software/'>소프트웨어학부</a>"+
            "<a class='btn' href='"+url+"software/'>소프트웨어학부</a>"+
            "<a href='"+url+"other/'>Not a department card</a>"+
            "<a class='btn' href='https://example.com/'>Ignore</a></div>");
        assertEquals(List.of("소프트웨어학부"), SsuAcademicSource.departments(doc, url));
    }
    @Test void failedSyncDoesNotOverwriteLastGoodSnapshot() throws Exception {
        var repository = mock(AcademicCatalogRepository.class);
        var source = mock(SsuAcademicSource.class);
        when(source.fetch()).thenThrow(new java.io.IOException("Unavailable"));
        new AcademicCatalogService(repository, source, JsonMapper.builder().build()).synchronize();
        verifyNoInteractions(repository);
    }
    @Test void successfulSyncPersistsWholeSnapshot() throws Exception {
        var repository = mock(AcademicCatalogRepository.class);
        var source = mock(SsuAcademicSource.class);
        var mapper = JsonMapper.builder().build();
        when(source.fetch()).thenReturn(new AcademicCatalog(1, java.time.Instant.now(), SsuAcademicSource.SOURCE,
            List.of(new AcademicCatalog.College("IT대학", SsuAcademicSource.SOURCE, List.of("컴퓨터학부")))));
        new AcademicCatalogService(repository, source, mapper).synchronize();
        verify(repository).saveAndFlush(argThat(row -> mapper.readValue(row.getPayload(), AcademicCatalog.class)
            .colleges().get(0).departments().contains("컴퓨터학부")));
    }
    @Test void bundledSnapshotContainsNoIntroLinksOrGeneralEducationCourses() throws Exception {
        try (var input = getClass().getResourceAsStream("/academic/ssu-catalog.json")) {
            var catalog = JsonMapper.builder().build().readValue(input, AcademicCatalog.class);
            assertEquals(1, catalog.schemaVersion());
            assertEquals(12, catalog.colleges().size());
            assertTrue(catalog.colleges().stream().filter(c -> c.name().equals("베어드학부대학"))
                .allMatch(c -> c.departments().isEmpty()));
            assertTrue(catalog.colleges().stream().flatMap(c -> c.departments().stream())
                .noneMatch(name -> name.endsWith(" 소개")));
        }
    }
    @Test @EnabledIfEnvironmentVariable(named="SSU_LIVE_SYNC", matches="1")
    void verifyLiveSource() throws Exception {
        var catalog = new SsuAcademicSource().fetch();
        Files.writeString(Path.of("/private/tmp/ssu-academic-catalog.json"),
            JsonMapper.builder().build().writeValueAsString(catalog));
        assertTrue(catalog.colleges().size() >= 10);
    }
}
