"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import React, { useEffect, useState } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  CalendarOff,
  CalendarSync,
  Info,
  LogIn,
  MapPin,
  UserRound,
} from "lucide-react";
import { Badge, Button, Card } from "@/design-system";
import { formatMessage, formatSeoulDateTime } from "@/lib/format";
import {
  buildBlocksByDay,
  formatMinutes,
  formatSessionLocation,
  seoulToday,
  timeAxis,
  timetableDays,
} from "@/lib/timetable";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import type {
  TimetableBlock,
  TimetableDay,
  TimetableSkeletonProps,
  TimetableStatePanelProps,
  TimetableViewProps,
} from "@/lib/types";

// Khung "My Timetable" trên My Page.
// - Dữ liệu là ảnh chụp thời khóa biểu u-SAINT (ZCMW2102) lấy cùng lúc đăng nhập, lưu trong authStore.
// - Desktop / tablet: lưới tuần đặt buổi học theo giờ bắt đầu / kết thúc thực tế. Mobile: chọn ngày + danh sách.
// - Phân biệt rõ: đang tải, thành công, rỗng, lỗi (unavailable) và phiên cũ chưa có dữ liệu (not_fetched).
// - Giao diện: bảng lịch tối giản trong Card, màu môn học pha từ token (light / dark), không dùng viền màu bên trái.

const PX_PER_MINUTE = 1;

// Màu nhấn của môn học, đều suy ra từ token sẵn có (tím / xanh ngọc là pha trộn token). Không dùng đỏ (nghĩa lỗi).
const COURSE_ACCENTS = [
  "var(--primary)",
  "var(--warning)",
  "var(--success)",
  "color-mix(in srgb, var(--primary) 55%, var(--error))",
  "color-mix(in srgb, var(--primary) 50%, var(--success))",
  "var(--text-muted)",
];

// Bộ biến màu cho một môn: nền nhạt, viền nhạt, chữ chính và chữ phụ đều nhuốm sắc của môn (đủ tương phản).
const courseTheme = (colorIndex: number) => {
  const accent = COURSE_ACCENTS[colorIndex % COURSE_ACCENTS.length];
  return {
    "--course-accent": accent,
    "--course-bg": `color-mix(in srgb, ${accent} 9%, var(--surface))`,
    "--course-bg-hover": `color-mix(in srgb, ${accent} 14%, var(--surface))`,
    "--course-border": `color-mix(in srgb, ${accent} 26%, var(--surface))`,
    "--course-ink": `color-mix(in srgb, ${accent} 28%, var(--text-primary))`,
    "--course-ink-muted": `color-mix(in srgb, ${accent} 38%, var(--text-secondary))`,
  } as React.CSSProperties;
};

const describeBlock = (block: TimetableBlock) =>
  [
    block.course.name,
    `${block.session.start}–${block.session.end}`,
    formatSessionLocation(block.session),
    block.session.locationDetail,
    block.course.instructor,
  ]
    .filter(Boolean)
    .join(" · ");

const blockKey = (block: TimetableBlock) => `${block.course.id}-${block.session.day}-${block.session.start}`;

// Giờ hiện tại (phút trong ngày) theo Asia/Seoul.
const seoulMinutesNow = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return value("hour") * 60 + value("minute");
};

// Asia/Seoul lệch UTC đúng 9 giờ (không có giờ mùa hè) nên đầu phút ở Seoul trùng đầu phút của epoch.
const msUntilNextMinute = () => 60_000 - (Date.now() % 60_000) + 25;

// Phút hiện tại cho vạch "bây giờ" trên lưới.
// - Chỉ chạy khi enabled (hôm nay có trên lưới); mỗi component một timer, hẹn đúng đầu phút, dọn khi unmount.
// - Khi giờ hiện tại nằm ngoài khung [start, end] thì giữ nguyên giá trị cũ để React bỏ qua render.
const useSeoulMinutes = (enabled: boolean, start: number, end: number): number => {
  const [minutes, setMinutes] = useState(seoulMinutesNow);
  useEffect(() => {
    if (!enabled) return;
    const inRange = (m: number) => m >= start && m <= end;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNextTick = () => {
      timer = setTimeout(() => {
        setMinutes((previous) => {
          const next = seoulMinutesNow();
          return inRange(previous) || inRange(next) ? next : previous;
        });
        scheduleNextTick();
      }, msUntilNextMinute());
    };
    scheduleNextTick();
    return () => clearTimeout(timer);
  }, [enabled, start, end]);
  return minutes;
};

const TimetableGrid = ({ blocksByDay, days, today }: TimetableViewProps) => {
  const { t } = useLanguageStore();
  const axis = timeAxis(days.flatMap((day) => blocksByDay[day]));
  const nowMinutes = useSeoulMinutes(today !== null, axis.start, axis.end);
  const height = (axis.end - axis.start) * PX_PER_MINUTE;
  const hours: number[] = [];
  for (let minute = axis.start; minute <= axis.end; minute += 60) hours.push(minute);
  const columns = { gridTemplateColumns: `3.25rem repeat(${days.length}, minmax(0, 1fr))` };
  const showNow = today !== null && nowMinutes >= axis.start && nowMinutes <= axis.end;

  return (
    <div className="hidden overflow-hidden rounded-(--radius-md) border border-(--border) md:block">
      {/* Day headers */}
      <div className="grid border-b border-(--border) bg-(--surface-container-low)" style={columns}>
        <div />
        {days.map((day) => (
          <div
            key={day}
            className={`flex h-10 items-center justify-center gap-1.5 border-l border-(--border-muted) text-xs font-semibold ${
              day === today ? "text-(--primary)" : "text-(--text-secondary)"
            }`}
          >
            <span><ScrambleText text={t.timetable.days[day]} /></span>
            {day === today && (
              <span className="rounded-full bg-(--primary-soft) px-1.5 py-px text-[10px] font-semibold leading-4 text-(--primary) ring-1 ring-inset ring-(--primary-soft-border)">
                <ScrambleText text={t.timetable.today} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Time axis + day columns */}
      <div className="grid bg-(--surface)" style={columns}>
        <div className="py-2.5" aria-hidden="true">
          <div className="relative" style={{ height }}>
            {hours.map((minute) => (
              <span
                key={minute}
                className="absolute right-2 -translate-y-1/2 font-mono text-[10.5px] tabular-nums text-[color-mix(in_srgb,var(--text-secondary)_50%,var(--text-muted))]"
                style={{ top: (minute - axis.start) * PX_PER_MINUTE }}
              >
                {formatMinutes(minute)}
              </span>
            ))}
          </div>
        </div>

        {days.map((day) => (
          <div
            key={day}
            className={`border-l border-(--border-muted) py-2.5 ${
              day === today ? "bg-[color-mix(in_srgb,var(--primary)_5%,transparent)]" : ""
            }`}
          >
            <div
              role="list"
              aria-label={t.timetable.daysLong[day]}
              className="relative"
              style={{
                height,
                backgroundImage:
                  "linear-gradient(to bottom, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border-muted) 1px, transparent 1px)",
                backgroundSize: `100% ${60 * PX_PER_MINUTE}px, 100% ${30 * PX_PER_MINUTE}px`,
              }}
            >
              {day === today && showNow && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-10 h-px bg-(--primary)"
                  style={{ top: (nowMinutes - axis.start) * PX_PER_MINUTE }}
                >
                  <span className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-(--primary)" />
                </div>
              )}
              {blocksByDay[day].map((block) => {
                const blockHeight = (block.endMin - block.startMin) * PX_PER_MINUTE;
                return (
                  <div
                    key={blockKey(block)}
                    role="listitem"
                    tabIndex={0}
                    title={describeBlock(block)}
                    aria-label={describeBlock(block)}
                    className="group/block absolute z-[1] h-(--block-h) overflow-hidden rounded-(--radius-xs) border border-(--course-border) bg-(--course-bg) px-2 py-1.5 transition-[background-color,box-shadow] duration-150 ease-out hover:z-20 hover:h-auto hover:min-h-(--block-h) hover:bg-(--course-bg-hover) hover:shadow-(--shadow-level-2) focus-visible:z-20 focus-visible:h-auto focus-visible:min-h-(--block-h) focus-visible:bg-(--course-bg-hover) focus-visible:shadow-(--shadow-level-2) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-solid focus-visible:outline-(--primary)"
                    style={{
                      ...courseTheme(block.colorIndex),
                      "--block-h": `${blockHeight}px`,
                      top: (block.startMin - axis.start) * PX_PER_MINUTE,
                      left: `calc(${(block.lane / block.lanes) * 100}% + 3px)`,
                      width: `calc(${100 / block.lanes}% - 6px)`,
                    } as React.CSSProperties}
                  >
                    <p className="line-clamp-2 break-keep text-xs font-semibold leading-[1.3] tracking-[-0.005em] text-(--course-ink) group-hover/block:line-clamp-none group-focus-visible/block:line-clamp-none">
                      {block.course.name}
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] font-medium tabular-nums text-(--course-ink-muted)">
                      {block.session.start}–{block.session.end}
                    </p>
                    <p className="truncate text-[11px] text-(--course-ink-muted) group-hover/block:whitespace-normal group-focus-visible/block:whitespace-normal">
                      {formatSessionLocation(block.session)}
                    </p>
                    {block.session.locationDetail && (
                      <p className="hidden text-[11px] text-(--course-ink-muted) group-hover/block:block group-focus-visible/block:block">
                        {block.session.locationDetail}
                      </p>
                    )}
                    <p className="hidden truncate text-[11px] text-(--course-ink-muted) group-hover/block:block group-focus-visible/block:block lg:block">
                      {block.course.instructor}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimetableDayList = ({ blocksByDay, days, today }: TimetableViewProps) => {
  const { t } = useLanguageStore();
  const [selected, setSelected] = useState<TimetableDay>(today && days.includes(today) ? today : days[0]);
  const blocks = [...blocksByDay[selected]].sort((a, b) => a.startMin - b.startMin);

  return (
    <div className="space-y-3 md:hidden">
      <div
        role="group"
        aria-label={t.timetable.daySelector}
        className="grid gap-1 rounded-(--radius-sm) bg-(--surface-container-low) p-1 ring-1 ring-inset ring-(--border-muted)"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const active = day === selected;
          const count = blocksByDay[day].length;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              aria-label={`${t.timetable.daysLong[day]}${day === today ? ` (${t.timetable.today})` : ""}`}
              onClick={() => setSelected(day)}
              className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-(--radius-xs) px-1 py-1.5 transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-(--primary) ${
                active
                  ? "bg-(--surface) shadow-(--shadow-level-1) ring-1 ring-(--primary-soft-border)"
                  : "hover:bg-(--surface-container)"
              }`}
            >
              <span
                className={`relative text-[13px] font-semibold leading-5 ${
                  active ? "text-(--primary)" : "text-(--text-secondary)"
                }`}
              >
                <ScrambleText text={t.timetable.days[day]} />
                {day === today && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-0.5 h-1.5 w-1.5 rounded-full bg-(--primary)"
                  />
                )}
              </span>
              <span
                aria-hidden="true"
                className={`font-mono text-[10px] leading-3 tabular-nums ${active ? "text-(--text-secondary)" : "text-(--text-muted)"}`}
              >
                {count > 0 ? count : "–"}
              </span>
            </button>
          );
        })}
      </div>

      {blocks.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-(--radius-sm) bg-(--surface-container-low) px-4 py-8 text-sm text-(--text-secondary)">
          <CalendarCheck2 className="h-4 w-4 text-(--text-muted)" aria-hidden="true" />
          <ScrambleText text={formatMessage(t.timetable.dayEmpty, { day: t.timetable.daysLong[selected] })} protectedValues={[...Object.values({ day: t.timetable.daysLong[selected] })]} />
        </div>
      ) : (
        <ol className="space-y-2" aria-label={t.timetable.daysLong[selected]}>
          {blocks.map((block) => (
            <li
              key={blockKey(block)}
              className="flex gap-3 rounded-(--radius-sm) border border-(--course-border) bg-(--course-bg) p-3"
              style={courseTheme(block.colorIndex)}
            >
              <div className="w-11 shrink-0 font-mono text-xs leading-5 tabular-nums">
                <p className="font-semibold text-(--course-ink)">{block.session.start}</p>
                <p className="text-(--course-ink-muted)">{block.session.end}</p>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="break-words text-sm font-semibold leading-5 tracking-[-0.005em] text-(--course-ink)">
                  {block.course.name}
                </p>
                <p className="flex items-start gap-1.5 text-xs leading-4 text-(--course-ink-muted)">
                  <MapPin className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words">
                    {formatSessionLocation(block.session)}
                    {block.session.locationDetail && <> · {block.session.locationDetail}</>}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-xs leading-4 text-(--course-ink-muted)">
                  <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{block.course.instructor}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

// Khung skeleton mô phỏng đúng bố cục lưới (desktop) và danh sách (mobile).
const SKELETON_BLOCKS = [[2, 3], [0], [3], [0, 1], [2]];

const TimetableSkeleton = ({ label }: TimetableSkeletonProps) => (
  <div aria-busy="true" aria-label={label} className="motion-safe:animate-pulse">
    <div className="hidden overflow-hidden rounded-(--radius-md) border border-(--border) md:block">
      <div className="grid h-10 grid-cols-[3.25rem_repeat(5,minmax(0,1fr))] border-b border-(--border) bg-(--surface-container-low)">
        <div />
        {SKELETON_BLOCKS.map((_, i) => (
          <div key={i} className="flex items-center justify-center border-l border-(--border-muted)">
            <div className="h-2.5 w-8 rounded-full bg-(--surface-container-high)" />
          </div>
        ))}
      </div>
      <div className="grid h-72 grid-cols-[3.25rem_repeat(5,minmax(0,1fr))]">
        <div />
        {SKELETON_BLOCKS.map((slots, i) => (
          <div key={i} className="relative border-l border-(--border-muted)">
            {slots.map((slot) => (
              <div
                key={slot}
                className="absolute inset-x-1 h-14 rounded-(--radius-xs) bg-(--surface-container)"
                style={{ top: 12 + slot * 64 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-2 md:hidden">
      <div className="h-12 rounded-(--radius-sm) bg-(--surface-container-low)" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-(--radius-sm) bg-(--surface-container)" />
      ))}
    </div>
  </div>
);

const TimetableStatePanel = ({ icon, title, description, action, tone = "neutral" }: TimetableStatePanelProps) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className="flex flex-col items-center gap-3 rounded-(--radius-md) bg-(--surface-container-low) px-6 py-10 text-center ring-1 ring-inset ring-(--border-muted)"
  >
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-(--radius-sm) ring-1 ring-inset ${
        tone === "error"
          ? "bg-(--error-bg) text-(--error-text) ring-(--error-border)"
          : "bg-(--surface) text-(--text-secondary) ring-(--border)"
      }`}
      aria-hidden="true"
    >
      {icon}
    </span>
    <div className="max-w-sm space-y-1">
      <p className="break-keep text-sm font-semibold text-(--text-primary)">{title}</p>
      {description && <p className="break-keep text-[13px] leading-5 text-(--text-secondary)">{description}</p>}
    </div>
    {action && <div className="pt-1">{action}</div>}
  </div>
);

const TimetableCard = () => {
  const { t, language } = useLanguageStore();
  const { timetable, timetableStatus, openLoginModal } = useAuthStore();

  const signInAgain = () => openLoginModal("/mypage");
  const loaded = timetableStatus === "success" && timetable ? timetable : null;
  const termLabel = loaded
    ? formatMessage(t.timetable.term, {
        year: loaded.term.yearKey,
        // Chỉ khóa "092" (2학기) đã được xác nhận; khóa khác hiển thị nguyên nhãn u-SAINT.
        semester: loaded.term.semesterKey === "092" ? t.timetable.secondSemester : loaded.term.semesterLabel,
      })
    : "";

  let body: React.ReactNode;
  if (timetableStatus === "loading") {
    body = <TimetableSkeleton label={t.timetable.loading} />;
  } else if (timetableStatus === "unavailable") {
    body = (
      <TimetableStatePanel
        tone="error"
        icon={<CalendarOff className="h-5 w-5" />}
        title={t.timetable.unavailableTitle}
        description={t.timetable.unavailableDesc}
        action={
          <Button size="sm" variant="outline" onClick={signInAgain} leftIcon={<LogIn className="h-3.5 w-3.5" />}>
            <ScrambleText text={t.timetable.signInAgain} />
          </Button>
        }
      />
    );
  } else if (!loaded) {
    body = (
      <TimetableStatePanel
        icon={<CalendarSync className="h-5 w-5" />}
        title={t.timetable.notFetchedTitle}
        description={t.timetable.notFetched}
        action={
          <Button size="sm" onClick={signInAgain} leftIcon={<LogIn className="h-3.5 w-3.5" />}>
            <ScrambleText text={t.timetable.signInAgain} />
          </Button>
        }
      />
    );
  } else if (loaded.courses.length === 0) {
    body = (
      <TimetableStatePanel
        icon={<CalendarCheck2 className="h-5 w-5" />}
        title={formatMessage(t.timetable.empty, { term: termLabel })}
        description={t.timetable.untimedNote}
      />
    );
  } else {
    const days = timetableDays(loaded);
    const today = seoulToday();
    const view: TimetableViewProps = {
      blocksByDay: buildBlocksByDay(loaded),
      days,
      today: today && days.includes(today) ? today : null,
    };
    body = (
      <>
        <TimetableGrid {...view} />
        <TimetableDayList {...view} />
      </>
    );
  }

  return (
    <Card className="space-y-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-sm) bg-(--primary-soft) text-(--primary) ring-1 ring-inset ring-(--primary-soft-border)"
            aria-hidden="true"
          >
            <CalendarDays className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-lg font-semibold leading-6 tracking-[-0.015em] text-(--text-primary)">
              <ScrambleText text={t.timetable.title} />
            </h2>
            {loaded && (
              <p className="break-keep text-xs leading-5 text-(--text-muted)">
                <ScrambleText text={formatMessage(t.timetable.fetchedAt, { time: formatSeoulDateTime(loaded.fetchedAt, language) })} protectedValues={[...Object.values({ time: formatSeoulDateTime(loaded.fetchedAt, language) })]} />
              </p>
            )}
          </div>
        </div>
        {loaded && (
          <Badge variant="primary" size="sm" mono>
            {termLabel}
          </Badge>
        )}
      </div>

      {body}

      {loaded && loaded.courses.length > 0 && (
        <p className="flex items-start gap-1.5 break-keep text-xs leading-5 text-(--text-muted)">
          <Info className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <ScrambleText text={t.timetable.untimedNote} />
        </p>
      )}
    </Card>
  );
};

export default TimetableCard;
