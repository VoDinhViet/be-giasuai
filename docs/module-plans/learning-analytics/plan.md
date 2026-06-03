# Learning Analytics Plan

## Muc tieu

Xay dung lop doc/tong hop du lieu hoc tap de ho tro dashboard va bao cao ma khong lam phinh logic ghi progress, cham diem hay nhom hoc.

## Ke hoach backend

- Lay du lieu tu progress, assessment result, group membership va AI weak tags khi co data model.
- Dinh nghia weak knowledge tag luu theo user, source va visibility.
- Visibility diem yeu: personal chi ca nhan thay; group thi ca Student va Teacher trong nhom thay.
- Tao read models/query service cho dashboard Student, Teacher va Admin.
- Canh bao bi ket can dua tren rule ro: lap lai sai, khong qua threshold, hoac khong tien bo sau mot khoang thoi gian.

## API/module de xuat

- `learning-analytics`: student dashboard, teacher student progress, group weak report, admin difficult content.
- `weak-knowledge`: list weak tags, create/update tags tu AI/assessment, visibility rules.
- `learning-alerts`: stuck alerts for teacher.

## Data concept

- Learning metric snapshot: user id, period, study time, completed content count, score summary.
- Weak tag: user id, tag/code, source, context content/group, visibility, created by.
- Alert: group id, student id, knowledge tag, severity, status, triggered at.

## RBAC

- Student: xem dashboard va diem yeu cua minh.
- Teacher: xem hoc sinh thuoc nhom minh va diem yeu visibility group.
- Admin: xem tong hop he thong, khong can xem du lieu ca nhan chi tiet neu khong co ly do.

## Verification

- Tests visibility diem yeu personal/group.
- Tests teacher chi xem hoc sinh thuoc nhom minh.
- Tests dashboard Student tinh dung completed content/study time.
- Tests stuck alert duoc trigger theo rule va khong duplicate qua muc.
