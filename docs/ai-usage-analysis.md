# Cách tôi sử dụng AI trong dự án

## Mục đích

Tài liệu này mô tả cách tôi đang sử dụng AI khi phát triển dự án backend Gia Sư AI, đồng thời chỉ ra ưu điểm, nhược điểm và cách cải thiện quy trình làm việc với AI.

## Cách sử dụng hiện tại

Tôi sử dụng AI như một trợ lý lập trình trực tiếp trong repository. AI không chỉ trả lời lý thuyết, mà còn đọc code, sửa file, chạy lệnh kiểm tra, tạo tài liệu, commit thay đổi và báo lại kết quả.

Các yêu cầu thường được đưa ra theo kiểu ngắn gọn, tập trung vào hành động cần làm. Ví dụ:

- Sửa logic service theo cách query dữ liệu tốt hơn.
- Đổi DTO hoặc bỏ DTO không cần thiết.
- Giảm mapping thủ công khi có thể lấy dữ liệu trực tiếp từ query.
- Đổi tên biến để rõ nghĩa hơn.
- Bỏ trường response frontend chưa cần dùng.
- Viết lại tài liệu Markdown bằng tiếng Việt có dấu.
- Sửa enum, permission, schema, migration và logic liên quan.

AI được dùng theo hướng cộng tác từng bước. Khi kết quả chưa đúng ý, tôi đưa thêm yêu cầu chỉnh tiếp thay vì viết lại toàn bộ đặc tả từ đầu. Quy trình này giúp tôi điều khiển chi tiết cách code được viết ra.

## Quy trình làm việc với AI

Quy trình thực tế thường gồm các bước sau:

1. Tôi nêu vấn đề hoặc hướng sửa.
2. AI đọc các file liên quan trong repository.
3. AI sửa code hoặc tài liệu theo phạm vi yêu cầu.
4. AI chạy kiểm tra phù hợp, thường là build hoặc lệnh xác minh hẹp.
5. AI chạy `codegraph sync` sau thay đổi code.
6. AI commit thay đổi vào git.
7. AI thử push lên remote và báo lỗi nếu thiếu credential.

Cách làm này biến AI thành một coding agent có khả năng xử lý công việc end-to-end, không chỉ là công cụ gợi ý code.

## Nguyên tắc tôi đang áp dụng

- Ưu tiên code ngắn, rõ, ít mapping thủ công.
- Tận dụng query relation của Drizzle khi có thể.
- Dùng DTO chuyển đổi bằng `plainToInstance` thay vì helper mapping riêng nếu không cần thiết.
- Không trả về dữ liệu frontend chưa dùng.
- Dùng lại DTO hoặc function sẵn có để tránh trùng logic.
- Đổi tên biến theo nghĩa dữ liệu thật, ví dụ `userRows` thành `entities`.
- Sửa schema, migration và logic cùng lúc khi thay đổi model dữ liệu.
- Viết tài liệu bằng tiếng Việt có dấu để dễ đọc và dễ bàn giao.

## Quy tắc dùng spread DTO khi ghi dữ liệu

Khi DTO có field trùng trực tiếp với cột của bảng, tôi ưu tiên dùng spread để giảm mapping thủ công.

Ví dụ nên dùng:

```ts
await tx.insert(users).values({
  ...dto,
  password: hashedPassword,
});
```

Ví dụ update có field cần xử lý trước:

```ts
await tx.update(users).set({
  ...reqDto,
  ...(reqDto.password ? { password: await hashPassword(reqDto.password) } : {}),
});
```

Không dùng spread nếu DTO có field không thuộc bảng đang ghi, hoặc field cần đổi tên, tách bảng, tính toán phức tạp. Khi đó chỉ spread phần chắc chắn đúng, phần còn lại vẫn map rõ ràng.

## Ưu điểm

### Tốc độ triển khai nhanh

AI có thể đọc nhiều file, tìm usage, sửa nhiều điểm liên quan và chạy build trong thời gian ngắn. Việc này giúp giảm thời gian tìm kiếm thủ công và giảm số vòng sửa lặt vặt.

### Dễ giữ ngữ cảnh toàn dự án

AI có thể đối chiếu service, DTO, schema, migration, guard, decorator và docs trong cùng một lượt làm việc. Điều này hữu ích khi thay đổi có ảnh hưởng chéo, ví dụ đổi role từ `STUDENT`/`TEACHER` sang `LEARNER`/`INSTRUCTOR`.

### Tăng tính nhất quán

Khi có quy chuẩn trong `AGENTS.md` và `docs/standards`, AI có thể dựa vào đó để sửa theo style chung của dự án. Điều này giúp code ít bị lệch phong cách giữa các module.

### Hỗ trợ tài liệu hóa tốt

AI giúp chuyển ý tưởng rời rạc thành file Markdown có cấu trúc. Điều này giúp dự án dễ bàn giao hơn, nhất là khi cần ghi lại kiến trúc, luồng hệ thống, tiến độ module và cách sử dụng AI.

### Giảm việc lặp lại

Các việc như đổi import, đổi enum, đổi type, sửa response DTO, cập nhật permission hoặc tạo migration có nhiều thao tác nhỏ. AI xử lý tốt các thao tác lặp này nếu phạm vi rõ.

## Nhược điểm

### Yêu cầu ngắn dễ bị hiểu thiếu

Khi yêu cầu quá ngắn, AI có thể phải tự suy luận nhiều. Nếu suy luận sai, code có thể đúng kỹ thuật nhưng chưa đúng ý nghiệp vụ.

Ví dụ, một yêu cầu như "bỏ map dữ liệu" cần nói rõ bỏ map ở response nào, giữ DTO nào và trường nào vẫn phải trả về.

### Dễ phát sinh thay đổi lan rộng

Một thay đổi nhỏ trong enum, schema hoặc permission có thể ảnh hưởng nhiều file. Nếu không kiểm soát phạm vi, AI có thể sửa nhiều hơn mức cần thiết.

### Worktree bẩn làm commit khó kiểm soát

Khi repository có nhiều file đã modified hoặc untracked từ trước, AI phải stage rất chọn lọc. Nếu không cẩn thận, commit có thể chứa cả thay đổi không liên quan.

### Cần kiểm chứng bằng lệnh thật

AI có thể suy luận code sẽ chạy, nhưng vẫn cần build, test hoặc kiểm tra runtime. Với backend NestJS, lỗi type, import, provider hoặc migration chỉ nên kết luận sau khi chạy lệnh xác minh.

### Push phụ thuộc môi trường

AI có thể commit local, nhưng không thể push nếu máy thiếu GitHub credential. Đây không phải lỗi code, mà là giới hạn môi trường làm việc.

## Rủi ro cần chú ý

- AI có thể hiểu nhầm thuật ngữ nếu tên domain chưa thống nhất.
- AI có thể tạo thêm abstraction khi chưa thật sự cần.
- AI có thể cập nhật docs lệch với code nếu không kiểm tra trạng thái hiện tại.
- AI có thể bỏ sót migration khi schema thay đổi.
- AI có thể sửa test hoặc file ngoài phạm vi nếu yêu cầu không rõ.

## Cách cải thiện khi làm việc với AI

Nên viết yêu cầu ngắn nhưng có đủ ba phần:

- File hoặc module cần sửa.
- Hành vi mong muốn.
- Giới hạn không được làm.

Ví dụ tốt:

```text
getUserById dùng db.query.users.findFirst với with profile, bỏ select columns, trả về plainToInstance(UserResDto), không tạo helper mapping mới.
```

Nên yêu cầu AI xác minh sau khi sửa:

```text
Sửa xong chạy pnpm run build và codegraph sync.
```

Nên tách yêu cầu lớn thành nhiều bước nhỏ:

- Sửa DTO trước.
- Sửa service sau.
- Sửa schema/migration sau.
- Cuối cùng cập nhật docs.

Nên kiểm tra lại diff trước khi commit nếu repository đang có nhiều file bẩn.

## Kết luận

Cách tôi dùng AI hiện tại phù hợp với mô hình coding agent: giao việc theo mục tiêu, để AI đọc code và tự xử lý phần kỹ thuật, sau đó tôi điều chỉnh bằng các yêu cầu ngắn tiếp theo.

Điểm mạnh lớn nhất là tốc độ, khả năng xử lý nhiều file liên quan và hỗ trợ tài liệu hóa. Điểm yếu chính là yêu cầu quá ngắn có thể làm AI suy luận sai, và repository bẩn khiến việc commit cần kiểm soát kỹ.

Để dùng AI hiệu quả hơn, cần tiếp tục giữ quy tắc rõ trong `AGENTS.md`, tài liệu hóa chuẩn trong `docs/`, và luôn xác minh thay đổi bằng lệnh thực tế trước khi xem công việc là hoàn tất.
