# Platform Admin Plan

## Muc tieu

Cung cap lop quan tri tong hop de Admin nam duoc suc khoe he thong va xu ly cac tac vu cross-module ma khong dua logic quan tri vao tung service nghiep vu.

## Ke hoach backend

- Tao dashboard query service tong hop tu users, courses, classes, learning analytics va AI logs.
- Tao settings service cho cau hinh mac dinh, nhung rule runtime van nam tai module so huu.
- Luu AI usage/conversation log de phuc vu chi phi va audit.
- Tao support/ticket flow cho phan hoi, bao tri, khieu nai va tranh chap.
- Giua `platform-admin` va module domain chi nen lien ket qua service/query on dinh.

## API/module de xuat

- `admin-dashboard`: tong hop user/course/class/learning/AI metrics.
- `system-settings`: cau hinh mac dinh cho learning/AI.
- `ai-usage`: chi phi API, lich su hoi thoai, usage summary.
- `support-tickets`: phan hoi, bao tri, khieu nai/tranh chap.

## Data concept

- System setting: key, value, scope, updated by, updated at.
- AI usage log: user id, purpose, provider/model, token/cost metadata, created at.
- Support ticket: reporter, target/context, type, status, priority, assigned admin.
- Ticket message/action: ticket id, actor, note, status change.

## RBAC

- Admin: doc dashboard, sua settings, xem AI usage, xu ly ticket/tranh chap.
- Student/Teacher: tao ticket va xem ticket cua minh.

## Verification

- Tests Admin-only dashboard/settings.
- Tests Student/Teacher chi tao/xem ticket cua minh.
- Tests AI usage aggregate dung theo period.
- Tests settings thay doi duoc audit.
