# Giai đoạn 2 — Network Tab Switcher + gửi `networkOverrides` thật

> File này là plan độc lập, đủ ngữ cảnh để 1 phiên chat/agent khác thực thi mà không cần
> đọc lại toàn bộ lịch sử hội thoại. Giai đoạn 1 (state nền `networkCustom`) đã hoàn tất
> và đã build pass — xem `src/constants/postComposerNetwork.js` và các thay đổi trong
> `src/hooks/usePostCreatorForm.js` + `src/pages/workspace/PostCreator.jsx`.

## Bối cảnh đã có sẵn từ Giai đoạn 1 (không cần làm lại)

Trong `src/hooks/usePostCreatorForm.js`, hook `usePostCreatorForm()` đã trả về các
state/hàm sau, có thể dùng thẳng qua `usePostCreatorFormContext()`:

- `isEditByNetwork` (bool, mặc định `false`), `setIsEditByNetwork(bool)`
- `activeNetworkTab` (string: `NETWORK_TAB_TEMPLATE` hoặc 1 platform id lowercase như `'facebook'`), `setNetworkTab(tabId)`
- `networkCustom` — object keyed theo platform id lowercase. Mỗi entry thường:
  `{ useTemplate: bool, caption: string, mediaUrls: string[] }`; riêng `networkCustom.threads`:
  `{ useTemplate: bool, activeThreadIndex: number, threadPosts: string[], mediaUrls: string[] }`.
- `toggleUseTemplate(platformId, value?)` — bật/tắt customize cho 1 platform, tự seed
  caption/mediaUrls từ giá trị chung (`caption`, `postMedia`) khi lần đầu customize.
- `updateNetworkCaption(platformId, value)`, `updateNetworkMedia(platformId, mediaUrls)`
- `updateThreadPostText(index, text)`, `addThreadPost()`, `removeThreadPost(index)`, `setThreadActiveIndex(index)` — CHƯA dùng ở giai đoạn này (để Giai đoạn 3), nhưng đã tồn tại và hoạt động đúng trên `networkCustom.threads`.

Hằng số quan trọng: `NETWORK_TAB_TEMPLATE = "TEMPLATE"` (import từ `src/constants/postComposerNetwork.js`).

`togglePlatform` đã tự động reset `activeNetworkTab` về `NETWORK_TAB_TEMPLATE` khi user bỏ
chọn platform đang active trong network tab — không cần đụng lại.

Việc **load ngược từ bài đã có `networkOverrides`** (khi sửa bài / load template) đã hoạt
động — khi mở `editingPost` có `networkOverrides`, `networkCustom` sẽ tự điền đúng và
`isEditByNetwork` tự bật nếu có ít nhất 1 platform `useTemplate === false`.

## Mục tiêu Giai đoạn 2

1. Thêm UI để bật/tắt "Cài đặt theo mạng" (`isEditByNetwork`).
2. Thêm UI tab switcher: chọn "CÀI ĐẶT CHUNG" hoặc 1 platform cụ thể để custom caption riêng.
3. Khi tạo bài mới có ít nhất 1 platform custom, gửi field `networkOverrides` lên backend qua endpoint `POST /api/v2/posts` (KHÔNG phải `/posts` cũ).
4. Khi **sửa bài** (PUT) có custom, KHÔNG gửi `networkOverrides` (backend `updatePost` chưa hỗ trợ lưu lại — quyết định đã chốt, xem mục "Ràng buộc" bên dưới) — chỉ hiện toast cảnh báo.

**Phạm vi CHỈ custom CAPTION theo platform — KHÔNG custom media riêng** (media luôn dùng chung `postMedia`/`albumMedia`). Media riêng theo platform để backlog sau.

## Ràng buộc quan trọng (đã chốt với user — không tự ý đổi)

- **Không vá backend.** `postService.updatePost` (PUT, dùng khi sửa bài) hiện KHÔNG gọi `upsertNetworkOverrides` — chỉ `createPost` (POST) mới lưu override. Đây là quyết định có chủ đích của user (không phải bug bỏ sót) — KHÔNG được tự ý thêm code backend để "sửa gap" này trong giai đoạn 2. Nếu sửa bài có `networkCustom` custom, chỉ hiện toast cảnh báo, giữ nguyên hành vi PUT cũ (không gửi `networkOverrides`).
- **Không đổi format `options` hiện tại.** Payload cũ (`options: {youtubeType, facebookType, ...}`) giữ nguyên 100%. `networkOverrides` là field THÊM VÀO, không thay thế field nào.
- **`activePlatform` và `activeNetworkTab` là 2 field độc lập, không hợp nhất.** `activePlatform` tiếp tục dùng cho preview đơn, sub-type dropdown (facebookType/youtubeType/instagramType), character-limit hiển thị — KHÔNG đổi ý nghĩa hay hành vi của nó. `activeNetworkTab` chỉ dùng trong phạm vi UI network switcher mới.
- **Backend đã sẵn sàng nhận `networkOverrides` khi TẠO MỚI** qua `POST /api/v2/posts` (đã xác nhận có model Prisma `PostNetworkOverride`, `postService.upsertNetworkOverrides`, `SocialPublishStep` đọc override lúc publish). Route v1 `POST /posts` bỏ qua field này hoàn toàn nên bắt buộc phải đổi sang v2 khi có override.

## Việc cần làm

### 1. File mới: `src/components/workspace/post-creator/NetworkTabSwitcher.jsx`

Component hiển thị hàng tab ngay trên caption textarea trong `ComposerBody.jsx`, CHỈ
render khi `isEditByNetwork === true`.

Lấy state qua `usePostCreatorFormContext()`: `activeNetworkTab`, `setNetworkTab`,
`selectedPlatforms`, `networkCustom`, `toggleUseTemplate`.

UI:
- Nút "CÀI ĐẶT CHUNG" — active khi `activeNetworkTab === NETWORK_TAB_TEMPLATE`, click gọi `setNetworkTab(NETWORK_TAB_TEMPLATE)`.
- 1 icon tròn cho mỗi platform trong `selectedPlatforms` (dùng component `PlatformIcon` có sẵn tại `src/components/shared/PlatformIcon.jsx`, xem cách dùng mẫu trong `ComposerHeader.jsx` dòng ~372/399) — active khi `activeNetworkTab === platform`, click gọi `setNetworkTab(platform)`.
- Khi `activeNetworkTab !== NETWORK_TAB_TEMPLATE`: hiện checkbox "Dùng nội dung chung" — checked = `networkCustom[activeNetworkTab]?.useTemplate ?? true`; onChange gọi `toggleUseTemplate(activeNetworkTab, e.target.checked)`.

Style: có thể phỏng nhẹ theo `ContentComposerRegion.jsx` trong
`D:/Fullit/projects/publicast-frontend/src/components/workspace/planner/composer/regions/ContentComposerRegion.jsx`
dòng ~227-274 (tham khảo layout, KHÔNG copy nguyên class Tailwind vì 2 dự án style khác nhau — PubliCast dùng bo góc lớn, font-sans, uppercase tracking-wider, xem style hiện có trong `ComposerHeader.jsx`/`ComposerBody.jsx` để đồng bộ).

### 2. Sửa `src/components/workspace/post-creator/ComposerHeader.jsx`

Thêm 1 toggle switch bật/tắt `isEditByNetwork`, đặt cạnh nút "Notes" hiện có (dòng
~442-454). Lấy `isEditByNetwork`, `setIsEditByNetwork` từ context (cần thêm 2 field này
vào destructure ở đầu component, dòng ~16-32 — hiện CHƯA có trong danh sách destructure
của `ComposerHeader.jsx`, dù đã có sẵn trong `contextValue` từ Giai đoạn 1).

Label gợi ý: "Cài đặt theo mạng" / "Network Settings" (dùng i18n key mới trong
`planner` namespace nếu dự án có pattern i18n rõ ràng — xem file `ComposerHeader.jsx` dùng
`t("planner:postCreator.header.notes")` làm mẫu, thêm key tương tự
`t("planner:postCreator.header.editByNetwork")` vào file locale JSON tương ứng nếu có, nếu không tìm thấy file locale thì dùng text tiếng Việt trực tiếp không cần i18n).

### 3. Sửa `src/components/workspace/post-creator/ComposerBody.jsx`

File này dài (~658 dòng). Đây là phần rủi ro cao nhất — PHẢI tách rõ biến, không sửa lan man.

- Import `NetworkTabSwitcher` và render nó ngay phía trên `<textarea>` (trước dòng ~175), chỉ khi `isEditByNetwork` (lấy từ context, cần thêm vào destructure ở đầu file dòng ~32-92 — hiện đã CÓ SẴN các field mới trong context nhưng `ComposerBody.jsx` CHƯA destructure chúng, cần thêm: `isEditByNetwork`, `activeNetworkTab`, `networkCustom`, `toggleUseTemplate`, `updateNetworkCaption`).
- Tính 2 biến dẫn xuất ngay đầu component (không rải rác if/else nhiều chỗ):

```js
const isCustomTab = isEditByNetwork
  && activeNetworkTab !== NETWORK_TAB_TEMPLATE
  && activeNetworkTab !== 'threads' // threads là case riêng, để Giai đoạn 3
  && networkCustom[activeNetworkTab]?.useTemplate === false;

const activeCaptionValue = isCustomTab ? (networkCustom[activeNetworkTab]?.caption || '') : caption;
const handleCaptionChange = (val) => {
  if (isCustomTab) {
    updateNetworkCaption(activeNetworkTab, val);
  } else {
    setCaption(val);
  }
};
```

- Sửa `<textarea value={caption} onChange={(e) => setCaption(e.target.value)} ...>` (dòng ~176-182) thành dùng `activeCaptionValue`/`handleCaptionChange`.
- Khi đang ở 1 tab platform (khác TEMPLATE, khác threads) mà `networkCustom[tab].useTemplate !== false` (tức đang khoá, dùng chung) — hiện locked-state thay vì textarea: khối UI dashed-border với text gợi ý + nút "Chỉnh sửa nội dung riêng" gọi `toggleUseTemplate(activeNetworkTab, false)`. Tham khảo layout locked-state trong `ContentComposerRegion.jsx` (`publicast-frontend`) dòng ~324-340 (dashed border, icon Lock, nút bấm).
- Threads tab ở giai đoạn này: nếu `activeNetworkTab === 'threads'`, hiện composer y hệt tab platform thường (locked-state hoặc textarea đơn dùng `networkCustom.threads.caption`) — **KHÔNG cần sub-tabs Post 1/2 ở giai đoạn này** (đó là Giai đoạn 3). Vì `networkCustom.threads` không có field `caption` (chỉ có `threadPosts`), map tạm: dùng `networkCustom.threads.threadPosts[0]` làm caption hiển thị, `updateThreadPostText(0, val)` làm setter.
- Media: KHÔNG đổi UI thêm/xoá media hiện có — vẫn luôn thao tác trên `postMedia`/`albumMedia` chung, kể cả khi đang ở tab custom. Có thể thêm 1 dòng text nhỏ phía trên khu vực media (`text-[10px] text-gray-400`) ghi "Media dùng chung cho mọi nền tảng" khi `isCustomTab` để tránh hiểu nhầm — không bắt buộc nhưng khuyến nghị.
- Character-limit ở footer toolbar (dòng ~499-530 hiện tại, dùng `caption.length` và `activePlatform`) — **GIỮ NGUYÊN**, không đổi sang đếm theo `networkCustom`.
- Preset accordion (`GlobalPresets` + `PRESET_REGISTRY`, dòng ~571-584) — **GIỮ NGUYÊN HOÀN TOÀN**, đây là cơ chế song song độc lập với network tab switcher, không đụng vào.

### 4. Thêm hàm `createPostV2` trong `src/services/post.service.js`

```js
async createPostV2(postData) {
  const response = await apiService.post('/v2/posts', postData);
  return response.data;
}
```
Đặt cạnh `createPost` hiện có (dòng 10-13), theo đúng pattern class method sẵn có.

### 5. Sửa `handleCreatePost` trong `src/hooks/usePostCreatorForm.js`

Vị trí: hàm `handleCreatePost` hiện tại (khoảng dòng ~789-938 sau khi Giai đoạn 1 đã
thêm vài dòng — tìm bằng cách grep `const handleCreatePost = async`).

Thêm logic build `networkOverrides` NGAY TRƯỚC khi build `payload`:

```js
const buildNetworkOverrides = () => {
  const overrides = [];
  Object.entries(networkCustom).forEach(([platform, entry]) => {
    if (!selectedPlatforms.includes(platform)) return;
    if (entry?.useTemplate !== false) return;
    if (platform === PLATFORMS.THREADS) {
      const threadPosts = (entry.threadPosts || []).filter((t) => t && t.trim());
      if (threadPosts.length === 0) return;
      overrides.push({
        platform: PLATFORM_API_KEY[platform],
        useTemplate: false,
        caption: threadPosts[0],
        mediaUrls: entry.mediaUrls || [],
        threadPosts: threadPosts.map((text) => ({ text, mediaUrls: [] })),
      });
    } else {
      if (!entry.caption && (!entry.mediaUrls || entry.mediaUrls.length === 0)) return;
      overrides.push({
        platform: PLATFORM_API_KEY[platform],
        useTemplate: false,
        caption: entry.caption || '',
        mediaUrls: entry.mediaUrls || [],
      });
    }
  });
  return overrides;
};
```

Cần import `PLATFORM_API_KEY` từ `../constants/platforms` (thêm vào import ở dòng 7 nếu
chưa có — hiện chỉ import `DEFAULT_PLATFORM, PLATFORMS`).

Trong khối `if (editingPost) { ... } else { ... }` (dòng ~881-923 gốc):

```js
const networkOverrides = buildNetworkOverrides();

if (editingPost) {
  if (networkOverrides.length > 0) {
    toast.warning("Cài đặt riêng theo nền tảng chưa được lưu khi cập nhật bài viết đã tồn tại");
  }
  await apiService.put(`/posts/${editingPost.id}`, payload, { timeout: 60000 });
  // ... giữ nguyên phần còn lại, KHÔNG thêm networkOverrides vào payload PUT
} else {
  const finalPayload = networkOverrides.length > 0 ? { ...payload, networkOverrides } : payload;
  if (networkOverrides.length > 0) {
    await postService.createPostV2(finalPayload);
  } else {
    await apiService.post('/posts', finalPayload, { timeout: 60000 });
  }
  // ... giữ nguyên phần reset state còn lại
}
```

**Lưu ý:** code gốc hiện tại gọi thẳng `apiService.post('/posts', payload, ...)` chứ
không qua `postService.createPost` — giữ đúng cách gọi hiện tại (`apiService` trực
tiếp) cho nhánh không có override, chỉ đường có override mới đi qua `postService.createPostV2`
mới thêm ở bước 4.

Sau khi tạo bài mới thành công (nhánh `else`, phần reset state ~dòng 890-921), thêm reset:
```js
setNetworkCustom(buildDefaultNetworkCustom());
setIsEditByNetwork(false);
setActiveNetworkTab(NETWORK_TAB_TEMPLATE);
```
(import `buildDefaultNetworkCustom` đã có sẵn từ Giai đoạn 1, không cần import lại).

## Rủi ro cần chú ý

- `ComposerBody.jsx` là file lớn nhất bị đụng vào — luôn tách biến `isCustomTab`/`activeCaptionValue`/`handleCaptionChange` rõ ràng ở đầu component thay vì rẽ nhánh rải rác trong JSX, để dễ review và không phá vỡ luồng caption chung hiện có.
- `PreviewBody`/`getValidationErrors`/`validatePostForm` KHÔNG đổi ở giai đoạn này — validate vẫn dựa hoàn toàn vào `caption` chung. Nghĩa là nếu user chỉ điền caption custom cho 1 platform mà để `caption` chung rỗng, validate có thể vẫn báo lỗi thiếu caption — đây là giới hạn đã biết, KHÔNG mở rộng validate trong giai đoạn này (backlog).
- Đảm bảo `PLATFORM_API_KEY[platform]` luôn trả về giá trị hợp lệ (không `undefined`) trước khi push vào `overrides` — nếu `platform` là key lạ (không có trong `PLATFORM_API_KEY`), bỏ qua thay vì gửi `platform: undefined` lên backend.

## Cách test / verify

1. `npm run dev` trong `D:/Fullit/projects/PubliCast/frontend`.
2. Mở Post Creator, tạo bài mới, chọn ít nhất 2 platform (vd Facebook + YouTube).
3. Bật toggle "Cài đặt theo mạng" ở `ComposerHeader` → xác nhận `NetworkTabSwitcher` xuất hiện trên caption card.
4. Click tab "CÀI ĐẶT CHUNG" → textarea vẫn là `caption` chung, hành vi y hệt lúc tắt toggle.
5. Click tab Facebook → thấy locked-state (chưa có textarea riêng) → bấm "Chỉnh sửa nội dung riêng" → textarea đổi sang custom caption của Facebook, gõ nội dung khác với caption chung.
6. Tắt toggle "Cài đặt theo mạng" → `NetworkTabSwitcher` biến mất, quay lại đúng 1 caption chung ban đầu (không mất dữ liệu).
7. Bật lại toggle, giữ custom Facebook, bấm Submit tạo bài mới → mở DevTools Network tab, xác nhận request đi tới `/api/v2/posts` (không phải `/api/posts`), body có field `networkOverrides` chứa đúng `{ platform: 'FACEBOOK', useTemplate: false, caption: '...', mediaUrls: [...] }`.
8. Mở lại bài vừa tạo để sửa (Edit) → xác nhận `networkCustom` tự điền đúng custom Facebook cũ (đã có từ Giai đoạn 1, kiểm tra lại không hỏng). Sửa gì đó rồi Submit (PUT) → xác nhận toast cảnh báo "Cài đặt riêng theo nền tảng chưa được lưu..." hiện ra, bài vẫn lưu được các trường khác bình thường.
9. Test không có custom nào (toggle tắt từ đầu, hoặc bật nhưng không customize platform nào) → xác nhận request vẫn đi `/api/posts` như cũ, không đổi hành vi hiện tại.
