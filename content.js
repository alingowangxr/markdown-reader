(() => {
  if (document.getElementById("md-reader-overlay")) {
    return;
  }

  const article = new Readability(
    document.cloneNode(true)
  ).parse();

  if (!article) {
    alert("Unable to parse article.");
    return;
  }

  // --- NEW: Fix Relative URLs to Absolute URLs ---
  const fixUrls = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    // Fix Images
    tempDiv.querySelectorAll("img").forEach(img => {
      if (img.src) img.src = img.src; // Browser automatically resolves this to absolute
    });
    
    // Fix Links
    tempDiv.querySelectorAll("a").forEach(a => {
      if (a.href) a.href = a.href;
    });
    
    return tempDiv.innerHTML;
  };

  const absoluteContent = fixUrls(article.content);

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced"
  });

  const markdownContent = turndownService.turndown(absoluteContent);

  // Constants
  const DEFAULT_YAML = `---\ntitle: #title#\nauthor: #author#\nurl: #url#\ndate: #date#\ndomain: #domain#\ntags: [clippings]\n---\n\n`;
  const DEFAULT_FILENAME = `#date#-#title#`;

  // Helper: Hash URL
  function getUrlHash(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).slice(-4);
  }

  // Template Replacement Logic
  function processTemplate(template, isFilename = false) {
    const fullTitle = article.title;
    const cleanTitle = fullTitle.replace(/[\\/:*?"<>|]/g, "_");
    const displayTitle = isFilename ? (cleanTitle.length > 20 ? cleanTitle.slice(0, 20) : cleanTitle) : fullTitle;
    
    const data = {
      "#title#": displayTitle,
      "#fulltitle#": cleanTitle,
      "#author#": article.byline || "Unknown",
      "#url#": window.location.href,
      "#date#": new Date().toISOString().slice(2, 10).replace(/-/g, ''), // YYMMDD
      "#isoDate#": new Date().toISOString().split("T")[0], // YYYY-MM-DD
      "#domain#": window.location.hostname.replace("www.", ""),
      "#hash#": getUrlHash(window.location.href)
    };
    
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.split(key).join(value);
    }
    return result;
  }

  // Load settings and initialize UI
  chrome.storage.local.get(['yamlTemplate', 'filenameTemplate'], (result) => {
    const currentYaml = result.yamlTemplate || DEFAULT_YAML;
    const currentFilename = result.filenameTemplate || DEFAULT_FILENAME;
    initOverlay(currentYaml, currentFilename);
  });

  function initOverlay(yamlTpl, fileTpl) {
    const frontmatter = processTemplate(yamlTpl);
    const markdown = frontmatter + markdownContent; // This now uses absolute URLs
    const html = marked.parse(markdownContent);

    const overlay = document.createElement("div");
    overlay.id = "md-reader-overlay";
    overlay.classList.add("theme-dark"); // Default theme

    overlay.innerHTML = `
      <div id="md-toolbar">
        <div id="md-title">${escapeHtml(article.title)}</div>

        <div id="md-buttons">
          <button id="md-obsidian" title="Save to Obsidian">Save</button>
          <button id="md-copy">Copy</button>
          <button id="md-download-zip" title="Download ZIP with Images">Export ZIP</button>
          <button id="md-download" title="Export Markdown only">Markdown</button>
          <button id="md-toggle">Preview</button>
          <button id="md-settings">Settings</button>
          <button id="md-close" title="Close Overlay">Close</button>
        </div>

        <div id="md-settings-panel">
          <div class="setting-group">
            <label>Appearance</label>
            <div class="theme-options">
              <div class="theme-swatch active" data-theme="dark" title="Dark Mode" style="background: #1a1a1a; border: 1px solid #333;"></div>
              <div class="theme-swatch" data-theme="sepia" title="Sepia" style="background: #f4ecd8; border: 1px solid #d3c7a1;"></div>
              <div class="theme-swatch" data-theme="light" style="background: #fff; border: 1px solid #ddd;"></div>
            </div>
          </div>
          <div class="setting-group">
            <label>Font Size</label>
            <div class="font-options">
              <button class="md-setting-btn" id="font-dec">-</button>
              <span id="font-val">18px</span>
              <button class="md-setting-btn" id="font-inc">+</button>
            </div>
          </div>
          <div class="setting-group">
            <label>Navigation</label>
            <button class="md-setting-btn" id="toggle-toc">Toggle Outline</button>
          </div>
          <div class="setting-group">
            <label>YAML Template</label>
            <textarea id="md-template-editor" spellcheck="false">${escapeHtml(yamlTpl)}</textarea>
          </div>
          <div class="setting-group">
            <label>Filename Template</label>
            <textarea id="md-filename-editor" spellcheck="false">${escapeHtml(fileTpl)}</textarea>
            <button class="md-setting-btn" id="md-save-all">Save & Refresh</button>
            <div style="font-size: 10px; opacity: 0.6; margin-top: 5px;">
              Tags: #date#, #title#, #domain#, #hash#, #fulltitle#
            </div>
          </div>
        </div>
      </div>

      <div id="md-container">
        <div id="md-toc">
          <h4>Outline</h4>
          <ul id="toc-list"></ul>
        </div>
        <div id="md-content"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const content = overlay.querySelector("#md-content");
    const settingsPanel = overlay.querySelector("#md-settings-panel");
    const tocSidebar = overlay.querySelector("#md-toc");
    const tocList = overlay.querySelector("#toc-list");
    const templateEditor = overlay.querySelector("#md-template-editor");
    const filenameEditor = overlay.querySelector("#md-filename-editor");

    let markdownMode = false;
    let fontSize = 18;

    renderHtml();

    // Toolbar Actions
    overlay.querySelector("#md-close").onclick = (e) => {
      e.stopPropagation();
      overlay.remove();
    };

    overlay.querySelector("#md-settings").onclick = (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle("active");
    };

    overlay.querySelector("#toggle-toc").onclick = (e) => {
      e.stopPropagation();
      tocSidebar.classList.toggle("active");
    };

    overlay.onclick = () => {
      settingsPanel.classList.remove("active");
    };

    settingsPanel.onclick = (e) => {
      e.stopPropagation();
    };

    // Save All Settings
    overlay.querySelector("#md-save-all").onclick = (e) => {
      e.stopPropagation();
      chrome.storage.local.set({ 
        yamlTemplate: templateEditor.value,
        filenameTemplate: filenameEditor.value
      }, () => {
        const btn = overlay.querySelector("#md-save-all");
        btn.textContent = "Saved! Refreshing...";
        setTimeout(() => location.reload(), 800);
      });
    };

    overlay.querySelector("#md-toggle").onclick = (e) => {
      e.stopPropagation();
      markdownMode = !markdownMode;
      overlay.querySelector("#md-toggle").textContent = markdownMode ? "Preview" : "Markdown";
      
      if (markdownMode) {
        content.innerHTML = `<pre class="md-source">${escapeHtml(markdown)}</pre>`;
        tocSidebar.classList.remove("active");
      } else {
        renderHtml();
      }
    };

    overlay.querySelector("#md-obsidian").onclick = (e) => {
      e.stopPropagation();
      const fileName = processTemplate(fileTpl, true);
      const uri = `obsidian://new?file=${encodeURIComponent(fileName)}&content=${encodeURIComponent(markdown)}`;
      window.location.href = uri;
    };

    overlay.querySelector("#md-copy").onclick = async (e) => {
      e.stopPropagation();
      await navigator.clipboard.writeText(markdown);
      const btn = overlay.querySelector("#md-copy");
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = "Copy"; }, 1200);
    };

    overlay.querySelector("#md-download").onclick = (e) => {
      e.stopPropagation();
      const fileName = processTemplate(fileTpl, true);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName + ".md";
      a.click();
      URL.revokeObjectURL(url);
    };

    // ZIP Download with Images
    overlay.querySelector("#md-download-zip").onclick = async (e) => {
      e.stopPropagation();
      const btn = overlay.querySelector("#md-download-zip");
      const originalText = btn.textContent;
      const finalFileName = processTemplate(fileTpl, true);
      btn.disabled = true;
      btn.textContent = "Processing...";

      try {
        const zip = new JSZip();
        const imgFolder = zip.folder("images");
        const imgMap = new Map();
        
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = absoluteContent; // Use the fixed absolute content
        const images = tempDiv.querySelectorAll("img");
        
        let processedCount = 0;
        for (const img of images) {
          const src = img.src;
          if (!src || src.startsWith("data:")) continue;
          btn.textContent = `Downloading (${processedCount + 1}/${images.length})`;
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            let ext = "png";
            const contentType = response.headers.get("Content-Type");
            if (contentType) ext = contentType.split("/")[1] || "png";
            else {
              const match = src.match(/\.(jpg|jpeg|png|gif|webp|svg)/i);
              if (match) ext = match[1];
            }
            const imgName = `image_${processedCount + 1}.${ext}`;
            imgFolder.file(imgName, blob);
            imgMap.set(src, `images/${imgName}`);
            processedCount++;
          } catch (err) { console.error("Img failed:", src, err); }
        }

        let finalMarkdown = markdownContent;
        imgMap.forEach((localPath, originalSrc) => {
          // Since markdownContent uses absolute URLs now, the replacement will work!
          finalMarkdown = finalMarkdown.split(originalSrc).join(localPath);
        });

        zip.file("index.md", processTemplate(yamlTpl) + finalMarkdown);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalFileName + ".zip";
        a.click();
        URL.revokeObjectURL(url);
        btn.textContent = "Success!";
      } catch (err) {
        console.error("ZIP failed:", err);
        btn.textContent = "Error";
      } finally {
        setTimeout(() => { btn.disabled = false; btn.textContent = originalText; }, 2000);
      }
    };

    // Settings Logic
    overlay.querySelectorAll(".theme-swatch").forEach(swatch => {
      swatch.onclick = (e) => {
        e.stopPropagation();
        overlay.querySelectorAll(".theme-swatch").forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
        const theme = swatch.dataset.theme;
        overlay.classList.remove("theme-dark", "theme-sepia", "theme-light");
        overlay.classList.add(`theme-${theme}`);
      };
    });

    overlay.querySelector("#font-inc").onclick = (e) => {
      e.stopPropagation();
      if (fontSize < 30) { fontSize += 2; updateFont(); }
    };

    overlay.querySelector("#font-dec").onclick = (e) => {
      e.stopPropagation();
      if (fontSize > 12) { fontSize -= 2; updateFont(); }
    };

    function updateFont() {
      overlay.style.setProperty("--md-font-size", `${fontSize}px`);
      overlay.querySelector("#font-val").textContent = `${fontSize}px`;
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.remove();
    });

    function renderHtml() {
      content.innerHTML = DOMPurify.sanitize(html);
      generateToC();
    }

    function generateToC() {
      tocList.innerHTML = "";
      const headings = content.querySelectorAll("h1, h2, h3");
      if (headings.length < 2) {
        tocSidebar.classList.remove("active");
        return;
      }
      headings.forEach((h, index) => {
        const id = `heading-${index}`;
        h.id = id;
        const li = document.createElement("li");
        li.className = `toc-${h.tagName.toLowerCase()}`;
        const a = document.createElement("a");
        a.href = `#${id}`;
        a.textContent = h.textContent;
        a.onclick = (e) => {
          e.preventDefault();
          h.scrollIntoView({ behavior: "smooth" });
        };
        li.appendChild(a);
        tocList.appendChild(li);
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));
  }

  function sanitizeFilename(name) {
    return name.replace(/[\\/:*?"<>|]/g, "_");
  }
})();