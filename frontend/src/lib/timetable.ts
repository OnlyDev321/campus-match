import type { StudentTimetable, TimetableBlock, TimetableDay, TimetableSession } from "@/lib/types";

// Tiện ích dựng thời khóa biểu cho giao diện My Page. Thời khóa biểu Soongsil dùng múi giờ Asia/Seoul.

export const TIMETABLE_WEEKDAYS: TimetableDay[] = ["MON", "TUE", "WED", "THU", "FRI"];

const SEOUL_WEEKDAY: Record<string, TimetableDay> = {
  Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI", Sat: "SAT",
};

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const formatMinutes = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// T2–T6 mặc định; chỉ thêm T7 khi thời khóa biểu có buổi học thứ Bảy.
export const timetableDays = (timetable: StudentTimetable): TimetableDay[] =>
  timetable.hasSaturday ? [...TIMETABLE_WEEKDAYS, "SAT"] : TIMETABLE_WEEKDAYS;

// Thứ hiện tại theo giờ Asia/Seoul (null vào Chủ nhật).
export const seoulToday = (now: Date = new Date()): TimetableDay | null =>
  SEOUL_WEEKDAY[new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "short" }).format(now)] ?? null;

// "정보과학관 21301" khi nhận dạng được tòa nhà + phòng, ngược lại hiển thị nguyên chuỗi địa điểm gốc.
export const formatSessionLocation = (session: TimetableSession): string =>
  session.building && session.room ? `${session.building} ${session.room}` : session.locationText;

// Khung giờ của lưới: bao trọn mọi buổi học, làm tròn theo giờ, tối thiểu 09:00–18:00.
export const timeAxis = (blocks: TimetableBlock[]): { start: number; end: number } => ({
  start: Math.floor(Math.min(9 * 60, ...blocks.map((b) => b.startMin)) / 60) * 60,
  end: Math.ceil(Math.max(18 * 60, ...blocks.map((b) => b.endMin)) / 60) * 60,
});

// Chia làn cho các buổi học trùng giờ trong một ngày: mỗi nhóm chồng nhau dùng chung số làn để không che nhau.
const assignLanes = (blocks: TimetableBlock[]) => {
  blocks.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  let group: TimetableBlock[] = [];
  let groupEnd = -1;
  let laneEnds: number[] = [];
  const closeGroup = () => {
    group.forEach((b) => { b.lanes = laneEnds.length; });
    group = [];
    laneEnds = [];
  };
  for (const block of blocks) {
    if (group.length && block.startMin >= groupEnd) closeGroup();
    let lane = laneEnds.findIndex((end) => end <= block.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.endMin);
    } else {
      laneEnds[lane] = block.endMin;
    }
    block.lane = lane;
    group.push(block);
    groupEnd = Math.max(groupEnd, block.endMin);
  }
  closeGroup();
};

// Gom các buổi học theo ngày (dùng giờ bắt đầu / kết thúc thực tế), màu theo thứ tự môn học.
export const buildBlocksByDay = (timetable: StudentTimetable): Record<TimetableDay, TimetableBlock[]> => {
  const byDay: Record<TimetableDay, TimetableBlock[]> = { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [] };
  timetable.courses.forEach((course, colorIndex) => {
    course.sessions.forEach((session) => {
      byDay[session.day].push({
        course, session, colorIndex,
        startMin: toMinutes(session.start),
        endMin: toMinutes(session.end),
        lane: 0,
        lanes: 1,
      });
    });
  });
  (Object.keys(byDay) as TimetableDay[]).forEach((day) => assignLanes(byDay[day]));
  return byDay;
};
