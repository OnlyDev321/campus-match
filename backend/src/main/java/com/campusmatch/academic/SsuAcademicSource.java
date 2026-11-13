package com.campusmatch.academic;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.*;

@Component
public class SsuAcademicSource {
    static final String ROOT = "https://ssu.ac.kr/교육-·-연구/대학소개/";
    public static final String SOURCE = ROOT + "it대학/";

    public AcademicCatalog fetch() throws IOException {
        var links = collegeLinks(load(SOURCE));
        if (links.size() < 10) throw new IOException("Incomplete SSU college navigation");
        var colleges = new ArrayList<AcademicCatalog.College>();
        for (var entry : links.entrySet()) {
            var page = load(entry.getValue());
            var departments = departments(page, entry.getValue());
            // Standalone academic units have no child department pages.
            if (entry.getKey().endsWith("학과") || entry.getKey().endsWith("학부")) {
                departments = List.of(entry.getKey());
            }
            // Baird lists general education courses, not departments.
            if (entry.getKey().equals("베어드학부대학")) departments = List.of();
            if (departments.isEmpty() && !entry.getKey().equals("베어드학부대학")) {
                throw new IOException("Missing department links: " + entry.getKey());
            }
            colleges.add(new AcademicCatalog.College(entry.getKey(), entry.getValue(), departments));
        }
        return new AcademicCatalog(1, Instant.now(), SOURCE, List.copyOf(colleges));
    }

    protected Document load(String url) throws IOException {
        return Jsoup.connect(URI.create(url).toASCIIString()).timeout(15000)
                .maxBodySize(3_000_000).userAgent("CampusMatch Academic Catalog Sync").get();
    }

    static Map<String, String> collegeLinks(Document document) {
        Map<String, String> result = new LinkedHashMap<>();
        for (var link : document.select(".currents a[href]")) {
            var url = decoded(link.absUrl("href"));
            if (url.startsWith(ROOT) && url.substring(ROOT.length()).matches("[^/]+/")) {
                result.putIfAbsent(link.text().strip(), url);
            }
        }
        return result;
    }

    static List<String> departments(Document document, String collegeUrl) {
        Set<String> names = new LinkedHashSet<>();
        for (var link : document.select("#contents a.btn[href]")) {
            var url = decoded(link.absUrl("href"));
            if (url.startsWith(collegeUrl) && url.length() > collegeUrl.length()) {
                var name = link.text().replaceAll("\\s*\\(재직자전형\\)", "").strip();
                if (!name.isBlank()) names.add(name);
            }
        }
        return List.copyOf(names);
    }

    private static String decoded(String url) {
        // URI#getPath decodes percent escapes without treating '+' as a space.
        if (!url.startsWith("https://ssu.ac.kr/")) return "";
        try {
            var uri = URI.create(url);
            return uri.getScheme() + "://" + uri.getHost() + uri.getPath();
        } catch (IllegalArgumentException ignored) {
            return "";
        }
    }
}
