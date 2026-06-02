# Service Packages Plan

## Muc tieu

Them lop goi dich vu sau khi cac flow cot loi da on dinh, de han che rui ro package/quota lam phuc tap hoa luong hoc tap va AI qua som.

## Ke hoach backend

- Thiet ke package catalog cho Student va Teacher.
- Thiet ke subscription/assignment cho user.
- Thiet ke entitlement resolver tra ve quyen loi hieu luc cua user.
- Them quota manager cho AI/practice generation sau khi da co AI usage log.
- Admin co the gan/sua goi va cap nhat quota policy.

## API/module de xuat

- `service-packages`: package catalog, package detail.
- `user-packages`: assign/current package for user.
- `entitlements`: resolve feature flags/limits by user.
- `quotas`: consume/check/reset quota by purpose.

## Data concept

- Package: code, audience role, name, status.
- Package entitlement: package id, feature code, limit value, reset period.
- User package: user id, package id, starts at, ends at, status.
- Quota usage: user id, feature code, period, used count.

## RBAC

- Admin: CRUD package, assign package, adjust quota.
- Student/Teacher: xem goi hien tai va usage cua minh.
- Internal services: check/consume quota khi feature da san sang ap gioi han.

## Verification

- Tests resolve entitlement theo role va package.
- Tests quota consume/check/reset.
- Tests Admin assign package.
- Tests feature khong bi chan neu module cot loi chua bat quota enforcement.
