# Giai đoạn 5 — Media riêng theo platform + Preview đồng bộ với "Cài đặt theo mạng"

> File này là plan độc lập, đủ ngữ cảnh để 1 phiên chat/agent khác thực thi mà không cần
> đọc lại lịch sử hội thoại trước. Giai đoạn 1-4 đã hoàn tất và verify (Giai đoạn 1-3 đã
> test end-to-end kể cả publish thật lên YouTube+Threads; Giai đoạn 4 code xong, đang chờ
> verify UI). Giai đoạn 5 mở rộng phạm vi đã cố tình thu hẹp ở Giai đoạn 2 ("chỉ custom
> caption, media dùng chung") — giờ làm nốt phần media riêng + đồng bộ preview.

## Bối cảnh: 3 vấn đề đã xác nhận qua test thực tế

Sau khi test Giai đoạn 2-4 bằng publish thật (xem `plan-giai-doan-2-network-tab-switcher.md`,
`plan-giai-doan-3-threads-chain.md`), user phát hiện 3 vấn đề UX còn tồn đọng:

1. **Upload media chậm** — cơ chế hiện tại của PubliCast: chọn file → upload lên Cloudinary
   ngay lập tức (`MediaUploadModal` gọi API upload thật, xem service tương ứng) → xong mới
   cho phép Publish. Bên dự án tham khảo `publicast-frontend` (đã đọc ở giai đoạn khảo sát
   trước) thì **hoãn upload thật đến lúc bấm Submit** — chọn file chỉ tạo `blob:` URL để
   preview tức thì, upload thật xảy ra trong `handleSubmit` (xem
   `usePostComposerFacade.js` — `pendingFiles` Map + vòng lặp `postService.uploadMedia`
   trong `handleSubmit`). Đây là khác biệt kiến trúc lớn, **KHÔNG nằm trong phạm vi Giai
   đoạn 5** — ghi vào backlog riêng (mục cuối file), vì đổi cơ chế upload ảnh hưởng toàn bộ
   composer chứ không chỉ phần network-custom.
2. **Preview không đồng bộ với "Cài đặt theo mạng"** — `PreviewBody.jsx` (dòng 6-83) luôn
   đọc `caption`/`videoFileUrl` chung, truyền thẳng xuống `PreviewStrategies[activePlatform]`
   — không hề biết đến `networkCustom`. Khi user customize caption riêng cho YouTube rồi
   xem preview YouTube, preview vẫn hiện caption CHUNG chứ không phải caption đã custom.
3. **Media dùng chung/riêng lẫn lộn** — `MediaUploadModal` (wiring trong `PostCreator.jsx`
   dòng ~567-607, `onAccept`) luôn gọi thẳng `setPostMedia`/`setVideoFile`/`setUploadedVideoPath`
   (state chung) bất kể đang ở tab nào trong Network Tab Switcher. Hàm `updateNetworkMedia`
   đã tồn tại sẵn trong hook (từ Giai đoạn 1) nhưng **chưa bao giờ được gọi** — không có
   đường dẫn UI nào dẫn tới nó.

Giai đoạn 5 giải quyết vấn đề #2 và #3. Vấn đề #1 để backlog riêng (xem cuối file).

## Mục tiêu Giai đoạn 5

1. `PreviewBody`/`PreviewStrategies` hiển thị đúng caption + media riêng khi đang xem preview 1 platform đã customize (`networkCustom[platform].useTemplate === false`).
2. Khi đang ở tab custom của 1 platform (`isCustomTab === true` trong `ComposerBody.jsx`), nút thêm media phải ghi vào `networkCustom[platform].mediaUrls` (qua `updateNetworkMedia` đã có sẵn) thay vì `postMedia` chung.
3. Khi đang ở tab "CÀI ĐẶT CHUNG" hoặc platform chưa customize, hành vi giữ y nguyên như hiện tại (ghi vào `postMedia` chung) — không phá vỡ luồng cũ.

## Ràng buộc cần tôn trọng

- **Không đổi cơ chế upload** (vẫn upload lên Cloudinary ngay khi chọn file, giữ nguyên `MediaUploadModal` API) — chỉ đổi **nơi lưu kết quả trả về** (chung hay riêng theo platform), không đổi cách nó lấy được URL.
- **`networkCustom[platform].mediaUrls` hiện là mảng string URL đơn giản** (từ Giai đoạn 1: `{ useTemplate, caption, mediaUrls: [] }`), khác hẳn shape phức tạp của `postMedia` (mảng object `{file, previewUrl, path}`). Cần quyết định rõ format thống nhất — khuyến nghị: chuẩn hoá `networkCustom[platform].mediaUrls` cũng lưu dạng object `{file, previewUrl, path}` giống `postMedia` để tái dùng toàn bộ UI thumbnail/edit hiện có của `ComposerBody.jsx` (dòng ~304-380, phần render `postMedia.map(...)`) — tránh viết lại 2 bộ UI khác nhau cho 2 loại dữ liệu.
- **Threads chain KHÔNG đổi ở giai đoạn này** — `networkCustom.threads.mediaUrls` chỉ gắn với `threadPosts[0]` (post gốc), giữ nguyên quyết định đã chốt ở Giai đoạn 3 ("chỉ post đầu mang media"). Giai đoạn 5 chỉ mở rộng cho các platform KHÔNG phải threads.
- **`activePlatform` vẫn là nguồn xác định `PreviewComponent` nào được chọn** (không đổi) — chỉ đổi PROPS truyền vào nó (caption/media) để phản ánh đúng theo `networkCustom[activePlatform]` nếu có customize.

## Thiết kế: `activePlatform` vs preview theo network — quyết định quan trọng

Hiện `PreviewBody` dùng `activePlatform` để chọn component preview
(`PreviewStrategies[activePlatform]`). Đây là biến ĐỘC LẬP với `activeNetworkTab` (theo
quyết định kiến trúc đã chốt từ Giai đoạn 1: "giữ song song, không hợp nhất"). Nghĩa là
user có thể đang xem preview Facebook (`activePlatform === 'facebook'`) trong khi
Network Tab Switcher đang mở tab YouTube (`activeNetworkTab === 'youtube'`) — 2 khái niệm
tách biệt.

**Quyết định cho Giai đoạn 5:** Preview luôn hiển thị theo `activePlatform` (giữ nguyên
hành vi chọn platform xem preview), nhưng nội dung hiển thị (caption/media) phải ưu tiên
đọc từ `networkCustom[activePlatform]` NẾU platform đó đang customize — bất kể
`activeNetworkTab` đang mở tab nào. Điều này khớp trực giác người dùng: "tôi đang xem
preview Facebook thì phải thấy đúng nội dung sẽ đăng lên Facebook", không quan tâm tab
nào đang mở trong khu vực soạn thảo.

## Việc cần làm

### 1. Sửa `src/components/workspace/post-creator/PreviewBody.jsx`

Thêm logic chọn caption + media hiệu lực theo `activePlatform`:

```js
import { NETWORK_TAB_TEMPLATE } from "../../../constants/postComposerNetwork"; // nếu cần dùng hằng số, thực ra ở đây không cần vì không dùng activeNetworkTab

export function PreviewBody() {
  const {
    activePlatform,
    caption,
    videoFileUrl,
    videoFile,
    postMedia,
    networkCustom, // MỚI: cần thêm vào destructure
    // ...giữ nguyên các field khác
  } = usePostCreatorFormContext();

  const platformCustom = networkCustom?.[activePlatform];
  const isPlatformCustomized = platformCustom?.useTemplate === false;

  // Với Threads: media/caption hiệu lực lấy từ threadPosts[0] (post gốc), không phải platformCustom.caption
  const isThreadsPlatform = activePlatform === 'threads';
  const effectiveCaption = isPlatformCustomized
    ? (isThreadsPlatform ? (platformCustom.threadPosts?.[0] || '') : (platformCustom.caption || ''))
    : caption;

  const effectiveMediaItems = isPlatformCustomized && Array.isArray(platformCustom.mediaUrls) && platformCustom.mediaUrls.length > 0
    ? platformCustom.mediaUrls // xem bước 2 để thống nhất shape
    : postMedia;

  // simulatedCaption dùng effectiveCaption thay vì caption thẳng:
  const simulatedCaption = React.useMemo(() => {
    if (!effectiveCaption || !useUrlShortener) return effectiveCaption;
    // ...giữ nguyên logic rút gọn link, chỉ đổi input
  }, [effectiveCaption, useUrlShortener]);

  // videoFileUrl/videoFile hiệu lực: nếu effectiveMediaItems khác postMedia (đang dùng custom),
  // lấy item đầu tiên của effectiveMediaItems làm videoFileUrl/videoFile hiển thị —
  // xem bước 2 để quyết định shape object, giữ tương thích với PreviewComponent hiện tại
  // (các component Preview* nhận videoFileUrl là string, videoFile là File object).
  const effectiveVideoFileUrl = ...; // suy ra từ effectiveMediaItems[0]
  const effectiveVideoFile = ...;

  const PreviewComponent = PreviewStrategies[activePlatform];

  return (
    // ... giữ nguyên JSX, chỉ đổi props truyền vào PreviewComponent:
    // caption={simulatedCaption}, videoFileUrl={effectiveVideoFileUrl}, videoFile={effectiveVideoFile}
  );
}
```

**Ghi chú quan trọng:** cần đọc kỹ từng file `Preview*.jsx` (`PreviewYouTube.jsx`,
`PreviewFacebook.jsx`, `PreviewInstagram.jsx`, `PreviewTikTok.jsx`, `PreviewThreads.jsx`,
`PreviewTelegram.jsx`, `previews/BlueskyPreview.jsx`, `previews/RedditPreview.jsx`,
`previews/TwitchPreview.jsx`) để xác nhận chúng chỉ dùng `videoFileUrl`/`videoFile` làm
props (không tự đọc `postMedia` trực tiếp từ context) — nếu có component nào tự
`usePostCreatorFormContext()` để đọc `postMedia` thẳng (bỏ qua props được truyền), nó
cũng cần sửa tương tự. Đây là bước RÀ SOÁT bắt buộc trước khi code, chưa được khảo sát
trong lần viết plan này.

### 2. Chuẩn hoá shape `networkCustom[platform].mediaUrls`

**Quyết định:** đổi từ mảng string đơn giản sang mảng object `{file, previewUrl, path}` —
**giống hệt shape của `postMedia`** để tái dùng logic hiện có (preview thumbnail, sửa ảnh,
xoá từng item...).

- Sửa `buildDefaultNetworkCustom()`/`buildDefaultNetworkEntry()` trong `src/constants/postComposerNetwork.js`: `mediaUrls: []` giữ nguyên là mảng rỗng (không đổi khởi tạo), nhưng cập nhật comment/JSDoc ghi rõ shape mới `{file, previewUrl, path}[]`.
- Sửa `mapNetworkOverridesToCustom()` (cùng file): khi map từ backend về (`override.mediaUrls` là mảng URL string thuần từ DB), cần convert sang `{file: null, previewUrl: url, path: url}` cho mỗi URL — vì dữ liệu tải từ backend không có `File` object gốc (đã upload xong từ trước), chỉ có URL cuối cùng.
- Sửa `buildNetworkOverrides()` trong `usePostCreatorForm.js` (hàm build override lúc submit, đã có từ Giai đoạn 2): đổi `mediaUrls: entry.mediaUrls || []` thành `mediaUrls: (entry.mediaUrls || []).map(item => item.path || item.previewUrl).filter(Boolean)` — vì backend cần mảng URL string thuần, không phải object.

### 3. Sửa `src/pages/workspace/PostCreator.jsx` — wiring `MediaUploadModal.onAccept`

Vị trí: `onAccept` của `MediaUploadModal` (dòng ~576-606). Cần biết đang ở tab nào để quyết định ghi vào đâu — lấy thêm `isEditByNetwork`, `activeNetworkTab`, `networkCustom`, `updateNetworkMedia` từ hook (đã có sẵn, chỉ cần thêm vào destructure nếu component này chưa lấy — kiểm tra lại, một số field đã có sẵn từ Giai đoạn 1-2).

```js
onAccept={(result, path) => {
  if (isUploadingThumbnail) {
    // giữ nguyên
  } else {
    const items = Array.isArray(result)
      ? result
      : [{ file: result, path, previewUrl: result ? URL.createObjectURL(result) : path }];
    const newItems = items.map(item => ({
      file: item.file,
      previewUrl: item.previewUrl || item.path,
      path: item.path
    }));

    const isCustomizingNonThreadsPlatform = isEditByNetwork
      && activeNetworkTab !== NETWORK_TAB_TEMPLATE
      && activeNetworkTab !== 'threads'
      && networkCustom[activeNetworkTab]?.useTemplate === false;

    if (isCustomizingNonThreadsPlatform) {
      const current = networkCustom[activeNetworkTab]?.mediaUrls || [];
      updateNetworkMedia(activeNetworkTab, [...current, ...newItems]);
    } else {
      setPostMedia(prev => {
        const updated = [...prev, ...newItems];
        if (updated.length > 0) {
          const firstItem = updated[0];
          setVideoFile(firstItem.file || null);
          setVideoFileUrl(firstItem.previewUrl || firstItem.path || '');
          setUploadedVideoPath(firstItem.path || '');
        }
        return updated;
      });
      setImageTransform({ rotation: 0, flipH: false, filter: 'none' });
    }
  }
}}
```

Import `NETWORK_TAB_TEMPLATE` từ `../../constants/postComposerNetwork` nếu chưa có trong file này.

### 4. Sửa `src/components/workspace/post-creator/ComposerBody.jsx` — hiển thị media riêng khi ở tab custom

Hiện khối hiển thị thumbnail media (dòng ~304-380, dựa vào `postMedia`) chỉ đọc `postMedia`
chung. Cần thêm biến dẫn xuất tương tự `isCustomTab` đã có (dòng ~104-108):

```js
const effectivePostMedia = isCustomTab
  ? (networkCustom[activeNetworkTab]?.mediaUrls || [])
  : postMedia;
```

Và đổi các chỗ dùng trực tiếp `postMedia`/`setPostMedia` trong phần hiển thị thumbnail
(không phải toàn bộ file — chỉ khối UI hiển thị/xoá ảnh media, dòng ~259-380) để dùng
`effectivePostMedia` khi đọc, và gọi `updateNetworkMedia(activeNetworkTab, ...)` thay vì
`setPostMedia(...)` khi xoá 1 item lúc đang ở tab custom. **Đây là điểm rủi ro nhất** —
cần review kỹ từng chỗ dùng `postMedia`/`setPostMedia` trong khối JSX này (khoảng 4-5 chỗ:
hiển thị thumbnail video/ảnh chờ upload, nút xoá media, mở ImageEditorModal sửa ảnh) để
đảm bảo mọi thao tác media khi đang ở tab custom đều tác động đúng vào
`networkCustom[activeNetworkTab].mediaUrls`, không lẫn vào `postMedia` chung.

Nút mở `MediaUploadModal`/media dropdown (toolbar phía dưới textarea) không cần đổi vị
trí — chỉ cần đảm bảo khi bấm nó lúc đang ở tab custom, modal vẫn mở bình thường (nó
không biết context, chỉ trigger `setShowUploadModal(true)` — phần biết-context nằm ở
`onAccept` đã sửa ở bước 3).

## Rủi ro cần chú ý

- **`ImageEditorModal`/video edit khi đang ở tab custom** — hiện `ImageEditorModal`/`editingPostMediaIndex` (trong `PostCreator.jsx`) chỉ thao tác trên `postMedia` theo index. Nếu user sửa ảnh khi đang ở tab custom, cần đảm bảo modal này biết đọc/ghi đúng vào `networkCustom[activeNetworkTab].mediaUrls[index]` thay vì `postMedia[index]` — đây là điểm phức tạp nhất, cần khảo sát kỹ trước khi code (không giả định trong plan này, cần đọc lại toàn bộ wiring `ImageEditorModal` trong `PostCreator.jsx` dòng ~608-670 khi bắt tay code thật).
- **Facebook Album mode** (`facebookType === 'album'`, dùng `albumMedia` riêng biệt hoàn toàn, không phải `postMedia`) — Giai đoạn 5 **KHÔNG** đụng vào luồng album, chỉ áp dụng cho chế độ post thường. Cần thêm điều kiện loại trừ rõ ràng (album luôn dùng `albumMedia` chung, không có khái niệm album riêng theo platform).
- **`isVideoPath`/kiểm tra loại file** (dùng trong nhiều nơi để phân biệt ảnh/video) — khi `effectivePostMedia` đổi nguồn dữ liệu, các hàm helper này vẫn nhận đúng shape `{file, previewUrl, path}` nên không cần sửa, nhưng cần test kỹ với cả ảnh lẫn video khi customize riêng cho 1 platform.
- **Giai đoạn 3 (Threads chain) không được đụng tới** — khi sửa các điều kiện `isCustomTab`/`isThreadsTab` trong `ComposerBody.jsx`, đảm bảo không vô tình đổi hành vi Threads đã hoạt động đúng (test lại Threads chain sau khi sửa xong Giai đoạn 5, dùng kịch bản test đã có trong `plan-giai-doan-3-threads-chain.md`).

## Cách test / verify

1. `npm run dev`, mở Post Creator, chọn ít nhất 2 platform có kết nối thật (vd Facebook + YouTube, hoặc dùng brand "UpdatedBrand_..." đã xác nhận có YouTube/Facebook/Threads connected).
2. Gõ caption chung, upload 1 ảnh/video chung → xác nhận Preview (mọi platform tab) hiện đúng như hiện tại (hành vi cũ, không đổi khi chưa customize).
3. Bật "THEO MẠNG", chọn tab Facebook, "Chỉnh sửa nội dung riêng", sửa caption khác + upload 1 ảnh khác cho riêng Facebook.
4. Chuyển `activePlatform` (icon platform ở `ComposerHeader`, KHÔNG phải Network Tab Switcher) sang Facebook để xem Preview → xác nhận Preview hiện ĐÚNG caption riêng + ảnh riêng vừa upload cho Facebook, KHÔNG phải caption/ảnh chung.
5. Chuyển `activePlatform` sang YouTube (chưa customize) → xác nhận Preview quay lại hiện đúng caption + media CHUNG (không bị ảnh hưởng bởi customize của Facebook).
6. Quay lại tab "CÀI ĐẶT CHUNG" trong Network Tab Switcher → xác nhận caption/media chung không bị đổi bởi việc đã upload ảnh riêng cho Facebook ở bước 3.
7. Xoá ảnh riêng của Facebook (trong tab custom Facebook) → xác nhận chỉ ảnh riêng bị xoá, ảnh/media chung (tab "CÀI ĐẶT CHUNG") không bị ảnh hưởng, và ngược lại (xoá ảnh chung không ảnh hưởng ảnh riêng Facebook).
8. Test lại toàn bộ kịch bản Threads chain từ `plan-giai-doan-3-threads-chain.md` (bước 1-10) để đảm bảo Giai đoạn 5 không phá vỡ Giai đoạn 3.
9. Submit thật (như đã làm ở Giai đoạn 2-3, dùng video test tạo bằng ffmpeg nếu cần) → verify qua DevTools Network + query DB bảng `PostNetworkOverride` xác nhận `mediaUrls` trong override là mảng URL string thuần (không phải object), khớp shape backend đã hỗ trợ.

## Backlog (ngoài phạm vi Giai đoạn 5)

- **Vấn đề #1 (upload chậm)**: đổi cơ chế composer sang "hoãn upload đến lúc Submit" (dùng
  `blob:` URL tạm + `pendingFiles` Map, giống `usePostComposerFacade.js` bên dự án tham
  khảo) — đây là thay đổi kiến trúc lớn, ảnh hưởng toàn bộ luồng chọn media của composer
  (không riêng gì phần network-custom), cần plan riêng và thảo luận kỹ về đánh đổi (UX
  nhanh hơn lúc soạn thảo, nhưng phức tạp hơn khi xử lý lỗi upload lúc submit, và cần
  validate file trước khi có URL thật).
- Media riêng cho Threads chain (hiện chỉ post gốc `threadPosts[0]` mang media, các post nối chuỗi sau không có media riêng) — giữ nguyên theo quyết định Giai đoạn 3, chưa mở rộng.
- Vá backend `updatePost` để lưu `networkOverrides` khi sửa bài draft/scheduled (đã ghi từ Giai đoạn 2, vẫn chưa làm).
- Chặn sửa bài viết đã PUBLISHED (vấn đề nghiệp vụ riêng, đã xác nhận tách biệt).
