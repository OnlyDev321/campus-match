"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Network,
  UserPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import GroupCard from "@/components/group/GroupCard";
import ApplyModal from "@/components/application/ApplyModal";
import { Card, SearchInput, Button, Badge } from "@/design-system";
import { CardSkeletonList, ErrorState } from "@/components/common/AsyncState";
import { useDebounce, useServiceData } from "@/lib/hooks";
import type { AcademicCatalog, GroupCardData, GroupDetailData } from "@/lib/types";
import { useRequireLogin } from "@/lib/hooks";
import { useLanguageStore } from "@/stores/languageStore";

import { getAcademicCatalog } from "@/services/academicService";
import { getPublicStatistics } from "@/services/statisticsService";
import { fetchAvailableYears, fetchGroups } from "@/services/groupService";

const GroupPage = () => {
  const isReady = useRequireLogin("/groups");
  const { t } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "spots">("recent");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Pagination State (6 items per page)
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Quick Apply Modal State
  const [selectedGroupForApply, setSelectedGroupForApply] = useState<
    GroupDetailData | GroupCardData | null
  >(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Applied filter states (triggered on Search button click or Enter)
  const appliedQuery = debouncedQuery;
  const [appliedCollege, setAppliedCollege] = useState("ALL");
  const [appliedDepartment, setAppliedDepartment] = useState("ALL");
  const [appliedYear, setAppliedYear] = useState("ALL");

  // Dropdown open states
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [catalog, setCatalog] = useState<AcademicCatalog | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogRequest, setCatalogRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    getAcademicCatalog(controller.signal)
      .then((data) => { if (active) setCatalog(data); })
      .catch(() => { if (active) setCatalogError(true); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [catalogRequest]);

  // Danh mục không phụ thuộc số nhóm hiện có trong trang.
  const colleges = catalog?.colleges.map((college) => college.name) ?? [];
  const departments = Array.from(new Set((catalog?.colleges ?? [])
    .filter((college) => selectedCollege === "ALL" || college.name === selectedCollege)
    .flatMap((college) => college.departments)));

  // Available years from backend
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    fetchAvailableYears()
      .then((data) => { if (active && data.length > 0) setYears(data); })
      .catch(() => { if (active) setYears([]); });
    return () => { active = false; };
  }, []);

  const handleSelectCollege = (col: string) => {
    setSelectedCollege(col);
    setIsCollegeOpen(false);
    const available = catalog?.colleges
      .filter((college) => col === "ALL" || college.name === col)
      .flatMap((college) => college.departments) ?? [];
    if (!available.includes(selectedDepartment)) setSelectedDepartment("ALL");
  };

  const handleSearch = () => {

    setAppliedCollege(selectedCollege);
    setAppliedDepartment(selectedDepartment);
    setAppliedYear(selectedYear);
    setCurrentPage(1);
  };

  const loadGroups = useCallback(() => fetchGroups({
    keyword: appliedQuery.trim() || undefined,
    college: appliedCollege === "ALL" ? undefined : appliedCollege,
    department: appliedDepartment === "ALL" ? undefined : appliedDepartment,
    postYear: appliedYear === "ALL" ? undefined : Number(appliedYear),
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
    sort: "createdAt,desc",
  }), [appliedQuery, appliedCollege, appliedDepartment, appliedYear, currentPage]);
  const { status, data: groupPage, errorCode, reload } = useServiceData(loadGroups, isReady);
  const paginatedGroups = useMemo(() => {
    const groups = [...(groupPage?.content ?? [])];
    if (sortBy === "spots") groups.sort((a, b) => (b.maxMembers - b.memberCount) - (a.maxMembers - a.memberCount));
    return groups;
  }, [groupPage, sortBy]);
  const totalPages = Math.max(1, groupPage?.totalPages ?? 1);
  const loadStatistics = useCallback(() => getPublicStatistics(), []);
  const { data: statistics } = useServiceData(loadStatistics, isReady);
  const activeGroupsCount = statistics ? statistics.recruitingGroups + statistics.fullGroups : 0;
  const teamsRecruitingCount = statistics?.recruitingGroups ?? 0;

  const hasActiveFilters =
    appliedCollege !== "ALL" ||
    appliedDepartment !== "ALL" ||
    appliedYear !== "ALL" ||
    appliedQuery.trim() !== "";

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedCollege("ALL");
    setSelectedDepartment("ALL");
    setSelectedYear("ALL");
    setSearchQuery("");
    setAppliedCollege("ALL");
    setAppliedDepartment("ALL");
    setAppliedYear("ALL");
    setCurrentPage(1);
  };

  // Chờ khôi phục phiên trước khi quyết định hiển thị hoặc yêu cầu đăng nhập.
  if (!isReady) return null;

  return (
    <div className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Breadcrumb / Directory path */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
        <span className="text-[var(--primary)] uppercase">
          <ScrambleText text={t.groupsPage.breadcrumbDirectory} />
        </span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text-muted)] font-normal">
          <ScrambleText text={t.groupsPage.breadcrumbCampus} />
        </span>
      </div>

      {/* 2. Page Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          <ScrambleText text={t.groupsPage.title} />
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          <ScrambleText text={t.groupsPage.subtitle} />
        </p>
      </div>

      {/* 3. Metric Summary Cards - Using Design System Card */}
      <Card className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-muted)] p-4 sm:p-5">
        {/* Active Groups */}
        <div className="flex items-center gap-4 py-2 sm:py-0 px-2 sm:px-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-none">
              {activeGroupsCount}
            </div>
            <div className="text-xs font-medium text-[var(--text-muted)] mt-1">
              <ScrambleText text={t.groupsPage.activeGroups} />
            </div>
          </div>
        </div>

        {/* Teams Recruiting */}
        <div className="flex items-center gap-4 py-2 sm:py-0 px-2 sm:px-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--success-bg)] text-[var(--success)] flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-none">
              {teamsRecruitingCount}
            </div>
            <div className="text-xs font-medium text-[var(--text-muted)] mt-1">
              <ScrambleText text={t.groupsPage.teamsRecruiting} />
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Filter & Search Panel - Using Design System Card & SearchInput */}
      <Card className="p-4 sm:p-5 space-y-4">
        {/* Design System SearchInput */}
        <SearchInput
          placeholder={t.groupsPage.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          shortcut=""
        />

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* College Dropdown (단과대) */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsCollegeOpen(!isCollegeOpen);
                  setIsDeptOpen(false);
                  setIsYearOpen(false);
                  setIsSortOpen(false);
                }}
                rightIcon={
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                }
              >
                <span className="text-[var(--text-muted)] font-normal mr-1">
                  <ScrambleText text={t.groupsPage.collegeLabel} />
                </span>
                <span>
                  <ScrambleText text={selectedCollege === "ALL"
                    ? t.groupsPage.allColleges
                    : selectedCollege} />
                </span>
              </Button>

              {isCollegeOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 max-h-64 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                  <button
                    type="button"
                    onClick={() => handleSelectCollege("ALL")}
                    className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                      selectedCollege === "ALL"
                        ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <ScrambleText text={t.groupsPage.allColleges} />
                  </button>
                  {!catalog && (
                    <div className="px-3.5 py-2 text-xs text-[var(--text-muted)]" role="status">
                      {catalogError ? (
                        <button type="button" onClick={() => { setCatalogError(false); setCatalogRequest((value) => value + 1); }}>
                          {t.groupsPage.catalogRetry}
                        </button>
                      ) : t.groupsPage.catalogLoading}
                    </div>
                  )}
                  {colleges.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleSelectCollege(col)}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                        selectedCollege === col
                          ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Department Dropdown (학부/학과) */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsDeptOpen(!isDeptOpen);
                  setIsCollegeOpen(false);
                  setIsYearOpen(false);
                  setIsSortOpen(false);
                }}
                rightIcon={
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                }
              >
                <span className="text-[var(--text-muted)] font-normal mr-1">
                  <ScrambleText text={t.groupsPage.departmentLabel} />
                </span>
                <span>
                  <ScrambleText text={selectedDepartment === "ALL"
                    ? t.groupsPage.allDepartments
                    : selectedDepartment} />
                </span>
              </Button>

              {isDeptOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 max-h-56 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDepartment("ALL");
                      setIsDeptOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                      selectedDepartment === "ALL"
                        ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <ScrambleText text={t.groupsPage.allDepartments} />
                  </button>
                  {!catalog && (
                    <div className="px-3.5 py-2 text-xs text-[var(--text-muted)]" role="status">
                      {catalogError ? (
                        <button type="button" onClick={() => { setCatalogError(false); setCatalogRequest((value) => value + 1); }}>
                          {t.groupsPage.catalogRetry}
                        </button>
                      ) : t.groupsPage.catalogLoading}
                    </div>
                  )}
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setIsDeptOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                        selectedDepartment === dept
                          ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown (연도 / Năm đăng) */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsYearOpen(!isYearOpen);
                  setIsCollegeOpen(false);
                  setIsDeptOpen(false);
                  setIsSortOpen(false);
                }}
                rightIcon={
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                }
              >
                <span className="text-[var(--text-muted)] font-normal mr-1">
                  <ScrambleText text={t.groupsPage.yearLabel} />
                </span>
                <span>
                  <ScrambleText text={selectedYear === "ALL"
                    ? t.groupsPage.allYears
                    : t.groupsPage.yearFormat.replace("{year}", String(selectedYear))} />
                </span>
              </Button>

              {isYearOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear("ALL");
                      setIsYearOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                      selectedYear === "ALL"
                        ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <ScrambleText text={t.groupsPage.allYears} />
                  </button>
                  {years.map((yr) => {
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setSelectedYear(String(yr));
                          setIsYearOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                          selectedYear === String(yr)
                            ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                            : "text-[var(--text-secondary)]"
                        }`}
                      >
                        <ScrambleText text={t.groupsPage.yearFormat.replace("{year}", String(yr))} />

                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Action Button */}
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleSearch}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="px-4 font-semibold shadow-sm"
            >
              <ScrambleText text={t.groupsPage.searchBtn} />
            </Button>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              <ScrambleText text={t.groupsPage.sortByLabel} />
            </span>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsCollegeOpen(false);
                setIsDeptOpen(false);
                setIsYearOpen(false);
              }}
              rightIcon={
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              }
            >
              <span>
                <ScrambleText text={sortBy === "recent"
                  ? t.groupsPage.mostRecent
                  : t.groupsPage.spotsLeft} />
              </span>
            </Button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-40 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("recent");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                    sortBy === "recent"
                      ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  <ScrambleText text={t.groupsPage.mostRecent} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("spots");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                    sortBy === "spots"
                      ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  <ScrambleText text={t.groupsPage.spotsLeft} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Row using Badge */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-muted)] text-xs">
            <span className="text-[var(--text-muted)] font-medium">
              <ScrambleText text={t.groupsPage.activeFiltersLabel} />
            </span>

            {appliedCollege !== "ALL" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>
                  <ScrambleText text={t.groupsPage.collegeLabel} /> {appliedCollege}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCollege("ALL");
                    setSelectedCollege("ALL");
                  }}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove college filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {appliedDepartment !== "ALL" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>
                  <ScrambleText text={t.groupsPage.departmentLabel} /> {appliedDepartment}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedDepartment("ALL");
                    setSelectedDepartment("ALL");
                  }}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove department filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {appliedYear !== "ALL" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>
                  <ScrambleText text={t.groupsPage.yearLabel} />{" "}
                  <ScrambleText text={t.groupsPage.yearFormat.replace("{year}", appliedYear)} />
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedYear("ALL");
                    setSelectedYear("ALL");
                  }}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove year filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {appliedQuery.trim() !== "" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>
                  <ScrambleText text={t.groupsPage.filterSearchPrefix} />&quot;{appliedQuery}&quot;
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-[var(--primary)] font-semibold hover:underline ml-1 cursor-pointer"
            >
              <ScrambleText text={t.groupsPage.clearAll} />
            </button>
          </div>
        )}
      </Card>

      {/* 5. Group Card Grid - Uses .responsive-card-grid from globals.css */}
      {status === "loading" ? <CardSkeletonList count={ITEMS_PER_PAGE} /> : status === "error" ? (
        <ErrorState title={t.groupsPage.noResultsTitle} message={t.apiErrors[errorCode ?? "SERVER_ERROR"]} retryLabel={t.groupsPage.resetFiltersBtn} onRetry={reload} />
      ) : paginatedGroups.length > 0 ? (
        <div className="space-y-6">
          <div className="responsive-card-grid">
            {paginatedGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onJoin={() => {
                  setSelectedGroupForApply(group);
                  setIsApplyModalOpen(true);
                }}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border-muted)]">
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              <ScrambleText text={t.groupsPage.showingCount
                .replace("{current}", String(Math.min(currentPage * ITEMS_PER_PAGE, groupPage?.totalElements ?? 0)))
                .replace("{total}", String(groupPage?.totalElements ?? 0))} />
            </p>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                aria-label="Previous Page"
                className="w-8 h-8 rounded-md flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-container-low)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-container-low)]"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page Button */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1 border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-container-low)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span><ScrambleText text={t.groupsPage.nextBtn} /></span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="text-center py-16 px-4 border-dashed bg-[var(--surface-container-low)]">
          <SlidersHorizontal className="w-10 h-10 mx-auto text-[var(--text-faint)] mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            <ScrambleText text={t.groupsPage.noResultsTitle} />
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            <ScrambleText text={t.groupsPage.noResultsDesc} />
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleClearAll}
            className="mt-4"
          >
            <ScrambleText text={t.groupsPage.resetFiltersBtn} />
          </Button>
        </Card>
      )}

      {/* Quick Application Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        group={selectedGroupForApply}
      />
    </div>
  );
};

export default GroupPage;
