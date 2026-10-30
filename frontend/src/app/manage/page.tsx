import { redirect } from "next/navigation";

// Trang danh sách nhóm tôi làm Leader đã được gộp vào tab "My groups" của /groups.
// Giữ đường dẫn cũ /manage bằng cách chuyển hướng; trang duyệt đơn /manage/[groupId] vẫn giữ nguyên.

export default function ManagePage() {
  redirect("/groups?tab=mine");
}
