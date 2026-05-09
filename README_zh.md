# Markdown Reader Overlay v1.0
### 網頁轉 Markdown 沉浸式閱讀與收藏專家

這是一款專為文章收藏者、研究人員與長文閱讀者設計的 Chrome 擴充功能。它能將混亂的網頁轉化為純淨的 Markdown，並提供高度自定義的收藏選項，完美對接 Obsidian、Logseq 或 Notion 等本地知識庫。

## 🌟 核心功能

- **沉浸式閱讀體驗：**
    - 全螢幕無干擾閱讀介面，具備優雅的動態效果。
    - **多種主題：** 提供深色 (Dark)、淺色 (Light) 以及舒適的羊皮紙 (Sepia) 模式。
    - **自定義排版：** 自由調整字體大小。
    - **智能大綱 (ToC)：** 自動提取標題生成目錄，支援點擊跳轉。
- **強大的收藏與個性化：**
    - **自定義 YAML 模板：** 自由定義 YAML Frontmatter 結構，符合您的標籤習慣。
    - **自定義檔名模板：** 支援多種變數組合，具備智能標題截斷，讓檔案列表井然有序。
    - **圖片在地化：** 一鍵抓取所有圖片並打包為 **ZIP**，自動轉換相對路徑（搜尋引擎友善）。
    - **一鍵導出：** 支援複製到剪貼簿、下載為 `.md` 或直接儲存至 **Obsidian**。
- **穩定性與安全：**
    - **路徑自動修復：** 自動將相對 URL 轉為絕對網址，確保導出的檔案在任何編輯器中圖示皆正常。
    - **安全過濾：** 使用 DOMPurify 進行 XSS 過濾。
    - **隱私第一：** 所有處理皆在本地完成，不上傳任何資料。

## 🚀 安裝指南

1. 開啟 **Chrome 瀏覽器**。
2. 進入擴充功能管理頁面：`chrome://extensions/`。
3. 開啟右上角的 **「開發者模式」**。
4. 點擊 **「載入開發版擴充功能」**。
5. 選擇此專案的 **根目錄**。

## ⚙️ 模板變數說明

您可以在 **YAML** 或 **檔名 (Filename)** 模板中使用以下預留位置：

| 變數 | 描述 | 範例 |
| :--- | :--- | :--- |
| `#title#` | 文章標題（檔名模式下會自動截斷至 20 字） | `如何學習 Python` |
| `#fulltitle#` | 完整文章標題（已過濾非法字元） | `2024年如何快速學習 Python` |
| `#date#` | 簡短日期格式 (YYMMDD) | `260510` |
| `#isoDate#` | 標準日期格式 (YYYY-MM-DD) | `2026-05-10` |
| `#author#` | 偵測到的作者名稱 | `張三` |
| `#domain#` | 來源網站網域（自動移除 www.） | `medium.com` |
| `#url#` | 文章原始網址 | `https://...` |
| `#hash#` | 根據網址生成的 4 位唯一雜湊值 | `a7b3` |

## 🛠 第三方庫與授權

| 函式庫 | 授權協議 | 描述 |
| :--- | :--- | :--- |
| [Readability.js](https://github.com/mozilla/readability) | Apache 2.0 | 網頁正文內容提取 (Mozilla)。 |
| [Turndown.js](https://github.com/mixmark-io/turndown) | MIT | HTML 轉換為 Markdown (Dom Christie)。 |
| [Marked.js](https://github.com/markedjs/marked) | MIT | 高效能 Markdown 渲染。 |
| [JSZip](https://github.com/Stuk/jszip) | MIT | 瀏覽器端 ZIP 打包。 |
| [DOMPurify](https://github.com/cure53/dompurify) | Apache 2.0 | HTML 安全過濾 (Cure53)。 |

## 📄 授權協議

本專案採用 **MIT License** 授權。
