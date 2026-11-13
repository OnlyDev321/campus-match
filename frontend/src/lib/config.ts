// Dùng chung ở trình duyệt và BFF; API thật là mặc định.
// Next.js đọc NEXT_PUBLIC_* khi khởi động/build, cần khởi động lại sau khi đổi.
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
