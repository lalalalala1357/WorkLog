# WorkLog API 合約（Stage 1 定案）

本文件是 Mockoon 假資料與後端 DTO 的唯一真相來源。欄位命名、狀態碼、錯誤格式都以此為準；後端實作時如果想改格式，回頭改這份文件並重新對齊 Mockoon，不要私自在 DTO 裡各自發揮。

對應範圍：系統分析書第五章端點規格 + Phase 1 開發細節 Stage 1 checklist。Phase 1 不含附件（`work_attachments`）與統計卡（`/worklogs/stats`），因此本合約不涵蓋這兩塊，留到 Phase 2。

> **本合約補上一支 Stage 1 checklist 沒列、但系統分析書 P03（6.2）需要的端點：`GET /shift-types`。** 編輯頁的「當日班別」下拉選單需要資料來源，系統分析書 5.3/5.4/5.5 沒有定義對應端點，判斷是規格遺漏，先補上，若不需要請告知我拿掉。

---

## 0. 通用規範

- Base URL：`https://localhost:7001/api`（Stage 2 起，前端 `VITE_API_BASE_URL` 先指向 Mockoon `http://localhost:3001`，路徑結構相同）
- 所有 Request / Response 一律 JSON，欄位命名 **camelCase**（ASP.NET Core 預設輸出即為 camelCase，Mockoon 假資料要手動對齊，不要留成 snake_case）
- 需登入端點：Header 帶 `Authorization: Bearer {token}`
- 日期欄位（`logDate`）格式 `YYYY-MM-DD`，不含時間
- 時間戳欄位（`createdAt` / `updatedAt` / `submittedAt`）格式 ISO 8601 UTC，例：`2026-07-20T08:15:30Z`
- 統一回應結構：

```ts
interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string | null
  errors: FieldError[] | null   // 只有欄位驗證錯誤時才是陣列，其餘情況為 null
}

interface FieldError {
  field: string
  message: string
}
```

- 狀態碼慣例：
  - `200` — GET / PUT / POST（含 submit）/ DELETE 皆用 200，統一由 `success` 欄位判斷成敗（DELETE 不用 204，維持回應結構一致，方便前端攔截器統一處理）
  - `201` — POST 建立資源成功（`POST /worklogs`、`POST /worklogs/{logId}/items`）
  - `400` — 業務規則錯誤（狀態不允許）或欄位驗證錯誤
  - `401` — 未帶 Token 或 Token 無效
  - `404` — 查無資源，或該資源不屬於目前登入者（見下方安全性備註）
  - `500` — 未預期錯誤

- **安全性備註：** `worklogs/{id}` 系列端點一律先用 `GetEmployeeIdAsync` 過濾擁有者，查到別人的日誌一律回 `404`（不要回 `403`，避免洩漏「這筆 id 存在但不是你的」）。

---

## 1. `GET /auth/me`

取得目前登入者的本地員工資料；查無則 JIT Provisioning 自動建立。

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a",
    "employeeNo": "G033",
    "name": "王小明",
    "email": "g033@ktgh.org.tw",
    "department": {
      "id": "8a2c1e10-1111-4a1a-9f2a-0f1e2d3c4b5a",
      "name": "資訊部",
      "code": "IT"
    },
    "isActive": true
  },
  "message": null,
  "errors": null
}
```

`department` 可能為 `null`（Keycloak token 沒帶 `department` claim 時）。

---

## 2. `GET /worklogs?year=&month=&status=`

取得我的日誌列表。`year`、`month` 必填；`status`（`DRAFT` / `SUBMITTED`）選填。

**Response 200（涵蓋 DRAFT / SUBMITTED 兩種狀態）**

```json
{
  "success": true,
  "data": [
    {
      "id": "b1e2c3d4-0001-4a1a-9f2a-0f1e2d3c4b5a",
      "logNo": "WD202607200002",
      "logDate": "2026-07-20",
      "status": "DRAFT",
      "summary": "系統需求訪談",
      "totalHours": 4.5
    },
    {
      "id": "b1e2c3d4-0002-4a1a-9f2a-0f1e2d3c4b5a",
      "logNo": "WD202607180001",
      "logDate": "2026-07-18",
      "status": "SUBMITTED",
      "summary": "月結報表撰寫",
      "totalHours": 8.0
    }
  ],
  "message": null,
  "errors": null
}
```

- `summary` = 第一筆 work_item 的 `taskName`；當日誌沒有任何細項時為 `null`
- `totalHours` 沒有細項時為 `null`，不是 `0`

---

## 3. `GET /worklogs/{id}`

取得單筆日誌詳情，含 `workItems` 陣列。

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "b1e2c3d4-0001-4a1a-9f2a-0f1e2d3c4b5a",
    "logNo": "WD202607200002",
    "logDate": "2026-07-20",
    "shiftType": {
      "id": "c2f3a4b5-0001-4a1a-9f2a-0f1e2d3c4b5a",
      "name": "正常班",
      "description": "08:00-12:00, 13:00-17:30"
    },
    "status": "DRAFT",
    "selfRead": false,
    "totalHours": 4.5,
    "submittedAt": null,
    "createdAt": "2026-07-20T01:02:03Z",
    "updatedAt": "2026-07-20T01:10:00Z",
    "workItems": [
      {
        "id": "d3f4a5b6-0001-4a1a-9f2a-0f1e2d3c4b5a",
        "seq": 1,
        "taskName": "系統需求訪談",
        "description": "與臨床單位討論工作日誌欄位",
        "hours": 2.5,
        "progress": 100
      },
      {
        "id": "d3f4a5b6-0002-4a1a-9f2a-0f1e2d3c4b5a",
        "seq": 2,
        "taskName": "API 合約撰寫",
        "description": null,
        "hours": 2.0,
        "progress": 50
      }
    ]
  },
  "message": null,
  "errors": null
}
```

`shiftType` 尚未選擇時為 `null`。

---

## 4. `POST /worklogs`

新增日誌（草稿）。前端呼叫時不帶 body（見系統分析書 8.7 `useCreateLog`），後端自動帶入今日日期、產生 `logNo`。

**Request** — 無 body（或空物件 `{}`）

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": "b1e2c3d4-0003-4a1a-9f2a-0f1e2d3c4b5a",
    "logNo": "WD202607200003",
    "logDate": "2026-07-20",
    "shiftType": null,
    "status": "DRAFT",
    "selfRead": false,
    "totalHours": null,
    "submittedAt": null,
    "createdAt": "2026-07-20T02:00:00Z",
    "updatedAt": "2026-07-20T02:00:00Z",
    "workItems": []
  },
  "message": null,
  "errors": null
}
```

`logNo` 格式：`WD` + `YYYYMMDD` + 4 位流水號（見系統分析書 7.2），流水號依「同一員工、同一天」遞增。

---

## 5. `PUT /worklogs/{id}`

更新日誌基本資訊。限 `DRAFT` 狀態。

**Request**

```json
{
  "logDate": "2026-07-20",
  "shiftTypeId": "c2f3a4b5-0001-4a1a-9f2a-0f1e2d3c4b5a",
  "selfRead": true
}
```

**Response 200（成功）**

```json
{
  "success": true,
  "data": {
    "id": "b1e2c3d4-0001-4a1a-9f2a-0f1e2d3c4b5a",
    "logNo": "WD202607200002",
    "logDate": "2026-07-20",
    "shiftType": {
      "id": "c2f3a4b5-0001-4a1a-9f2a-0f1e2d3c4b5a",
      "name": "正常班",
      "description": "08:00-12:00, 13:00-17:30"
    },
    "status": "DRAFT",
    "selfRead": true,
    "totalHours": 4.5,
    "submittedAt": null,
    "createdAt": "2026-07-20T01:02:03Z",
    "updatedAt": "2026-07-20T03:00:00Z",
    "workItems": [ ]
  },
  "message": null,
  "errors": null
}
```

**Response 400（非 DRAFT 狀態）**

```json
{
  "success": false,
  "data": null,
  "message": "僅能編輯草稿狀態的日誌",
  "errors": null
}
```

---

## 6. `DELETE /worklogs/{id}`

刪除草稿。限 `DRAFT` 狀態。

**Response 200（成功）**

```json
{
  "success": true,
  "data": null,
  "message": "刪除成功",
  "errors": null
}
```

非 `DRAFT` 狀態時比照 Stage 1 checklist 錯誤慣例，回 400：

```json
{
  "success": false,
  "data": null,
  "message": "僅能刪除草稿狀態的日誌",
  "errors": null
}
```

---

## 7. `POST /worklogs/{id}/submit`

送出日誌，`DRAFT` → `SUBMITTED`，寫入 `submittedAt`。

**Request** — 無 body

**Response 200（成功）**

```json
{
  "success": true,
  "data": {
    "id": "b1e2c3d4-0001-4a1a-9f2a-0f1e2d3c4b5a",
    "logNo": "WD202607200002",
    "status": "SUBMITTED",
    "submittedAt": "2026-07-20T03:05:00Z"
  },
  "message": null,
  "errors": null
}
```

**Response 400（重複送出）**

```json
{
  "success": false,
  "data": null,
  "message": "此日誌已送出，無法重複送出",
  "errors": null
}
```

---

## 8. WorkItems

### 8.1 `POST /worklogs/{logId}/items`

新增工作細項，`seq` 自動遞增。回應同時帶回後端重新計算後的 `logTotalHours`，前端不用再打一次 `GET /worklogs/{id}` 才能拿到最新合計。

**Request**

```json
{
  "taskName": "API 合約撰寫",
  "description": null,
  "hours": 2.0,
  "progress": 50
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "d3f4a5b6-0002-4a1a-9f2a-0f1e2d3c4b5a",
      "seq": 2,
      "taskName": "API 合約撰寫",
      "description": null,
      "hours": 2.0,
      "progress": 50
    },
    "logTotalHours": 4.5
  },
  "message": null,
  "errors": null
}
```

### 8.2 `PUT /worklogs/{logId}/items/{itemId}`

**Request**

```json
{
  "taskName": "API 合約撰寫（含錯誤格式）",
  "description": "補上統一錯誤格式範例",
  "hours": 3.0,
  "progress": 80
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "d3f4a5b6-0002-4a1a-9f2a-0f1e2d3c4b5a",
      "seq": 2,
      "taskName": "API 合約撰寫（含錯誤格式）",
      "description": "補上統一錯誤格式範例",
      "hours": 3.0,
      "progress": 80
    },
    "logTotalHours": 5.5
  },
  "message": null,
  "errors": null
}
```

### 8.3 `DELETE /worklogs/{logId}/items/{itemId}`

**Response 200**

```json
{
  "success": true,
  "data": {
    "logTotalHours": 2.5
  },
  "message": "刪除成功",
  "errors": null
}
```

### 8.4 非 DRAFT 狀態限制（三支共用）

日誌狀態非 `DRAFT` 時，新增/更新/刪除細項一律回 400：

```json
{
  "success": false,
  "data": null,
  "message": "已送出的日誌無法修改工作細項",
  "errors": null
}
```

---

## 9.（補充端點）`GET /shift-types`

供 P03 編輯頁「當日班別」下拉選單使用。系統分析書 5.3/5.4/5.5 未定義，判斷是規格遺漏後補上（見文件開頭說明）。

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "c2f3a4b5-0001-4a1a-9f2a-0f1e2d3c4b5a",
      "name": "正常班",
      "description": "08:00-12:00, 13:00-17:30",
      "totalHours": 8.0
    },
    {
      "id": "c2f3a4b5-0002-4a1a-9f2a-0f1e2d3c4b5a",
      "name": "夜班",
      "description": "20:00-08:00",
      "totalHours": 12.0
    }
  ],
  "message": null,
  "errors": null
}
```

---

## 10. 統一錯誤格式範例

### 10.1 欄位驗證錯誤（400，`errors` 為陣列）

例：`POST /worklogs/{logId}/items` 缺必填欄位。

```json
{
  "success": false,
  "data": null,
  "message": "輸入資料有誤",
  "errors": [
    { "field": "taskName", "message": "工作摘要為必填" },
    { "field": "hours", "message": "時數必須大於 0" }
  ]
}
```

### 10.2 業務規則錯誤（400，`errors` 為 `null`）

例：非 DRAFT 狀態時 PUT / DELETE / submit（見第 5、6、7、8.4 節），統一走 `message` 單行說明，不用 `errors` 陣列。

### 10.3 未帶 Token（401）

```json
{
  "success": false,
  "data": null,
  "message": "未授權，請重新登入",
  "errors": null
}
```

### 10.4 查無資源 / 非本人日誌（404）

```json
{
  "success": false,
  "data": null,
  "message": "找不到指定的日誌",
  "errors": null
}
```

---

## 驗收（對應 Stage 1 驗證標準）

這份合約寫完，前端工程師不用等後端，光看這份就能開始刻頁面；後端工程師之後也是照這份實作 DTO，不用另外開會對格式。Stage 2 Mockoon 假資料、Stage 7 後端 DTO 都要逐欄位對齊本文件；若任一方需要偏離，先回來改這份文件再動工。
