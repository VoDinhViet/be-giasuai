# Service Packages Progress

## Tong quan

Trang thai tong quan: `planned-later`

Module nay duoc tach rieng de lam sau cung. Hien chua can chan dang nhap, hoc tap, lop hoc hoac AI.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Goi Student `casual/plus/pro` | Dong 9 - Student | `planned-later` | Chua thay package schema. | Lam sau khi flow hoc tap cot loi on dinh. |
| Goi Teacher `casual/plus/pro` | Dong 9 - Teacher | `planned-later` | Chua thay package schema. | Lam sau khi classroom/AI teacher tools on dinh. |
| Admin quan ly cap quyen/goi | Dong 9 - Admin | `planned-later` | Hien co role enum, chua co package entitlement. | Thiet ke entitlement resolver. |
| Quota tao de AI | Dong 19 - Admin | `planned-later` | Chua co AI usage/quota. | Can `ai-personalization` va `platform-admin` AI usage log truoc. |
| Gioi han AI theo goi | Dong 17 va 19 | `planned-later` | Chua ap enforcement. | Them quota manager sau. |

## Dieu kien bat dau

- `ai-personalization` da co AI generation log.
- `platform-admin` da co AI usage summary.
- Cac flow cot loi khong con thay doi lon ve endpoint/use case.
