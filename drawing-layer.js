(() => {
  const STORAGE_PREFIX = "math-formula-tool-annotations-v1";

  function getPageKey() {
    const page = window.location.pathname.split(/[\\/]/).pop() || "index.html";
    return `${STORAGE_PREFIX}:${page}${window.location.search || ""}`;
  }

  function loadStrokes() {
    try {
      const raw = localStorage.getItem(getPageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveStrokes(strokes) {
    try {
      localStorage.setItem(getPageKey(), JSON.stringify(strokes));
    } catch (error) {
    }
  }

  function buildToolbar() {
    const wrapper = document.createElement("div");
    wrapper.className = "page-annotation-toolbar";
    wrapper.innerHTML = `
      <div class="page-annotation-toolbar__group">
        <button type="button" data-mode="browse" class="is-active">瀏覽</button>
        <button type="button" data-mode="pen">畫筆</button>
        <button type="button" data-mode="highlight">螢光筆</button>
        <button type="button" data-mode="erase">橡皮擦</button>
      </div>
      <div class="page-annotation-toolbar__group">
        <label><span>顏色</span><input type="color" data-role="color" value="#d95d39" /></label>
        <label><span>粗細</span><input type="range" data-role="size" min="2" max="24" value="4" /></label>
      </div>
      <div class="page-annotation-toolbar__group">
        <button type="button" data-role="clear">清除筆跡</button>
      </div>
    `;
    return wrapper;
  }

  function initDrawingLayer() {
    if (document.querySelector(".page-annotation-layer")) return;

    const canvas = document.createElement("canvas");
    canvas.className = "page-annotation-layer";
    const toolbar = buildToolbar();
    document.body.appendChild(canvas);
    document.body.appendChild(toolbar);

    const ctx = canvas.getContext("2d");
    let mode = "browse";
    let color = "#d95d39";
    let size = 4;
    let strokes = loadStrokes();
    let currentStroke = null;

    function resizeCanvas() {
      const width = Math.max(document.documentElement.clientWidth, document.body.scrollWidth, window.innerWidth);
      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redraw();
    }

    function drawStroke(stroke) {
      if (!stroke?.points?.length) return;
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.globalCompositeOperation = stroke.mode === "erase" ? "destination-out" : "source-over";
      ctx.globalAlpha = stroke.mode === "highlight" ? 0.28 : 1;
      ctx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
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

    function setMode(nextMode) {
      mode = nextMode;
      canvas.classList.toggle("is-drawing", mode !== "browse");
      canvas.hidden = mode === "browse";
      toolbar.querySelectorAll("[data-mode]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.mode === mode);
      });
    }

    function getPoint(event) {
      return {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY
      };
    }

    function startStroke(event) {
      if (mode === "browse") return;
      event.preventDefault();
      currentStroke = {
        mode,
        color,
        size: mode === "highlight" ? Math.max(size + 8, 12) : size,
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
      saveStrokes(strokes);
      currentStroke = null;
      redraw();
    }

    toolbar.addEventListener("click", (event) => {
      const modeButton = event.target.closest("[data-mode]");
      if (modeButton) {
        setMode(modeButton.dataset.mode);
        return;
      }
      if (event.target.closest("[data-role='clear']")) {
        strokes = [];
        currentStroke = null;
        saveStrokes(strokes);
        redraw();
      }
    });

    toolbar.querySelector("[data-role='color']")?.addEventListener("input", (event) => {
      color = event.target.value;
    });
    toolbar.querySelector("[data-role='size']")?.addEventListener("input", (event) => {
      size = Number(event.target.value) || 4;
    });

    canvas.addEventListener("pointerdown", startStroke);
    canvas.addEventListener("pointermove", moveStroke);
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    setMode("browse");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDrawingLayer);
  } else {
    initDrawingLayer();
  }

  window.annotationLayer = { init: initDrawingLayer };
})();
