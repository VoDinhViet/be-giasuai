# Classroom Management Plan

## Muc tieu

Hoan thien classroom nhu mot boundary rieng de Teacher quan ly lop va Student tham gia hoc co giao vien, dong thoi cung cap scope cho analytics, delivery va assessment.

## Ke hoach backend

- Duy tri `classes` module hien co cho CRUD lop, join code, gan khoa hoc va gan hoc vien.
- Mo rong luong phe duyet hoc vien neu hien tai join la active truc tiep.
- Chuan hoa permission theo owner: Teacher chi thao tac lop minh, Admin thao tac toan bo.
- Them direct communication khi co quyet dinh channel/message.
- Cac query tien do hoc sinh trong lop lay tu `learning-analytics`, khong tinh truc tiep trong class service neu phinh to.

## API/module de xuat

- `classes`: CRUD lop, get class, stats, join by code/invite, assign course/student.
- `class-registrations`: pending/approved/rejected membership flow.
- `class-messages`: trao doi Student - Teacher khi can realtime/message history.

## Data concept

- Class: name, code, invite code, teacher id, active status.
- Class registration: class id, user id, status.
- Class course: class id, course id, assigned by.
- Class message/thread: class id, sender, receiver/context, content, read status.

## RBAC

- Student: join class, xem lop da tham gia, trao doi trong lop cua minh.
- Teacher: tao/sua/xoa lop minh, gan khoa hoc, phe duyet hoc vien, xem danh sach.
- Admin: xem/quan ly tat ca lop.

## Verification

- Tests Teacher chi quan ly lop minh.
- Tests Student join by invite code.
- Tests duplicate registration bi chan.
- Tests assign course to class chi cho Teacher hop le.
- Tests pending/approval flow neu duoc them.
