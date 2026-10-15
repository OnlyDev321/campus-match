"use client";

import { useState, useMemo } from "react";
import {
  Network,
  UserPlus,
  ChevronDown,
  X,
  SlidersHorizontal,
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
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [isRecruitingOnly, setIsRecruitingOnly] = useState(true);
  const [sortBy, setSortBy] = useState("Most Recent");

  // Dropdown open states
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Available subjects and skills extracted from mock data
  const subjects = useMemo(() => {
    const list = Array.from(new Set(mockGroupCards.map((g) => g.course)));
    return ["All Subjects", ...list];
  }, []);

  const skills = useMemo(() => {
    const set = new Set<string>();
    mockGroupCards.forEach((g) => g.tags.forEach((t) => set.add(t)));
    return ["All Skills", ...Array.from(set)];
  }, []);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return mockGroupCards.filter((group) => {
      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = group.title.toLowerCase().includes(query);
        const matchesDesc = group.description.toLowerCase().includes(query);
        const matchesCourse = group.course.toLowerCase().includes(query);
        const matchesTags = group.tags.some((t) =>
          t.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesDesc && !matchesCourse && !matchesTags) {
          return false;
        }
      }

      // Subject filter
      if (
        selectedSubject !== "All Subjects" &&
        group.course !== selectedSubject
      ) {
        return false;
      }

      // Skill filter
      if (
        selectedSkill !== "All Skills" &&
        !group.tags.includes(selectedSkill)
      ) {
        return false;
      }

      // Recruiting only filter
      if (isRecruitingOnly) {
        const spotsLeft = group.maxMembers - group.memberCount;
        if (spotsLeft <= 0) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSubject, selectedSkill, isRecruitingOnly]);

  const activeGroupsCount = mockGroupCards.length;
  const teamsRecruitingCount = mockGroupCards.filter(
    (g) => g.maxMembers > g.memberCount,
  ).length;

  const hasActiveFilters =
    isRecruitingOnly ||
    selectedSubject !== "All Subjects" ||
    selectedSkill !== "All Skills" ||
    searchQuery.trim() !== "";

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedSubject("All Subjects");
    setSelectedSkill("All Skills");
    setIsRecruitingOnly(false);
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
          shortcut=""
        />

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsSubjectOpen(!isSubjectOpen);
                  setIsSkillOpen(false);
                  setIsSortOpen(false);
                }}
                rightIcon={
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                }
              >
                <span className="text-[var(--text-muted)] font-normal mr-1">
                  Subject:
                </span>
                <span>{selectedSubject}</span>
              </Button>

              {isSubjectOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                  {subjects.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(sub);
                        setIsSubjectOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                        selectedSubject === sub
                          ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsSkillOpen(!isSkillOpen);
                  setIsSubjectOpen(false);
                  setIsSortOpen(false);
                }}
                rightIcon={
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                }
              >
                <span className="text-[var(--text-muted)] font-normal mr-1">
                  Skills:
                </span>
                <span>{selectedSkill}</span>
              </Button>

              {isSkillOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 max-h-56 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        setSelectedSkill(skill);
                        setIsSkillOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--surface-container-low)] ${
                        selectedSkill === skill
                          ? "font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Button (Recruiting Pill) using Button */}
            <Button
              variant={isRecruitingOnly ? "secondary" : "outline"}
              size="sm"
              type="button"
              onClick={() => setIsRecruitingOnly(!isRecruitingOnly)}
              leftIcon={
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0" />
              }
              rightIcon={
                <ChevronDown
                  className={`w-3.5 h-3.5 ${
                    isRecruitingOnly
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-faint)]"
                  }`}
                />
              }
              className={
                isRecruitingOnly
                  ? "!border-[var(--primary-soft-border)] !bg-[var(--primary-soft)] !text-[var(--primary)]"
                  : ""
              }
            >
              Recruiting
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
                setIsSubjectOpen(false);
                setIsSkillOpen(false);
              }}
              rightIcon={
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              }
            >
              <span>{sortBy}</span>
            </Button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-36 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-2)] py-1 z-20">
                {["Most Recent", "Most Popular", "Spots Left"].map((item) => (
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

            {isRecruitingOnly && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>Status: Recruiting</span>
                <button
                  type="button"
                  onClick={() => setIsRecruitingOnly(false)}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove recruiting filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {selectedSubject !== "All Subjects" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>Subject: {selectedSubject}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubject("All Subjects")}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove subject filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {selectedSkill !== "All Skills" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>Skill: {selectedSkill}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSkill("All Skills")}
                  className="text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Remove skill filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )}

            {searchQuery.trim() !== "" && (
              <Badge variant="neutral" size="md" className="gap-2">
                <span>Search: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
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
