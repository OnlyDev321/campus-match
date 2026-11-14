/**
 * Ký "SSO assertion" để BFF chứng minh với Spring Boot backend rằng MSSV đã được xác thực qua u-SAINT.
 *
 * CHỈ DÙNG TRONG CODE SERVER (Next.js Route Handler). Khóa ký đọc từ biến môi trường server-only
 * `SSO_ASSERTION_SECRET` (không có tiền tố NEXT_PUBLIC_), không bao giờ được đưa xuống trình duyệt.
 *
 * Định dạng: JWS compact HS256, khớp với `SsoAssertionVerifier` của backend.
 *   iss = campus-match-bff, aud = campus-match-backend
 *   sub = MSSV đã xác thực, iat/exp (sống 30 giây), jti = id dùng một lần
 *   body_sha256 = SHA-256 (hex) của đúng chuỗi body gửi sang backend → body không thể bị thay đổi.
 */

import { createHash, createHmac, randomUUID } from "node:crypto";

/** Header HTTP mang assertion khi BFF gọi backend. */
export const SSO_ASSERTION_HEADER = "X-SSO-Assertion";

const ISSUER = "campus-match-bff";
const AUDIENCE = "campus-match-backend";
/** Backend chấp nhận tối đa 60 giây; BFF dùng 30 giây vì assertion chỉ cần sống đủ cho một lần gọi. */
const LIFETIME_SECONDS = 30;
/** 256 bit: kích thước khóa tối thiểu của HS256, backend cũng từ chối khóa ngắn hơn. */
const MIN_SECRET_BYTES = 32;
/** Cùng quy tắc kiểm tra đầu vào với backend (vừa cột users.student_id dài 20 ký tự). */
const STUDENT_ID_PATTERN = /^[A-Za-z0-9._-]{1,20}$/;

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

/**
 * Tạo assertion cho một lần gọi `POST /api/auth/sso/usaint`.
 *
 * Ném lỗi (đóng an toàn) nếu thiếu/ngắn khóa ký hoặc MSSV không hợp lệ. Thông báo lỗi không chứa giá trị bí mật.
 * `nowMs` và `assertionId` chỉ để kiểm thử tất định; mặc định là thời gian hiện tại và UUID ngẫu nhiên.
 *
 * @param studentId MSSV lấy từ kết quả u-SAINT đã xác thực (KHÔNG phải dữ liệu từ trình duyệt)
 * @param rawBody Đúng chuỗi JSON sẽ được gửi làm body (phải gửi nguyên văn chuỗi này)
 */
export function createSsoAssertion(
  studentId: string,
  rawBody: string,
  nowMs: number = Date.now(),
  assertionId: string = randomUUID(),
): string {
  const secret = process.env.SSO_ASSERTION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < MIN_SECRET_BYTES) {
    throw new Error("SSO_ASSERTION_SECRET is not set or is shorter than 32 bytes.");
  }
  if (!STUDENT_ID_PATTERN.test(studentId)) {
    throw new Error("Student ID is not valid for an SSO assertion.");
  }

  const issuedAt = Math.floor(nowMs / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      iss: ISSUER,
      aud: AUDIENCE,
      sub: studentId,
      iat: issuedAt,
      exp: issuedAt + LIFETIME_SECONDS,
      jti: assertionId,
      body_sha256: createHash("sha256").update(rawBody, "utf8").digest("hex"),
    }),
  );
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}
