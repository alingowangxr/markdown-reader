# Markdown Reader Overlay v1.0

Read webpages in a distraction-free markdown overlay mode without breaking browser history. A professional tool designed for long-form readers and knowledge base (Obsidian/Notion) collectors.

## 🌟 Features

- **Reading Experience:** 
    - Full-screen distraction-free overlay with smooth transitions.
    - **Multi-theme support:** Dark, Light, and Sepia modes.
    - **Adjustable typography:** Custom font sizes for comfortable reading.
    - **Smart Outline (ToC):** Automatically generated Table of Contents for easy navigation.
- **Content Collection & Personalization:**
    - **Custom YAML Template:** Define your own metadata structure for your knowledge base.
    - **Custom Filename Template:** Master your file naming with smart truncation and unique IDs.
    - **Image Localization:** Download all images and package them into a **ZIP** file with relative Markdown links (Perfect for search engine indexing).
    - **One-click Export:** Copy to clipboard, download as `.md`, or save directly to **Obsidian**.
- **Privacy & Stability:**
    - **Absolute URL Fixing:** Ensures all images and links work in any external Markdown editor.
    - No history hijacking.
    - XSS sanitization via DOMPurify.
    - Local-only processing.

## 🚀 Installation

1. Open **Chrome**.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select this repository's root folder.

## ⚙️ Template Customization

You can use the following placeholders in both **YAML** and **Filename** templates:

| Placeholder | Description | Example |
| :--- | :--- | :--- |
| `#title#` | Article title (truncated to 20 chars for filename) | `How to learn Python` |
| `#fulltitle#` | Complete article title (sanitized) | `How to learn Python in 2024` |
| `#date#` | Short date format (YYMMDD) | `260510` |
| `#isoDate#` | Standard date format (YYYY-MM-DD) | `2026-05-10` |
| `#author#` | Detected author name | `John Doe` |
| `#domain#` | Source website domain | `medium.com` |
| `#url#` | Original article URL | `https://...` |
| `#hash#` | 4-character unique hash from URL | `a7b3` |

## 🛠 Third-Party Libraries & Licenses

| Library | License | Description |
| :--- | :--- | :--- |
| [Readability.js](https://github.com/mozilla/readability) | Apache 2.0 | Article content extraction (Mozilla). |
| [Turndown.js](https://github.com/mixmark-io/turndown) | MIT | HTML to Markdown conversion (Dom Christie). |
| [Marked.js](https://github.com/markedjs/marked) | MIT | High-speed Markdown rendering. |
| [JSZip](https://github.com/Stuk/jszip) | MIT | In-browser ZIP generation. |
| [DOMPurify](https://github.com/cure53/dompurify) | Apache 2.0 | XSS sanitization (Cure53). |

## 📄 License

This project is open-source and available under the **MIT License**.
