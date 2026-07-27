# WorkLog — Phase 1 開發細節

MVP 範圍：登入 → 新增日誌 → 填工作細項 → 送出 → 查詢，完整跑一輪。
範圍定義與整體規劃見系統分析書第十一章 11.1；本檔案是可逐項執行、逐項驗證的任務分解。

不含：附件上傳、統計卡、月曆視圖（Phase 2 / Phase 3）。

---

## 開發順序

API 合約定案 → Mockoon 假 API → 前端認證串接（真 Keycloak）→ 前端頁面（打 Mockoon）→ 資料庫初步設計 → 後端真實實作 → 前後端切換整合 → 整合驗收

前端先行，後端用 Mockoon 頂著，資料庫先求「建得起來」不求「一次到位」，等前端頁面都做完、需求都摸清楚了，後端再照著已經驗證過的 API 合約去實作，資料庫設計也在這個階段補齊索引、約束等細節。

**唯一例外是登入：** Keycloak 是真實服務，redirect 到登入頁這件事沒辦法用 Mockoon 模擬，所以認證串接一開始就要接真的 Keycloak；被 Mock 掉的只有 WorkLog 自己的業務 API（`/auth/me`、`/worklogs`、`/worklogs/{logId}/items`）。

**風險提醒——合約漂移：** 前端跟 Mockoon 假資料開發完之後，如果後端實作時自己重新設計回應格式（欄位改名、少包一層、狀態碼不一樣），切換到真後端那一刻前端就會壞掉。Stage 1 定案的 API 合約是這次唯一的真相來源，Mockoon 假資料和後端 DTO 都要對齊它，不要各自發揮。ASP.NET Core 預設輸出 camelCase JSON，Mockoon 假資料的欄位名稱也要用 camelCase，避免文字大小寫不一致這種低階錯誤。

---

## Stage 0　環境準備

- [x] Keycloak：在既有正式 Keycloak 伺服器上建立新 realm `dev`（不用 master realm，也不各自另開獨立 instance）——`dev` 是暫時性的隔離方案，之後有時間補齊獨立主機環境時再遷移；未來新專案若需要跨系統 SSO，一律加進 `dev` realm 底下當新 client，不要各自另開 realm
- [x] Keycloak：建立 client `work-log-frontend`（client authentication off、Standard flow、redirect URI `http://localhost:6171/callback`、silent redirect URI `http://localhost:6171/silent-callback`、PKCE S256）
- [x] Keycloak：確認測試用員工帳號可登入，並記下該帳號的 `preferred_username`（工號）、`name`、`email`、`department` claim 內容——至少準備 2 個測試帳號，後面要測試權限隔離；`department` claim 透過自訂 Client Scope（User Attribute mapper）加入 token
- [x] 安裝 Mockoon（桌面版或 CLI 皆可）
- [x] 前端：`mkdir frontend && cd frontend && npm create vite@latest . -- --template react-ts`，安裝套件（見系統分析書 8.1）；shadcn/ui 已 init（Base UI + Nova preset），alias 設定正確
- [x] 後端：改用 `ktgh-react`／`ktgh-api` 對稱的 KTGH Modular Monolith 架構（Dapper + FluentMigrator，不是 EF Core），用 `ktgh-api` skill scaffold，SolutionName=`WorkLog`、第一個業務模組=`WorkLogs`，資料夾為 `work-log/WorkLog/`；build 成功，先不寫邏輯（Stage 6 才會動）——系統分析書第 2.1、2.2、第四章、第九章的 EF Core／簡單分層架構描述目前已過時，待補寫
- [ ] PostgreSQL：先確認裝好、能連得上，`worklog_db` 資料庫本身留到 Stage 5 才建

**驗證：** Keycloak admin console 能看到 client 設定；Mockoon 能開啟並建立一個空的 environment；`npm run dev` 能看到空白 Vite 頁面；`dotnet run` 能跑起空的 WebApi。

---

## Stage 1　API 合約定案

把系統分析書第五章的每一支端點，逐一寫出明確的 Request / Response JSON 範例，之後 Mockoon 假資料和後端 DTO 都照這份走。

- [x] `GET /auth/me` — 回傳成功的員工資料範例
- [x] `GET /worklogs?year=&month=` — 回傳列表範例（至少涵蓋 DRAFT / SUBMITTED 兩種狀態）
- [x] `GET /worklogs/{id}` — 回傳單筆詳情範例（含 work_items 陣列）
- [x] `POST /worklogs` — 回傳新建立日誌的範例（含自動產生的 log_no）
- [x] `PUT /worklogs/{id}` — 成功回應範例，以及非 DRAFT 狀態時的 400 錯誤範例
- [x] `DELETE /worklogs/{id}` — 成功回應範例
- [x] `POST /worklogs/{id}/submit` — 成功回應範例，以及重複送出的 400 錯誤範例
- [x] `POST /worklogs/{logId}/items`、`PUT .../items/{itemId}`、`DELETE .../items/{itemId}` — 回應範例
- [x] 統一錯誤格式範例（對應系統分析書 5.1 的 `{ success, data, message, errors }`）

合約全文見 [`work-log-api-contract.md`](./work-log-api-contract.md)。過程中發現系統分析書 5.3/5.4/5.5 沒定義 P03 班別下拉選單要打的端點，判斷是規格遺漏，合約裡補上 `GET /shift-types`（待你確認是否保留）。

**驗證：** 這份合約寫完，前端工程師不用等後端，光看這份就能開始刻頁面；後端工程師之後也是照這份實作，不用另外開會對格式。

---

## Stage 2　Mockoon 假 API

- [ ] 建立 Mockoon environment（例如取名 `worklog-mock`），依 Stage 1 合約設定所有 route
- [ ] `GET /worklogs` 假資料至少 3～5 筆、涵蓋不同狀態，方便前端測列表篩選
- [ ] `POST /worklogs` 回傳假的新日誌（log_no 可以先寫死或簡單遞增，不用真的算日期流水號）
- [ ] `POST /worklogs/{id}/submit` 準備兩種情境：正常送出成功、與模擬「已經是 SUBMITTED」的 400
- [ ] `GET /auth/me` 固定回傳一筆假員工資料
- [ ] 啟動 Mockoon server（例如 port 3001），用 Postman/curl 打過一輪確認每支都通
- [ ] 把 environment 檔案存進專案（例如 `mockoon/worklog-mock.json`），方便版本控管與之後調整

**驗證：** 前端之後只要把 `VITE_API_BASE_URL` 指向這個 Mockoon 網址，就可以完全不依賴後端把 Stage 3～4 做完。

---

## Stage 3　前端 — 認證串接（真 Keycloak）

這一步不能用 Mockoon 頂——Keycloak 的登入頁 redirect 是真實服務行為。

- [ ] `.env` 設定完整 OIDC 變數：`VITE_OIDC_AUTHORITY`、`VITE_OIDC_CLIENT_ID`、`VITE_OIDC_REDIRECT_URI`、`VITE_OIDC_SILENT_REDIRECT_URI`、`VITE_OIDC_POST_LOGOUT_REDIRECT_URI`、`VITE_OIDC_SCOPE`、`VITE_OIDC_AUTOMATIC_SILENT_RENEW`（系統分析書 8.2），`VITE_API_BASE_URL` 先指向 Mockoon
- [ ] 建立 `features/authentication/lib/userManager.ts`，含 `automaticSilentRenew: true`（系統分析書 8.4）
- [ ] 建立 `authStore`、`initAuth`（含 `addSilentRenewError` 失敗時導回登入）、`useAuth`（含 `logout()`）
- [ ] 建立 `pages/CallbackPage.tsx`，成功後打一次 `GET /auth/me`（這時候打到的是 Mockoon）
- [ ] 建立 `pages/SilentCallbackPage.tsx`，只呼叫 `signinSilentCallback()`
- [ ] 建立 `router/ProtectedRoute.tsx`，未登入觸發 `signinRedirect()`
- [ ] `router/index.tsx` 改用 `createBrowserRouter`（不是 `createHashRouter`），註冊 `/callback`、`/silent-callback` 兩個公開路由
- [ ] `main.tsx` 先 `await initAuth()` 再 render RouterProvider
- [ ] `lib/apiClient.ts` 攔截器帶入 access_token，401 時觸發 `signinRedirect()`
- [ ] DashboardPage 頂部加登出按鈕，呼叫 `useAuth().logout()`

**驗證：**

1. 開啟前端網址（未登入）→ 自動導向 Keycloak 登入頁
2. 登入成功 → 導回 `/callback` → 短暫顯示「登入中…」→ 導向 `/dashboard`
3. 重新整理頁面 → 不會被要求重新登入（Token 從 localStorage 還原成功）
4. `/auth/me` 打到 Mockoon，畫面能正確顯示假員工資料
5. 在 work-log **client** 的 Advanced 設定（Fine Grain OpenID Connect Configuration → Access Token Lifespan）調短（例如 30 秒）測試 Silent Renew，不要改 realm 層級的全域設定——realm 是多專案共用的，改 realm 層級會影響其他 client：等待過期時間，畫面不會跳轉、操作不中斷
6. 按登出按鈕 → 導向 Keycloak 登出 → 導回系統首頁
7. 直接重新整理 `/dashboard`（非首頁路徑）不會 404（確認 dev server 的 history fallback 正常）

---

## Stage 4　前端 — Dashboard（打 Mockoon）

- [ ] `useGetMyLogs` Hook（TanStack Query）
- [ ] `DashboardPage`：月份切換 + 列表（狀態 / 日期 / 摘要 / 總時數 / 操作）
- [ ] 「＋新增今日日誌」按鈕 → 呼叫 `useCreateLog` → 導向 `/logs/{id}/edit`
- [ ] 草稿列可「編輯」「刪除」；已送出列只能「查看」

不做：統計卡 3 欄（Phase 2）。

**驗證：** 切換月份列表正確過濾（Mockoon 假資料要涵蓋不同月份才測得出來）；新增後列表立即出現（TanStack Query invalidate 正確）。

---

## Stage 5　前端 — EditLogPage（打 Mockoon）

- [ ] 基本資訊區：日期（唯讀或 DatePicker）、班別下拉選單
- [ ] 工作細項區：動態新增/刪除 Row，即時顯示加總時數
- [ ] 「本人已閱讀」Checkbox（送出前必須勾選才能按送出）
- [ ] 頂部操作列：取消／儲存草稿／送出
- [ ] 送出後整頁進入唯讀模式

**驗證：**

1. 新增 2 筆細項並填時數 → 畫面即時顯示合計（這階段是前端自己算，還沒有後端加總邏輯可以對照）
2. 「送出」按鈕在未勾選「本人已閱讀」時 disabled
3. 送出後重新整理頁面 → 欄位全部唯讀，無法編輯
4. 觸發 Mockoon 設定的 400 情境（重複送出），確認前端有正確顯示錯誤訊息，不是白畫面或 console error

到這邊，前端頁面在「假資料」的世界裡應該已經完整可操作。

---

## Stage 6　資料庫初步設計

只求「建得起來、欄位對得上 API 合約」，索引、額外約束等細節留到 Stage 7 後端實作時再補。

- [ ] 建立 EF Core Entity：`Department`、`Employee`（`EmployeeNo` 對應 Keycloak `preferred_username`）、`ShiftType`、`WorkLog`、`WorkItem`
- [ ] 建立 `AppDbContext`，設定關聯（work_logs → employees / shift_types，work_items → work_logs，employees → departments）
- [ ] `dotnet ef migrations add InitialCreate`
- [ ] `dotnet ef database update`
- [ ] 手動 Seed 至少 1～2 筆 shift_types（正常班等）；department 不用手動 Seed，第一次登入時由 JIT Provisioning 自動建立

**驗證：** 用 psql 或 DBeaver 連進 `worklog_db`，確認 5 張表都建好、欄位與系統分析書第四章一致（employees 沒有 password_hash，也沒有額外的 sso_subject 欄位，直接用既有的 employee_no）。

---

## Stage 7　後端 — 真實 API 實作

照 Stage 1 定案的合約做，不要重新設計回應格式。這裡把認證、WorkLogs、WorkItems 三塊一次做完。

**認證**
- [ ] `appsettings.json` 設定 `Keycloak:Authority`、`Keycloak:Audience`（系統分析書 9.2）
- [ ] `Program.cs` 設定 `AddJwtBearer` + `UseAuthentication()` / `UseAuthorization()`
- [ ] 建立 `ClaimsPrincipalExtensions.GetEmployeeIdAsync`：用 `preferred_username`（UPPER + Trim）查 `employee_no`（系統分析書 9.5）
- [ ] 建立 `AuthController.Me()`：查不到 employee 就用 claims 建立，`department` claim 一併 find-or-create 到 departments 表（JIT Provisioning）

**WorkLogs**
- [ ] `POST /worklogs`：建立草稿，log_no 自動產生（系統分析書 7.2 / 9.4）
- [ ] `GET /worklogs`：依 year/month 篩選我的日誌列表
- [ ] `GET /worklogs/{id}`：單筆詳情（含 work_items）
- [ ] `PUT /worklogs/{id}`：更新（限 DRAFT 狀態，非 DRAFT 要回 400）
- [ ] `DELETE /worklogs/{id}`：刪除草稿（限 DRAFT 狀態）
- [ ] `POST /worklogs/{id}/submit`：DRAFT → SUBMITTED，寫入 submitted_at
- [ ] 所有端點都要用 `GetEmployeeIdAsync` 過濾「只能動自己的日誌」

**WorkItems**
- [ ] `POST /worklogs/{logId}/items`：新增細項（seq 自動遞增）
- [ ] `PUT /worklogs/{logId}/items/{itemId}`：更新細項
- [ ] `DELETE /worklogs/{logId}/items/{itemId}`：刪除細項
- [ ] `work_logs.total_hours` 在細項新增/刪除/更新時後端重新計算加總（不要交給前端算了再存）
- [ ] 限制：日誌狀態非 DRAFT 時不能新增/刪除/更新細項

**驗證（Swagger 手動測試，先不透過前端）：**

1. 不帶 Token 打任一端點 → 401
2. 打 `/api/auth/me` → 第一次呼叫新增 employee（新部門代碼則一併新增 department），第二次呼叫回傳同一筆
3. 建立日誌 → log_no 格式正確（WDYYYYMMDDxxxx），同一天第二筆流水號 +1
4. 用另一個測試帳號的 Token 打自己以外的 `worklogs/{id}` → 查不到 / 403
5. 送出後再嘗試 PUT/DELETE 該筆 → 400
6. 新增 3 筆細項，`GET /worklogs/{id}` 回傳的 total_hours 等於加總；刪除 1 筆後重新計算正確
7. **逐一核對回應 JSON 跟 Stage 1 合約、Mockoon 假資料的欄位是否一致**——這是這個開發順序最容易出包的地方

---

## Stage 8　前後端切換整合

- [ ] 把 `.env` 的 `VITE_API_BASE_URL` 從 Mockoon 網址換成真後端網址
- [ ] 前端不改任何程式碼，只換這一個環境變數

**驗證：** 如果切換後前端能正常運作，代表 Stage 1 的合約有守住；如果壞掉，代表後端某處回應格式偏離了合約，回頭修後端，不要改前端遷就後端。

---

## Stage 9　整合驗收（對照系統分析書 11.1 驗收標準）

- [ ] 未登入自動導向 Keycloak，登入後導回 /callback 並成功建立本地員工資料
- [ ] Silent Renew 正常運作，Token 快過期時不會中斷操作
- [ ] 登出功能正常，導回 Keycloak 登出後回到系統
- [ ] 新增日誌自動產生 log_no
- [ ] 細項新增/刪除即時加總（前端顯示與後端回傳一致）
- [ ] 草稿可重新編輯
- [ ] 送出後狀態變 SUBMITTED 且唯讀
- [ ] 列表可依月份篩選看到剛建立的日誌
- [ ] 用兩個不同測試帳號互相確認看不到對方的日誌（權限隔離）

全部勾完，Phase 1 才算完成，才進 Phase 2。
