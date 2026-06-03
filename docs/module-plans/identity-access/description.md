# Identity Access

## Muc dich

Module `identity-access` so huu danh tinh, dang nhap, dang ky, xac thuc va cac rule truy cap nen tang cua nguoi dung. Day la module dau vao cho Student, Teacher va Admin truoc khi dung cac chuc nang hoc tap va AI.

## Pham vi chuc nang

- Dang ky bang email/mat khau.
- Dang nhap bang email.
- OTP cho dang ky va reset mat khau.
- Reset mat khau khi quen mat khau.
- Logout/session.
- Khoa/mo khoa tai khoan.
- Role/permission nen tang.
- Luong Teacher cho admin xac thuc tai khoan truoc khi duoc su dung day du.

## Vai tro

| Vai tro | Nhu cau |
| --- | --- |
| Student | Dang ky, xac thuc OTP, dang nhap, reset mat khau, duoc bao ve khoi spam mail. |
| Teacher | Dang ky, xac thuc OTP, cho admin xac thuc tai khoan, dang nhap, reset mat khau. |
| Admin | Quan ly danh sach tai khoan, khoa/mo khoa tai khoan, xac thuc giao vien, quan ly role/permission nen tang. |

## Ngoai pham vi

- Goi `casual/plus/pro` va quota theo goi nam trong `service-packages`.
- Ho so ca nhan chi tiet nam trong `user-profiles`.
- Dashboard tien do va analytics nam trong `learning-analytics`.
