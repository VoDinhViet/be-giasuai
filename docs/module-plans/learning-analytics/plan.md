# Learning Analytics Plan

## Muc tieu

Xay dung lop doc/tong hop du lieu hoc tap de ho tro dashboard va bao cao ma khong lam phinh logic ghi progress, cham diem hay lop hoc.

## Ke hoach backend

- Lay du lieu tu progress, assessment result, class registration va AI weak tags.
- Dinh nghia weak knowledge tag luu theo user, source va visibility.
- Visibility diem yeu: personal chi ca nhan thay; class thi ca Student va Teacher cua lop thay.
- Tao read models/query service cho dashboard Student, Teacher va Admin.
- Canh bao bi ket can dua tren rule ro: lap lai sai, khong qua threshold, hoac khong tien bo sau mot khoang thoi gian.

## API/module de xuat

- `learning-analytics`: student dashboard, teacher student progress, class weak report, admin difficult modules.
- `weak-knowledge`: list weak tags, create/update tags tu AI/assessment, visibility rules.
- `learning-alerts`: stuck alerts for teacher.

## Data concept

- Learning metric snapshot: user id, period, study time, completed modules, score summary.
- Weak tag: user id, tag/code, source, context course/lesson/class, visibility, created by.
- Alert: class id, student id, knowledge tag, severity, status, triggered at.

## RBAC

- Student: xem dashboard va diem yeu cua minh.
- Teacher: xem hoc sinh thuoc lop minh va diem yeu visibility class.
- Admin: xem tong hop he thong, khong can xem du lieu ca nhan chi tiet neu khong co ly do.

## Verification

- Tests visibility diem yeu personal/class.
- Tests teacher chi xem hoc sinh thuoc lop minh.
- Tests dashboard Student tinh dung completed modules/study time.
- Tests stuck alert duoc trigger theo rule va khong duplicate qua muc.
