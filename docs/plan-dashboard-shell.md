# Plan: Implement Dashboard Shell từ Figma

> Prompt/checklist này dành để giao cho một AI coding agent khác thực thi. Mỗi bước là một prompt độc lập, tự chứa đủ ngữ cảnh cần thiết. Làm tuần tự theo thứ tự, xong bước nào duyệt bước đó rồi mới sang bước sau.

## Nguồn thiết kế (Figma)

- File: `https://www.figma.com/design/nvVgr5x3LEs5ZfQvmgAtB7/Publicast`
- Có 3 frame gốc cùng kích thước 1280×1024, thể hiện **3 trạng thái của cùng 1 dashboard** (không phải 3 màn hình khác nhau):
  | Trạng thái | Node ID | Ghi chú |
  |---|---|---|
  | Light Mode | `4:156` | Main content đang là Empty State |
  | Dark Mode | `4:309` | Có thêm Right Navigation Drawer (tabs/notifications) |
  | Settings Drawer mở | `4:451` | Main content có **Bento Grid Layout thật** (`4:526`, 1012×636) + Settings Drawer overlay bên phải |

Các sub-node id quan trọng để lấy design context (`get_design_context` với `fileKey=nvVgr5x3LEs5ZfQvmgAtB7`):
- Sidebar (Light): `4:158` — "Aside - SideNavBar"
- Sidebar (Dark, có 7 nav item data-bound): `4:310` — "Aside - Sidebar Navigation"
- Header (Light): `4:263` — "Header - TopAppBar"
- Header (Dark): `4:388` — "Header - TopNavBar"
- Main content thật (Bento Grid): `4:526` — trong frame `4:511` "Main Content Canvas" của `4:451`
- Right Navigation Drawer (dark mode, tabs/notifications): `4:417`
- Settings Drawer (overlay, 4 nhóm mục): `4:621` — "Aside - NavigationDrawer (Settings Drawer) Shell", con của `4:451`
- Dimmed overlay khi drawer mở: `4:620`

## Tech stack & quy ước hiện có trong repo (BẮT BUỘC tuân theo)

- Vite + React 19 (JSX, **không phải Next.js**), react-router-dom v7
- Tailwind v4 (`@tailwindcss/vite`), design tokens định nghĩa ở `src/assets/styles/theme.css` dùng biến HSL kiểu shadcn (`--background`, `--sidebar-background`, `--sidebar-accent`, v.v. — **đã có sẵn token riêng cho sidebar**, dùng chúng thay vì hardcode màu)
- Dark mode: class `.dark` trên root — kiểm tra cách toggle hiện tại (chưa có, cần thêm store/hook)
- UI primitives kiểu shadcn/Radix đã có trong `src/components/ui/` (button, input, card, dialog, tabs, dropdown-menu, avatar, badge, sonner) — theo mẫu `cva` + `cn()` (`src/utils/cn.js`, dùng `clsx` + `tailwind-merge`). Tái sử dụng các component này, chỉ tạo thêm primitive mới nếu thật sự thiếu (vd: `Sheet`/`Drawer` cho Settings Drawer nếu cần — kiểm tra `radix-ui` package trước khi tự viết từ đầu).
- Alias import: `@/` trỏ tới `src/`
- State toàn cục: `zustand` (xem `src/store/`)
- Icon: `lucide-react`
- i18n: `react-i18next`, có sẵn `src/i18n/locales/{en,vi}` — text hiển thị trong sidebar/header/drawer nên đi qua i18n, không hardcode chuỗi tiếng Anh/Việt trực tiếp trong JSX
- Cấu trúc thư mục hiện có: `src/layout/` (đang trống), `src/components/{app,manage,shared,ui,workspace}/`, `src/pages/workspace/planner/PlannerPage.jsx`, router chính ở `src/App.jsx`

## Kết quả cuối cùng cần đạt

Route `/workspace/*` được bọc bởi 1 layout mới (`DashboardLayout`) gồm Sidebar + Header + main content (`<Outlet/>` render `PlannerPage` và các page tương lai), có toggle dark mode, và có Settings Drawer mở được từ nút trong sidebar/header.

---

## Bước 1 — Layout shell (khung tổng)

Tạo `src/layout/DashboardLayout.jsx`: layout gồm 3 vùng — Sidebar trái (cố định, width ~220px theo Figma `4:158`), Header trên cùng (height 56px theo Figma `4:263`/`4:388`), và main content area chiếm phần còn lại chứa `<Outlet/>` từ react-router-dom.

Dùng `get_design_context` trên node `4:156` (fileKey `nvVgr5x3LEs5ZfQvmgAtB7`) để lấy layout, spacing, kích thước chính xác. Dùng token màu từ `theme.css` (`bg-background`, `text-foreground`, v.v.), KHÔNG hardcode hex.

Sau bước này: layout render được nhưng Sidebar/Header là placeholder rỗng hoặc rất đơn giản — sẽ hoàn thiện ở bước 2-3.

## Bước 2 — Sidebar

Tạo `src/components/workspace/Sidebar.jsx` (hoặc đặt trong `src/layout/` nếu phù hợp hơn với cấu trúc layout ở bước 1).

Lấy `get_design_context` trên node `4:158` (Light) — tham khảo thêm `4:310` (Dark, có 7 nav item) để biết đầy đủ danh sách item nav.

Nội dung: logo/margin trên cùng, 2 nhóm nav item (icon + label, dùng `lucide-react` cho icon), Plan Card (nếu có thông tin plan/subscription), footer chứa nút toggle dark mode + nút mở Settings Drawer.

Dùng token `--sidebar-*` đã có sẵn trong `theme.css` cho màu nền/border/active state.

Item nav nên nhận `active` state dựa theo route hiện tại (`useLocation` từ react-router-dom).

## Bước 3 — Header / TopAppBar

Tạo `src/components/workspace/Header.jsx`.

Lấy `get_design_context` trên node `4:263` (Light) / `4:388` (Dark).

Nội dung: logo + search bên trái, icon nav ở giữa, actions + mode switcher bên phải. Dùng `Input` có sẵn (`src/components/ui/input.jsx`) cho search nếu khớp style, `Avatar`/`Badge`/`DropdownMenu` có sẵn cho phần actions/user menu.

## Bước 4 — Dark mode toggle

Thêm store zustand mới (vd `src/store/themeStore.js`) quản lý `theme: 'light' | 'dark'`, persist vào `localStorage`. Hook/effect áp dụng class `.dark` lên `document.documentElement` khi theme đổi.

Nối nút toggle trong Sidebar (bước 2) với store này. Test bằng cách chuyển đổi và xem token màu trong `theme.css` (`.dark { ... }`) áp dụng đúng.

## Bước 5 — Main content / Bento Grid

Lấy `get_design_context` trên node `4:526` (Bento Grid Layout thật, trong `4:451`) — đây là nguồn chính xác hơn vì bản Light Mode (`4:235`) chỉ là Empty State.

Tạo component(s) trong `src/components/workspace/` cho các "bento card" — dựa theo cấu trúc thật trong Figma (số lượng và loại card sẽ rõ khi lấy design context). Đặt trong `PlannerPage.jsx` hoặc tạo page/section riêng nếu bento grid là dashboard tổng quan khác với planner.

Cân nhắc: nếu chưa có API/data thật cho các card, dùng mock data tạm trong component, đánh dấu rõ bằng comment ngắn `// TODO: thay bằng data thật từ API` để dễ tìm sau — không tự ý bịa API call.

## Bước 6 — Settings Drawer (overlay phải)

Lấy `get_design_context` trên node `4:621` (Settings Drawer) và `4:620` (dimmed overlay).

Kiểm tra `radix-ui`/`@radix-ui/react-dialog` đã có trong `package.json` — có thể dùng `Dialog` hiện có (`src/components/ui/dialog.jsx`) làm nền tảng để build drawer trượt từ phải, hoặc tạo thêm primitive `Sheet` riêng nếu `Dialog` hiện tại không hỗ trợ side="right" (kiểm tra code trước khi quyết định).

Nội dung 4 nhóm mục: **Account & Workspace**, **Users & Billing**, **Preferences**, **Support**, cộng nút **Logout**. Trigger mở từ nút Settings trong Sidebar (bước 2) hoặc Header (bước 3).

State mở/đóng: local state trong `DashboardLayout` hoặc store riêng nếu cần mở từ nhiều nơi.

## Bước 7 — Wire vào router

Sửa `src/App.jsx`: bọc route `/workspace/planner` (và các route `/workspace/*` tương lai) bằng `DashboardLayout` từ bước 1, đặt bên trong `ProtectedRoute` hiện có. Xác nhận `PlannerPage` vẫn render đúng bên trong `<Outlet/>`.

---

## Lưu ý chung cho mọi bước

- Luôn gọi `get_design_context` (không chỉ nhìn số liệu trong bảng trên) trước khi code — bảng trên chỉ là bản đồ định hướng, không thay thế việc đọc thiết kế thật.
- Tái sử dụng token trong `theme.css` và component có sẵn trong `src/components/ui/`. Không tạo trùng lặp primitive đã tồn tại.
- Giữ nguyên convention hiện có: `cva` cho variant, `cn()` cho class merge, `forwardRef` cho component UI cấp thấp.
- Không thêm thư viện mới (state management, CSS framework, icon set khác) trừ khi thật sự cần và không có sẵn giải pháp trong `package.json`.
