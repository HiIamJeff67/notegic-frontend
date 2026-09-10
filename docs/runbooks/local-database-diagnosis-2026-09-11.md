# Local database 診斷 — 2026-09-11

## 結論與範圍

目前 Zen Browser 正式站上的 migration 失敗，已確認是前端 `getVersion()` 誤解 Drizzle SQLite proxy 的 raw query 回傳格式。SQLite 實際版本是 1，前端卻回傳 0。這個錯誤會阻擋登入／註冊的本地同步，並讓下一次初始化再次進入刪檔重建分支。

檢查的本地 HEAD：`87ca7bee863877d5a614d3ff546b54afc8b5f7d8`。
Zen 已載入的正式站 bundle：`https://www.notegic.com/assets/db-Ct2zxo1D.js`。
已安裝的相關套件：SQLocal 0.17.0、Drizzle ORM 0.45.2。

此次只讀取現有頁面診斷與資料庫版本、資料表數量，並執行既有單元測試；未呼叫正式站的 `ensureReady()`、未刪除使用者資料、未重新登入或註冊、未修改應用程式碼或部署。本報告不是宣告所有歷史錯誤或所有瀏覽器情境都已排除。

## 正式站的直接證據

在現有頁面，取得已載入模組中帶有 `getVersion` 方法的 localDB，執行：

```js
{
  raw: await db.get("PRAGMA user_version"),
  parsed: await db.getVersion(),
  tables: await db.get("SELECT count(*) FROM sqlite_master WHERE type = 'table'")
}
```

Zen console 實際輸出：

```json
{"raw":[1],"parsed":0,"tables":[19]}
```

這是同一個頁面、同一個 localDB 連線取得的結果，不是 mock。19 張資料表證明建表已產生結果，但不代表逐一驗證過所有表內容、索引或資料完整性。

既有診斷記錄也顯示：

1. SQLite WASM 初始化完成，`opfsVfs: true`。
2. OPFS driver 初始化完成，`storageType: "opfs"`。
3. 建表與建索引完成。
4. `PRAGMA user_version = 1` 成功。
5. 交易內 `PRAGMA user_version`（`method: "all"`）成功，`rowCount: 1`。
6. `COMMIT` 成功。
7. 交易外 `PRAGMA user_version`（`method: "get"`）成功，`rowCount: 1`。
8. 前端轉為 `failed`：`local database migration stopped at version 0; expected 1.`。

最後版本設定／交易內查詢記錄時間為 `1789062927121`，COMMIT 完成為 `1789062927132`，交易外查詢完成與失敗狀態為 `1789062927135`。這次失敗發生在成功 COMMIT 之後，並非交易回滾或 Worker timeout。

## 根因：混用了兩種查詢 API 的回傳格式

位置：`apps/web/src/api/local/db.ts:384`。

```ts
const getVersion = async (): Promise<number> => {
  const result = await wrappedGet<{ user_version?: number }>(
    `PRAGMA user_version`
  );
  return Math.max(0, Math.trunc(Number(result?.user_version ?? 0)));
};
```

`wrappedGet` 呼叫 Drizzle 的 `get`。SQLocal driver 使用 SQLite 的 `rowMode: 'array'`，`method: 'get'` 回傳第一列陣列。Drizzle 收到沒有欄位映射資訊的 raw SQL 時，直接回傳該列。因此實際值是 `[1]`。

`<{ user_version?: number }>` 只告訴 TypeScript 假設這個型別，不會把陣列轉換成物件。`[1].user_version` 是 `undefined`，`?? 0` 就把成功查詢偽裝成版本 0。

相對地，migration 交易內使用 SQLocal `transaction.query()`，它會根據 columns 將每列轉換成物件，得到 `[{ user_version: 1 }]`。所以 `migrator.ts` 的交易內版本驗證能通過，交易外 `getVersion()` 卻失敗。不要因為外層讀錯，就把交易內物件的讀法也改成陣列。

已核對安裝套件原始碼：

- `node_modules/sqlocal/src/drivers/sqlite-memory-driver.ts`：`execOnDb()`、`rowMode: 'array'`、`case 'get'`。OPFS driver 繼承此實作。
- `node_modules/drizzle-orm/sqlite-proxy/session.js`：`mapGetResult()` 在沒有 fields/customResultMapper 時直接回傳 row。
- `node_modules/sqlocal/src/client.ts`：`beginTransaction()` 中的 `query()` 呼叫 `convertRowsToObjects()`。

官方契約：[Drizzle Proxy](https://orm.drizzle.team/docs/connect-drizzle-proxy)、[SQLocal transaction](https://sqlocal.dev/api/transaction)。

## 為什麼看起來登入、註冊、首頁全部壞掉

登入和註冊共用這條依賴鏈：

```text
登入／註冊 API 回應
  → auth.hook.ts 的 async onSuccess
  → await AuthLocalSynchronizer.syncLogin / syncRegister
  → await localDB.ensureReady()
  → ensureMigrated → getVersion 誤讀 0
  → 建表、設定版本、COMMIT
  → verifyMigrationVersion → getVersion 再次誤讀 0
  → throw
  → mutateAsync 拒絕，頁面 catch 顯示錯誤，正常導頁中斷
```

對應程式位置：

- `apps/web/src/api/hooks/auth.hook.ts:20`、`:60`：API 成功後仍 await 本地同步。
- `apps/web/src/api/local/synchronizers/auth.synchronizer.ts`：各登入／註冊同步方法先 ensureReady。
- `apps/web/src/pages/auth/LoginPage.tsx:40`、`RegisterPage.tsx:41`：導頁位於 mutateAsync 成功之後。

所以後端成功、前端仍顯示登入／註冊失敗，在這個流程下完全可能。此次沒有重送帳號操作或核對所有歷史 HTTP 回應，不能據此宣稱每一次後端回應都成功。

首頁錯誤也有獨立入口：`LocalPreferencesProvider.tsx:211` 在偏好載入後呼叫 `cleanupLocalData()`；後者為了找出 Yjs 清理的使用者命名空間，在 `local-data.cleanup.ts` 呼叫 ensureReady。最後 console 顯示 `Failed to resolve local Yjs cleanup namespace.`，但底層原因仍是 SQLite 版本被讀錯，並不是這條 log 證明 Yjs/IndexedDB 本身壞掉。

主畫面 `TransactionSynchronizerProvider.tsx:1005` 也先 await ensureReady，失敗後停在 unsynchronized。因此不同畫面的多個錯誤可以共享同一個根因。

## 放大問題的重建策略

`db.ts:423` 把 `currentVersion === 0 && targetVersion > 0` 當作重建條件，接著在 `db.ts:432` 呼叫 `recoverOPFSError()`。

`recover.ts:51` 的實際操作是 `sqlocalDrizzle.deleteDatabaseFile()`。它不是只重連，也不是只重跑 migration。

因此目前路徑是：

```text
資料庫版本其實是 1
  → 誤讀為 0
  → 刪除資料庫、重建 schema
  → 成功 COMMIT 版本 1
  → 再誤讀為 0、標記失敗
  → 下一次 ensureReady 重複上述流程
```

這會影響本地 SQL 資料及 SQL 中尚未同步的交易。此次沒有檢查使用者資料內容，不能判定既有資料已損失多少。

就算修正解析，真正的 `user_version = 0` 也只表示版本標記未設定，不足以證明資料庫是空的或可安全刪除。普通的開檔錯誤也不應直接被解讀為可以丟棄所有本地資料。

## 為什麼既有修改和測試沒有解決

- `git blame` 顯示，錯誤的 getVersion 邏輯來自 `9ab604af`（2026-05-11），不是最新那次 COMMIT 驗證才引入。
- `2879b3c` 加強啟動、交易、migration lock 與 bootstrap，但保留錯誤讀法。
- 後續 commits 調整 Worker、資源隔離與診斷。這些可能修掉不同階段的真實問題；目前這次記錄已顯示 Worker/OPFS 啟動成功，不能把所有歷史修改一概視為無效。
- `87ca7be` 加入交易內／交易後版本一致性驗證，但交易後仍使用有問題的 getVersion，所以成功 migration 仍被否決。
- `migrator.test.ts` 測的是獨立 migrator，交易 mock 回傳物件列；這與 SQLocal transaction.query 的格式相符，但沒有跨越外部 Drizzle get → getVersion 的整合邊界。
- 實際執行 `migrator.test.ts`、`local-database-diagnostics.test.ts`、`local-data.cleanup.test.ts`：**3 suites、10 tests 全數通過**。這只能驗證它們涵蓋的範圍，無法證明真實初始化成功。
- `local-database-startup.spec.ts` 等待頁面/networkidle、檢查按鈕和已收集的錯誤，沒有明確等待資料庫 phase=ready 或查出實際版本。networkidle 不能代表 Worker 中資料庫初始化完成。
- 現有 Playwright 配置只有 Chromium、使用開發伺服器。CI 沒有啟用需要 `E2E_RUN_AUTHENTICATED=true` 和 API URL 的 authenticated suites，亦沒有 Firefox/Zen 或正式建置的覆蓋。

## 建議修正與驗收

第一步是修正 getVersion 的回傳格式，並讓無法辨識的結果明確失敗，不要默默當作 0。最小修正方向如下（尚未套用）：

```ts
const getVersion = async (): Promise<number> => {
  const result = await wrappedGet<[number]>(`PRAGMA user_version`);
  const version = result?.[0];
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("Invalid local database user_version result.");
  }
  return version;
};
```

第二步是移除「版本 0 就自動刪檔」的推論：空庫正常 bootstrap；有既存表卻版本未知時保留資料，檢查 schema/遷移來源後再處理。不能只把 CREATE TABLE 改成 IF NOT EXISTS 就視為完成 migration，因為既有欄位和索引也需要一致。

第三步才是調整 auth 的錯誤邊界：區分遠端驗證失敗與本地同步失敗。若支援本地資料庫故障時繼續線上使用，必須一起確認 UserProvider 和後續讀取能走遠端路徑，不能只把同步例外吞掉。這屬於額外容錯，不是修正這次 bug 的替代品。

修正的必要驗收：

1. 真實 SQLocal + Drizzle 連線讀取 user_version=1，getVersion 必須等於 1；空／異常回傳不得被當作可重建的版本 0。
2. 全新測試資料庫完整 ensureReady 後，phase=ready，版本等於 targetVersion。
3. 重複 ensureReady、重載、兩分頁開啟後，保留測試標記資料且不進入刪檔重建。
4. migration 中途失敗時，schema 變更和 user_version 一起回滾。
5. 在隔離的測試帳號環境驗證登入／註冊成功導頁、主畫面同步完成，並明確等待資料庫 ready。
6. Chromium 與 Firefox 類瀏覽器，加上 production build 的 Worker/WASM 資源路徑。

另有一項需獨立驗證的交易隔離風險：一般業務交易仍使用 Drizzle 原生 transaction（db.ts:301），migration 才使用 SQLocal transaction。外層 operation chain 包裝 raw 方法及 transaction，但 query builder/select/insert 等直接使用 rawDriver，未全部進入同一條 chain。SQLocal 官方也建議使用 SQLocal transaction；此項需要併發測試，不能當作這次確診錯誤的原因。

## 對 local database 可行性的判斷

目前證據不足以否定 local database。此例反而直接證明 Zen 中 SQLite/WASM/OPFS 能啟動、建表、COMMIT 並讀出版本 1。已確認的缺陷在前端 adapter 結果解析、重建策略與整合測試覆蓋。

但「資料庫本身能工作」也不代表目前這套整合已達到可靠的 offline-first 行為。需要先修正版本讀取和資料保護，再用重載、多分頁、失敗回滾與實際登入測試驗收；繼續延長 timeout、增加 retry 或要求使用者清除 storage，無法修正這個確定性的解析錯誤。
