"use client";

import React from "react";
import { CalendarDays, Clock, LogIn, MapPin } from "lucide-react";
import { Badge, Button, Card } from "@/design-system";
import { EmptyState, ErrorState } from "@/components/common/AsyncState";
import { buildTimetableLayout, TIMETABLE_DAYS } from "@/lib/timetable";
import { formatDateTime, formatMessage } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import type {
  StudentTimetable,
  TimetableCardProps,
  TimetableCourseDetailsProps,
  TimetableCoursesProps,
  TranslationDict,
} from "@/lib/types";

// Thẻ thời khóa biểu tuần trên My Page (dữ liệu lấy từ u-SAINT lúc đăng nhập, lưu trong authStore).
// - Màn hình md trở lên: lưới theo giờ (T2–T6, thêm T7 nếu có môn). Màn hình nhỏ: danh sách theo từng ngày.
// - Tên môn và phòng học giữ nguyên như u-SAINT trả về (không dịch).
// - Màu khối suy ra từ các design token có sẵn (primary / success / warning / surface), theo tên môn.

const TONE_CLASSES = [
  "bg-[var(--primary-soft)] border-[var(--primary-soft-border)] text-[var(--primary)]",
  "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]",
  "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning-text)]",
  "bg-[var(--surface-container-high)] border-[var(--border-strong)] text-[var(--text-primary)]",
];

const CourseDetails = ({ course, compact }: TimetableCourseDetailsProps) => {
  const { t } = useLanguageStore();
  return (
    <>
      <p className={`font-semibold leading-snug ${compact ? "text-[11px] line-clamp-2" : "text-sm"}`}>
        {course.name}
      </p>
      <p className={`inline-flex items-center gap-1 font-mono opacity-90 ${compact ? "text-[10px]" : "text-xs"}`}>
        <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span className="sr-only">{t.timetable.timeLabel}: </span>
        {course.start}–{course.end}
      </p>
      {course.room && (
        <p className={`inline-flex items-center gap-1 opacity-90 ${compact ? "text-[10px] truncate max-w-full" : "text-xs"}`}>
          <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span className="sr-only">{t.timetable.roomLabel}: </span>
          <span className="truncate">{course.room}</span>
        </p>
      )}
    </>
  );
};

const TimetableGrid = ({ courses }: TimetableCoursesProps) => {
  const { t } = useLanguageStore();
  const layout = buildTimetableLayout(courses);
  const hours = Array.from(
    { length: layout.endHour - layout.startHour },
    (_, index) => layout.startHour + index,
  );
  const bodyHeight = hours.length * layout.hourHeight;

  return (
    <div className="hidden md:block overflow-x-auto">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `3.5rem repeat(${layout.days.length}, minmax(0, 1fr))` }}
      >
        {/* Day headers (the day columns below carry the accessible day names) */}
        <div aria-hidden="true" />
        {layout.days.map((day) => (
          <div
            key={day}
            aria-hidden="true"
            className="pb-2 text-center text-xs font-semibold text-[var(--text-secondary)]"
          >
            {t.timetable.daysShort[day]}
          </div>
        ))}

        {/* Time axis */}
        <div aria-hidden="true" className="relative" style={{ height: bodyHeight }}>
          {hours.map((hour, index) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-muted)]"
              style={{ top: index * layout.hourHeight }}
            >
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {/* Day columns */}
        {layout.days.map((day) => (
          <div
            key={day}
            className="relative border-l border-[var(--border-muted)]"
            style={{ height: bodyHeight }}
          >
            {hours.map((hour, index) => (
              <div
                key={hour}
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-[var(--border-muted)]"
                style={{ top: index * layout.hourHeight }}
              />
            ))}
            <ul aria-label={t.timetable.daysLong[day]} className="absolute inset-0">
              {layout.blocksByDay[day].map((block) => (
                <li
                  key={`${block.course.name}-${block.course.start}-${block.course.end}`}
                  className={`absolute overflow-hidden rounded-[var(--radius-sm)] border px-1.5 py-1 flex flex-col gap-0.5 ${TONE_CLASSES[block.tone]}`}
                  style={{
                    top: block.top + 1,
                    height: Math.max(block.height - 2, 20),
                    left: `calc(${(block.lane / block.laneCount) * 100}% + 2px)`,
                    width: `calc(${100 / block.laneCount}% - 4px)`,
                  }}
                >
                  <CourseDetails course={block.course} compact />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimetableList = ({ courses }: TimetableCoursesProps) => {
  const { t } = useLanguageStore();
  const layout = buildTimetableLayout(courses);
  const daysWithCourses = TIMETABLE_DAYS.filter((day) => layout.blocksByDay[day].length > 0);

  return (
    <div className="md:hidden space-y-5">
      {daysWithCourses.map((day) => (
        <section key={day} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t.timetable.daysLong[day]}
          </h3>
          <ul className="space-y-2">
            {layout.blocksByDay[day].map((block) => (
              <li
                key={`${block.course.name}-${block.course.start}-${block.course.end}`}
                className={`rounded-[var(--radius-md)] border px-3 py-2 flex flex-col gap-1 ${TONE_CLASSES[block.tone]}`}
              >
                <CourseDetails course={block.course} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

const semesterText = (timetable: StudentTimetable, t: TranslationDict) => {
  if (timetable.year && timetable.term) {
    return formatMessage(t.timetable.semester, {
      year: timetable.year,
      term: t.timetable.terms[timetable.term],
    });
  }
  return timetable.semesterLabel;
};

const TimetableCard = ({ timetable }: TimetableCardProps) => {
  const { t, language } = useLanguageStore();
  const { openLoginModal } = useAuthStore();
  const loginAgain = () => openLoginModal("/mypage");
  const semester = timetable ? semesterText(timetable, t) : null;

  return (
    <Card className="p-6 sm:p-8 space-y-5" role="region" aria-labelledby="timetable-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
            <h2
              id="timetable-title"
              className="text-lg font-bold tracking-tight text-[var(--text-primary)]"
            >
              {t.timetable.title}
            </h2>
            {semester && (
              <Badge variant="primary" size="sm">
                {semester}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t.timetable.refreshNote}</p>
        </div>
        {timetable && (
          <p className="text-[11px] font-mono text-[var(--text-muted)]">
            {formatMessage(t.timetable.lastUpdated, {
              time: formatDateTime(timetable.fetchedAt, language),
            })}
          </p>
        )}
      </div>

      {!timetable ? (
        <EmptyState
          text={t.timetable.notLoaded}
          action={
            <Button size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />} onClick={loginAgain}>
              {t.timetable.loginAgain}
            </Button>
          }
        />
      ) : timetable.status === "unavailable" ? (
        <ErrorState
          title={t.timetable.unavailable}
          message={t.timetable.unavailableHint}
          retryLabel={t.timetable.loginAgain}
          onRetry={loginAgain}
        />
      ) : timetable.status === "empty" || timetable.courses.length === 0 ? (
        <EmptyState text={t.timetable.empty} />
      ) : (
        <>
          <TimetableGrid courses={timetable.courses} />
          <TimetableList courses={timetable.courses} />
        </>
      )}
    </Card>
  );
};

export default TimetableCard;
