(() => {
  const STORAGE_PREFIX = "math-formula-tool-block-annotations-v2";

  function getPageId() {
    const page = window.location.pathname.split(/[\\/]/).pop() || "index.html";
    return `${page}${window.location.search || ""}`;
  }

  function getStorageKey(blockKey) {
    return `${STORAGE_PREFIX}:${getPageId()}:${blockKey}`;
  }

  function loadStrokes(blockKey) {
    try {
      const raw = window.localStorage.getItem(getStorageKey(blockKey));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveStrokes(blockKey, strokes) {
    try {
      window.localStorage.setItem(getStorageKey(blockKey), JSON.stringify(strokes));
    } catch (_) {
    }
  }

  function buildToolbar() {
    const wrapper = document.createElement("div");
    wrapper.className = "annotation-block__toolbar";
    wrapper.innerHTML = `
      <div class="annotation-block__toolbar-group annotation-block__toolbar-group--primary">
        <button type="button" data-mode="browse" class="is-active">瀏覽</button>
        <button type="button" data-mode="pen">畫筆</button>
      </div>
      <div class="annotation-block__toolbar-advanced" hidden>
        <div class="annotation-block__toolbar-group">
          <button type="button" data-mode="pen" class="is-active">藍筆</button>
          <button type="button" data-mode="highlight">螢光筆</button>
          <button type="button" data-mode="erase">橡皮擦</button>
        </div>
        <div class="annotation-block__toolbar-group annotation-block__color-picks">
          <button type="button" data-role="quick-color" data-color="#2563eb" class="is-active">藍</button>
          <button type="button" data-role="quick-color" data-color="#dc2626">紅</button>
          <button type="button" data-role="quick-color" data-color="#16a34a">綠</button>
          <button type="button" data-role="quick-color" data-color="#f59e0b">黃</button>
          <button type="button" data-role="quick-color" data-color="#7c3aed">紫</button>
          <label><span>顏色</span><input type="color" data-role="color" value="#2563eb" /></label>
          <label><span>粗細</span><input type="range" data-role="size" min="2" max="24" value="4" /></label>
        </div>
        <div class="annotation-block__toolbar-group">
          <button type="button" data-role="clear">清除</button>
        </div>
      </div>
    `;
    return wrapper;
  }

  function ensureBlockKey(element, index) {
    if (!element.dataset.annotationKey) {
      element.dataset.annotationKey = `block-${index + 1}`;
    }
    return element.dataset.annotationKey;
  }

  function initAnnotatableBlock(target, index) {
    if (!target || target.dataset.annotationReady === "true") return;

    const blockKey = ensureBlockKey(target, index);
    const shell = document.createElement("div");
    shell.className = "annotation-block";
    const toolbar = buildToolbar();
    const body = document.createElement("div");
    body.className = "annotation-block__body";
    const canvas = document.createElement("canvas");
    canvas.className = "annotation-block__canvas";
    canvas.hidden = true;

    target.parentNode.insertBefore(shell, target);
    shell.appendChild(toolbar);
    shell.appendChild(body);
    body.appendChild(target);
    body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let mode = "browse";
    let color = "#2563eb";
    let size = 4;
    let strokes = loadStrokes(blockKey);
    let currentStroke = null;
    const advancedTools = toolbar.querySelector(".annotation-block__toolbar-advanced");

    function resizeCanvas() {
      const rect = body.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.ceil(rect.width));
      const height = Math.max(1, Math.ceil(body.scrollHeight));
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redraw();
    }

    function drawStroke(stroke) {
      if (!stroke || !Array.isArray(stroke.points) || !stroke.points.length) return;
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.globalCompositeOperation = stroke.mode === "erase" ? "destination-out" : "source-over";
      ctx.globalAlpha = stroke.mode === "highlight" ? 0.28 : 1;
      ctx.beginPath();
      stroke.points.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      strokes.forEach(drawStroke);
      if (currentStroke) drawStroke(currentStroke);
    }

    function updateColorButtons() {
      toolbar.querySelectorAll("[data-role='quick-color']").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.color === color);
      });
      const input = toolbar.querySelector("[data-role='color']");
      if (input) input.value = color;
    }

    function setMode(nextMode) {
      mode = nextMode;
      canvas.hidden = mode === "browse";
      canvas.classList.toggle("is-drawing", mode !== "browse");
      body.dataset.drawMode = mode;
      advancedTools.hidden = mode === "browse";
      advancedTools.classList.toggle("is-hidden", mode === "browse");
      toolbar.querySelectorAll("[data-mode]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.mode === mode);
      });
    }

    function getPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    function startStroke(event) {
      if (mode === "browse") return;
      event.preventDefault();
      currentStroke = {
        mode,
        color,
        size:
          mode === "erase"
            ? Math.max(size * 3, 18)
            : mode === "highlight"
              ? Math.max(size + 8, 12)
              : size,
        points: [getPoint(event)]
      };
      redraw();
    }

    function moveStroke(event) {
      if (!currentStroke) return;
      event.preventDefault();
      currentStroke.points.push(getPoint(event));
      redraw();
    }

    function endStroke() {
      if (!currentStroke) return;
      strokes.push(currentStroke);
      saveStrokes(blockKey, strokes);
      currentStroke = null;
      redraw();
    }

    toolbar.addEventListener("click", (event) => {
      const modeButton = event.target.closest("[data-mode]");
      if (modeButton) {
        setMode(modeButton.dataset.mode);
        return;
      }

      const colorButton = event.target.closest("[data-role='quick-color']");
      if (colorButton) {
        color = colorButton.dataset.color || "#2563eb";
        updateColorButtons();
        return;
      }

      if (event.target.closest("[data-role='clear']")) {
        strokes = [];
        currentStroke = null;
        saveStrokes(blockKey, strokes);
        redraw();
      }
    });

    toolbar.querySelector("[data-role='color']")?.addEventListener("input", (event) => {
      color = event.target.value;
      updateColorButtons();
    });

    toolbar.querySelector("[data-role='size']")?.addEventListener("input", (event) => {
      size = Number(event.target.value) || 4;
    });

    canvas.addEventListener("pointerdown", startStroke);
    canvas.addEventListener("pointermove", moveStroke);
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointerleave", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
    window.addEventListener("resize", resizeCanvas);

    target.dataset.annotationReady = "true";
    resizeCanvas();
    updateColorButtons();
    setMode("browse");
  }

  function initAnnotationBlocks(root = document) {
    const blocks = root.querySelectorAll("[data-annotatable='true']");
    blocks.forEach((block, index) => initAnnotatableBlock(block, index));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initAnnotationBlocks());
  } else {
    initAnnotationBlocks();
  }

  window.annotationBlocks = { init: initAnnotationBlocks };
})();
