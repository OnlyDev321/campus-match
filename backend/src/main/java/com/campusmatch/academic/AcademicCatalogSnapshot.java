package com.campusmatch.academic;

import jakarta.persistence.*;
import lombok.*;

/** Một snapshot duy nhất; chỉ ghi sau khi toàn bộ nguồn đã được xác thực. */
@Entity
@Getter @Setter @NoArgsConstructor
public class AcademicCatalogSnapshot {
    @Id
    private Long id = 1L;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;
}
