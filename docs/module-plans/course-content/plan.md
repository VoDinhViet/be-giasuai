# Course Content Plan

## Muc tieu

Hoan thien lop noi dung hoc tap de cac module delivery, assessment, AI va classroom co the dung chung course/lesson/module nhu mot nguon su that.

## Ke hoach backend

- Duy tri `courses` la module doc/xem noi dung cong khai.
- Mo rong quan tri noi dung cho Admin/Teacher khi co yeu cau tao/sua/duyet.
- Chuan hoa cau truc course -> section/module -> lesson -> lesson part.
- Bo sung search co pham vi theo vai tro: public course search, teacher class/student related search, admin system search.
- Tach content approval rule khoi learning progress va grading.

## API/module de xuat

- `courses`: list/detail courses, sections, lessons, lesson parts.
- `content-search`: co the la service noi bo neu search phinh to.
- `content-moderation`: admin duyet noi dung giao vien tu soan khi bat dau cho phep Teacher authoring.

## Data concept

- Course: tieu de, slug, mo ta, thumbnail, publish status.
- Section/module: course id, title, position.
- Lesson: section id, title, position.
- Lesson part: lesson id, content type, content payload, position.
- Moderation: author, status, reviewed by, reviewed at, rejection reason.

## RBAC

- Public/Student: doc noi dung published.
- Teacher: xem noi dung can giang day, soan de xuat noi dung neu duoc mo.
- Admin: CRUD/duyet noi dung.

## Verification

- Tests list/search courses, course detail, sections/lessons, lesson parts.
- Tests chi tra noi dung published cho public neu co publish rule.
- Tests sort position on sections, lessons, lesson parts.
- Tests moderation permissions khi them duyet noi dung.
