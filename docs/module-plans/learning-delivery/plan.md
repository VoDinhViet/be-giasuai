# Learning Delivery Plan

## Muc tieu

Tao flow hoc tap co trang thai ro rang de biet hoc vien da hoc gi, dat diem nao, co duoc mo khoa module tiep theo hay chua.

## Ke hoach backend

- Them concept enrollment/learning progress neu chua co.
- Ghi nhan content started, completed, last viewed, score summary.
- Dinh nghia unlock rule dua tren diem tu `assessments-grading`.
- Ho tro override nguong diem theo group khi co data model; neu khong co thi dung default he thong.
- Khong rang buoc goi dich vu trong giai doan dau.

## API/module de xuat

- `learning-progress`: get current progress, mark content viewed/completed, get learning history.
- `module-unlocks`: compute accessible content for user.
- `group-learning-settings`: teacher set passing score threshold for group.
- `system-learning-settings`: admin default passing threshold.

## Data concept

- User content progress: user id, content id, status, started at, completed at.
- Content progress: user id, content id, viewed/completed status, last viewed at.
- Content unlock: user id, content id, unlocked at, reason.
- Passing threshold: global default and optional group override.

## RBAC

- Student: xem/cap nhat progress cua minh qua hanh dong hoc.
- Teacher: xem/cau hinh progress trong nhom minh quan ly.
- Admin: cau hinh default va xem tong quan neu can.

## Verification

- Tests mo khoa module tiep theo khi dat diem.
- Tests khong mo khoa khi chua dat diem.
- Tests uu tien threshold cua group so voi default.
- Tests Student khong xem/sua progress cua nguoi khac.
