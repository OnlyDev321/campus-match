package com.campusmatch.academic;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicCatalogRepository extends JpaRepository<AcademicCatalogSnapshot, Long> {}
