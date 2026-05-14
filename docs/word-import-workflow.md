# Word 匯入標準流程（主題 + 題目 + 連結 + 同步）

## 0) 先準備工具（只要做一次）

```powershell
cd C:\codex資料夾\數學公式使用工具
powershell -ExecutionPolicy Bypass -File .\scripts\install_word_pipeline_tools.ps1
.\.venv-word\Scripts\python.exe .\scripts\check_word_pipeline_tools.py
```

## 1) 每匯入一個 Word 檔，固定跑這四步

1. 匯入主題與題庫到 DB 主檔（`program-db/database/formula-db.json`、`program-db/database/question-db.json`）。  
2. 重建題目連結（優先掛主題，無法判斷才掛章節）：  

```powershell
python .\scripts\build_topic_question_links.py
```

3. 同步前端資料：  

```powershell
python .\program-db\scripts\sync_web_data.py
```

4. 驗證（至少檢查 JSON 可解析、id 唯一、抽樣 3 筆）。  

## 2) 主題掛題目規則（目前）

- 第一優先：題目 tags 有 `topic:<topic_id>` 或 `topic=<topic_id>`。  
- 第二優先：同章節內做關鍵詞匹配（`auto-keyword`）。  
- 第三優先：只掛章節（`auto-chapter`）。  

## 3) 產出「重點整理 Word」建議方式

- 先用 Pandoc 把原始 `.docx` 轉成 Markdown（保留圖片）。  
- 依章節模板整理成白話重點（先講「要注意什麼」再給公式）。  
- 再用 Pandoc 輸出 `.docx` 作為重點版講義。  

範例（自行替換檔名）：

```powershell
pandoc "來源.docx" -t gfm --extract-media="exports\word-media\來源" -o "exports\來源.md"
pandoc "exports\來源-重點整理.md" -o "exports\來源-重點整理.docx"
```

