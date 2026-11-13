# Bàn giao tích hợp Manage

Phần này cụ thể hóa dữ liệu frontend cần từ `architecture.md` §4–7. Backend hiện có Entity và Auth nhưng **chưa có Group/Application controller**, repository và service tương ứng. Frontend sẵn đường gọi API; chưa thể xác nhận chạy tích hợp trước khi các endpoint này được triển khai.

## Cấu hình

Sao chép `frontend/.env.example` thành `frontend/.env.local`.

- `NEXT_PUBLIC_USE_MOCK_API=false`: dùng API thật (mặc định kể cả khi không khai báo). Lỗi API được hiển thị, không tự chuyển sang mock.
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`: URL trình duyệt gọi backend, có `/api`.
- `SPRING_BOOT_API_URL=http://localhost:8080`: URL BFF gọi backend, không có `/api`.
- Để xem giao diện độc lập, đặt `NEXT_PUBLIC_USE_MOCK_API=true`. Mock chỉ tồn tại trong bộ nhớ, không lưu DB, mất khi tải lại môi trường chạy.
- Khởi động lại `pnpm dev` hoặc build lại sau khi đổi biến `NEXT_PUBLIC_*`.
- Ở chế độ thật, BFF đăng nhập phải nhận JWT hợp lệ từ Spring Boot. Backend không hoạt động / không trả token → BFF trả HTTP 503 với `SERVER_ERROR`, không tạo JWT giả. Đăng nhập lại nếu trình duyệt còn lưu token giả từ phiên cũ.

## Luồng và xác thực

`/manage` mở trực tiếp workspace của nhóm đầu tiên tôi làm Leader, theo màn hình Figma. `/manage/{groupId}` mở nhóm cụ thể; chỉ mở nhóm có `myRole=LEADER`. Danh sách hai cột nhóm làm Leader / tham gia vẫn ở `/manage/groups` và truy cập qua mục My Groups trong bộ chọn nhóm. Quyền truy cập vẫn phải được kiểm tra ở backend từ JWT, không tin dữ liệu UI.

Mọi request qua `lib/api.ts` có `Authorization: Bearer <token>` và `Accept-Language: vi|en|ko`. Có body thì gửi JSON. Spring Security cần JWT filter và CORS cho origin frontend; cấu hình `permitAll` hiện tại chưa thực thi quyền Leader.

## Hợp đồng endpoint

| Method | Endpoint (sau `/api`) | Body | Response thành công |
| --- | --- | --- | --- |
| GET | `/users/me/groups` | — | `MyGroupSummary[]` |
| GET | `/groups/{id}/applications` | — | `GroupApplication[]` |
| PUT | `/applications/{id}/accept` | — | `GroupApplication` sau cập nhật |
| PUT | `/applications/{id}/reject` | — | `GroupApplication` sau cập nhật |
| PUT | `/groups/{id}` | `{ title, description, maxMembers }` | `204` hoặc JSON; UI tải lại từ GET |
| DELETE | `/groups/{id}` | — | `204` hoặc JSON; UI tải lại từ GET |

Dùng response DTO JSON trực tiếp, không bọc `{ data: ... }`, không serialize JPA Entity. `GET /users/me/groups` bổ sung dữ liệu cần cho luồng My Groups đã mô tả trong architecture. Type chuẩn nằm ở `src/lib/types.ts`.

**Điểm cần đội backend chốt trước khi tích hợp:** architecture ghi DELETE là “đóng đợt tuyển hoặc xóa nhóm”. Nút Close Recruitment ở Manage yêu cầu **đóng mềm**: chuyển `status=CLOSED`, giữ nhóm, thành viên và các đơn. Tuyệt đối không nối nút này vào một DELETE xóa cứng. Nếu backend chọn xóa cứng, cần thống nhất endpoint đóng tuyển riêng và đổi `closeGroupRecruitment` trước khi bật tích hợp.

## DTO mẫu tối thiểu

`GET /users/me/groups`:

```json
[
  {
    "id": 101,
    "title": "Web Programming Project",
    "description": "Campus marketplace application",
    "courseCode": "CS301",
    "courseName": "Capstone Studio A",
    "college": "IT대학",
    "department": "소프트웨어학부",
    "status": "RECRUITING",
    "maxMembers": 4,
    "memberCount": 1,
    "myRole": "LEADER",
    "leader": {
      "id": 1,
      "studentId": "20211234",
      "name": "Kim Jinho",
      "department": "소프트웨어학부",
      "faculty": "IT대학",
      "academicYear": "3"
    },
    "members": [
      { "userId": 1, "name": "Kim Jinho", "role": "LEADER", "joinedAt": "2026-11-13T09:00:00+09:00" }
    ],
    "pendingApplicationCount": 1,
    "createdAt": "2026-11-13T09:00:00+09:00"
  }
]
```

`GET /groups/101/applications` và response Accept/Reject:

```json
{
  "id": 9001,
  "groupId": 101,
  "applicant": {
    "id": 8,
    "studentId": "20221357",
    "name": "Park Minji",
    "department": "소프트웨어학부",
    "faculty": "IT대학",
    "academicYear": "3",
    "email": "20221357@soongsil.ac.kr"
  },
  "statement": "I can contribute to the frontend.",
  "status": "PENDING",
  "createdAt": "2026-11-13T10:00:00+09:00"
}
```

Endpoint GET trả **mảng** các đối tượng trên; PUT trả **một đối tượng**, đổi `status` thành `ACCEPTED` hoặc `REJECTED`. Trả mảng rỗng `[]` khi không có dữ liệu. Các collection `members`, `applications` không được null; `statement` thiếu thì trả chuỗi rỗng. Timestamp nên kèm offset ISO-8601. Các trường tùy chọn `skills`, `githubUrl`, `portfolioUrl` chỉ hiển thị khi có dữ liệu; schema hiện tại chưa lưu các trường này.

## Nghiệp vụ server cần đảm bảo

- Kiểm tra JWT và quyền Leader với mọi API ghi / xem đơn; trả 401, 403, 404 đúng nghĩa.
- Accept chạy transaction, khóa/chặn cạnh tranh trên nhóm, chỉ nhận đơn PENDING khi đang RECRUITING và còn chỗ. Thêm thành viên một lần, đổi đơn ACCEPTED; đủ người đổi nhóm COMPLETED. Không tin `memberCount` hay quyền từ client.
- Reject chỉ đổi đơn PENDING thành REJECTED. Đóng tuyển vẫn cho phép từ chối đơn cũ.
- Tính `memberCount`, `pendingApplicationCount`, `myRole` từ DB, bao gồm Leader trong sĩ số. Duy trì UNIQUE(group_id, applicant_id) và PK(group_id, user_id).
- PUT kiểm tra tên không rỗng và tối đa 150 ký tự theo Entity, mô tả không rỗng, `maxMembers` nguyên dương và không nhỏ hơn sĩ số. Với nhóm chưa CLOSED, cập nhật COMPLETED/RECRUITING theo sĩ số mới; nhóm CLOSED giữ CLOSED.
- Hiện schema chỉ có quyền LEADER/MEMBER, chưa có endpoint đổi vai trò/xóa thành viên. Nhãn chuyên môn `projectRole` là trường response tùy chọn chỉ để hiển thị, không thay thế quyền. Hai nút này được khóa kèm giải thích; frontend không tự ghi thêm trường ngoài schema. Xuất CSV chạy ở frontend từ dữ liệu GET.

## Phản hồi lỗi

Theo `architecture.md` §6: `{ status, error, message, timestamp }`. Frontend ánh xạ theo HTTP status và dịch ở cả ba ngôn ngữ, không hiển thị thông báo thô của server:

- 400/422 → BAD_REQUEST.
- 401 → UNAUTHORIZED.
- 403 → FORBIDDEN.
- 404 → NOT_FOUND.
- 409 → CONFLICT (đơn đã xử lý, nhóm đầy hoặc vừa đóng tuyển).
- 5xx → SERVER_ERROR; không kết nối được → NETWORK_ERROR.

## Kiểm tra

```sh
cd frontend
node --test tests/manage-api.test.mjs
npx tsc --noEmit
npx eslint src/app/manage src/components/application/ApplicationCard.tsx src/services src/lib/api.ts src/lib/config.ts
```

Test HTTP kiểm tra mã service thực với transport giả lập: URL, method, payload, JWT, ngôn ngữ, 204 và mã lỗi; không thay thế kiểm tra với Spring Boot thật. Khi backend sẵn sàng, chạy bằng hai tài khoản Leader/Member, kiểm tra danh sách, sửa nhóm, duyệt/từ chối, đồng bộ sĩ số và thử truy cập trái quyền. Xác nhận DELETE đóng mềm trước khi thử nút Close Recruitment.

## Trường hiển thị bổ sung từ Figma

Workspace hoạt động với DTO tối thiểu ở trên. Các trường dưới đây là **tùy chọn**; frontend không gửi chúng trong PUT nhóm:

- `MyGroupSummary.skills?: string[]`, `recruitmentEndsAt?: string` (ISO-8601).
- `GroupMemberSummary.email?`, `department?`, `avatarUrl?`, `projectRole?`.
- `UserSummary.avatarUrl?`.
- `GroupApplication.skills?`, `githubUrl?`, `portfolioUrl?`, `isHonorsStudent?`, `scheduleMatch?` (0–100).

Khi thiếu hạn tuyển, UI hiển thị trạng thái; khi thiếu ảnh, Avatar hiển thị chữ viết tắt. Bộ lọc Frontend lọc theo các kỹ năng do API cung cấp. Mock dùng các trường này để xem bố cục đầy đủ; không yêu cầu sửa Entity backend để chạy DTO tối thiểu.
