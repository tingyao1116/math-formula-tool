# 程式版資料庫（不修改原網頁）

這個資料夾是獨立版本，不會改動原本的網頁與資料檔。

## 目的

把現有 `data/formula-content.js` 的資料轉成可用程式管理的 JSON 資料庫格式，提供程式化查詢。

## 檔案

- `scripts/export-formula-content.mjs`：從原始 JS 匯出 JSON
- `scripts/build-db.py`：把 JSON 匯入程式資料庫
- `scripts/query.py`：用命令列查詢資料庫
- `scripts/manage.py`：CRUD 管理（新增/讀取/修改/刪除）
- `scripts/gui_app.py`：桌面 GUI 管理介面
- `run-gui.ps1`：啟動 GUI
- `scripts/batch_import.py`：批次匯入（txt/jsonl）
- `web/index.html`：新版獨立網頁主頁
- `run-web.ps1`：啟動本機網頁伺服器
- `sync-web-data.ps1`：同步資料庫到原站資料檔
- `exports/formula-content.records.json`：匯出後的中介資料
- `database/formula-db.json`：最終資料庫

## 使用方式

在專案根目錄執行：

```powershell
node .\program-db\scripts\export-formula-content.mjs
python .\program-db\scripts\build-db.py
python .\program-db\scripts\query.py --keyword 聯立 --limit 5
```

## 常用查詢

```powershell
# 看資料總覽
python .\program-db\scripts\query.py --stats

# 依章節找
python .\program-db\scripts\query.py --chapter 二元一次聯立方程式

# 依年級找
python .\program-db\scripts\query.py --stage 國中 --grade 國一
```

## CRUD 管理

```powershell
# 統計
python .\program-db\scripts\manage.py stats

# 查詢
python .\program-db\scripts\manage.py search --keyword 聯立 --limit 5

# 讀單筆
python .\program-db\scripts\manage.py get --id system-linear-equations

# 新增（JSON 範例檔）
python .\program-db\scripts\manage.py add --json-file .\program-db\examples\new-topic.json

# 更新（只覆蓋給定欄位）
python .\program-db\scripts\manage.py update --id custom-demo-topic --json-file .\program-db\examples\update-topic.json

# 刪除
python .\program-db\scripts\manage.py delete --ids custom-demo-topic
```

## 圖形介面（GUI）

在專案根目錄執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\program-db\run-gui.ps1
```

介面功能：
- 左側清單查詢與選取
- 右側 JSON 編輯
- `儲存（新增/更新）`
- `刪除選取`
- `重載資料庫`

## 批次增加資料

### 1) 文字檔批次（推薦）

可參考範本：
- `program-db/examples/batch-import-template.txt`

匯入指令：

```powershell
python .\program-db\scripts\batch_import.py --file .\program-db\examples\batch-import-template.txt --format txt --mode upsert
```

### 2) JSONL 批次

每行一筆 JSON 物件，再執行：

```powershell
python .\program-db\scripts\batch_import.py --file .\your-data.jsonl --format jsonl --mode upsert
```

`--mode` 說明：
- `upsert`：同 id 就覆蓋更新（預設）
- `insert`：同 id 就略過

## SQLite 結構（主題 + 題庫）

已新增：
- `program-db/sqlite/schema.sql`
- `program-db/scripts/init_sqlite_db.py`
- `program-db/scripts/import_topics_to_sqlite.py`

初始化 SQLite：

```powershell
python .\program-db\scripts\init_sqlite_db.py
```

若路徑權限或編碼造成 SQLite 建檔問題，可改指定英文路徑：

```powershell
python .\program-db\scripts\init_sqlite_db.py --db-path C:\temp\math-db\app.sqlite3
```

把目前主題資料匯入 SQLite（topics 表）：

```powershell
python .\program-db\scripts\import_topics_to_sqlite.py
```

```powershell
python .\program-db\scripts\import_topics_to_sqlite.py --db-path C:\temp\math-db\app.sqlite3
```

核心資料表：
- `topics`：主題
- `questions`：題庫
- `question_images`：題目圖片（一題多圖）
- `topic_questions`：主題與題目關聯（多對多）

## 新版網頁（獨立，不改原網頁）

啟動：

```powershell
powershell -ExecutionPolicy Bypass -File .\program-db\run-web.ps1
```

然後開：
- `http://127.0.0.1:8765/web/index.html`

## 兩個網頁同步同一資料來源

把 `program-db/database/formula-db.json` 同步到原站 `data/formula-content.js`：

```powershell
powershell -ExecutionPolicy Bypass -File .\program-db\sync-web-data.ps1
```

建議流程：
1. 先在 GUI/批次匯入更新資料庫
2. 執行 `sync-web-data.ps1`
3. 重新整理原站與新版網頁

補充：目前 `manage.py`、`batch_import.py`、`gui_app.py` 在寫入資料庫後，會自動同步更新 `data/formula-content.js`。
