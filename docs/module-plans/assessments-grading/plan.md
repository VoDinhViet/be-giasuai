# Assessments Grading Plan

## Muc tieu

Tao nen tang assessment co the dung cho test dau vao, bai tap trong lesson va cac phan cham diem/giai thich bang rule hoac AI.

## Ke hoach backend

- Thiet ke ngan hang cau hoi theo type co the mo rong.
- Tao attempt/result flow cho Student.
- Tich hop grading engine: rule-based truoc, AI grading khi can.
- Luu feedback/giai thich loi sai de Student va Teacher xem lai.
- Cho Admin quan ly ngan hang de va giam sat ket qua AI grading.

## API/module de xuat

- `assessments`: question bank, assessment definitions, attempts, results.
- `placement-tests`: test dau vao va ket qua phan loai.
- `grading`: cham diem, feedback, grading review/audit.

## Data concept

- Question: type, prompt, answer key/rubric, metadata.
- Assessment: purpose, question set, passing score.
- Attempt: user id, assessment id, answers, submitted at.
- Result: score, passed, feedback, weak tags.
- Grading audit: grader type, confidence, reviewed by, reviewed at.

## RBAC

- Student: lam bai va xem ket qua cua minh.
- Teacher: xem ket qua hoc sinh trong lop minh.
- Admin: quan ly ngan hang de va giam sat grading.

## Verification

- Tests submit attempt va tinh score rule-based.
- Tests feedback/giai thich loi sai duoc luu va tra ve dung user.
- Tests Teacher chi xem ket qua hoc sinh thuoc lop minh.
- Tests Admin CRUD question bank va review grading audit.
