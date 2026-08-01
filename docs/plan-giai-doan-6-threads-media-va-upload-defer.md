# Giai đoạn 6 — Gộp 3 mục backlog còn lại: Threads media riêng, validate chain, hoãn upload

> File này là plan độc lập, đủ ngữ cảnh để 1 phiên chat/agent khác thực thi mà không cần
> đọc lại lịch sử hội thoại trước. Giai đoạn 1-5 (networkCustom, tab switcher, Threads
> chain UI, Notes side-panel, media/preview đồng bộ) đã hoàn tất và verify end-to-end
> (publish thật lên YouTube+Facebook+Threads, DB xác nhận đúng). Đồng thời đã vá xong
> `updatePost`/`networkOverrides` (backend) và chặn sửa bài PUBLISHED (frontend) — 2 việc
> đó không liên quan tới file này.

Đây là 3 mục backlog cuối cùng, gộp vào 1 file vì #A và #B đều thuộc phạm vi Threads chain
(nên làm cùng lúc, cùng người, dễ test chung), còn #C độc lập nhưng nên làm SAU CÙNG vì
phạm vi lớn nhất và rủi ro cao nhất trong cả 3.

**Thứ tự bắt buộc khi thực thi:** A → B → C. Không làm C trước A/B vì C thay đổi tận gốc
cách `postMedia`/`networkCustom[platform].mediaUrls` được điền vào (từ "upload xong ngay"
sang "blob tạm, upload lúc submit") — nếu đổi trước, code Threads media riêng (A) sẽ phải
viết lại theo cơ chế mới ngay lập tức, tốn công gấp đôi.

---

## PHẦN A — Media riêng cho từng post trong Threads chain

### Bối cảnh

Từ Giai đoạn 3, quyết định đã chốt: "Threads chain chỉ post gốc (`threadPosts[0]`) mang
`networkCustom.threads.mediaUrls`, các post nối chuỗi sau (`threadPosts[1]`, `[2]`...) chỉ
có text" — vì đúng hành vi Threads thực tế (ảnh/video nằm ở post gốc, reply chain thường
chỉ text). Đây **không phải giới hạn kỹ thuật** mà là **giả định về hành vi Threads** — nếu
giả định sai (Threads thực tế cho phép mỗi post trong chain có ảnh riêng), cần mở rộng.

**Việc cần làm:** cho phép mỗi phần tử trong `threadPosts` mang mảng media riêng, không chỉ
`threadPosts[0]`.

### Thiết kế shape dữ liệu mới

Hiện `networkCustom.threads` là:
```js
{ useTemplate: bool, activeThreadIndex: number, threadPosts: string[], mediaUrls: object[] }
```

`threadPosts` là mảng STRING thuần (chỉ text). Đổi thành mảng OBJECT để mỗi post tự mang
media riêng:
```js
{
  useTemplate: bool,
  activeThreadIndex: number,
  threadPosts: [
    { text: string, mediaUrls: {file, previewUrl, path}[] },
    { text: string, mediaUrls: {file, previewUrl, path}[] },
    ...
  ]
}
```
Bỏ hẳn field `mediaUrls` cấp ngoài của `networkCustom.threads` (không cần nữa — mỗi post tự
mang media của nó, kể cả post đầu).

**Đây là thay đổi BREAKING với dữ liệu cũ** (Giai đoạn 1-5 dùng `threadPosts: string[]`) —
cần viết migration ở cả 2 chiều:
1. **Load từ backend** (`mapNetworkOverridesToCustom` trong `src/constants/postComposerNetwork.js`): hiện parse `override.threadPosts` (JSON từ DB, shape `[{text, mediaUrls}]` — backend đã lưu đúng shape có `mediaUrls` per-post từ `SocialPublishStep`/`upsertNetworkOverrides`, xem `backend/src/services/workspace/post.service.js` dòng ~166: `threadPosts: threadPosts ? JSON.stringify(threadPosts) : null` — mảng gốc là `[{text, mediaUrls: []}]`, ĐÃ CÓ SẴN field `mediaUrls` per-post dù frontend chưa dùng tới). Nghĩa là **backend đã sẵn sàng cho thay đổi này từ trước** — chỉ cần frontend bắt đầu đọc/ghi đúng field đã có.
2. **Trong toàn bộ frontend hiện tại dùng `threadPosts[i]` như string** cần đổi sang `threadPosts[i].text`.

### File cần sửa

**1. `src/constants/postComposerNetwork.js`**
- `buildDefaultNetworkEntry` (case Threads): đổi `threadPosts: ['']` thành `threadPosts: [{ text: '', mediaUrls: [] }]`.
- `mapNetworkOverridesToCustom` (case Threads): đổi map hiện tại
  ```js
  threadPosts: threadPosts.length > 0
    ? threadPosts.map((p) => (typeof p === 'string' ? p : p?.text || ''))
    : [override.caption || ''],
  ```
  thành:
  ```js
  threadPosts: threadPosts.length > 0
    ? threadPosts.map((p) => ({
        text: typeof p === 'string' ? p : (p?.text || ''),
        mediaUrls: (Array.isArray(p?.mediaUrls) ? p.mediaUrls : []).map((item) =>
          typeof item === 'string' ? { file: null, previewUrl: item, path: item } : item
        ),
      }))
    : [{ text: override.caption || '', mediaUrls: [] }],
  ```
  (dùng chung helper `formattedMediaUrls`-style logic đã có ở nhánh non-Threads phía trên trong cùng hàm — có thể tách thành 1 hàm nhỏ `normalizeMediaItem(item)` dùng lại ở cả 2 chỗ, tránh lặp code).

**2. `src/hooks/usePostCreatorForm.js`**
- `updateThreadPostText(index, text)`: đổi `newPosts[index] = text` thành `newPosts[index] = { ...newPosts[index], text }` (giữ nguyên `mediaUrls` của post đó khi chỉ đổi text).
- `addThreadPost()`: đổi `[...threadPosts, ""]` thành `[...threadPosts, { text: '', mediaUrls: [] }]`.
- Thêm hàm mới `updateThreadPostMedia(index, mediaUrls)`:
  ```js
  const updateThreadPostMedia = (index, mediaUrls) => {
    setNetworkCustom((prev) => {
      const threads = prev[PLATFORMS.THREADS] || { threadPosts: [{ text: '', mediaUrls: [] }] };
      const newPosts = [...threads.threadPosts];
      newPosts[index] = { ...newPosts[index], mediaUrls };
      return { ...prev, [PLATFORMS.THREADS]: { ...threads, threadPosts: newPosts } };
    });
  };
  ```
  Export hàm này trong object trả về của hook (cạnh `updateThreadPostText`).
- `toggleUseTemplate` (nhánh seed lần đầu customize cho Threads, tìm bằng grep `isThreads`): đổi
  ```js
  { ...current, threadPosts: [caption, ...(current.threadPosts?.slice(1) || [])] }
  ```
  thành
  ```js
  { ...current, threadPosts: [{ text: caption, mediaUrls: [...postMedia] }, ...(current.threadPosts?.slice(1) || [])] }
  ```
  (seed cả text VÀ media từ `postMedia`/`caption` chung — trước đây chỉ seed text, giờ cũng seed media cho post đầu, khớp tinh thần "seed từ nội dung chung khi lần đầu customize" đã áp dụng cho các platform khác).
- `buildNetworkOverrides` (nhánh Threads, tìm bằng grep `PLATFORMS.THREADS` trong hàm này): đổi
  ```js
  const threadPosts = (entry.threadPosts || []).filter((t) => t && t.trim());
  if (threadPosts.length === 0) return;
  overrides.push({
    platform: apiKey,
    useTemplate: false,
    caption: threadPosts[0],
    mediaUrls: formattedMediaUrls, // media riêng cấp ngoài — SẼ BỎ
    threadPosts: threadPosts.map((text) => ({ text, mediaUrls: [] })),
  });
  ```
  thành:
  ```js
  const validPosts = (entry.threadPosts || []).filter((p) => p?.text?.trim() || (p?.mediaUrls || []).length > 0);
  if (validPosts.length === 0) return;
  const formatPostMedia = (mediaUrls) => (mediaUrls || [])
    .map((item) => (typeof item === 'string' ? item : item.path || item.previewUrl))
    .filter(Boolean);
  overrides.push({
    platform: apiKey,
    useTemplate: false,
    caption: validPosts[0].text || '',
    mediaUrls: formatPostMedia(validPosts[0].mediaUrls),
    threadPosts: validPosts.map((p) => ({ text: p.text || '', mediaUrls: formatPostMedia(p.mediaUrls) })),
  });
  ```
  Field `mediaUrls` cấp ngoài của override (dùng cho tương thích với chỗ khác đọc `caption`/`mediaUrls` chung của 1 platform) giờ lấy từ `validPosts[0].mediaUrls` — giữ hành vi "post đầu = nguồn caption/media đại diện" cho các nơi khác trong code không biết đến khái niệm chain (ví dụ preview khi hiển thị dạng khác), nhưng bản thân mảng `threadPosts` giờ đã đúng — mỗi phần tử tự mang media của nó.

**3. `src/components/workspace/post-creator/NetworkTabSwitcher.jsx`**
- Chỗ hiển thị sub-tabs Threads (`threadsData.threadPosts.map(...)`) — hiện dùng `(_, index)` bỏ qua giá trị — không cần đổi vì chỉ dùng `index`, không đọc nội dung.
- Không có chỗ nào khác trong file này đọc `threadPosts[i]` như string.

**4. `src/components/workspace/post-creator/ComposerBody.jsx`**
- `activeCaptionValue` (nhánh Threads):
  ```js
  : isThreadsTab ? (networkCustom['threads']?.threadPosts?.[networkCustom['threads']?.activeThreadIndex || 0] || '')
  ```
  đổi thành:
  ```js
  : isThreadsTab ? (networkCustom['threads']?.threadPosts?.[networkCustom['threads']?.activeThreadIndex || 0]?.text || '')
  ```
- `handleCaptionChange` (nhánh Threads) — không đổi logic gọi `updateThreadPostText`, vì hàm đó tự xử lý giữ nguyên `mediaUrls` (đã sửa ở mục 2).
- **Media hiển thị/upload khi đang ở Threads tab + đã customize:** hiện `effectivePostMedia` chỉ tính cho case `isCustomTab` (non-Threads). Cần thêm case Threads:
  ```js
  const activeThreadPost = isThreadsTab
    ? networkCustom['threads']?.threadPosts?.[networkCustom['threads']?.activeThreadIndex || 0]
    : null;

  const effectivePostMedia = isCustomTab
    ? (networkCustom[activeNetworkTab]?.mediaUrls || [])
    : (isThreadsTab && networkCustom['threads']?.useTemplate === false)
      ? (activeThreadPost?.mediaUrls || [])
      : postMedia;
  ```
  Và `handleRemoveMediaItem` cần thêm nhánh Threads:
  ```js
  const handleRemoveMediaItem = (index) => {
    if (isCustomTab) {
      // ... giữ nguyên logic non-Threads
    } else if (isThreadsTab && networkCustom['threads']?.useTemplate === false) {
      const threadIdx = networkCustom['threads']?.activeThreadIndex || 0;
      const current = activeThreadPost?.mediaUrls || [];
      updateThreadPostMedia(threadIdx, current.filter((_, i) => i !== index));
    } else {
      // ... giữ nguyên logic postMedia chung
    }
  };
  ```
  Cần lấy thêm `updateThreadPostMedia` từ context trong destructure đầu component.

**5. `src/pages/workspace/PostCreator.jsx`**
- `MediaUploadModal.onAccept`: biến `isCustomizingNonThreadsPlatform` hiện loại trừ Threads
  hoàn toàn (`activeNetworkTab !== 'threads'`). Cần thêm nhánh riêng cho Threads:
  ```js
  const isCustomizingThreads = isEditByNetwork
    && activeNetworkTab === 'threads'
    && networkCustom?.threads?.useTemplate === false;
  ```
  Trong `onAccept`, thêm case: nếu `isCustomizingThreads`, gọi `updateThreadPostMedia(threadIdx, [...current, ...newItems])` với `threadIdx = networkCustom.threads.activeThreadIndex || 0` và `current = networkCustom.threads.threadPosts[threadIdx]?.mediaUrls || []` — đặt TRƯỚC nhánh `isCustomizingNonThreadsPlatform` hiện có (else-if chain).
- `ImageEditorModal.onSave`: tương tự, thêm nhánh Threads khi sửa ảnh trong lúc đang ở tab Threads custom — dùng `updateThreadPostMedia` thay vì `updateNetworkMedia`.

### Rủi ro cần chú ý (Phần A)

- **Đây là thay đổi shape dữ liệu, không phải thêm tính năng cộng thêm** — mọi chỗ trong code (kể cả những chỗ plan này liệt kê) cần grep lại kỹ `threadPosts` trước khi code thật, vì có thể có chỗ khác chưa được liệt kê ở đây (plan viết dựa trên khảo sát tại thời điểm viết, code có thể đã đổi thêm).
- **Test lại toàn bộ kịch bản Giai đoạn 3** (thêm/xoá/chuyển sub-tab Post 1/2/3) sau khi đổi xong — đảm bảo hành vi text vẫn đúng y hệt cũ, chỉ thêm khả năng media riêng.
- **Giới hạn thực tế của Threads:** nếu nền tảng Threads thật sự không cho phép mỗi reply trong chain có ảnh riêng (cần xác nhận qua tài liệu API Threads hoặc test thật), phần A này vẫn AN TOÀN ở tầng composer (không publish sai) vì backend (`social-publish.step.js`/`services/social/threads/index.js`) là nơi quyết định cuối cùng có gửi media theo post nào lên Threads — nhưng cần xác nhận backend cũng xử lý đúng `threadPosts[i].mediaUrls` khi publish (đọc `services/social/threads/index.js`, đã có comment nhắc tới `effectiveThreadPosts` — kiểm tra lại nó có publish media riêng theo từng post hay chỉ post đầu, TRƯỚC khi test publish thật, để tránh kỳ vọng sai).

### Test / verify (Phần A)

1. Bật edit-by-network, tab Threads, customize, Post 1 upload ảnh A, thêm Post 2 upload ảnh B (khác ảnh A).
2. Chuyển qua lại Post 1/Post 2 → xác nhận mỗi post hiện đúng ảnh riêng của nó, không lẫn.
3. Xoá ảnh A khỏi Post 1 → xác nhận Post 2 không bị ảnh hưởng.
4. Submit → query DB (`PostNetworkOverride.threadPosts`) → xác nhận JSON có `mediaUrls` khác nhau đúng cho từng phần tử mảng.
5. Nếu backend publish thật hỗ trợ, publish thử lên Threads thật (brand có kết nối) → xác nhận trên Threads thực tế từng bài trong chain có đúng ảnh của nó (hoặc xác nhận backend hiện chỉ gửi ảnh post đầu — ghi nhận giới hạn thật của platform nếu vậy, không phải bug).

---

## PHẦN B — Validate độ dài từng post trong Threads chain

### Bối cảnh

Từ Giai đoạn 3: validate hiện tại (`getValidationErrors`/`validatePostForm`) chỉ áp dụng
giới hạn ký tự Threads (thường 500) lên `caption` chung / `threadPosts[0]`, không lặp qua
`threadPosts[1]`, `[2]`... Quyết định trước đó là để backlog. Giờ làm.

**Phụ thuộc Phần A:** nên làm SAU Phần A (vì Phần A đổi `threadPosts[i]` từ string sang
`{text, mediaUrls}` — validate cần đọc đúng `.text`).

### File cần sửa

**`src/utils/postValidation.js`** (hàm `validatePostForm`, hoặc nơi validate Threads hiện tại —
cần đọc lại file này lúc bắt tay code thật để xác định đúng vị trí, plan này viết dựa trên
tên hàm suy luận từ cách `usePostCreatorForm.js` gọi `getValidationErrors`).

Thêm 1 khối validate mới, CHỈ chạy khi `selectedPlatforms.includes('threads')` VÀ
`networkCustom.threads.useTemplate === false` (đang customize chain thật):

```js
const THREADS_MAX_CHARS = 500; // xác nhận lại con số chính xác từ platformRegistry.js
  // (đã thấy platformRegistry.js dòng ~203-209 định nghĩa giới hạn Threads — dùng đúng
  // giá trị từ đó thay vì hardcode lại, để không lệch khi giới hạn platform thay đổi)

if (threadsCustom?.useTemplate === false) {
  (threadsCustom.threadPosts || []).forEach((post, index) => {
    const len = (post.text || '').length;
    if (len > THREADS_MAX_CHARS) {
      errors.push(`[THREADS] Post ${index + 1} trong chuỗi vượt quá ${THREADS_MAX_CHARS} ký tự (hiện ${len}).`);
    }
    if (len === 0 && (post.mediaUrls || []).length === 0) {
      errors.push(`[THREADS] Post ${index + 1} trong chuỗi đang trống (không có text lẫn media).`);
    }
  });
}
```

Vị trí chèn chính xác cần xác định khi đọc lại `postValidation.js` — tìm đoạn xử lý riêng
cho Threads hiện có (nếu có) để đặt logic mới cạnh đó, giữ nhất quán style code hiện tại
(hàm thuần, nhận tham số, trả mảng string lỗi — theo cách các validate khác trong cùng
file đang làm, không đoán trước mà đọc code thật).

### Rủi ro cần chú ý (Phần B)

- **Constant giới hạn ký tự phải lấy từ 1 nguồn duy nhất** (`platformRegistry.js` hoặc tương đương) — không hardcode số `500` ở 2 chỗ khác nhau trong codebase (rủi ro lệch nếu sau này đổi giới hạn platform).
- **Validate chỉ chạy khi đang customize thật** (`useTemplate === false`) — nếu Threads đang dùng chung caption (chưa customize), validate cũ (áp dụng lên `caption` chung) đã đủ, không chạy trùng logic mới để tránh báo lỗi 2 lần cho cùng 1 nội dung.
- Test kỹ trường hợp `threadPosts` rỗng hoàn toàn (mới bật customize, chưa gõ gì) — không nên báo lỗi ngay lập tức trước khi user kịp gõ, cân nhắc chỉ validate khi user đã tương tác hoặc lúc bấm Submit (xem cách các validate khác trong file xử lý thời điểm chạy, làm nhất quán).

### Test / verify (Phần B)

1. Customize Threads, gõ Post 1 dài hơn 500 ký tự → bấm Submit → xác nhận lỗi hiện đúng "Post 1 trong chuỗi vượt quá 500 ký tự".
2. Sửa Post 1 về dưới 500 ký tự, để Post 2 dài hơn 500 → xác nhận lỗi chỉ báo đúng Post 2, không báo nhầm Post 1.
3. Để 1 post giữa chain hoàn toàn trống (không text, không media) → xác nhận báo lỗi "đang trống" đúng cho post đó.
4. Threads chưa customize (dùng chung) → gõ caption chung dài hơn 500 → xác nhận validate CŨ vẫn báo lỗi như trước (không bị validate mới can thiệp/trùng lặp).

---

## PHẦN C — Đổi cơ chế upload sang "hoãn đến lúc Submit"

### Bối cảnh

Vấn đề đã nêu từ đầu: `MediaUploadModal.handleAccept` (đọc code hiện tại,
`src/components/workspace/post-creator/MediaUploadModal.jsx` dòng 105-232) khi chọn file
từ máy tính sẽ: (1) xin signature từ backend, (2) upload trực tiếp lên Cloudinary qua
`CloudinaryResumableUploader` (có progress bar %), (3) gọi `POST /media/save-direct` để
lưu record, (4) CHỈ SAU KHI xong cả 3 bước mới gọi `onAccept(...)` và đóng modal. Toàn bộ
quá trình này chặn UI (modal hiện "Uploading X%", nút Accept disabled).

Dự án tham khảo `publicast-frontend` làm khác: chọn file → tạo `blob:` URL preview NGAY
LẬP TỨC (đồng bộ, không cần chờ mạng) → modal đóng ngay, media hiện trong composer dùng
blob URL → **upload thật xảy ra SAU, lúc bấm Submit** (xem `usePostComposerFacade.js`,
biến `pendingFiles` Map + vòng lặp `postService.uploadMedia` trong `handleSubmit`).

### Phạm vi thay đổi (LỚN — đọc kỹ trước khi bắt tay code)

Đây là thay đổi kiến trúc, không phải thêm 1 tính năng nhỏ. Ảnh hưởng:
1. `MediaUploadModal.jsx` — đổi hành vi `handleAccept` khi `activeTab === "computer"`.
2. `PostCreator.jsx` — nơi `onAccept` được truyền vào, hiện set thẳng `postMedia`/`videoFile`/`videoFileUrl`/`uploadedVideoPath` với data ĐÃ upload — giờ cần lưu `File` object gốc + blob URL tạm.
3. `usePostCreatorForm.js` — `handleCreatePost` cần thêm bước "upload tất cả file đang chờ" TRƯỚC KHI build payload gửi backend.
4. Toàn bộ nơi đọc `postMedia[i].path`/`previewUrl` với giả định "đã là URL Cloudinary thật" (ví dụ validate kiểm tra kích thước file, hoặc preview hiển thị) — cần rà soát lại có chỗ nào giả định sai khi `path` tạm thời là blob URL không phải URL thật.
5. **Ảnh hưởng cả Phần A vừa làm** (Threads media riêng theo từng post) — nếu Phần C đổi cơ chế trước, mọi nơi Phần A vừa viết (`updateThreadPostMedia`, v.v.) cần validate lại có còn đúng với luồng "blob tạm, upload lúc submit" hay không. ĐÂY LÀ LÝ DO CHÍNH plan này yêu cầu thứ tự A → B → C.

### Thiết kế đề xuất (mức khung, cần review kỹ hơn khi bắt tay — không phải chi tiết đầy đủ như Phần A/B vì rủi ro cao, cần 1 vòng khảo sát riêng trước khi viết code thật)

**Bước 1 — `MediaUploadModal.jsx`:** khi `activeTab === "computer"`, KHÔNG gọi API signature/Cloudinary/save-direct nữa. Thay bằng:
```js
const items = selectedFiles.map((file) => ({
  file,
  previewUrl: URL.createObjectURL(file),
  path: null, // chưa có URL thật — đánh dấu rõ ràng "chưa upload"
}));
onAccept(multiple ? items : selectedFile, multiple ? undefined : URL.createObjectURL(selectedFile));
onClose();
```
Modal đóng NGAY LẬP TỨC, không còn progress bar upload trong modal này nữa.

**Bước 2 — nơi lưu `pendingFiles`:** cần 1 state mới (Map hoặc mảng) lưu `{blobUrl, file}` cho
mọi file chưa upload thật — đặt trong `usePostCreatorForm.js`, tương tự cách
`usePostComposerFacade.js` bên tham khảo làm (biến `pendingFiles`, hàm `addPendingFiles`).
Field `postMedia[i].path` khi chưa upload sẽ tạm thời là `null` hoặc chính blob URL (cần
quyết định 1 quy ước rõ ràng, nhất quán toàn bộ code — khuyến nghị: `path` LUÔN là URL thật
hoặc `null`, không bao giờ là blob URL, để mọi chỗ check `if (item.path)` biết chắc đó là
"đã upload xong" hay chưa).

**Bước 3 — `handleCreatePost`:** trước khi build `payload`, thêm 1 bước:
```js
const pendingUploads = postMedia.filter((item) => item.file && !item.path);
for (const item of pendingUploads) {
  const result = await uploadMediaFile(item.file, activeBrand.id); // hàm mới, tái dùng logic Cloudinary hiện có, tách ra khỏi MediaUploadModal thành 1 service dùng chung
  item.path = result.url;
}
```
Tương tự cho `networkCustom[platform].mediaUrls` và `networkCustom.threads.threadPosts[i].mediaUrls`
(từ Phần A) — mọi nơi có thể chứa file chưa upload đều cần quét qua bước này trước khi
build `networkOverrides`.

**Bước 4 — tách logic upload Cloudinary thành 1 service dùng chung** (hiện đang nằm thẳng
trong `MediaUploadModal.jsx`, cần tách ra `src/services/media-upload.service.js` hoặc thêm
method vào `post.service.js`) để cả `MediaUploadModal` (nếu vẫn cần upload ngay cho 1 số
trường hợp, ví dụ thumbnail YouTube — xem `isUploadingThumbnail` trong `PostCreator.jsx`,
CÓ THỂ vẫn cần giữ upload-ngay cho case này) và `handleCreatePost` (upload hoãn) đều dùng
lại được, không lặp code.

### Quyết định cần hỏi lại user TRƯỚC KHI code Phần C (không tự ý giả định)

1. **Thumbnail YouTube** (`isUploadingThumbnail` trong `PostCreator.jsx`) có cần giữ nguyên
   "upload ngay" hay cũng chuyển sang hoãn? Thumbnail thường là 1 ảnh nhỏ, ít lý do phải
   hoãn — khuyến nghị GIỮ NGUYÊN upload-ngay cho riêng case này, chỉ đổi cơ chế cho media
   chính của bài viết (video/ảnh trong `postMedia`, `networkCustom[platform].mediaUrls`,
   `threadPosts[i].mediaUrls`).
2. **Xử lý lỗi khi upload lúc Submit thất bại** — hiện tại lỗi upload xảy ra ngay khi chọn
   file (dễ sửa/chọn lại). Nếu hoãn tới Submit, lỗi upload xảy ra sau khi user đã điền xong
   toàn bộ form (caption, presets, v.v.) — cần thiết kế thông báo lỗi rõ ràng "file X lỗi,
   vui lòng chọn lại" MÀ KHÔNG mất dữ liệu caption/presets đã điền. Đây là điểm UX quan
   trọng cần bàn kỹ, không nên tự quyết khi code.
3. **Progress bar khi Submit** — nếu có nhiều file (ảnh Facebook riêng + video YouTube
   chung + ảnh Threads riêng từng post...), lúc bấm Submit sẽ upload TUẦN TỰ nhiều file
   cùng lúc — cần UI progress rõ ràng (hiện tại chỉ có nút "Publish Now" không có progress
   bar tổng thể), tránh user tưởng app treo.

### Rủi ro cần chú ý (Phần C — cao nhất trong 3 phần)

- **Đừng đánh giá thấp phạm vi.** Đây thực chất là viết lại 1 phần luồng dữ liệu cốt lõi
  của composer. Nên làm trong 1 nhánh git riêng, test kỹ với brand thật trước khi merge.
- **Kiểm tra `MediaUploadModal` còn được dùng ở đâu khác ngoài Post Creator** (ví dụ
  Facebook Album Composer, YouTube thumbnail) — mỗi nơi cần xác nhận có nên đổi cơ chế hay
  giữ nguyên, không đổi đồng loạt mà không kiểm tra từng use-case.
- **`URL.revokeObjectURL`** — khi dùng blob URL tạm, phải nhớ revoke đúng lúc (khi xoá media
  hoặc submit xong) để tránh leak memory — xem cách `usePostComposerFacade.js` bên tham
  khảo xử lý việc này làm mẫu (đã có sẵn logic revoke khi remove file).

### Test / verify (Phần C)

1. Chọn 1 ảnh/video từ máy tính → xác nhận modal đóng NGAY (không chờ mạng), ảnh hiện preview tức thì trong composer bằng blob URL.
2. Kiểm tra Network tab lúc này → xác nhận CHƯA có request nào tới Cloudinary/`/media/save-direct` (upload thật chưa xảy ra).
3. Điền đầy đủ caption/presets, bấm Submit → xác nhận LÚC NÀY mới thấy request upload Cloudinary + save-direct trong Network tab.
4. Sau khi submit thành công → query DB → xác nhận `mediaUrls` của post là URL Cloudinary thật (không phải blob URL).
5. Test file lỗi (quá lớn, sai định dạng) → bấm Submit → xác nhận thông báo lỗi rõ ràng, caption/presets đã điền KHÔNG bị mất, user có thể xoá file lỗi và chọn lại rồi submit lại mà không phải gõ lại từ đầu.
6. Test lại toàn bộ kịch bản Giai đoạn 2, 3, 5, và Phần A/B của file này — xác nhận không có gì bị phá vỡ sau khi đổi cơ chế upload (đây là bước test hồi quy bắt buộc do phạm vi thay đổi lớn).

---

## Tổng kết thứ tự & file bị ảnh hưởng

| Phần | Việc | File chính bị sửa | Phụ thuộc |
|---|---|---|---|
| A | Media riêng theo từng post Threads | `postComposerNetwork.js`, `usePostCreatorForm.js`, `NetworkTabSwitcher.jsx`, `ComposerBody.jsx`, `PostCreator.jsx` | Không (làm trước) |
| B | Validate độ dài từng post Threads | `postValidation.js` | Sau A (đọc `.text` thay vì string thuần) |
| C | Hoãn upload đến lúc Submit | `MediaUploadModal.jsx`, `PostCreator.jsx`, `usePostCreatorForm.js`, service upload mới | Sau A, B (đổi cơ chế nền tảng, cần A/B ổn định trước) |

**Trước khi bắt tay Phần C**, dừng lại hỏi lại user 3 câu ở mục "Quyết định cần hỏi lại
user" phía trên — không tự ý giả định và code thẳng vì rủi ro/phạm vi cao nhất trong toàn
bộ backlog.
