# Giai đoạn 4 — Notes: chuyển từ modal center sang side-panel bên phải

> File này là plan độc lập, đủ ngữ cảnh để 1 phiên chat/agent khác thực thi mà không cần
> đọc lại lịch sử hội thoại trước. Giai đoạn 1, 2, 3 đã hoàn tất, đã test qua UI thật lẫn
> submit thật (published thành công cả YouTube và Threads, `networkOverrides` lưu đúng
> trong DB). Giai đoạn 4 **độc lập hoàn toàn** với `networkCustom`/Threads chain — chỉ là
> thay đổi UI thuần cho tính năng Notes, rủi ro thấp nhất trong 4 giai đoạn.

## Bối cảnh hiện tại (đã xác nhận qua đọc code thật, số dòng chính xác tại thời điểm viết plan)

Trong `src/pages/workspace/PostCreator.jsx`:

- State `isNotesOpen`/`setIsNotesOpen`, `notes`/`setNotes`, `newNoteText`/`setNewNoteText`, `handleAddNoteClick`, `handleDeleteNoteClick` đã tồn tại (khai báo dòng ~213, ~204, đưa vào `contextValue` dòng ~419-426) — **không cần đổi state, chỉ đổi UI**.
- Khối "REGION 2: PREVIEW" (dòng ~524-537) hiện luôn render cố định `<PreviewHeader /><PreviewBody /><PreviewFooter />` bên trong 1 card `flex-[0.85]` — **chưa có nhánh rẽ theo `isNotesOpen`**.
- Modal Notes hiện tại (dòng ~883-981) là 1 overlay center riêng biệt: `fixed inset-0 bg-black/60 ... flex items-center justify-center z-[100]`, chứa toàn bộ UI (header với nút đóng, danh sách note có empty-state, avatar màu theo hash tên, input thêm note, nút gửi) — logic này **đã đầy đủ và đúng, cần giữ nguyên 100%**, chỉ đổi phần khung bọc ngoài.
- Nút "Notes" ở `ComposerHeader.jsx` (đã xác nhận từ Giai đoạn 2, dòng ~442-454 gốc, nay dịch xuống do đã chèn toggle "Theo mạng" phía trước) gọi `onClick={() => setIsNotesOpen(true)}` — **không cần đổi gì ở đây**.

## Mục tiêu

Khi `isNotesOpen === true`, khu vực "REGION 2: PREVIEW" (bên phải, card `flex-[0.85]`) hiển
thị Notes panel **thay thế** `PreviewHeader`/`PreviewBody`/`PreviewFooter`, thay vì mở
modal đè lên giữa màn hình. Khi đóng Notes, Preview hiện lại y như cũ — không mất trạng
thái caption/media/platform preview đang soạn (vì Preview components tự đọc lại state
từ context như trước, không có state cục bộ nào bị mất).

## Ràng buộc đã chốt với user (không tự ý đổi)

- **Giữ nguyên toàn bộ logic Notes hiện có** — thêm note (author + timestamp), xoá note, empty-state, avatar màu theo hash tên. Bản hiện tại của PubliCast **đầy đủ hơn** bản tham khảo (`publicast-frontend`'s `PostNotesPanel.jsx` chưa có xoá note, chưa lưu qua API) nên **không copy logic từ bên tham khảo**, chỉ tham khảo **cách bố trí khung** (side-panel thay preview).
- **Không đổi state, không đổi API/service** — đây là thay đổi UI thuần (di chuyển JSX + đổi class bọc ngoài), không đụng `usePostCreatorForm.js`.
- **Độ rộng panel**: dùng `className="flex-1 h-full"` để lấp đầy đúng không gian của card Preview hiện tại (`flex-[0.85]`), **không** hard-code `w-[520px]` như bên tham khảo (vì layout PubliCast là 2-region chia theo tỷ lệ flex, không phải fixed-width sidebar).

## Việc cần làm

### 1. File mới: `src/components/workspace/post-creator/NotesPanel.jsx`

Cắt nguyên khối JSX từ modal Notes hiện tại (`PostCreator.jsx` dòng ~883-981) thành 1
component riêng, lấy state qua `usePostCreatorFormContext()`:

```jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, X, MessageSquare, Trash2, Send } from "lucide-react";
import { usePostCreatorFormContext } from "../../../context/PostCreatorFormContext";

export function NotesPanel() {
  const { t } = useTranslation(["planner", "common"]);
  const {
    notes,
    newNoteText,
    setNewNoteText,
    handleAddNoteClick,
    handleDeleteNoteClick,
    setIsNotesOpen,
  } = usePostCreatorFormContext();

  return (
    <div className="flex-1 h-full bg-white rounded-[20px] border border-gray-200/80 shadow-sm flex flex-col overflow-hidden min-h-0 p-6 animate-in fade-in duration-200">
      <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-800" />
            <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight font-sans">{t("planner:postCreator.composer.sections.notesTitle")}</h3>
          </div>
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed uppercase tracking-widest font-sans">
            {t("planner:postCreator.composer.sections.notesDesc")}
          </p>
        </div>
        <button
          onClick={() => setIsNotesOpen(false)}
          className="text-gray-400 hover:text-black transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
        {/* ... giữ nguyên 100% nội dung empty-state + notes.map(...) từ modal cũ (dòng ~906-948) ... */}
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-3 shrink-0">
        {/* ... giữ nguyên 100% textarea + nút gửi từ modal cũ (dòng ~951-978) ... */}
      </div>
    </div>
  );
}
```

**Lưu ý quan trọng khi cắt-dán:** modal cũ dùng `max-h-[80vh]` / `max-h-[40vh]` cho danh
sách note (vì nó là popup center, cần giới hạn chiều cao trong viewport) — trong panel
mới, bỏ các `max-h-*` này, thay bằng `flex-1 overflow-y-auto` (đã viết ở trên) để danh
sách note tự giãn theo chiều cao thật của card Preview (dùng flexbox, không cần giới hạn
vh cứng vì card cha đã có `overflow-hidden` + chiều cao xác định từ layout ngoài).

### 2. Sửa `src/pages/workspace/PostCreator.jsx`

**Bước a** — Import component mới (đặt cạnh các import khác của post-creator, gần dòng ~44):
```js
import { NotesPanel } from "../../components/workspace/post-creator/NotesPanel";
```

**Bước b** — Sửa khối "REGION 2: PREVIEW" (dòng ~524-537), rẽ nhánh theo `isNotesOpen`:
```jsx
{/* ── REGION 2: PREVIEW (hoặc NOTES khi isNotesOpen) ── */}
<div className="flex-[0.85] flex flex-col min-h-0 overflow-hidden">
  <div className="flex items-center gap-2 px-1 pb-2 shrink-0">
    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 font-sans">
      {isNotesOpen ? "📝 Notes" : "👁 Preview"}
    </span>
    <div className="flex-1 h-px bg-gray-300/50" />
  </div>
  {isNotesOpen ? (
    <NotesPanel />
  ) : (
    <div className="flex-1 bg-[#F7F8FA] rounded-[20px] border border-gray-200/80 shadow-sm flex flex-col overflow-hidden min-h-0">
      <PreviewHeader />
      <PreviewBody />
      <PreviewFooter />
    </div>
  )}
</div>
```

`isNotesOpen` đã có sẵn trong destructure của `PostCreator.jsx` từ hook — kiểm tra lại nó
đã nằm trong danh sách destructure ở đầu component (nếu component đọc trực tiếp từ
`usePostCreatorForm()` thay vì qua context ở cấp này, xác nhận field đã được lấy ra trước
khi dùng trong JSX).

**Bước c** — Xoá hẳn khối modal Notes cũ (dòng ~883-981, từ `{/* Modal Team Notes */}`
đến `)}` đóng khối `{isNotesOpen && (...)}`) — toàn bộ nội dung đã chuyển sang
`NotesPanel.jsx` ở bước 1.

### 3. KHÔNG sửa `ComposerHeader.jsx`

Nút "Notes" hiện tại (`onClick={() => setIsNotesOpen(true)}`) đã đúng hành vi cần —
không cần đổi gì. Badge số lượng note (`{notes.length}`) trên nút cũng giữ nguyên.

## Rủi ro cần chú ý

- **Đừng quên bỏ `max-h-[40vh]`/`max-h-[80vh]`** khi cắt dán — nếu giữ nguyên, danh sách note trong panel mới có thể bị giới hạn chiều cao sai lệch so với không gian thật của card Preview (quá ngắn hoặc bị scroll kép).
- **Region label** ("👁 Preview" / "📝 Notes") nằm NGOÀI card trắng, thuộc khối cha `flex-[0.85]` — khi rẽ nhánh, đừng vô tình xoá mất label này hoặc đặt nhầm nó vào trong `NotesPanel.jsx` (nó nên ở ngoài, chung cho cả 2 trạng thái, chỉ đổi text/icon).
- Khi đóng Notes panel (`setIsNotesOpen(false)`), Preview phải hiện lại đúng bài đang soạn — vì `PreviewHeader/Body/Footer` là các component không giữ state cục bộ (đọc thẳng từ context mỗi lần render), việc unmount rồi mount lại chúng khi bật/tắt `isNotesOpen` không làm mất dữ liệu — nhưng vẫn cần test bằng tay để chắc chắn (ví dụ preview có state cục bộ ẩn nào như scroll position, animation state... thì sẽ reset về đầu, đó là chấp nhận được, không phải bug).
- Test kỹ `getBackupPayload`/`restoreFormState` (điều hướng sang `/workspace/video-editor` rồi quay lại) — `notes` đã nằm trong backup payload từ trước (không phải việc mới của Giai đoạn 4), chỉ cần xác nhận vẫn hoạt động đúng sau khi đổi UI, không cần sửa code phần này.

## Cách test / verify

1. `npm run dev` trong `D:/Fullit/projects/PubliCast/frontend`, mở Post Creator.
2. Gõ caption, chọn platform, xem Preview bên phải hiển thị đúng (như bình thường).
3. Bấm nút "Notes" ở header → xác nhận: vùng Preview (bên phải) bị **thay thế** bằng Notes panel (không phải overlay che toàn màn hình như trước), vùng Compose (bên trái) không đổi gì, vẫn gõ được caption bình thường.
4. Gõ 1 note, bấm nút gửi (hoặc Enter) → xác nhận note xuất hiện đúng với author + timestamp, input trống lại.
5. Thêm note thứ 2 → xác nhận cả 2 note hiển thị đúng thứ tự, avatar màu khác nhau theo hash tên tác giả.
6. Xoá 1 note (hover vào note, bấm icon thùng rác) → xác nhận đúng note bị xoá, toast hiện (nếu có), danh sách còn lại đúng.
7. Bấm nút đóng (X) trong Notes panel → xác nhận quay lại đúng Preview với caption/media/platform đang soạn (không bị reset).
8. Mở lại Notes → xác nhận note đã thêm trước đó (bước 4-5, trừ note đã xoá ở bước 6) vẫn còn nguyên — do `notes` là state global của hook, không phụ thuộc UI đang mở hay đóng.
9. Test empty-state: mở Post Creator mới (chưa có note nào) → bấm Notes → xác nhận hiện đúng icon + text "chưa có note nào" giống bản modal cũ.
10. Test responsive: thu nhỏ/phóng to cửa sổ trình duyệt → xác nhận Notes panel co giãn đúng theo tỷ lệ `flex-[0.85]`, không bị tràn hay vỡ layout.
11. Test backup/restore: mở Notes, thêm 1 note, điều hướng sang `/workspace/video-editor` rồi quay lại Post Creator → xác nhận note vẫn còn, đồng thời `isNotesOpen` không bắt buộc phải giữ trạng thái mở (kiểm tra hành vi thực tế, không phải lỗi nếu nó tự đóng lại — chỉ cần dữ liệu `notes` không mất).
