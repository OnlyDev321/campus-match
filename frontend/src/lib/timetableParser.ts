import type {
  StudentTimetable,
  TimetableCourse,
  TimetableDay,
  TimetableDomNode,
  TimetableFetchResult,
  TimetableParseOptions,
  TimetablePeriod,
  TimetableRawCell,
  TimetableSession,
} from "@/lib/types";

// Bộ trích xuất & phân tích thời khóa biểu u-SAINT ZCMW2102 (개인수업시간표조회).
// Định dạng ô đã xác nhận bằng chẩn đoán trên dữ liệu thật:
//   - Ô tiết học : ["<k> 교시", "(HH:MM-HH:MM)"]                                   (2 đoạn)
//   - Ô môn học  : ["<tên môn>", "<giảng viên>", "HH:MM-HH:MM", "<địa điểm>"]      (4 đoạn)
//   - Địa điểm   : "정보과학관21301" | "정보과학관 21305 (…)" | "문화관 03408(…)"
// Thứ và tiết lấy từ ID điều khiển (…TABLE_MON_EDITOR.5), không đếm vị trí ô (ô có thể bị lệch).
// Nguyên tắc: không đoán. Chỉ cần một ô vi phạm quy tắc là trả về lỗi thay vì thời khóa biểu sai.
// File này thuần TypeScript (chỉ import type) để dùng được ở BFF, authStore và khi kiểm thử bằng Node.

const DAY_TOKENS: Record<string, TimetableDay> = {
  MON: "MON", TUE: "TUE", WED: "WED", THU: "THU", FRI: "FRI", SAT: "SAT",
};
const HEADER_DAY: Record<string, TimetableDay> = {
  월: "MON", 화: "TUE", 수: "WED", 목: "THU", 금: "FRI", 토: "SAT",
};
const DAY_ORDER: TimetableDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const EDITOR_ID = /TABLE_([A-Z]+)_EDITOR\.(\d+)/;
const SEGMENT_BREAK_TAGS = new Set(["br", "div", "p", "tr", "td", "th", "li", "table", "tbody", "thead"]);
const TIME_FULL = /^(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})$/;
const TIME_ANY = /\d{1,2}:\d{2}\s*[-~]\s*\d{1,2}:\d{2}/;
const PERIOD_NUMBER = /^(\d{1,2})\s*교시$/;
const PERIOD_TIME = /^\(\s*(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})\s*\)$/;
// "<tên tòa nhà (chỉ chữ)><khoảng trắng tùy chọn><số phòng 3-6 chữ số>" + "(<ghi chú>)" tùy chọn.
const LOCATION = /^([가-힣A-Za-z]+)\s*(\d{3,6})\s*(?:\(\s*([^()]+?)\s*\))?$/;
// Giờ dạng chuẩn hóa "HH:mm" với giờ 00–23, phút 00–59 (dùng khi kiểm tra dữ liệu đã lưu).
const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (h: string, m: string) => Number(h) * 60 + Number(m);
const formatMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const isValidClock = (h1: string, m1: string, h2: string, m2: string) =>
  Number(h1) <= 23 && Number(h2) <= 23 && Number(m1) <= 59 && Number(m2) <= 59;

// Băm FNV-1a 32-bit: ID môn học ổn định giữa các lần đăng nhập (không cần thư viện crypto).
const stableHash = (text: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

/** Tách văn bản của một nút thành các đoạn tại <br>, thẻ khối và điều khiển SAP ([ct]). Giữ nguyên văn bản gốc. */
function segmentsOf(node: TimetableDomNode): string[] {
  const segments: string[] = [];
  let current = "";
  const push = () => {
    const text = current.replace(/\s+/g, " ").trim();
    if (text) segments.push(text);
    current = "";
  };
  const walk = (n: TimetableDomNode) => {
    if (n.type === "text") {
      current += n.data ?? "";
      return;
    }
    if (n.type !== "tag" || !n.name) return;
    const tag = n.name.toLowerCase();
    if (tag === "br") {
      push();
      return;
    }
    const isBreak = SEGMENT_BREAK_TAGS.has(tag) || Boolean(n.attribs?.ct);
    if (isBreak) push();
    (n.children ?? []).forEach(walk);
    if (isBreak) push();
  };
  walk(node);
  push();
  return segments;
}

const closestTag = (node: TimetableDomNode, tag: string) => {
  let current = node.parent ?? null;
  while (current && !(current.type === "tag" && current.name === tag)) current = current.parent ?? null;
  return current;
};

/** Trích xuất mọi điều khiển ô (…TABLE_<TOKEN>_EDITOR.<n>) trong bảng thời khóa biểu, kèm văn bản gốc. */
export function extractTimetableCells(table: TimetableDomNode, headers: string[]): TimetableRawCell[] {
  const cells: TimetableRawCell[] = [];
  const visit = (node: TimetableDomNode) => {
    const id = node.attribs?.id;
    const match = id ? id.match(EDITOR_ID) : null;
    if (id && match) {
      const ccAttr = closestTag(node, "td")?.attribs?.cc;
      const cc = ccAttr === undefined ? null : Number(ccAttr);
      cells.push({
        id,
        token: match[1],
        n: Number(match[2]),
        cc,
        headerByCc: cc === null ? null : (headers[cc] ?? null),
        segments: segmentsOf(node),
      });
    }
    (node.children ?? []).forEach(visit);
  };
  visit(table);
  return cells;
}

interface ParsedCourseCell {
  day: TimetableDay;
  period: number;
  name: string;
  instructor: string;
  start: number;
  end: number;
  building: string | null;
  room: string | null;
  locationDetail: string | null;
  locationText: string;
}

/**
 * Phân tích các ô đã trích xuất thành StudentTimetable.
 * Trả về { ok: false, reason } nếu bất kỳ quy tắc nào bị vi phạm (reason không chứa nội dung ô).
 */
export function parseTimetableCells(
  cells: TimetableRawCell[],
  headers: string[],
  options: TimetableParseOptions,
): TimetableFetchResult {
  const fail = (reason: string): TimetableFetchResult => ({ ok: false, reason });

  const dayColumns = headers.slice(1).map((h) => HEADER_DAY[h]);
  if (headers[0] !== "시간" || dayColumns.some((d) => !d) || !DAY_ORDER.slice(0, 5).every((d) => dayColumns.includes(d))) {
    return fail(`unexpected headers (${headers.length} columns)`);
  }

  // Gộp các điều khiển bị vẽ lặp (một hàng nằm ở hai vùng của bảng). Bản sao khác nội dung → lỗi.
  const byKey = new Map<string, TimetableRawCell>();
  for (const cell of cells) {
    const key = `${cell.token}.${cell.n}`;
    const previous = byKey.get(key);
    if (!previous) {
      byKey.set(key, cell);
      continue;
    }
    if (JSON.stringify(previous.segments) !== JSON.stringify(cell.segments)) {
      return fail(`${key}: same control rendered twice with different text`);
    }
    if (previous.cc === null && cell.cc !== null) byKey.set(key, cell);
  }
  const unique = [...byKey.values()];

  // Cột tiết học: token duy nhất không phải thứ. Mỗi ô không rỗng: ["<k> 교시", "(HH:MM-HH:MM)"] và k = chỉ số hàng.
  const periodTokens = [...new Set(unique.filter((c) => !DAY_TOKENS[c.token]).map((c) => c.token))];
  if (periodTokens.length !== 1) return fail(`expected one period column, found ${periodTokens.length}`);
  const periods = new Map<number, { number: number; start: number; end: number }>();
  for (const cell of unique.filter((c) => c.token === periodTokens[0] && c.segments.length)) {
    const key = `${cell.token}.${cell.n}`;
    if (cell.segments.length !== 2) return fail(`${key}: period label has ${cell.segments.length} segments, expected 2`);
    const number = cell.segments[0].match(PERIOD_NUMBER);
    const time = cell.segments[1].match(PERIOD_TIME);
    if (!number || !time) return fail(`${key}: period label is not "<k> 교시" + "(HH:MM-HH:MM)"`);
    if (Number(number[1]) !== cell.n) return fail(`${key}: period number does not match its row index`);
    if (!isValidClock(time[1], time[2], time[3], time[4])) return fail(`${key}: invalid clock time in period label`);
    const start = toMinutes(time[1], time[2]);
    const end = toMinutes(time[3], time[4]);
    if (start >= end) return fail(`${key}: period start is not before end`);
    periods.set(cell.n, { number: cell.n, start, end });
  }
  if (periods.size !== options.expectedRows) {
    return fail(`period labels (${periods.size}) do not match table rows (${options.expectedRows})`);
  }

  // Ô môn học: đúng 4 đoạn [tên môn, giảng viên, giờ, địa điểm].
  const parsed: ParsedCourseCell[] = [];
  for (const cell of unique.filter((c) => DAY_TOKENS[c.token] && c.segments.length)) {
    const key = `${cell.token}.${cell.n}`;
    const day = DAY_TOKENS[cell.token];
    if (cell.cc !== null && HEADER_DAY[cell.headerByCc ?? ""] !== day) return fail(`${key}: day in id does not match column header`);
    const period = periods.get(cell.n);
    if (!period) return fail(`${key}: no valid period label for this row`);
    if (cell.segments.length !== 4) return fail(`${key}: course cell has ${cell.segments.length} segments, expected 4`);
    const [name, instructor, timeText, locationText] = cell.segments;
    const time = timeText.match(TIME_FULL);
    if (!time) return fail(`${key}: third segment is not a time range`);
    if ([name, instructor, locationText].some((s) => TIME_ANY.test(s))) return fail(`${key}: time range in a non-time segment`);
    if (/\d/.test(instructor)) return fail(`${key}: instructor segment contains digits`);
    if (!isValidClock(time[1], time[2], time[3], time[4])) return fail(`${key}: invalid clock time`);
    const start = toMinutes(time[1], time[2]);
    const end = toMinutes(time[3], time[4]);
    if (start >= end) return fail(`${key}: start time is not before end time`);
    if (end <= period.start || start >= period.end) return fail(`${key}: time lies outside its period row`);
    const location = locationText.match(LOCATION);
    parsed.push({
      day, period: period.number, name, instructor, start, end,
      building: location ? location[1] : null,
      room: location ? location[2] : null,
      locationDetail: location?.[3] ?? null,
      locationText,
    });
  }

  // Buổi học: các ô giống hệt (thứ, giờ, môn, giảng viên, địa điểm) ở nhiều hàng gộp thành một buổi.
  const sessions = new Map<string, { name: string; instructor: string; session: TimetableSession }>();
  for (const cell of parsed) {
    const key = [cell.day, cell.start, cell.end, cell.name, cell.instructor, cell.locationText].join("\u0000");
    const existing = sessions.get(key);
    if (existing) {
      existing.session.periods.push(cell.period);
      continue;
    }
    sessions.set(key, {
      name: cell.name,
      instructor: cell.instructor,
      session: {
        day: cell.day,
        start: formatMinutes(cell.start),
        end: formatMinutes(cell.end),
        periods: [cell.period],
        building: cell.building,
        room: cell.room,
        locationDetail: cell.locationDetail,
        locationText: cell.locationText,
      },
    });
  }
  const ordered = [...sessions.values()].sort(
    (a, b) => DAY_ORDER.indexOf(a.session.day) - DAY_ORDER.indexOf(b.session.day) || a.session.start.localeCompare(b.session.start),
  );

  // Môn học: gom theo đúng (tên môn, giảng viên) để các lớp / giảng viên khác nhau không bị trộn.
  const courses = new Map<string, TimetableCourse>();
  for (const { name, instructor, session } of ordered) {
    session.periods.sort((a, b) => a - b);
    const key = `${name}\u0000${instructor}`;
    if (!courses.has(key)) courses.set(key, { id: `course-${stableHash(key)}`, name, instructor, sessions: [] });
    courses.get(key)!.sessions.push(session);
  }

  const periodList: TimetablePeriod[] = [...periods.values()]
    .sort((a, b) => a.number - b.number)
    .map((p) => ({ number: p.number, start: formatMinutes(p.start), end: formatMinutes(p.end) }));
  return {
    ok: true,
    timetable: {
      term: options.term,
      periods: periodList,
      hasSaturday: ordered.some((s) => s.session.day === "SAT"),
      courses: [...courses.values()],
      fetchedAt: options.fetchedAt,
    },
  };
}

const isString = (value: unknown): value is string => typeof value === "string";
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.length > 0;
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isPositiveInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// "HH:mm" có giờ 00–23 và phút 00–59 → số phút trong ngày; ngược lại null.
const clockMinutes = (value: unknown): number | null => {
  if (!isString(value)) return null;
  const match = value.match(CLOCK);
  return match ? toMinutes(match[1], match[2]) : null;
};

// Khoảng giờ hợp lệ khi cả hai đầu là giờ thật và bắt đầu trước kết thúc.
const isValidRange = (start: unknown, end: unknown): boolean => {
  const from = clockMinutes(start);
  const to = clockMinutes(end);
  return from !== null && to !== null && from < to;
};

/**
 * Kiểm tra cấu trúc thời khóa biểu nhận từ API hoặc khôi phục từ localStorage.
 * Trả về null nếu dữ liệu không hợp lệ (VD: phiên cũ, dữ liệu hỏng) để giao diện yêu cầu đăng nhập lại.
 * Giữ nguyên định dạng dữ liệu do parseTimetableCells tạo ra; `hasSaturday` luôn tính lại từ các buổi học.
 */
export function normalizeStudentTimetable(value: unknown): StudentTimetable | null {
  if (!isRecord(value) || !isRecord(value.term)) return null;
  if (!Array.isArray(value.periods) || !Array.isArray(value.courses)) return null;
  if (typeof value.hasSaturday !== "boolean") return null;
  if (!isString(value.fetchedAt) || Number.isNaN(Date.parse(value.fetchedAt))) return null;

  const { term } = value;
  const { yearKey, yearLabel, semesterKey, semesterLabel } = term;
  if (
    !isNonEmptyString(yearKey) ||
    !isNonEmptyString(yearLabel) ||
    !isNonEmptyString(semesterKey) ||
    !isNonEmptyString(semesterLabel)
  ) {
    return null;
  }

  // Tiết học: số tiết nguyên dương, không trùng; khoảng giờ hợp lệ.
  const periods: TimetablePeriod[] = [];
  const periodNumbers = new Set<number>();
  for (const p of value.periods) {
    if (!isRecord(p) || !isPositiveInteger(p.number) || periodNumbers.has(p.number)) return null;
    if (!isString(p.start) || !isString(p.end) || !isValidRange(p.start, p.end)) return null;
    periodNumbers.add(p.number);
    periods.push({ number: p.number, start: p.start, end: p.end });
  }

  const courses: TimetableCourse[] = [];
  for (const c of value.courses) {
    if (!isRecord(c) || !isNonEmptyString(c.id) || !isNonEmptyString(c.name) || !isNonEmptyString(c.instructor)) {
      return null;
    }
    if (!Array.isArray(c.sessions) || c.sessions.length === 0) return null;

    const sessions: TimetableSession[] = [];
    for (const s of c.sessions) {
      if (!isRecord(s) || !isString(s.day) || !DAY_TOKENS[s.day]) return null;
      if (!isString(s.start) || !isString(s.end) || !isValidRange(s.start, s.end)) return null;
      // Mỗi buổi chiếm ít nhất một tiết có thật trong danh sách tiết học, không lặp lại.
      if (!Array.isArray(s.periods) || s.periods.length === 0) return null;
      const sessionPeriods = s.periods;
      if (!sessionPeriods.every((n) => isPositiveInteger(n) && periodNumbers.has(n))) return null;
      if (new Set(sessionPeriods).size !== sessionPeriods.length) return null;
      if (!isNullableString(s.building) || !isNullableString(s.room) || !isNullableString(s.locationDetail)) return null;
      if (!isNonEmptyString(s.locationText)) return null;
      sessions.push({
        day: DAY_TOKENS[s.day],
        start: s.start,
        end: s.end,
        periods: sessionPeriods as number[],
        building: s.building,
        room: s.room,
        locationDetail: s.locationDetail,
        locationText: s.locationText,
      });
    }
    courses.push({ id: c.id, name: c.name, instructor: c.instructor, sessions });
  }

  return {
    term: { yearKey, yearLabel, semesterKey, semesterLabel },
    periods,
    hasSaturday: courses.some((c) => c.sessions.some((s) => s.day === "SAT")),
    courses,
    fetchedAt: value.fetchedAt,
  };
}
