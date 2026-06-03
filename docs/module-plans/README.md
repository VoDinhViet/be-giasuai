# Module Plans

Tai lieu nay phan ra chuc nang tu file Excel thanh cac module backend/domain co the trien khai doc lap trong NestJS API.

Nguon chinh:

```text
docs/CHỨC NĂNG PHÁT TRIỂN GIA SƯ AI (V3).xlsx
Sheet: Trang tính1
```

## Cach doc

- Moi folder module co 3 file: `description.md`, `plan.md`, `progress.md`.
- `description.md` mo ta nghiep vu, vai tro va pham vi so huu cua module.
- `plan.md` la ke hoach backend-ready o muc domain, API module, data concept, RBAC va verification.
- `progress.md` ghi trang thai theo tung chuc nang tu Excel va bang chung hien co trong code.

## Trang thai

| Status | Y nghia |
| --- | --- |
| `done` | Da co bang chung ro trong code/docs hien tai va khop voi yeu cau. |
| `in-progress` | Da co mot phan nen tang, nhung con thieu rule/API/data theo Excel. |
| `planned` | Chua co nen tang ro, can trien khai moi. |
| `planned-later` | Co chu y lam sau, khong chan module cot loi. |
| `blocked` | Chua the trien khai neu thieu quyet dinh san pham/du lieu quan trong. |

## Thu tu module

| Thu tu | Module | Muc dich | Trang thai tong quan |
| --- | --- | --- | --- |
| 1 | `identity-access` | Dang ky, dang nhap, OTP, reset mat khau, session, khoa tai khoan, role/permission, xac thuc giao vien. | `in-progress` |
| 2 | `user-profiles` | Ho so ca nhan, avatar, thong tin co ban, admin xem ho so va hoat dong nguoi dung. | `in-progress` |
| 3 | `learning-delivery` | Lich su hoc tap, diem qua bai, mo khoa noi dung tiep theo. | `planned` |
| 4 | `assessments-grading` | Test dau vao, ngan hang de, bai tap, cham diem, giai thich loi sai. | `planned` |
| 5 | `ai-personalization` | Lo trinh AI, can thiep lo trinh, AI Tutor, goi y giao an, bai tu luyen AI. | `planned` |
| 6 | `learning-analytics` | Dashboard tien do, diem yeu, canh bao bi ket, bao cao noi dung kho. | `planned` |
| 7 | `platform-admin` | Dashboard he thong, cau hinh mac dinh, chi phi API, lich su hoi thoai, ticket, tranh chap. | `planned` |
| 8 | `service-packages` | Goi `casual/plus/pro`, quyen loi theo goi, quota va gioi han AI. Lam sau cung. | `planned-later` |
| removed | `course-content` | Module course da bi go khoi backend va database. | `removed` |
| removed | `classroom-management` | Module class da bi go khoi backend va database. | `removed` |

## Mapping nguon Excel

| Chuc nang Excel | Module chinh |
| --- | --- |
| Dang nhap / Dang ky | `identity-access` |
| Reset mat khau | `identity-access` |
| Khoa tai khoan | `identity-access` |
| Quan ly thong tin ca nhan | `user-profiles` |
| Tien do hoc tap | `learning-analytics` |
| Quyen, goi `casual/plus/pro` | `service-packages` |
| Tracking diem yeu | `learning-analytics` |
| Tim kiem | Can module moi neu khoi phuc tinh nang. |
| Hoc tap trong Module | `learning-delivery` |
| Lam bai dat diem de mo khoa module tiep theo | `learning-delivery` |
| Kiem tra nang luc | `assessments-grading` |
| Sinh lo trinh AI | `ai-personalization` |
| Can thiep lo trinh | `ai-personalization` |
| Ho tro hoc tap (AI Tutor) | `ai-personalization` |
| AI Cham diem & Giai thich | `assessments-grading` |
| Bai tap tu luyen AI | `ai-personalization`, `service-packages` |
| Quan ly Lop hoc | Can module moi neu khoi phuc tinh nang. |
| Giam sat & Tuong tac | `learning-analytics`, `platform-admin` |
| Ho tro & Giao tiep | `platform-admin` |

## Nguyen tac trien khai sau nay

- Khong de `service-packages` chan cac luong cot loi nhu dang nhap, hoc tap, lop hoc va AI ban dau.
- Module nao bat dau code thi cap nhat spec tai `docs/module-specs/<module>.md`.
- Neu thay doi tien do tong the, cap nhat tai lieu tien do du an theo chuan repo khi file do duoc khoi tao.
- Neu phat sinh cross-module flow moi, cap nhat tai lieu system flow theo chuan repo khi file do duoc khoi tao.
