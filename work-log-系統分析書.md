WorkLog
工作日誌管理系統
系統分析與設計規格書

適用技術：React 19  ·  ASP.NET Core Web API  ·  PostgreSQL  ·  Keycloak SSO

版本 2.0  ·  2026 年 7 月

# 目錄

第一章　系統概述
第二章　系統架構設計
第三章　功能需求規格
第四章　資料庫 Table 設計
第五章　API 端點規格
第六章　畫面 UI 設計說明
第七章　操作流程
第八章　前端 React 實作指引
第九章　後端 ASP.NET Core 實作指引
第十章　單人開發時程建議
第十一章　分期開發規劃

# 第一章　系統概述

## 1.1 系統背景

WorkLog 是一套員工工作日誌管理系統，讓員工能每日記錄工作內容、總時數與附件，並將日誌送出供自我留存與追蹤。系統目標是取代紙本或 Email 回報，提升工作進度的可視化與管理效率。

## 1.2 系統目標

- 員工可每日新增、編輯工作日誌
- 系統自動產生日誌編號（格式：WDYYYYMMDDxxxx）
- 支援草稿儲存與正式送出兩種狀態
- 提供月份切換、統計卡（本月填寫率 / 待送出數 / 已完成數）
- 支援工作細項動態新增（多筆），自動加總總工時
- 支援附件上傳（圖片、PDF 等）
- 月曆視圖瀏覽各日日誌狀態

## 1.3 使用者角色

| 角色 | 英文代碼 | 主要功能 |
| --- | --- | --- |
| 員工 | Employee | 填寫 / 草稿儲存 / 送出 / 查看自己的日誌 / 月曆視圖 / 統計卡 |

# 第二章　系統架構設計

## 2.1 技術架構總覽

| 層次 | 技術選型 | 說明 |
| --- | --- | --- |
| 前端 | React 19 + Vite | Function Component + Hooks、React Router 7、Zustand 狀態管理 |
| UI 元件庫 | shadcn/ui + Tailwind CSS 4 | 基於 Radix / Base UI 的無樣式元件，可客製化樣式，搭配 lucide-react 圖示 |
| 資料查詢 | TanStack Query 5 | API 資料快取、loading / error 狀態管理，取代手寫 useEffect 抓資料 |
| HTTP 客戶端 | Axios | 呼叫後端 REST API，統一攔截 Token |
| 後端框架 | ASP.NET Core 10 Web API | KTGH Modular Monolith 架構，比照公司內部 Knect.API 專案的模式 |
| 架構模式 | KTGH Modular Monolith | Common 模組（跨模組共用）＋業務模組（各自 Domains/Features/Infrastructure/PublicApi/IntegrationEvents 五個專案）；模組之間不能直接參照對方的 Domains／Infrastructure，只能透過對方的 PublicApi 介面或 IntegrationEvents 溝通 |
| 路由 | Carter | Minimal API 路由庫，以 Module 為單位定義端點（`ICarterModule`），不使用傳統 `[ApiController]` Controller |
| 資料存取 | Dapper | Micro-ORM，手寫 SQL，透過 Repository 封裝查詢，不用 EF Core |
| Migration | FluentMigrator | Code-based migration class，套用到 PostgreSQL，不用 EF Core Migrations |
| 資料庫 | PostgreSQL 16 | 主要關聯式資料庫，支援 JSONB |
| 檔案儲存 | Local FileSystem | 附件上傳，開發與展示使用本機儲存 |
| 身份驗證 | Keycloak（OIDC）+ JWT Bearer Token | 公司內部 Keycloak SSO 核發 Token，走 Authorization Code + PKCE；後端以 Keycloak JWKS 驗簽，不自行核發 Token |
| SSO 函式庫 | oidc-client-ts | 前端處理 Authorization Code + PKCE、callback 交換、Token 靜默更新 |

## 2.2 專案資料夾結構

### 前端（React）

frontend/src/

- components/ui/       — shadcn/ui 元件（Button、Input、Dialog 等）
- features/            — 依功能模組拆分（worklog/、attachment/、authentication/），各自內含 api/、store/、components/
  - features/authentication/lib/ — oidc-client-ts 的 UserManager 設定與初始化（userManager.ts、initAuth.ts）
- pages/               — 路由頁面元件（DashboardPage、EditLogPage、CalendarPage、CallbackPage、SilentCallbackPage）
- router/              — React Router 路由定義（index.tsx、ProtectedRoute.tsx）
- lib/                 — 共用底層設定（apiClient.ts、queryClient.ts）
- hooks/               — 跨功能共用 Hooks
- utils/               — 工具函式
- config/              — 常數設定（如路由路徑）

### 後端（ASP.NET Core Web API — KTGH Modular Monolith）

資料夾命名比照公司內部 Knect.API 專案慣例：repo 根目錄叫 `{Product}.API`，內部 Solution／Host 專案名稱是 `{Product}`，不重複疊字。用 `ktgh-api` skill scaffold（SolutionName=`WorkLog`、第一個業務模組=`WorkLogs`），不手動 `dotnet new webapi`。

```
WorkLog.API/                                   — repo 根目錄
├── WorkLog.API.slnx
├── global.json / nuget.config / Directory.Packages.props
├── src/
│   ├── Modules/
│   │   ├── Common/                            — 跨模組共用，不含業務邏輯
│   │   │   ├── Modules.Common.Domains/        — SeedWork（Entity、ValueObject、IAggregateRoot 等基底介面）
│   │   │   ├── Modules.Common.Features/       — IHandler、HandlerRegistration、ITokenResolver（讀 preferred_username claim）
│   │   │   └── Modules.Common.Infrastructure/ — NpgsqlConnectionFactory、EventBus、RedisService
│   │   └── WorkLogs/                          — 核心業務模組
│   │       ├── Modules.WorkLogs.Domains/          — WorkLog／WorkItem 聚合根、IWorkLogsRepository
│   │       ├── Modules.WorkLogs.Features/         — Carter Module + Handler（依 Use Case 分資料夾）
│   │       ├── Modules.WorkLogs.Infrastructure/   — Dapper Repository 實作
│   │       ├── Modules.WorkLogs.PublicApi/        — 給其他模組呼叫的對外介面
│   │       └── Modules.WorkLogs.IntegrationEvents/ — 模組間非同步事件（例如 WorkLogSubmittedIntegrationEvent）
│   └── WorkLog.API.Host/                      — 進入點，組裝所有模組（Program.cs、appsettings.json）
└── tests/
    ├── WorkLogs.UnitTests/
    └── Tests.Common/
```

# 第三章　功能需求規格

## 3.1 功能清單（Use Case 摘要）

| UC編號 | 功能名稱 | 說明 |
| --- | --- | --- |
| UC-01 | 使用者登入 | 帳號密碼登入，取得 JWT Token |
| UC-02 | 查看工作日誌總覽 | 依月份篩選，顯示統計卡與日誌列表 |
| UC-03 | 新增今日日誌 | 建立新日誌，系統自動帶入今日日期與員工資訊 |
| UC-04 | 編輯工作日誌 | 填寫日期、班別、工作細項、附件 |
| UC-05 | 新增工作細項 | 在日誌內動態新增多筆工作項目，自動加總時數 |
| UC-06 | 上傳附件 | 上傳圖片或 PDF 至日誌，可預覽與刪除 |
| UC-07 | 儲存草稿 | 暫存尚未完成的日誌，可隨時繼續編輯 |
| UC-08 | 送出日誌 | 將草稿正式送出，狀態改為「已完成」 |
| UC-09 | 查看月曆視圖 | 以月曆方式瀏覽各日日誌填寫狀態 |
| UC-10 | 刪除草稿 | 刪除尚未送出的草稿日誌 |

## 3.2 日誌狀態說明

| 狀態代碼 | 顯示名稱 | 說明 |
| --- | --- | --- |
| DRAFT | 草稿 | 員工建立或儲存草稿，尚未正式送出 |
| SUBMITTED | 已送出 | 員工正式送出，日誌完成歸檔 |

# 第四章　資料庫 Table 設計

## 4.1 資料表關聯說明

系統共 5 張核心資料表，關聯說明如下：
- employees（員工）1 對多 work_logs（工作日誌）
- work_logs 1 對多 work_items（工作細項）
- work_logs 1 對多 work_attachments（附件）
- employees 多對一 departments（部門）

## 4.2 詳細 Table 定義

### ① departments（部門）

| 欄位名稱 | 型態 | 限制 | 說明 |
| --- | --- | --- | --- |
| id | UUID | PK | 部門唯一識別碼 |
| name | VARCHAR(100) | NOT NULL | 部門名稱 |
| code | VARCHAR(20) | UNIQUE | 部門代碼（如 IT、HR） |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 建立時間 |

### ② employees（員工）

| 欄位名稱 | 型態 | 限制 | 說明 |
| --- | --- | --- | --- |
| id | UUID | PK | 員工唯一識別碼 |
| employee_no | VARCHAR(20) | UNIQUE NOT NULL | 員工編號（如 G033），對應 Keycloak Token 的 `preferred_username` claim（登入時 UPPER + TRIM 後比對），JIT Provisioning 的比對鍵 |
| name | VARCHAR(100) | NOT NULL | 員工姓名（來自 Keycloak `name` claim） |
| email | VARCHAR(200) | UNIQUE NOT NULL | Email（來自 Keycloak `email` claim） |
| department_id | UUID | FK → departments.id | 所屬部門，JIT Provisioning 時依 Keycloak `department` claim（部門代碼）find-or-create |
| is_active | BOOLEAN | DEFAULT TRUE | 帳號是否啟用 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 建立時間 |

### ③ shift_types（班別設定）

| 欄位名稱 | 型態 | 限制 | 說明 |
| --- | --- | --- | --- |
| id | UUID | PK | 班別唯一識別碼 |
| name | VARCHAR(50) | NOT NULL | 班別名稱（如 正常班） |
| description | VARCHAR(200) |  | 時間說明（08:00-12:00, 13:00-17:30） |
| total_hours | NUMERIC(4,1) | NOT NULL | 班別總工時 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否啟用 |

### ④ work_logs（工作日誌主表）

| 欄位名稱 | 型態 | 限制 | 說明 |
| --- | --- | --- | --- |
| id | UUID | PK | 日誌唯一識別碼 |
| log_no | VARCHAR(20) | UNIQUE NOT NULL | 日誌編號（WDYYYYMMDDxxxx） |
| employee_id | UUID | FK → employees.id NOT NULL | 填寫員工 |
| log_date | DATE | NOT NULL | 日誌日期 |
| shift_type_id | UUID | FK → shift_types.id | 當日班別 |
| total_hours | NUMERIC(4,1) |  | 總工時（由細項自動加總） |
| status | VARCHAR(20) | DEFAULT 'DRAFT' | DRAFT / SUBMITTED |
| self_read | BOOLEAN | DEFAULT FALSE | 本人已閱讀確認 |
| submitted_at | TIMESTAMPTZ |  | 送出時間 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 建立時間 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 最後更新時間 |

### ⑤ work_items（工作細項）

| 欄位名稱 | 型態 | 限制 | 說明 |
| --- | --- | --- | --- |
| id | UUID | PK | 細項唯一識別碼 |
| work_log_id | UUID | FK → work_logs.id NOT NULL | 所屬日誌 |
| seq | SMALLINT | NOT NULL | 細項排列順序 |
| task_name | VARCHAR(200) | NOT NULL | 工作名稱 / 摘要 |
| description | TEXT |  | 詳細說明 |
| hours | NUMERIC(4,1) | NOT NULL | 此項工作時數 |
| progress | SMALLINT |  | 完成百分比（0–100） |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 建立時間 |

### ⑥ work_attachments（附件）

| 欄位名稱 | 型態 | 限制 | 說明 |
| --- | --- | --- | --- |
| id | UUID | PK | 附件唯一識別碼 |
| work_log_id | UUID | FK → work_logs.id NOT NULL | 所屬日誌 |
| file_name | VARCHAR(255) | NOT NULL | 原始檔案名稱 |
| file_path | TEXT | NOT NULL | 本機儲存路徑 |
| file_size | INTEGER |  | 檔案大小（bytes） |
| mime_type | VARCHAR(100) |  | MIME Type（image/jpeg 等） |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() | 上傳時間 |

## 4.3 建立 Table SQL

以下 SQL 是目標 Schema 設計稿，實際建表透過 **FluentMigrator** 的 Migration class 撰寫（不是直接執行 SQL script，也不是 EF Core Migrations），Stage 7 後端實作時把這份 SQL 轉寫成對應的 `Migration` class。

```
-- 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(20) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no     VARCHAR(20) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(200) UNIQUE NOT NULL,
  department_id   UUID REFERENCES departments(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shift_types (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(50) NOT NULL,
  description  VARCHAR(200),
  total_hours  NUMERIC(4,1) NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE
);

CREATE TABLE work_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_no          VARCHAR(20) UNIQUE NOT NULL,
  employee_id     UUID REFERENCES employees(id) NOT NULL,
  log_date        DATE NOT NULL,
  shift_type_id   UUID REFERENCES shift_types(id),
  total_hours     NUMERIC(4,1),
  status          VARCHAR(20) DEFAULT 'DRAFT',
  self_read       BOOLEAN DEFAULT FALSE,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id  UUID REFERENCES work_logs(id) ON DELETE CASCADE NOT NULL,
  seq          SMALLINT NOT NULL,
  task_name    VARCHAR(200) NOT NULL,
  description  TEXT,
  hours        NUMERIC(4,1) NOT NULL,
  progress     SMALLINT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id  UUID REFERENCES work_logs(id) ON DELETE CASCADE NOT NULL,
  file_name    VARCHAR(255) NOT NULL,
  file_path    TEXT NOT NULL,
  file_size    INTEGER,
  mime_type    VARCHAR(100),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 常用索引
CREATE INDEX idx_work_logs_employee_date ON work_logs(employee_id, log_date);
CREATE INDEX idx_work_logs_status ON work_logs(status);
```

# 第五章　API 端點規格

## 5.1 通用規範

- Base URL：https://localhost:7001/api
- 所有請求與回應使用 JSON 格式
- 需登入的端點：Header 帶入 Authorization: Bearer {token}，此 Token 由 Keycloak 核發（前端透過 oidc-client-ts 取得），非本系統自行簽發
- 統一回應結構：{ success, data, message, errors }

## 5.2 認證 API（Auth）

登入 / 登出本身不經過本系統後端——前端由 oidc-client-ts 導向 Keycloak 完成 Authorization Code + PKCE 流程，直接取得 Token。以下端點僅處理「本地員工資料」：

| 方法 | 路徑 | 說明 | 備註 |
| --- | --- | --- | --- |
| GET | /auth/me | 取得目前登入者的本地員工資料，以 JWT `preferred_username` claim（工號）比對 employee_no，查無則自動用 claims（preferred_username / name / email / department）建立，department 一併 find-or-create（JIT Provisioning） | 前端登入成功後呼叫一次 |

## 5.3 工作日誌 API（WorkLogs）

| 方法 | 路徑 | 說明 | 備註 |
| --- | --- | --- | --- |
| GET | /worklogs | 取得我的日誌列表 | Query: year, month, status |
| GET | /worklogs/{id} | 取得單筆日誌詳情 | 含細項、附件 |
| POST | /worklogs | 新增日誌（草稿） | 自動產生 log_no |
| PUT | /worklogs/{id} | 更新日誌 | 限 DRAFT 狀態 |
| DELETE | /worklogs/{id} | 刪除草稿 | 限 DRAFT 狀態 |
| POST | /worklogs/{id}/submit | 送出日誌 | 狀態改為 SUBMITTED |
| GET | /worklogs/stats | 取得統計資料 | 填寫率、草稿數、已送出數 |

## 5.4 工作細項 API（WorkItems）

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| POST | /worklogs/{logId}/items | 新增工作細項 |
| PUT | /worklogs/{logId}/items/{itemId} | 更新工作細項 |
| DELETE | /worklogs/{logId}/items/{itemId} | 刪除工作細項 |

## 5.5 附件 API（Attachments）

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| POST | /worklogs/{logId}/attachments | 上傳附件（multipart/form-data） |
| GET | /worklogs/{logId}/attachments/{fileId} | 下載 / 預覽附件 |
| DELETE | /worklogs/{logId}/attachments/{fileId} | 刪除附件 |

# 第六章　畫面 UI 設計說明

## 6.1 設計規範

| 項目 | 規格 |
| --- | --- |
| 主色 | #0f766e（Teal 700） |
| 輔助色 | #1d9e75（成功/已送出）、#f59e0b（草稿/待送出）、#6b7280（一般） |
| 字型 | Noto Sans TC（中文）、DM Sans（英文數字） |
| 圓角 | 8px（卡片）、4px（輸入框）、9999px（Pill 按鈕） |
| 佈局 | 最大寬 1280px，左右 padding 24px，行動裝置 16px |
| 按鈕規格 | 主要按鈕：teal 背景白字；次要：白底邊框；危險：紅底白字 |

## 6.2 頁面清單與說明

### P01 — 登入 / 登出（無自建登入頁）

- 未登入使用者進入受保護路由時，由 `ProtectedRoute` 自動導向公司內部 Keycloak 登入頁（Authorization Code + PKCE），不自行畫帳號密碼表單
- Keycloak 登入完成後導回 `/callback`，由 `CallbackPage` 交換 Token 並呼叫一次 GET /auth/me 完成本地員工資料建立
- 完成後導向 /dashboard；Access Token 快過期時由 Silent Renew 背景換新（見 8.4），不會中斷使用者操作；只有 Silent Renew 失敗（例如 Keycloak session 已徹底過期）才會整頁導回登入頁
- Dashboard 頂部提供登出按鈕，觸發 `userManager.signoutRedirect()`，導向 Keycloak 登出後回到系統首頁

### P02 — 工作日誌總覽（/dashboard）

頂部統計卡（3 欄）：
- 本月填寫率：已填寫天數 ÷ 工作天數，顯示百分比與環形圖
- 待送出數量：草稿狀態日誌數（橘色沙漏 icon）
- 已完成數量：已送出狀態日誌數（綠色勾勾 icon）

月份切換列：
- 顯示「YYYY 年 M 月」，左右箭頭切換月份
- 右側「月曆視圖」按鈕，導向 /calendar

日誌列表表格：
- 欄位：狀態 / 日期 / 工作摘要（首項） / 總時數 / 附檔 / 操作
- 狀態以 Chip 顯示（草稿 = 橘、已送出 = 綠）
- 操作欄：[編輯] [刪除]（草稿）；[查看]（已送出）
- 右上角「＋新增今日日誌」按鈕，導向 /logs/new

### P03 — 編輯工作日誌（/logs/new 或 /logs/:id/edit）

左欄 — 基本資訊：
- 日誌編號（唯讀，系統自動產生，格式 WD202606040001）
- 員工編號 + 員工姓名（唯讀，從登入者帶入）
- 日期（必填，DatePicker，預設今日）
- 當日班別（下拉選單，從 shift_types 載入）

左欄下方 — 簽核資訊：
- 「本人已閱讀」Checkbox（送出前需勾選）
- 送出後顯示送出時間戳記

右欄 — 工作細項內容：
- 「＋新增項目」按鈕，動態新增工作細項 Row
- 每筆細項含：工作摘要（必填）、時數（必填）、完成度（%）、刪除按鈕
- 底部即時顯示合計時數
- 無細項時顯示空白狀態「目前沒有工作項目 · 點此新增第一項工作」

右欄下方 — 附件檔案：
- 「＋新增附件」區域：拖拉或點擊上傳
- 已上傳附件列表：顯示檔名 / 大小 / 下載連結 / 刪除按鈕

頂部操作按鈕列：
- [取消]  [儲存草稿]  [送出]

### P04 — 月曆視圖（/calendar）

- 月份格狀日曆，每格顯示當日日誌狀態顏色圓點（橘 = 草稿，綠 = 已送出，空 = 未填）
- 點擊有日誌的日期，跳出快速預覽浮層（Popover）顯示摘要與操作按鈕

# 第七章　操作流程

## 7.1 員工新增日誌標準流程

Step 1  →  點擊「＋新增今日日誌」
- 前端呼叫 POST /worklogs，建立 DRAFT 日誌，取得 log_no 與 id
- 系統自動帶入今日日期，導向編輯頁 /logs/{id}/edit

Step 2  →  填寫基本資訊
- 確認日期（DatePicker，預設今日）
- 選擇當日班別（下拉選單）

Step 3  →  新增工作細項
- 點「＋新增項目」，輸入工作摘要、時數、完成百分比
- 可重複新增多筆，底部即時顯示加總時數

Step 4  →  上傳附件（選填）
- 拖拉或點擊上傳，呼叫 POST /worklogs/{id}/attachments
- 上傳後列表顯示檔名，可刪除

Step 5  →  勾選「本人已閱讀」
- 左欄 Checkbox 勾選，確認內容正確

Step 6  →  儲存草稿 或 送出
- 草稿：點「儲存草稿」→ PUT /worklogs/{id}，status 維持 DRAFT，可繼續編輯
- 送出：點「送出」→ POST /worklogs/{id}/submit，status 改為 SUBMITTED
- 送出後日誌進入唯讀模式，僅可查看不可編輯

## 7.2 日誌編號產生邏輯

格式：WD + YYYYMMDD + 4 位流水號（當日）
範例：WD202606040001（2026/06/04 當日第 1 筆）

後端實作建議（C# 範例，Dapper）：

```
var today = DateOnly.FromDateTime(DateTime.Today);
var count = await connection.ExecuteScalarAsync<int>(
    "SELECT COUNT(*) FROM work_logs WHERE log_date = @today AND employee_id = @employeeId",
    new { today, employeeId });
var logNo = $"WD{today:yyyyMMdd}{(count + 1):D4}";
```

# 第八章　前端 React 實作指引

## 8.1 環境建置

```
# 建立 React + Vite 專案
mkdir frontend && cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install axios zustand react-router-dom @tanstack/react-query
npm install oidc-client-ts
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

- `@tailwindcss/vite` 需加進 vite.config.ts 的 plugins；`shadcn init` 會一併設定 `@/` path alias 與 `components.json`
- UI 元件用 `npx shadcn@latest add button input dialog` 之類指令按需加入，不整包引入
- 開發 port 統一用 `6171`（非 Vite 預設 5173），需在 `vite.config.ts` 加上 `server: { port: 6171 }`，並跟下面 8.2 的 OIDC redirect URI、Keycloak client 設定的 port 保持一致

## 8.2 環境變數設定（.env）

```
VITE_API_BASE_URL=https://localhost:7001/api
VITE_OIDC_AUTHORITY=https://ktgh-sso.ktgh.com.tw/realms/dev
VITE_OIDC_CLIENT_ID=work-log-frontend
VITE_OIDC_REDIRECT_URI=http://localhost:6171/callback
VITE_OIDC_SILENT_REDIRECT_URI=http://localhost:6171/silent-callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:6171/
VITE_OIDC_SCOPE=openid profile email
VITE_OIDC_AUTOMATIC_SILENT_RENEW=true
```

- `VITE_OIDC_SILENT_REDIRECT_URI` 這個網址要能被 Keycloak 用隱藏 iframe 載入，Keycloak client 設定的 redirect URI 清單要一併加入，否則 Silent Renew 會失敗
- `VITE_OIDC_SCOPE` 沒加 `offline_access`，代表不核發 Refresh Token；Access Token 過期只能靠 Silent Renew（仍在 Keycloak session 有效期內）換新，Keycloak session 本身過期就必須整頁重新登入

## 8.3 Axios / TanStack Query 基礎設定

```
// lib/apiClient.ts
import axios from 'axios'
import { userManager } from '@/features/authentication/lib/userManager'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

apiClient.interceptors.request.use(async (config) => {
  const user = await userManager.getUser()
  if (user?.access_token) config.headers.Authorization = `Bearer ${user.access_token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) userManager.signinRedirect()
    return Promise.reject(err)
  }
)
```

```
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
})
```

## 8.4 oidc-client-ts 設定與 Zustand Store（authStore）

```
// features/authentication/lib/userManager.ts
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

export const userManager = new UserManager({
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  silent_redirect_uri: import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
  response_type: 'code',
  scope: import.meta.env.VITE_OIDC_SCOPE,
  automaticSilentRenew: import.meta.env.VITE_OIDC_AUTOMATIC_SILENT_RENEW === 'true',
  // Token 快過期前幾秒觸發 Silent Renew，預設 60 秒，開發時可調小方便測試
  accessTokenExpiringNotificationTimeInSeconds: 60,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
})
```

```
// features/authentication/store/authStore.ts
import { create } from 'zustand'
import type { User } from 'oidc-client-ts'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

```
// features/authentication/lib/initAuth.ts
import { userManager } from './userManager'
import { useAuthStore } from '../store/authStore'

// 應用程式啟動時呼叫一次，還原既有登入狀態並訂閱 Token 事件
export async function initAuth() {
  const user = await userManager.getUser()
  useAuthStore.getState().setUser(user)

  userManager.events.addUserLoaded((user) => useAuthStore.getState().setUser(user))
  userManager.events.addUserUnloaded(() => useAuthStore.getState().setUser(null))

  // Silent Renew 失敗（例如 Keycloak session 已過期）就整頁導回登入
  userManager.events.addSilentRenewError(() => userManager.signinRedirect())
}
```

```
// features/authentication/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore'
import { userManager } from '../lib/userManager'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  return {
    isAuthenticated: !!user && !user.expired,
    accessToken: user?.access_token,
    logout: () => userManager.signoutRedirect(user?.id_token ? { id_token_hint: user.id_token } : undefined),
  }
}
```

```
// features/authentication/index.ts
export { useAuth } from './hooks/useAuth'
export { useAuthStore } from './store/authStore'
export { userManager } from './lib/userManager'
export { initAuth } from './lib/initAuth'
```

## 8.5 登入 Callback 與本地員工資料建立

登入不再是本系統的 API 呼叫——`ProtectedRoute` 偵測到未登入時會直接呼叫 `userManager.signinRedirect()` 導去 Keycloak。使用者在 Keycloak 完成登入後，會被導回 `/callback`，由 `CallbackPage` 負責交換 Token 並建立本地員工資料：

```
// pages/CallbackPage.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userManager } from '@/features/authentication'
import { apiClient } from '@/lib/apiClient'

export default function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(() => apiClient.get('/auth/me'))
      .then(() => navigate('/dashboard', { replace: true }))
  }, [navigate])

  return <p>登入中…</p>
}
```

`automaticSilentRenew: true` 讓 `userManager` 在 Access Token 快過期時，自動在隱藏 iframe 載入 `silent_redirect_uri`，換到新 Token 就把 iframe 關掉——使用者完全無感，不會中斷正在填寫的表單。這個網址需要一個對應的極簡頁面，只負責把回應交還給 `userManager`：

```
// pages/SilentCallbackPage.tsx
import { useEffect } from 'react'
import { userManager } from '@/features/authentication'

export default function SilentCallbackPage() {
  useEffect(() => {
    userManager.signinSilentCallback().catch(console.error)
  }, [])

  return null
}
```

## 8.6 React Router 路由定義

```
// router/ProtectedRoute.tsx
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth, userManager } from '@/features/authentication'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) userManager.signinRedirect()
  }, [isAuthenticated])

  return isAuthenticated ? <Outlet /> : null
}
```

```
// router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import CallbackPage from '@/pages/CallbackPage'
import SilentCallbackPage from '@/pages/SilentCallbackPage'
import DashboardPage from '@/pages/DashboardPage'
import EditLogPage from '@/pages/EditLogPage'
import CalendarPage from '@/pages/CalendarPage'

export const router = createBrowserRouter([
  { path: '/callback', element: <CallbackPage /> },
  { path: '/silent-callback', element: <SilentCallbackPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/logs/new', element: <EditLogPage /> },
      { path: '/logs/:id/edit', element: <EditLogPage /> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '*', element: <DashboardPage /> },
    ],
  },
])
```

改用 `createBrowserRouter`（不是原本的 `createHashRouter`）——Keycloak 導回 `/callback` 時網址是真實路徑加 query string（`?code=...&state=...`），不是 `#` 後面的 hash，`createHashRouter` 會抓不到這個路徑。副作用是正式部署時 Nginx／IIS 需要設定「所有非 API 路徑都 fallback 回 `index.html`」的 rewrite 規則，不然重新整理 `/dashboard` 這類子路徑會 404。

App 啟動時（`main.tsx`）需先呼叫 `initAuth()` 還原登入狀態，待其完成後才 render `<RouterProvider>`，避免 `ProtectedRoute` 在狀態還原前誤判為未登入而觸發不必要的 redirect。

## 8.7 WorkLog API 封裝（TanStack Query）

```
// features/worklog/api/types.ts
export interface WorkLog {
  id: string
  logNo: string
  logDate: string
  status: 'DRAFT' | 'SUBMITTED'
  totalHours: number | null
}
```

```
// features/worklog/api/useGetMyLogs.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { WorkLog } from './types'

export function useGetMyLogs(year: number, month: number) {
  return useQuery({
    queryKey: ['worklogs', year, month],
    queryFn: async () => {
      const response = await apiClient.get<{ data: WorkLog[] }>('/worklogs', {
        params: { year, month },
      })
      return response.data.data
    },
  })
}
```

```
// features/worklog/api/useCreateLog.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { WorkLog } from './types'

export function useCreateLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<WorkLog>('/worklogs')
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worklogs'] }),
  })
}
```

```
// features/worklog/api/useSubmitLog.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export function useSubmitLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/worklogs/${id}/submit`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worklogs'] }),
  })
}
```

```
// features/worklog/api/useUploadAttachment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export function useUploadAttachment(logId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post(`/worklogs/${logId}/attachments`, form)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worklogs', logId] }),
  })
}
```

# 第九章　後端 ASP.NET Core 實作指引（KTGH Modular Monolith）

## 9.1 環境建置

不手動 `dotnet new webapi`，用 `ktgh-api` skill scaffold（內部呼叫 `New-KtghApi.ps1`），一次產生完整 Modular Monolith 結構，已內建 Dapper、FluentMigrator、Carter、JWT Bearer 套件參照：

```
pwsh -File New-KtghApi.ps1 -SolutionName WorkLog -ModuleName WorkLogs -TargetDirectory work-log/
```

產生的 repo 根目錄命名為 `WorkLog.API`（比照 Knect.API 慣例），內部 Solution／Host 專案名稱是 `WorkLog`，詳細結構見 2.2。

## 9.2 appsettings.json 與 Program.cs

```
// src/WorkLog.API.Host/appsettings.json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=WorkLog;Username=postgres;Password=postgres"
  },
  "Keycloak": {
    "Authority": "https://ktgh-sso.ktgh.com.tw/realms/dev"
  }
}
```

```
// src/WorkLog.API.Host/Program.cs（節錄，由 scaffold 產生）
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true; // work_logs.log_date ↔ WorkLog.LogDate 自動對應

builder.Services
    .AddAuthentication(options => {
        options.DefaultAuthenticateScheme = "Bearer";
        options.DefaultChallengeScheme = "Bearer";
    })
    .AddJwtBearer("Bearer", options => {
        options.Authority = builder.Configuration["Keycloak:Authority"];
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = false, // 未驗證 audience，之後要嚴格驗證需補上 Audience 設定並改 true
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes("Bearer")
        .RequireAuthenticatedUser()
        .Build());

builder.Services.AddCarter();
builder.Services.AddHttpContextAccessor();
builder.Services.AddCommonModule().AddCommonInfrastructure();
builder.Services.AddWorkLogsModule(builder.Configuration).AddWorkLogsInfrastructure(builder.Configuration);

var connectionString = builder.Configuration.GetConnectionString("Default")!;
builder.Services.AddSingleton<IDbConnectionFactory>(new NpgsqlConnectionFactory(connectionString));
```

## 9.3 WorkLog 聚合根與 Repository 介面

`Modules.WorkLogs.Domains` 只放聚合根與介面，不含資料存取邏輯。scaffold 產生的預設 stub 類別叫 `WorkLogs`（跟模組同名，單純沿用 ModuleName），Stage 7 實作時要改名成單數 `WorkLog`，避免跟模組名稱混淆：

```
// src/Modules/WorkLogs/Modules.WorkLogs.Domains/WorkLogsAggregate/WorkLog.cs
namespace Modules.WorkLogs.Domains.WorkLogsAggregate;

public class WorkLog : Entity, IAggregateRoot {
  public string LogNo { get; set; } = string.Empty;
  public Guid EmployeeId { get; set; }
  public DateOnly LogDate { get; set; }
  public Guid? ShiftTypeId { get; set; }
  public decimal? TotalHours { get; set; }
  public string Status { get; set; } = "DRAFT";
  public bool SelfRead { get; set; }
  public DateTime? SubmittedAt { get; set; }
  public List<WorkItem> WorkItems { get; set; } = new();
}

public class WorkItem {
  public Guid Id { get; set; }
  public short Seq { get; set; }
  public string TaskName { get; set; } = string.Empty;
  public string? Description { get; set; }
  public decimal Hours { get; set; }
  public short? Progress { get; set; }
}
```

```
// src/Modules/WorkLogs/Modules.WorkLogs.Domains/WorkLogsAggregate/IWorkLogsRepository.cs
namespace Modules.WorkLogs.Domains.WorkLogsAggregate;

public interface IWorkLogsRepository : IRepository<WorkLog> {
  Task<IEnumerable<WorkLog>> GetByEmployeeAndMonthAsync(Guid employeeId, int year, int month);
  Task<WorkLog?> GetByIdAsync(Guid id, Guid employeeId);
  Task<int> CountByEmployeeAndDateAsync(Guid employeeId, DateOnly date);
  Task AddAsync(WorkLog workLog);
  Task UpdateStatusAsync(Guid id, string status, DateTime? submittedAt);
}
```

## 9.4 Carter Module + Handler（取代傳統 Controller）

每個 Use Case 是 `Features/<UseCase>/` 底下一組 Module + Handler，不使用 `[ApiController]`：

```
// src/Modules/WorkLogs/Modules.WorkLogs.Features/Features/GetWorkLogs/GetWorkLogsModule.cs
using Carter;

namespace Modules.WorkLogs.Features.Features.GetWorkLogs;

public class GetWorkLogsModule : ICarterModule {
  public void AddRoutes(IEndpointRouteBuilder app) {
    app.MapGet("worklogs", Handle).RequireAuthorization();
  }

  private static async Task<IResult> Handle(
      [FromQuery] int year, [FromQuery] int month,
      ClaimsPrincipal user, [FromServices] IGetWorkLogsHandler handler,
      [FromServices] IEmployeesRepository employees) {
    var employeeId = await employees.GetIdByEmployeeNoAsync(
      (user.FindFirstValue("preferred_username") ?? "").Trim().ToUpperInvariant());
    var result = await handler.HandleAsync(employeeId, year, month);
    return Results.Ok(new { success = true, data = result });
  }
}
```

```
// src/Modules/WorkLogs/Modules.WorkLogs.Features/Features/GetWorkLogs/GetWorkLogsHandler.cs
namespace Modules.WorkLogs.Features.Features.GetWorkLogs;

public interface IGetWorkLogsHandler : IHandler {
  Task<IEnumerable<WorkLog>> HandleAsync(Guid employeeId, int year, int month);
}

public class GetWorkLogsHandler(IWorkLogsRepository repository) : IGetWorkLogsHandler {
  public Task<IEnumerable<WorkLog>> HandleAsync(Guid employeeId, int year, int month)
    => repository.GetByEmployeeAndMonthAsync(employeeId, year, month);
}
```

`IGetWorkLogsHandler` 繼承 Common.Features 提供的 `IHandler`，`HandlerRegistrationExtensions.RegisterHandlersFromAssemblyContaining`（在 `AddWorkLogsModule` 裡呼叫）會自動掃描註冊，不用每個 Handler 手動 `AddScoped`。

送出日誌（`POST /worklogs/{id}/submit`）的邏輯搬進 Handler，狀態檢查不再靠 Controller if-else：

```
// src/Modules/WorkLogs/Modules.WorkLogs.Features/Features/SubmitWorkLog/SubmitWorkLogHandler.cs
public interface ISubmitWorkLogHandler : IHandler {
  Task<(bool Success, string? Error)> HandleAsync(Guid id, Guid employeeId);
}

public class SubmitWorkLogHandler(IWorkLogsRepository repository) : ISubmitWorkLogHandler {
  public async Task<(bool, string?)> HandleAsync(Guid id, Guid employeeId) {
    var log = await repository.GetByIdAsync(id, employeeId);
    if (log is null) return (false, "找不到日誌");
    if (log.Status != "DRAFT") return (false, "只有草稿狀態才能送出");

    await repository.UpdateStatusAsync(id, "SUBMITTED", DateTime.UtcNow);
    return (true, null);
  }
}
```

Dapper Repository 實作（`Modules.WorkLogs.Infrastructure`），手寫 SQL 取代 EF Core LINQ：

```
// src/Modules/WorkLogs/Modules.WorkLogs.Infrastructure/Repositories/WorkLogsRepository.cs
public class WorkLogsRepository(IDbConnectionFactory connFactory) : IWorkLogsRepository {
  public async Task<IEnumerable<WorkLog>> GetByEmployeeAndMonthAsync(Guid employeeId, int year, int month) {
    using var conn = await connFactory.CreateAsync();
    return await conn.QueryAsync<WorkLog>(
      @"SELECT * FROM work_logs
        WHERE employee_id = @employeeId
          AND EXTRACT(YEAR FROM log_date) = @year
          AND EXTRACT(MONTH FROM log_date) = @month
        ORDER BY log_date DESC",
      new { employeeId, year, month });
  }

  public async Task<int> CountByEmployeeAndDateAsync(Guid employeeId, DateOnly date) {
    using var conn = await connFactory.CreateAsync();
    return await conn.ExecuteScalarAsync<int>(
      "SELECT COUNT(*) FROM work_logs WHERE employee_id = @employeeId AND log_date = @date",
      new { employeeId, date });
  }

  // GetByIdAsync、AddAsync、UpdateStatusAsync 略，同樣是手寫 SQL + Dapper 參數化查詢
}
```

## 9.5 JIT Provisioning — /auth/me

公司 Keycloak 的 `preferred_username` claim 就是員工工號（例如 G033），跟既有 `employees.employee_no` 天生對得上。比對前統一 UPPER + Trim，避免大小寫或空白造成比對不到：

```
// Features/Me/MeModule.cs
public class MeModule : ICarterModule {
  public void AddRoutes(IEndpointRouteBuilder app) {
    app.MapGet("auth/me", Handle).RequireAuthorization();
  }

  private static async Task<IResult> Handle(
      ClaimsPrincipal user, [FromServices] IGetOrCreateEmployeeHandler handler) {
    var employeeNo = (user.FindFirstValue("preferred_username") ?? "").Trim().ToUpperInvariant();
    var employee = await handler.HandleAsync(
      employeeNo,
      user.FindFirstValue("name") ?? "",
      user.FindFirstValue("email") ?? "",
      user.FindFirstValue("department"));
    return Results.Ok(new { success = true, data = employee });
  }
}
```

```
// GetOrCreateEmployeeHandler.cs — 唯一「建立」本地員工資料的地方（第一次登入時 upsert）
public interface IGetOrCreateEmployeeHandler : IHandler {
  Task<Employee> HandleAsync(string employeeNo, string name, string email, string? departmentCode);
}

public class GetOrCreateEmployeeHandler(IEmployeesRepository repository) : IGetOrCreateEmployeeHandler {
  public async Task<Employee> HandleAsync(string employeeNo, string name, string email, string? departmentCode) {
    var existing = await repository.GetByEmployeeNoAsync(employeeNo);
    if (existing is not null) return existing;

    var departmentId = string.IsNullOrWhiteSpace(departmentCode)
      ? (Guid?)null
      : await repository.FindOrCreateDepartmentAsync(departmentCode); // department claim find-or-create

    return await repository.CreateAsync(employeeNo, name, email, departmentId);
  }
}
```

**待 Stage 7 決定的架構問題：** 員工／部門資料（`/auth/me`、JIT Provisioning）屬於「員工資料」而非「工作日誌」，職責上不該塞進 `WorkLogs` 模組。可以另開一個 `Employees` 模組（`Modules.Employees.*`），透過它的 PublicApi 讓 `WorkLogs` 模組查詢 `employeeId`；或因為 `employees`／`departments` 是跨模組共用的基礎資料，先放進 `Common` 模組也是合理選項。兩種都符合「模組間不直接參照對方 Domains」的規則，差別在於未來模組變多時的擴充彈性，Stage 7 實作時再定案。

# 第十章　單人開發時程建議

## 10.1 開發時程（1 人 · 6 週）

| 週次 | 任務重點 | 預期產出 |
| --- | --- | --- |
| Week 1 | 環境建置 + 資料庫 + 登入 | PostgreSQL 建表完成、FluentMigrator Migration 成功、Keycloak 登入串接完成（Authorization Code + PKCE）、React 路由骨架建立 |
| Week 2 | 工作日誌 CRUD API + 總覽頁前端 | GET/POST/PUT/DELETE /worklogs API 完成、Swagger 可測試、總覽頁列表顯示正確 |
| Week 3 | 編輯頁前端 — 基本資訊 + 工作細項 | 編輯頁基本資訊欄位、工作細項動態新增/刪除/時數加總功能完成 |
| Week 4 | 附件上傳 + 送出流程 | 附件上傳 API 完成、前端拖拉上傳元件、送出按鈕狀態切換正確 |
| Week 5 | 統計卡 + 月曆視圖 | 統計卡數字正確計算、月曆視圖狀態顯示、快速預覽 Popover |
| Week 6 | UI 細節優化 + 整合測試 + 展示準備 | 全頁面 RWD 調整、錯誤處理（Token 過期/驗證失敗）、展示 Demo 資料準備 |

## 10.2 每週工作量估算

| 週次 | 前端（小時） | 後端（小時） | 合計（小時） | 備註 |
| --- | --- | --- | --- | --- |
| Week 1 | 4 | 6 | 10 | 環境設定較耗時，正常 |
| Week 2 | 8 | 8 | 16 | 核心功能週，最重要 |
| Week 3 | 10 | 4 | 14 | 前端工作量較重 |
| Week 4 | 8 | 6 | 14 | 附件上傳需注意 CORS |
| Week 5 | 8 | 2 | 10 | 以前端為主 |
| Week 6 | 6 | 2 | 8 | 收尾與展示準備 |
| 合計 | 44 | 28 | 72 | 約 6 週 × 每週 12 小時 |

## 10.3 開發建議事項

- 先完成後端 API（Swagger 測試通過）再開始接前端，避免等待
- 使用 Git 做版本控管，每個功能一個 branch，完成後 merge 到 main
- Week 1 就建立測試帳號與測試資料（Seed Data），方便後續開發時使用
- 附件上傳注意設定 CORS 與檔案大小限制（建議 10MB 上限）
- Token 過期時間由 Keycloak realm 設定控管（非本系統 appsettings），前端統一實作 401 自動觸發 `signinRedirect()`
- 遇到卡關優先查 Swagger 確認 API 是否正常，再排查前端問題

## 10.4 驗收 Checklist

- [ ] 可登入、登出，Token 過期自動導向登入
- [ ] 新增日誌自動產生 log_no（格式 WDYYYYMMDDxxxx）
- [ ] 可儲存草稿，重新進入繼續編輯
- [ ] 工作細項可動態新增 / 刪除，自動加總時數
- [ ] 可上傳附件，可下載、刪除
- [ ] 勾選「本人已閱讀」後送出，狀態改為已送出
- [ ] 已送出日誌變唯讀（不可編輯）
- [ ] 總覽頁統計卡數字正確
- [ ] 月份切換列表正確過濾
- [ ] 月曆視圖顯示各日狀態顏色

# 第十一章　分期開發規劃

第十章的六週時程是總覽式排法；本章把功能拆成三個 Phase，每個 Phase 結束都是一個「範圍窄但完整可跑」的系統，而不是半成品。

## 11.1 Phase 1 — 核心流程打通（MVP）

**目標：** 登入 → 新增日誌 → 填細項 → 送出 → 查詢，完整跑一輪。

| 類型 | 項目 |
| --- | --- |
| Use Case | UC-01 登入（Keycloak）、UC-03 新增日誌、UC-04 編輯基本資訊、UC-05 工作細項（新增/刪除+加總）、UC-07 儲存草稿、UC-08 送出、UC-10 刪除草稿、UC-02（簡化版，僅列表無統計卡） |
| 身份驗證 | Keycloak Authorization Code + PKCE（oidc-client-ts），後端以 JWKS 驗證 Bearer Token，不自行核發 Token；含 Silent Renew（避免填表填到一半被登出）與登出 |
| 後端 API | `/auth/me`（JIT Provisioning）、`/worklogs`（GET/POST/PUT/DELETE）、`/worklogs/{id}/submit`、`/worklogs/{logId}/items`（POST/PUT/DELETE） |
| 資料表 | departments、employees（employee_no 對應 Keycloak preferred_username）、shift_types、work_logs、work_items（work_attachments 這階段先不建） |
| 前端頁面 | CallbackPage、SilentCallbackPage、DashboardPage（純列表，無統計卡，含登出按鈕）、EditLogPage（基本資訊+細項+儲存/送出）、ProtectedRoute、路由骨架 |
| 驗收標準 | 未登入自動導向 Keycloak，登入後導回 /callback 並成功建立本地員工資料；Access Token 快過期時 Silent Renew 自動換新、不中斷操作；登出可正常導回 Keycloak 登出；新增日誌自動產生 log_no；細項新增/刪除即時加總；草稿可重新編輯；送出後狀態變 SUBMITTED 且唯讀；列表可依月份篩選看到剛建立的日誌 |

## 11.2 Phase 2 — 附件與統計

**目標：** 補齊日誌內容完整性與總覽頁的量化資訊。

| 類型 | 項目 |
| --- | --- |
| Use Case | UC-06 附件上傳/預覽/刪除、UC-02 統計卡（填寫率/待送出/已完成） |
| 後端 API | `/worklogs/{logId}/attachments`（POST/GET/DELETE）、`/worklogs/stats` |
| 資料表 | work_attachments |
| 前端頁面 | EditLogPage 加附件區塊、DashboardPage 加統計卡（3 欄） |
| 驗收標準 | 可上傳圖片/PDF 並預覽、下載、刪除；統計卡數字與當月實際資料一致 |

## 11.3 Phase 3 — 月曆視圖與體驗優化

**目標：** 補齊次要視覺功能，收斂成可展示的完整系統。

| 類型 | 項目 |
| --- | --- |
| Use Case | UC-09 月曆視圖 + 快速預覽 Popover |
| 前端 | CalendarPage、狀態顏色圓點、Popover 摘要 |
| 非功能項 | Loading / Empty States、RWD 調整 |
| 收尾 | 整合測試、Demo 資料準備 |
| 驗收標準 | 月曆各日狀態顏色正確；手機/桌機版面正常 |

WorkLog 系統分析書  v2.0  ·  2026
