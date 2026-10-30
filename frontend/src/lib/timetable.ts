import type { SapWdaClient } from "usaint-lib";
import type {
  RawTimetable,
  StudentTimetable,
  TimetableBlock,
  TimetableCourse,
  TimetableDay,
  TimetableLayout,
  TimetableParseResult,
  TimetableSemesterTarget,
  TimetableTerm,
  TimetableUnavailableReason,
} from "@/lib/types";

/**
 * Tiện ích thời khóa biểu u-SAINT (màn hình ZCMW2102), thuần và dùng được cả ở server (BFF) lẫn client.
 * - File này chỉ import type, không có phụ thuộc lúc chạy, để có thể kiểm thử độc lập.
 * - Không bao giờ ghi log nội dung thời khóa biểu.
 */

/** ID các phần tử trên màn hình ZCMW2102 (nguồn: dự án mã nguồn mở rusaint, đã xác nhận bằng script khám phá). */
export const TIMETABLE_CONTROL_IDS = {
  YEAR: "ZCMW_PERIOD_RE.ID_D8FB9BECD84FD622F5EAED9E0BE35D27:VIW_MAIN.PERYR",
  SEMESTER: "ZCMW_PERIOD_RE.ID_D8FB9BECD84FD622F5EAED9E0BE35D27:VIW_MAIN.PERID",
  TABLE: "ZCMW2102.ID_0001:VIW_MAIN.TABLE",
} as const;

export const TERM_KEYS: Record<TimetableTerm, string> = {
  FIRST: "090",
  SUMMER: "091",
  SECOND: "092",
  WINTER: "093",
};

export const termFromKey = (key: string): TimetableTerm | null =>
  (Object.keys(TERM_KEYS) as TimetableTerm[]).find((term) => TERM_KEYS[term] === key) ?? null;

export const TIMETABLE_DAYS: TimetableDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const KOREAN_DAY_HEADERS = ["월", "화", "수", "목", "금", "토"];

const MAX_COURSES = 60;
const TIME_RANGE = /^(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})$/;

/** Thời khóa biểu ở trạng thái không đọc được (dùng chung cho BFF khi lỗi / quá thời gian). */
export const unavailableTimetable = (
  reason: TimetableUnavailableReason,
  fetchedAt: string = new Date().toISOString(),
): StudentTimetable => ({
  status: "unavailable",
  reason,
  year: null,
  term: null,
  semesterLabel: null,
  courses: [],
  fetchedAt,
});

/* --------------------------------------------------------------------------
   Học kỳ mục tiêu theo ngày hiện tại (giờ Hàn Quốc, UTC+9)
   -------------------------------------------------------------------------- */

/**
 * Chọn học kỳ cần hiển thị:
 * - Tháng 3–6: (Y, 1학기) · Tháng 9–12: (Y, 2학기)
 * - Tháng 7–8: giữ (Y, 여름학기) nếu màn hình đang hiển thị, ngược lại (Y, 2학기)
 * - Tháng 1–2: giữ (Y-1, 겨울학기) nếu màn hình đang hiển thị, ngược lại (Y, 1학기)
 * Y là năm dương lịch theo giờ Hàn Quốc.
 */
export const resolveSemesterTarget = (
  now: Date,
  shown: TimetableSemesterTarget | null,
): TimetableSemesterTarget => {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1;

  if (month >= 3 && month <= 6) return { year, term: "FIRST" };
  if (month >= 9) return { year, term: "SECOND" };
  if (month >= 7) {
    return shown?.year === year && shown.term === "SUMMER"
      ? { year, term: "SUMMER" }
      : { year, term: "SECOND" };
  }
  return shown?.year === year - 1 && shown.term === "WINTER"
    ? { year: year - 1, term: "WINTER" }
    : { year, term: "FIRST" };
};

/* --------------------------------------------------------------------------
   Đọc bảng thô từ DOM của SapWdaClient
   -------------------------------------------------------------------------- */

/**
 * Đọc bảng thời khóa biểu từ DOM ảo của SapWdaClient (`wda.$`).
 * Không dùng SapTable của usaint-lib vì nó gộp mọi khoảng trắng trong ô thành một dấu cách,
 * làm mất các dòng (tên môn / giảng viên / giờ / phòng) vốn được ngăn bằng <br>.
 * Trả về null nếu không tìm thấy bảng.
 */
export const extractRawTimetable = (
  $: SapWdaClient["$"],
  tableId: string = TIMETABLE_CONTROL_IDS.TABLE,
): RawTimetable | null => {
  const table = $(`[id="${tableId}"]`);
  if (table.length === 0) return null;

  const headers = table
    .find("th")
    .map((_i, th) => $(th).text().replace(/\s+/g, " ").trim())
    .get();

  const rows = table
    .find('[id$="-contentTBody"]')
    .find("tr[rr]")
    .map((_i, tr) => [
      $(tr)
        .children("td")
        .map((_j, td) => {
          const clone = $(td).clone();
          clone.find("br").replaceWith("\n");
          return [
            clone
              .text()
              .split("\n")
              .map((line) => line.replace(/\s+/g, " ").trim())
              .filter(Boolean),
          ];
        })
        .get() as string[][],
    ])
    .get() as string[][][];

  return { headers, rows };
};

/* --------------------------------------------------------------------------
   Parse thuần: RawTimetable → TimetableCourse[]
   -------------------------------------------------------------------------- */

const pad2 = (value: number) => String(value).padStart(2, "0");

const parseTimeRange = (line: string): { start: string; end: string } | null => {
  const match = TIME_RANGE.exec(line);
  if (!match) return null;
  const [sh, sm, eh, em] = match.slice(1).map(Number);
  if (sh > 23 || eh > 24 || sm > 59 || em > 59) return null;
  const start = `${pad2(sh)}:${pad2(sm)}`;
  const end = `${pad2(eh)}:${pad2(em)}`;
  return start < end ? { start, end } : null;
};

/**
 * Bóc tách một ô: mỗi môn gồm các dòng [tên môn, giảng viên, "hh:mm-hh:mm", phòng (tùy chọn)].
 * Giảng viên bị bỏ qua (không lưu). Trả về null nếu ô có nội dung nhưng không có dòng giờ nào.
 */
const parseCell = (lines: string[], day: TimetableDay): TimetableCourse[] | null => {
  const timeIndexes = lines.flatMap((line, index) => (parseTimeRange(line) ? [index] : []));
  if (timeIndexes.length === 0) return null;

  const courses: TimetableCourse[] = [];
  let nameIndex = 0;
  timeIndexes.forEach((timeIndex, k) => {
    const range = parseTimeRange(lines[timeIndex]);
    const nextTimeIndex = timeIndexes[k + 1];
    const name = nameIndex < timeIndex ? lines[nameIndex] : undefined;

    let room: string | undefined;
    if (nextTimeIndex === undefined) {
      room = lines[timeIndex + 1];
    } else if (nextTimeIndex - (timeIndex + 1) >= 3) {
      // Sau dòng giờ còn đủ [phòng, tên môn kế, giảng viên kế] → dòng đầu là phòng.
      room = lines[timeIndex + 1];
    }
    nameIndex = timeIndex + (room !== undefined ? 2 : 1);

    if (name && range) {
      courses.push({ name, day, ...range, ...(room ? { room } : {}) });
    }
  });
  return courses;
};

/**
 * Chuyển bảng thô thành danh sách buổi học. Không bao giờ ném lỗi.
 * - Cột 0 là nhãn tiết học (bỏ qua), cột 1..6 tương ứng Thứ Hai..Thứ Bảy (kiểm tra theo tiêu đề 월 화 수 목 금 토).
 * - Môn kéo dài nhiều tiết lặp lại ở nhiều hàng (không có rowspan) → loại trùng.
 * - Hàng trống / hàng đệm được bỏ qua tự nhiên; giờ học lấy từ chính ô, không phụ thuộc hàng.
 */
export const parseTimetable = (raw: RawTimetable): TimetableParseResult => {
  try {
    const dayHeaders = raw.headers
      .map((header) => header.replace(/요일$/, ""))
      .filter((header) => KOREAN_DAY_HEADERS.includes(header));
    const headersMatch =
      dayHeaders.length >= 5 && dayHeaders.every((header, index) => header === KOREAN_DAY_HEADERS[index]);
    if (!headersMatch) {
      return { status: "unavailable", reason: "LAYOUT_CHANGED", courses: [], skippedCells: 0 };
    }

    const seen = new Set<string>();
    const courses: TimetableCourse[] = [];
    let skippedCells = 0;

    for (const row of raw.rows) {
      row.forEach((lines, cellIndex) => {
        if (cellIndex === 0 || cellIndex > dayHeaders.length || lines.length === 0) return;
        const day = TIMETABLE_DAYS[cellIndex - 1];
        const parsed = parseCell(lines, day);
        if (!parsed) {
          skippedCells += 1;
          return;
        }
        for (const course of parsed) {
          const key = [course.day, course.name, course.start, course.end, course.room ?? ""].join("|");
          if (seen.has(key) || courses.length >= MAX_COURSES) continue;
          seen.add(key);
          courses.push(course);
        }
      });
    }

    courses.sort(
      (a, b) =>
        TIMETABLE_DAYS.indexOf(a.day) - TIMETABLE_DAYS.indexOf(b.day) || a.start.localeCompare(b.start),
    );

    if (courses.length > 0) return { status: "ok", courses, skippedCells };
    if (skippedCells > 0) {
      return { status: "unavailable", reason: "PARSE_FAILED", courses: [], skippedCells };
    }
    return { status: "empty", courses: [], skippedCells: 0 };
  } catch {
    return { status: "unavailable", reason: "PARSE_FAILED", courses: [], skippedCells: 0 };
  }
};

/* --------------------------------------------------------------------------
   Bố cục lưới cho giao diện (TimetableCard)
   -------------------------------------------------------------------------- */

export const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/** Chỉ số màu ổn định theo tên môn (cùng một môn luôn cùng màu ở mọi ngày). */
export const courseTone = (name: string, toneCount = 4): number => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % toneCount;
};

/**
 * Tính bố cục lưới: cột T2–T6 (thêm T7 nếu có môn), trục giờ từ min(09:00, giờ sớm nhất)
 * đến max(18:00, giờ muộn nhất) làm tròn theo giờ, môn trùng giờ trong một ngày chia làn.
 */
export const buildTimetableLayout = (
  courses: TimetableCourse[],
  hourHeight = 56,
): TimetableLayout => {
  const hasSaturday = courses.some((course) => course.day === "SAT");
  const days = TIMETABLE_DAYS.filter((day) => day !== "SAT" || hasSaturday);

  const earliest = Math.min(9 * 60, ...courses.map((c) => toMinutes(c.start)));
  const latest = Math.max(18 * 60, ...courses.map((c) => toMinutes(c.end)));
  const startHour = Math.floor(earliest / 60);
  const endHour = Math.ceil(latest / 60);

  const blocksByDay = Object.fromEntries(
    TIMETABLE_DAYS.map((day) => [day, [] as TimetableBlock[]]),
  ) as Record<TimetableDay, TimetableBlock[]>;

  for (const day of days) {
    const dayCourses = courses
      .filter((course) => course.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    // Gom các môn chồng giờ thành cụm, mỗi môn nhận làn trống đầu tiên trong cụm.
    let cluster: TimetableBlock[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;
    const flush = () => {
      for (const block of cluster) block.laneCount = laneEnds.length;
      cluster = [];
      laneEnds = [];
    };

    for (const course of dayCourses) {
      const start = toMinutes(course.start);
      const end = toMinutes(course.end);
      if (start >= clusterEnd) flush();
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[lane] = end;
      }
      clusterEnd = Math.max(clusterEnd, end);
      const block: TimetableBlock = {
        course,
        top: ((start - startHour * 60) / 60) * hourHeight,
        height: ((end - start) / 60) * hourHeight,
        lane,
        laneCount: 1,
        tone: courseTone(course.name),
      };
      cluster.push(block);
      blocksByDay[day].push(block);
    }
    flush();
  }

  return { days, startHour, endHour, hourHeight, blocksByDay };
};
