# Giai đoạn 3 — Threads multi-post chain (Post 1/2/3...)

> File này là plan độc lập, đủ ngữ cảnh để 1 phiên chat/agent khác thực thi mà không cần
> đọc lại lịch sử hội thoại trước. Giai đoạn 1 (state nền `networkCustom`) và Giai đoạn 2
> (Network Tab Switcher + gửi `networkOverrides` thật cho caption theo platform) đã hoàn
> tất, đã test qua UI thật (browser) và đã build pass. Xem code hiện có:
> - `src/constants/postComposerNetwork.js`
> - `src/hooks/usePostCreatorForm.js`
> - `src/components/workspace/post-creator/NetworkTabSwitcher.jsx`
> - `src/components/workspace/post-creator/ComposerBody.jsx`
> - `src/components/workspace/post-creator/ComposerHeader.jsx`
> - `src/services/post.service.js`

## Bối cảnh đã có sẵn (không cần làm lại)

Hook `usePostCreatorForm()` (trong `usePostCreatorFormContext()`) đã có sẵn và **đã hoạt
động đúng** — đã verify qua Giai đoạn 1:

- `networkCustom.threads` có shape: `{ useTemplate: bool, activeThreadIndex: number, threadPosts: string[], mediaUrls: string[] }`. Mặc định `{ useTemplate: true, activeThreadIndex: 0, threadPosts: [''], mediaUrls: [] }`.
- `updateThreadPostText(index, text)` — sửa text tại vị trí `index` trong `threadPosts`.
- `addThreadPost()` — thêm 1 post rỗng vào cuối `threadPosts`, tự set `activeThreadIndex` trỏ vào post mới.
- `removeThreadPost(index)` — xoá post tại `index` (chặn xoá nếu chỉ còn 1 post), tự lùi `activeThreadIndex` về hợp lệ.
- `setThreadActiveIndex(index)` — đổi post đang active trong chain.
- `toggleUseTemplate('threads', value)` — bật/tắt customize cho Threads. Khi lần đầu bật (`threadPosts[0] === ''` và `mediaUrls` rỗng), tự seed `threadPosts[0]` từ `caption` chung (xem `usePostCreatorForm.js` dòng ~370-395, khối `isFirstCustomization`).

Trong `ComposerBody.jsx` (dòng ~102-129, đã có từ Giai đoạn 2), các biến dẫn xuất sau **đã tồn tại**:

```js
const isThreadsTab = isEditByNetwork && activeNetworkTab === 'threads';
const isCustomTab = isEditByNetwork && activeNetworkTab !== NETWORK_TAB_TEMPLATE
  && activeNetworkTab !== 'threads' && networkCustom[activeNetworkTab]?.useTemplate === false;
const activeCaptionValue = isCustomTab
  ? (networkCustom[activeNetworkTab]?.caption || '')
  : isThreadsTab ? (networkCustom['threads']?.threadPosts?.[0] || '') : caption;
const handleCaptionChange = (val) => {
  if (isCustomTab) updateNetworkCaption(activeNetworkTab, val);
  else if (isThreadsTab) updateThreadPostText(0, val);
  else setCaption(val);
};
const isLockedPlatformTab = isEditByNetwork && activeNetworkTab !== NETWORK_TAB_TEMPLATE
  && networkCustom[activeNetworkTab]?.useTemplate !== false;
```

**Giới hạn hiện tại (đây là lý do cần Giai đoạn 3):** khi ở tab Threads và đã customize
(`useTemplate === false`), textarea chỉ luôn bind vào `threadPosts[0]` (post đầu tiên) —
**chưa có UI để xem/sửa post thứ 2, 3... trong chain**, dù state (`threadPosts` mảng,
`activeThreadIndex`) đã sẵn sàng chứa nhiều post.

Trong `handleCreatePost` → `buildNetworkOverrides()` (đã có từ Giai đoạn 2,
`usePostCreatorForm.js` dòng ~1010-1030), nhánh Threads **đã build đúng shape** gửi lên
backend:

```js
if (platform === PLATFORMS.THREADS) {
  const threadPosts = (entry.threadPosts || []).filter((t) => t && t.trim());
  if (threadPosts.length === 0) return;
  overrides.push({
    platform: apiKey, // 'THREADS'
    useTemplate: false,
    caption: threadPosts[0],
    mediaUrls: entry.mediaUrls || [],
    threadPosts: threadPosts.map((text) => ({ text, mediaUrls: [] })),
  });
}
```

Nghĩa là **phần submit/backend integration cho Threads chain đã xong từ Giai đoạn 2** —
Giai đoạn 3 chỉ cần bổ sung UI để user thực sự nhập được nhiều post trong chain.

## Mục tiêu Giai đoạn 3

1. Thêm sub-tabs "Post 1 / Post 2 / + " trong `NetworkTabSwitcher.jsx`, chỉ hiện khi đang ở tab Threads **và** đã customize (`useTemplate === false`).
2. Sửa `ComposerBody.jsx` để textarea đọc/ghi đúng `threadPosts[activeThreadIndex]` thay vì luôn cứng `threadPosts[0]`.
3. Không đổi gì ở `handleCreatePost`/`buildNetworkOverrides` — logic đó đã đúng từ Giai đoạn 2, chỉ cần verify lại bằng test thủ công.

## Ràng buộc đã chốt với user (không tự ý đổi)

- **Không validate riêng độ dài từng post trong chain.** Validate hiện tại (`getValidationErrors`/`validatePostForm`) tiếp tục chỉ dựa vào `caption` chung, không mở rộng để kiểm tra `threadPosts[1]`, `[2]`... Đây là quyết định đã xác nhận (bên dự án tham khảo `publicast-frontend` cũng không làm việc này — `ThreadsStrategy` trong `PlatformStrategies.js` chỉ giới hạn 500 ký tự cho 1 caption, không lặp qua từng post trong chain). Để backlog.
- **Media chỉ ở post đầu tiên (`threadPosts[0]`/`networkCustom.threads.mediaUrls`).** Các post nối chuỗi sau (`threadPosts[1]`, `[2]`...) chỉ chứa text, không có media riêng — đúng hành vi Threads thực tế (ảnh/video nằm ở post gốc, các reply nối chuỗi thường chỉ text). Không thêm UI upload media cho từng post trong chain.
- **Không đổi `buildNetworkOverrides`/`handleCreatePost`.** Logic build override cho Threads đã đúng từ Giai đoạn 2 — chỉ cần UI mới, không sửa lại phần submit.
- **Không hợp nhất `activePlatform` với `activeNetworkTab`, không đổi validate.** Giữ đúng các ràng buộc đã áp dụng xuyên suốt Giai đoạn 1-2.

## Việc cần làm

### 1. Sửa `src/components/workspace/post-creator/NetworkTabSwitcher.jsx`

Thêm 1 hàng sub-tabs MỚI, render **bên dưới** hàng checkbox "Dùng nội dung chung" hiện có
(sau khối `{isCustomPlatformTab && (...)}`, dòng ~124-146), chỉ hiện khi:

```js
const isThreadsTab = activeNetworkTab === 'threads';
const threadsData = networkCustom['threads'];
const showThreadSubTabs = isThreadsTab && threadsData?.useTemplate === false;
```

Cần lấy thêm từ context (`usePostCreatorFormContext()`, thêm vào destructure đầu component,
dòng ~37-43): `updateThreadPostText`, `addThreadPost`, `removeThreadPost`, `setThreadActiveIndex`
(cả 4 hàm này **đã tồn tại sẵn** trong hook, chỉ cần destructure thêm trong component này —
hiện `NetworkTabSwitcher.jsx` CHƯA lấy các hàm này).

UI sub-tabs (đặt trong 1 `<div>` mới ngay dưới khối checkbox, chỉ render khi `showThreadSubTabs`):

```jsx
{showThreadSubTabs && (
  <div className="flex items-center gap-2 pb-3 flex-wrap">
    {threadsData.threadPosts.map((_, index) => {
      const isActive = threadsData.activeThreadIndex === index;
      return (
        <button
          key={index}
          type="button"
          onClick={() => setThreadActiveIndex(index)}
          className={`flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
            isActive ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? "bg-white/20" : "bg-gray-300"}`}>
            {index + 1}
          </span>
          <span>Post {index + 1}</span>
          {threadsData.threadPosts.length > 1 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); removeThreadPost(index); }}
              className="ml-1 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer"
              title="Xoá post này"
            >
              ×
            </span>
          )}
        </button>
      );
    })}
    <button
      type="button"
      onClick={addThreadPost}
      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
      title="Thêm bài viết vào chuỗi Threads"
    >
      +
    </button>
  </div>
)}
```

Style/class cụ thể có thể điều chỉnh nhẹ để khớp design-system hiện có của
`NetworkTabSwitcher.jsx` (đã dùng `font-sans`, `text-[10px] font-black uppercase
tracking-wider` cho các tab khác) — giữ nhất quán, không bắt buộc chép y nguyên class trên.

### 2. Sửa `src/components/workspace/post-creator/ComposerBody.jsx`

Đổi 2 chỗ đang cứng index `0` thành `activeThreadIndex` động:

**Chỗ 1** — biến `activeCaptionValue` (dòng ~110-114):
```js
// TRƯỚC (Giai đoạn 2, cứng post đầu tiên):
: isThreadsTab ? (networkCustom['threads']?.threadPosts?.[0] || '') : caption;

// SAU (Giai đoạn 3, đọc đúng post đang active trong chain):
: isThreadsTab
  ? (networkCustom['threads']?.threadPosts?.[networkCustom['threads']?.activeThreadIndex || 0] || '')
  : caption;
```

**Chỗ 2** — hàm `handleCaptionChange` (dòng ~116-124):
```js
// TRƯỚC:
} else if (isThreadsTab) {
  updateThreadPostText(0, val);
}

// SAU:
} else if (isThreadsTab) {
  const threadIndex = networkCustom['threads']?.activeThreadIndex || 0;
  updateThreadPostText(threadIndex, val);
}
```

**Placeholder text** (dòng ~245-249) — cập nhật để phản ánh đúng post nào đang sửa khi ở Threads:
```js
placeholder={
  isThreadsTab
    ? `Nội dung Post ${(networkCustom['threads']?.activeThreadIndex || 0) + 1} trong chuỗi Threads...`
    : isCustomTab
      ? `Nội dung riêng cho ${activeNetworkTab}...`
      : t("planner:postCreator.composer.placeholders.caption")
}
```

Không đổi gì khác trong `ComposerBody.jsx` — `isLockedPlatformTab`, khối media, toolbar,
preset accordion... giữ nguyên 100%.

### 3. KHÔNG sửa `handleCreatePost`/`buildNetworkOverrides` trong `usePostCreatorForm.js`

Logic build `networkOverrides` cho Threads (dòng ~1010-1030) **đã đúng** — nó lặp qua toàn
bộ `threadPosts` (không chỉ post đầu), lọc bỏ post rỗng, build đúng
`threadPosts: threadPosts.map((text) => ({ text, mediaUrls: [] }))`. Chỉ cần verify lại
bằng test thủ công ở bước 4 dưới đây, không cần đổi code.

## Rủi ro cần chú ý

- Khi `removeThreadPost(index)` xoá post đang là `threadPosts[0]` (post đầu, nơi mang `mediaUrls` chung) — dữ liệu `mediaUrls` của Threads không bị ảnh hưởng (nó nằm ở `networkCustom.threads.mediaUrls`, tách biệt khỏi mảng `threadPosts` text) nên không lo mất media khi xoá/sắp xếp lại các post text.
- Đảm bảo `activeThreadIndex` luôn hợp lệ sau khi xoá — `removeThreadPost` đã tự xử lý (`Math.max(0, activeThreadIndex - 1)`), không cần thêm guard ở UI, nhưng nên test kỹ trường hợp xoá post đang active ở giữa danh sách (vd có 3 post, xoá post 2, xác nhận `activeThreadIndex` và tab active hiển thị đúng post còn lại).
- `showThreadSubTabs` chỉ nên phụ thuộc `threadsData?.useTemplate === false`, KHÔNG phụ thuộc `isLockedPlatformTab` ở `ComposerBody.jsx` (2 file khác nhau, đừng nhầm điều kiện) — khi Threads đang locked (`useTemplate !== false`), sub-tabs không hiện là đúng (vì lúc đó không có gì để chọn — locked-state UI đã che hết textarea).
- Test kỹ khi tab đổi qua lại giữa "CÀI ĐẶT CHUNG" → Threads → platform khác → quay lại Threads: `activeThreadIndex` phải giữ nguyên vị trí đã chọn trước đó (không tự reset về 0), vì `setNetworkTab` (từ Giai đoạn 2) không đụng vào `activeThreadIndex`.

## Cách test / verify

1. `npm run dev` trong `D:/Fullit/projects/PubliCast/frontend`. Cần 1 brand có Threads connected (brand "Drive Test Brand" dùng ở Giai đoạn 2 chỉ có YouTube — kiểm tra `Threads` trong "Social Connections" của brand test, hoặc dùng brand khác nếu có, hoặc yêu cầu user connect Threads cho brand test trước khi verify đầy đủ).
2. Chọn platform Threads trong danh sách platform ở `ComposerHeader`. Bật toggle "THEO MẠNG" ở header.
3. Click tab "THREADS" trong `NetworkTabSwitcher` → xác nhận thấy locked-state (giống các platform khác ở Giai đoạn 2) vì `useTemplate` mặc định `true`.
4. Bấm "Chỉnh sửa nội dung riêng" → xác nhận: (a) textarea hiện ra, seed đúng nội dung từ caption chung vào `threadPosts[0]`; (b) **sub-tab "Post 1" xuất hiện** ngay dưới checkbox "Dùng nội dung chung" (tính năng mới của Giai đoạn 3).
5. Bấm nút "+" cạnh sub-tabs → xác nhận thêm "Post 2", tự động chuyển active sang Post 2, textarea trống (đúng vì `addThreadPost` thêm `""`).
6. Gõ nội dung khác cho Post 2 → chuyển qua lại giữa "Post 1"/"Post 2" bằng click tab → xác nhận nội dung mỗi post giữ đúng, không bị trộn lẫn hay ghi đè lên nhau.
7. Thêm tiếp "Post 3", sau đó bấm nút "×" trên "Post 2" (post ở giữa) → xác nhận: Post 2 bị xoá, danh sách còn lại tự đánh số lại đúng thứ tự (Post 1, Post 2 — post 3 cũ giờ là Post 2), `activeThreadIndex` trỏ vào 1 post hợp lệ (không bị lỗi hiển thị "Post 0" hay tab trống).
8. Thử xoá tới khi còn 1 post cuối cùng → xác nhận nút "×" biến mất trên post cuối (không cho xoá hết, khớp guard có sẵn trong `removeThreadPost`).
9. Bấm "Publish Now" (cần platform khác đã đáp ứng đủ điều kiện validate, hoặc thêm media/video hợp lệ cho Threads nếu cần) → mở DevTools Network tab, xác nhận request tới `/api/v2/posts` có `networkOverrides` chứa phần tử `{ platform: 'THREADS', useTemplate: false, caption: '<nội dung post 1>', mediaUrls: [...], threadPosts: [{text: '<post 1>', mediaUrls: []}, {text: '<post 2>', mediaUrls: []}, ...] }` đúng thứ tự và đủ số post đã nhập (không thiếu, không thừa post rỗng).
10. Tắt toggle "THEO MẠNG" rồi bật lại → xác nhận toàn bộ `threadPosts` đã nhập vẫn còn nguyên (không bị reset), giống hành vi đã verify ở Giai đoạn 2 cho custom caption thường.
