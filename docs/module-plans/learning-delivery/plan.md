# Learning Delivery Plan

## Muc tieu

Tao flow hoc tap co trang thai ro rang de biet hoc vien da hoc gi, dat diem nao, co duoc mo khoa module tiep theo hay chua.

## Ke hoach backend

- Them concept enrollment/learning progress neu chua co.
- Ghi nhan lesson/module started, completed, last viewed, score summary.
- Dinh nghia unlock rule dua tren diem tu `assessments-grading`.
- Ho tro override nguong diem theo class; neu khong co thi dung default he thong.
- Khong rang buoc goi dich vu trong giai doan dau.

## API/module de xuat

- `learning-progress`: get current progress, mark lesson viewed/completed, get learning history.
- `module-unlocks`: compute accessible modules/lessons for user.
- `class-learning-settings`: teacher set passing score threshold for class.
- `system-learning-settings`: admin default passing threshold.

## Data concept

- User course progress: user id, course id, status, started at, completed at.
- Lesson progress: user id, lesson id, viewed/completed status, last viewed at.
- Module unlock: user id, section/module id, unlocked at, reason.
- Passing threshold: global default and optional class override.

## RBAC

- Student: xem/cap nhat progress cua minh qua hanh dong hoc.
- Teacher: xem/cau hinh progress trong lop minh quan ly.
- Admin: cau hinh default va xem tong quan neu can.

## Verification

- Tests mo khoa module tiep theo khi dat diem.
- Tests khong mo khoa khi chua dat diem.
- Tests uu tien threshold cua class so voi default.
- Tests Student khong xem/sua progress cua nguoi khac.
