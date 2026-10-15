"use client";

import { useState, useMemo } from "react";
import {
  Network,
  UserPlus,
  ChevronDown,
  X,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import GroupCard from "@/components/group/GroupCard";
import { Card, SearchInput, Button, Badge } from "@/design-system";
import { mockGroupCards } from "@/lib/mockData";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const GroupPage = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading, openLoginModal } = useAuth();

  // Yêu cầu đăng nhập trước khi vào xem trang Groups
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      openLoginModal("/groups");
      router.push("/");
    }
  }, [isLoggedIn, isLoading, openLoginModal, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [sortBy, setSortBy] = useState("Most Recent");

  // Applied filter states (triggered on Search button click or Enter)
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedCollege, setAppliedCollege] = useState("All Colleges");
  const [appliedDepartment, setAppliedDepartment] = useState("All Departments");
  const [appliedYear, setAppliedYear] = useState("All Years");

  // Dropdown open states
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Available colleges (단과대)
  const colleges = useMemo(() => {
    const list = Array.from(new Set(mockGroupCards.map((g) => g.college)));
    return ["All Colleges", ...list];
  }, []);

  // Available departments (학부/학과 - cascaded by selected college)
  const departments = useMemo(() => {
    const pool =
      selectedCollege === "All Colleges"
        ? mockGroupCards
        : mockGroupCards.filter((g) => g.college === selectedCollege);
    const list = Array.from(new Set(pool.map((g) => g.department)));
    return ["All Departments", ...list];
  }, [selectedCollege]);

  // Available years (연도 / Năm đăng bài)
  const years = useMemo(() => {
    const list = Array.from(new Set(mockGroupCards.map((g) => g.postYear))).sort(
      (a, b) => b - a,
    );
    return ["All Years", ...list.map(String)];
  }, []);

  const handleSelectCollege = (col: string) => {
    setSelectedCollege(col);
    setIsCollegeOpen(false);
    if (col !== "All Colleges") {
      const deptsInCollege = mockGroupCards
        .filter((g) => g.college === col)
        .map((g) => g.department);
      if (!deptsInCollege.includes(selectedDepartment)) {
        setSelectedDepartment("All Departments");
      }
    }
  };

  const handleSearch = () => {
    setAppliedQuery(searchQuery);
    setAppliedCollege(selectedCollege);
    setAppliedDepartment(selectedDepartment);
    setAppliedYear(selectedYear);
  };

  // Filter groups
  const filteredGroups = useMemo(() => {
    return mockGroupCards
      .filter((group) => {
        // Search keyword filter
        if (appliedQuery.trim()) {
          const query = appliedQuery.toLowerCase();
          const matchesTitle = group.title.toLowerCase().includes(query);
          const matchesDesc = group.description.toLowerCase().includes(query);
          const matchesCourse = group.course.toLowerCase().includes(query);
          const matchesCollege = group.college.toLowerCase().includes(query);
          const matchesDept = group.department.toLowerCase().includes(query);
          const matchesYear = String(group.postYear).includes(query);
          if (
            !matchesTitle &&
            !matchesDesc &&
            !matchesCourse &&
            !matchesCollege &&
            !matchesDept &&
            !matchesYear
          ) {
            return false;
          }
        }

        // College filter (단과대)
        if (
          appliedCollege !== "All Colleges" &&
          group.college !== appliedCollege
        ) {
          return false;
        }

        // Department filter (학부/학과)
        if (
          appliedDepartment !== "All Departments" &&
          group.department !== appliedDepartment
        ) {
          return false;
        }

        // Post Year filter (Năm đăng bài)
        if (
          appliedYear !== "All Years" &&
          String(group.postYear) !== appliedYear
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Most Recent") {
          return b.postYear - a.postYear;
        }
        if (sortBy === "Spots Left") {
          const spotsA = a.maxMembers - a.memberCount;
          const spotsB = b.maxMembers - b.memberCount;
          return spotsB - spotsA;
        }
        return 0;
      });
  }, [
    appliedQuery,
    appliedCollege,
    appliedDepartment,
    appliedYear,
    sortBy,
  ]);

  const activeGroupsCount = mockGroupCards.length;
  const teamsRecruitingCount = mockGroupCards.filter(
    (g) => g.maxMembers > g.memberCount,
  ).length;

  const hasActiveFilters =
    appliedCollege !== "All Colleges" ||
    appliedDepartment !== "All Departments" ||
    appliedYear !== "All Years" ||
    appliedQuery.trim() !== "";

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedCollege("All Colleges");
    setSelectedDepartment("All Departments");
    setSelectedYear("All Years");
    setAppliedQuery("");
    setAppliedCollege("All Colleges");
    setAppliedDepartment("All Departments");
    setAppliedYear("All Years");
  };

  return (
    <div className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Breadcrumb / Directory path */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
        <span className="text-[var(--primary)] uppercase">
          WORKSPACE DIRECTORY
        </span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text-muted)] font-normal">
          SoongSil Campus
        </span>
      </div>

      {/* 2. Page Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Find Your Group
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Discover study groups, capstone design projects, and programming teams
          across campus.
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
              Active Groups
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
              Teams Recruiting
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Filter & Search Panel - Using Design System Card & SearchInput */}
      <Card className="p-4 sm:p-5 space-y-4">
        {/* Design System SearchInput */}
        <SearchInput
          placeholder="Search by group name, topic, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                  대학:
                </span>
                <span>{selectedCollege}</span>
              </Button>

              {isCollegeOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
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
                  학과:
                </span>
                <span>{selectedDepartment}</span>
              </Button>

              {isDeptOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 max-h-56 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
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
                  연도:
                </span>
                <span>
                  {selectedYear === "All Years" ? "All Years" : `${selectedYear}년`}
                </span>
              </Button>

              {isYearOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-36 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                  {years.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedYear(yr);
                        setIsYearOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                        selectedYear === yr
                          ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {yr === "All Years" ? yr : `${yr}년`}
                    </button>
                  ))}
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
              Search
            </Button>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Sort by:
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
              <span>{sortBy}</span>
            </Button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-36 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                {["Most Recent", "Spots Left"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSortBy(item);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                      sortBy === item
                        ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Row using Badge */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-muted)] text-xs">
            <span className="text-[var(--text-muted)] font-medium">
              Active Filters:
            </span>

            {appliedCollege !== "All Colleges" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>대학: {appliedCollege}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCollege("All Colleges");
                    setSelectedCollege("All Colleges");
                  }}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove college filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {appliedDepartment !== "All Departments" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>학과: {appliedDepartment}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedDepartment("All Departments");
                    setSelectedDepartment("All Departments");
                  }}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove department filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {appliedYear !== "All Years" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>연도: {appliedYear}년</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedYear("All Years");
                    setSelectedYear("All Years");
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
                <span>Search: &quot;{appliedQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedQuery("");
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
              Clear All
            </button>
          </div>
        )}
      </Card>

      {/* 5. Group Card Grid - Uses .responsive-card-grid from globals.css */}
      {filteredGroups.length > 0 ? (
        <div className="responsive-card-grid">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 px-4 border-dashed bg-[var(--surface-container-low)]">
          <SlidersHorizontal className="w-10 h-10 mx-auto text-[var(--text-faint)] mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            No matching groups found
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or removing active filters to see
            more study groups.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleClearAll}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      )}
    </div>
  );
};

export default GroupPage;
