# Documentation Structure

## Muc dich

Tai lieu nay quy dinh cach dung cac file markdown trong du an de tranh trung lap, tranh lech thong tin va giup AI agent/developer doc dung ngu canh.

Hien tai cach chia docs cua du an la hop ly: co tai lieu kien truc, luong he thong, module spec, module plan va progress. Van de chinh khong phai co nhieu file `.md`, ma la can quy dinh ro moi file chiu trach nhiem cho loai thong tin nao.

## Nguyen tac chung

- Moi thong tin quan trong chi nen co mot nguon su that chinh.
- File plan khong thay the file spec.
- File progress khong thay the file system flow.
- File module spec phai mo ta API/schema/rule dang ton tai trong code hien tai.
- File module plan phai mo ta y tuong, pham vi va ke hoach trien khai trong tuong lai.
- Khi code thay doi API module, cap nhat module spec tuong ung.
- Khi thay doi luong cross-module, cap nhat `docs/system-flow.md`.
- Khi thay doi trang thai hoan thanh/pending/blocker, cap nhat progress.
- Khi them file bo sung nhu `usage.md`, can ghi ro file do dung de lam gi va khong dung de lam gi.

## Vai tro tung nhom tai lieu

### `docs/architecture.md`

Dung de mo ta kien truc tong quan cua backend.

Nen co:

- Tech stack.
- Module boundaries.
- Folder structure.
- Layer responsibilities.
- Database/API/Auth architecture tong quan.

Khong nen co:

- Trang thai tung feature.
- Chi tiet endpoint tung module.
- Ke hoach product chua lam.

### `docs/system-flow.md`

Dung de mo ta luong nghiep vu cross-module dang ton tai hoac dang duoc backend ho tro.

Nen co:

- Luong dang ky/dang nhap/session.
- Luong user profile.
- Luong class/course neu module dang ton tai.
- Cac constraint hien tai.

Khong nen co:

- Bang status chi tiet tung task.
- API spec day du.
- Ke hoach xa chua co backend.

### `docs/module-specs/<module>.md`

Dung lam su that cho API module hien tai.

Nen co:

- Purpose module.
- Public API/endpoints.
- Request DTO/Response DTO.
- Permissions/RBAC.
- Business rules.
- Errors.
- Dependencies.
- Security rules.
- Verification commands.

Khong nen co:

- Feature chua co code.
- Y tuong product chua trien khai.
- Progress table dai.

Quy tac:

- Neu module co code trong `src/api/<module>/`, nen co spec trong `docs/module-specs/<module>.md`.
- Neu chua co code, khong tao module spec tru khi can ghi contract da chot.
- Khi thay doi endpoint/DTO/schema/permission/rule, phai cap nhat spec.

### `docs/module-progress.md`

Dung lam dashboard trang thai tong the cua project.

Nen co:

- Module nao `done`, `in-progress`, `planned`, `planned-later`, `blocked`.
- Backend done noi bat.
- Pending/blocker noi bat.
- Verification gan nhat neu co.

Khong nen co:

- API spec chi tiet.
- Toan bo plan tung module.
- Noi dung trung lap dai voi `module-plans/*/progress.md`.

Quy tac:

- Giu ngan gon.
- Neu can bang chi tiet theo feature, dat trong `docs/module-plans/<module>/progress.md`.

### `docs/module-plans/README.md`

Dung de giai thich cach doc module plans va mapping tu nguon yeu cau sang module.

Nen co:

- Nguon chinh cua plan.
- Cach doc folder module.
- Dinh nghia status.
- Thu tu module.
- Mapping feature Excel -> module.

Khong nen co:

- Spec API hien tai.
- Chi tiet logic tung endpoint.

### `docs/module-plans/<module>/description.md`

Dung de mo ta module o muc nghiep vu.

Nen co:

- Muc dich module.
- Pham vi chuc nang.
- Vai tro nguoi dung.
- Ngoai pham vi.

Khong nen co:

- Endpoint chi tiet.
- SQL/schema chi tiet.
- Trang thai task chi tiet.

### `docs/module-plans/<module>/plan.md`

Dung de mo ta ke hoach backend-ready cho module.

Nen co:

- Muc tieu trien khai.
- API/module de xuat.
- Data concept.
- RBAC.
- Verification can co.

Khong nen co:

- Noi dung khang dinh da co code neu chua co bang chung.
- Response DTO chi tiet nhu module spec.

### `docs/module-plans/<module>/progress.md`

Dung de theo doi tien do chi tiet cua module theo tung feature.

Nen co:

- Trang thai tong quan module.
- Bang feature/status/evidence/next step.
- Bang chung ro trong code/docs neu status la `done` hoac `in-progress`.
- Phu thuoc/blocker.

Khong nen co:

- Full endpoint spec.
- Luong cross-module dai.

### `docs/module-plans/<module>/usage.md`

Dung cho module can thong ke cach su dung rieng, vi du AI usage.

Nen co:

- Cac use case.
- Actor.
- Input/output.
- Data/log can luu.
- Module so huu.
- Nguyen tac an toan.
- Thu tu trien khai de nghi.

Khong nen co:

- API spec bat buoc neu module chua co code.
- Endpoint/DTO chi tiet thay cho `docs/module-specs/<module>.md`.
- Chi tiet provider secret/model key.

## Cau truc de nghi

```text
docs/
  architecture.md
  system-flow.md
  module-progress.md
  documentation-structure.md
  module-specs/
    auth.md
    users.md
    files.md
    <module>.md
  module-plans/
    README.md
    <module>/
      description.md
      plan.md
      progress.md
      usage.md        # optional
  standards/
    naming-standards.md
    typescript-standards.md
    nestjs-standards.md
    api-standards.md
    database-standards.md
    testing-standards.md
```

## Van de hien tai can luu y

### Trung lap nguon su that

Du an co nhieu noi cung co the noi ve trang thai module:

- `docs/module-progress.md`
- `docs/module-plans/<module>/progress.md`
- `docs/module-specs/<module>.md`
- `docs/system-flow.md`

Neu khong chia vai ro ro, cac file nay se de lech nhau.

Cach xu ly:

- `module-specs`: noi code/API hien tai.
- `module-plans`: noi ke hoach va tien do theo feature.
- `module-progress`: noi tong quan ngan gon.
- `system-flow`: noi luong nghiep vu cross-module.

### Plan va spec de bi lan

Neu `plan.md` mo ta endpoint nhu da ton tai, AI agent co the hieu nham la code da co.

Cach xu ly:

- Dung tu `de xuat`, `can tao`, `planned` trong plan.
- Dung tu `endpoint`, `business rules`, `errors`, `permissions` trong spec khi code da co.

### Progress can evidence

Status `done` hoac `in-progress` nen co bang chung.

Evidence tot:

- Endpoint: `POST /auth/login`.
- File code: `src/api/auth/auth.service.ts`.
- Schema: `src/database/schemas/users.ts`.
- Test/build: `pnpm run build`, `pnpm test ...`.

Evidence kem:

- `Da lam` nhung khong ghi file/API.
- `Gan xong` nhung khong co pending ro.
- `Done` nhung spec chua cap nhat.

### Worktree dirty lam commit de sai

Khi repo co nhieu modified/untracked file, viec auto commit rat de dua nham thay doi vao commit.

Cach xu ly:

- Truoc khi sua, kiem tra `git status --short`.
- Khi commit, stage dung file lien quan.
- Khong revert file khong phai minh sua.
- Sau moi feature, commit rieng theo scope.

## Quy tac khi them module moi

1. Tao `docs/module-plans/<module>/description.md` neu module moi den tu product plan.
2. Tao `docs/module-plans/<module>/plan.md` de chia API/data/RBAC/verification.
3. Tao `docs/module-plans/<module>/progress.md` de theo doi tien do.
4. Khi bat dau code module trong `src/api/<module>/`, tao `docs/module-specs/<module>.md`.
5. Khi module tao flow anh huong module khac, cap nhat `docs/system-flow.md`.
6. Khi trang thai tong the doi, cap nhat `docs/module-progress.md`.

## Quy tac khi sua API module hien co

1. Doc `docs/module-specs/<module>.md` truoc.
2. Sua code theo request.
3. Cap nhat spec neu endpoint/DTO/permission/rule/schema thay doi.
4. Cap nhat progress neu done/pending/blocker doi.
5. Cap nhat system flow neu thay doi cross-module.
6. Chay verification phu hop.
7. Commit rieng scope.

## Ket luan

Cach chia markdown hien tai dung huong. Can cai thien bang cach gan vai tro ro cho tung file va giam trung lap. Muc tieu la khi AI agent hoac developer doc docs, ho phai biet file nao la spec hien tai, file nao la ke hoach, file nao la progress va file nao la luong he thong.
