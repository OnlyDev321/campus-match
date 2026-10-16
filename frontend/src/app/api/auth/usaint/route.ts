import { NextRequest, NextResponse } from "next/server";
import { authenticateUsaint } from "@/lib/usaint";

/**
 * API ROUTE: /api/auth/usaint (Phương thức POST)
 * Cổng xác thực BFF (Backend-For-Frontend) đăng nhập với hệ thống u-SAINT SSO.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Tiếp nhận Request & bóc tách studentId và password
    const body = await req.json();
    const { studentId, password } = body || {};

    // 2. Kiểm tra đầu vào (Validation)
    if (!studentId || !password) {
      return NextResponse.json(
        { error: "Mã số sinh viên và mật khẩu u-SAINT là bắt buộc." },
        { status: 400 }
      );
    }

    // 3. Gọi hàm xác thực qua usaint-lib
    const authResult = await authenticateUsaint(String(studentId).trim(), String(password));

    // 4. Kiểm tra kết quả (Nếu không có vé MYSAPSSO2 hoặc sai thông tin)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Sai mã số sinh viên hoặc mật khẩu u-SAINT." },
        { status: 401 }
      );
    }

    // 5. Xác thực thành công:
    // Trả về kết quả thành công cho Client (hoặc chuẩn bị đồng bộ sang Spring Boot ở Bước 4, 5)
    return NextResponse.json({
      success: true,
      message: "Đăng nhập u-SAINT thành công.",
      studentId: String(studentId).trim(),
    });
  } catch (error) {
    console.error("Lỗi hệ thống khi xử lý xác thực u-SAINT:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ trong quá trình xác thực u-SAINT." },
      { status: 500 }
    );
  }
}
