const NS = "http://www.w3.org/2000/svg";

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

// Removed flood-fill and convex-hull in favor of measured rectangles

export async function createContourKeyboard() {
  if (document.getElementById("keyboard-overlay")) return;
  const src = "/assets/keyboard.png";
  const img = await loadImage(src);
  const W = img.naturalWidth,
    H = img.naturalHeight;
  // Measured key dimensions from keyboard.png (2012x632)
  const keyW = 35;
  const keyH = 36;
  const gapX = 10;
  const gapY = 10;
  const startX = 110;
  const startY = 40;
  const offsets = [0, 30, 60];
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
  ];

  const overlay = document.createElement("div");
  overlay.id = "keyboard-overlay";
  overlay.style.position = "absolute";
  // overlay.style.left = "60px";
  // overlay.style.right = "60px";
  // overlay.style.top = "260px";
  // overlay.style.bottom = "40px";
  // overlay.style.width = "auto";
  // overlay.style.transform = "none";
  overlay.style.left = "50%";
  overlay.style.top = "76%"; //////////////////////////////////////////////////////
  overlay.style.transform =
    "translate(-50%,-50%) perspective(1400px) rotateX(35deg)";
  overlay.style.width = "min(850px,65vw)"; ////////////////////////////////////////
  overlay.style.zIndex = "9999";
  overlay.style.pointerEvents = "auto";
  overlay.style.background = "rgba(35,35,45,0.05)"; ///////////////////////////////
  overlay.style.backdropFilter = "blur(2px)";
  overlay.style.webkitBackdropFilter = "blur(2px)";
  const svg = document.createElementNS(NS, "svg"); /////////////////////////////////
  svg.setAttribute("viewBox", `0 0 ${W - 150} ${H - 45}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "auto";
  const defs = document.createElementNS(NS, "defs");
  svg.appendChild(defs);
  const imgEl = document.createElementNS(NS, "image");
  imgEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", src);
  imgEl.setAttribute("x", "0");
  imgEl.setAttribute("y", "0");
  imgEl.setAttribute("width", String(W));
  imgEl.setAttribute("height", String(H));
  imgEl.style.opacity = "0.55"; //////////////////////////////////////////////////////////////////////

  function makeKey(id, x, y, w, h) {
    const g = document.createElementNS(NS, "g");
    g.classList.add("key-group");
    g.setAttribute("data-key", id);
    const keyRect = document.createElementNS(NS, "rect");

    const inset = 0;

    keyRect.setAttribute("x", String(x));
    keyRect.setAttribute("y", String(y));
    keyRect.setAttribute("width", String(w));
    keyRect.setAttribute("height", String(h));
    keyRect.setAttribute("rx", "2");
    keyRect.setAttribute("ry", "2");
    keyRect.setAttribute("fill", "#ffffff");
    keyRect.setAttribute("fill-opacity", "0.05");

    keyRect.setAttribute("stroke", "rgba(220,225,255,0.35)");
    keyRect.setAttribute("stroke-width", "1.5");

    g.appendChild(keyRect);
    const bottomGlow = document.createElementNS(NS, "rect");

    bottomGlow.setAttribute("x", String(x + 1));
    bottomGlow.setAttribute("y", String(y + h - 4));

    bottomGlow.setAttribute("width", String(w - 2));
    bottomGlow.setAttribute("height", "3");

    bottomGlow.setAttribute("rx", "2");

    bottomGlow.setAttribute("fill", "rgba(220,225,255,0.55)");

    g.appendChild(bottomGlow);
    //   const shine = document.createElementNS(NS, "polygon");

    //   shine.setAttribute(
    //     "points",
    //     `${x + inset + 5},${y + 4}
    //  ${x + w - inset - 5},${y + 4}
    //  ${x + w - 10},${y + 16}
    //  ${x + 10},${y + 16}`,
    //   );

    //   shine.setAttribute("fill", "#ffffff");
    //   shine.setAttribute("fill-opacity", "0.04");

    //   g.appendChild(shine);
    const txt = document.createElementNS(NS, "text");

    txt.setAttribute("x", String(x + w / 2));
    txt.setAttribute("y", String(y + h / 2 + 5));

    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("fill", "#d7d7d7");

    txt.setAttribute("font-size", "12");
    txt.setAttribute("font-family", "Arial");
    txt.setAttribute("font-weight", "600");

    const label = id.split("-")[0];

    if (label === "SPACE") {
      txt.textContent = "";
    } else if (label === "LSHIFT" || label === "RSHIFT") {
      txt.textContent = "SHIFT";
    } else {
      txt.textContent = label;
    }

    g.appendChild(txt);

    const hit = document.createElementNS(NS, "rect");
    hit.setAttribute("x", String(x));
    hit.setAttribute("y", String(y));
    hit.setAttribute("width", String(w));
    hit.setAttribute("height", String(h));
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("pointer-events", "all");
    hit.style.cursor = "pointer";
    g.appendChild(hit);

    const press = () => {
      g.setAttribute("transform", "translate(0,6)");
    };

    const release = () => {
      g.setAttribute("transform", "translate(0,0)");
    };
    g.press = press;
    g.release = release;

    hit.addEventListener("mousedown", press);
    hit.addEventListener("mouseup", release);
    hit.addEventListener("mouseleave", release);
    hit.addEventListener("touchstart", (e) => {
      e.preventDefault();
      press();
    });
    hit.addEventListener("touchend", release);

    return g;
  }

  // Build letter keys
  rows.forEach((row, rIdx) => {
    row.forEach((label, i) => {
      const x0 = startX + offsets[rIdx] + i * (keyW + gapX);
      const y0 = startY + rIdx * (keyH + gapY);
      const g = makeKey(`${label}-${rIdx}-${i}`, x0, y0, keyW, keyH);
      if (g) svg.appendChild(g);
    });
  });

  // Space row: shift, spacebar, shift
  const shiftW = 115;
  const spaceBarW = 240;
  const spaceBarY = startY + 3 * (keyH + gapY);
  const gap = 10;
  const bottomRowOffset = -20;

  const g1 = makeKey(
    "LSHIFT",
    startX + bottomRowOffset,
    spaceBarY,
    shiftW,
    keyH,
  );
  svg.appendChild(g1);

  const g2 = makeKey(
    "SPACE",
    startX + bottomRowOffset + shiftW + gap,
    spaceBarY,
    spaceBarW,
    keyH,
  );
  svg.appendChild(g2);

  const g3 = makeKey(
    "RSHIFT",
    startX + bottomRowOffset + shiftW + gap + spaceBarW + gap,
    spaceBarY,
    shiftW,
    keyH,
  );
  svg.appendChild(g3);

  overlay.appendChild(svg);
  document.body.appendChild(overlay);
  const keyMap = {};

  svg.querySelectorAll(".key-group").forEach((key) => {
    const name = key.dataset.key.split("-")[0];
    keyMap[name.toUpperCase()] = key;
  });
  window.addEventListener("keydown", (e) => {
    const blockedKeys = [
      "Q",
      "W",
      "E",
      "R",
      "T",
      "Y",
      "U",
      "I",
      "O",
      "P",
      "A",
      "S",
      "D",
      "F",
      "G",
      "H",
      "J",
      "K",
      "L",
      "Z",
      "X",
      "C",
      "V",
      "B",
      "N",
      "M",
      ";",
      "/",
      "Shift",
      " ",
    ];

    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
    }
    let keyName = e.key.toUpperCase();

    if (e.code === "ShiftLeft") {
      keyName = "LSHIFT";
    }

    if (e.code === "ShiftRight") {
      keyName = "RSHIFT";
    }
    if (e.code === "Space") {
      keyName = "SPACE";
    }
    const key = keyMap[keyName];

    if (key && key.press) {
      key.press();
    }
  });
  window.addEventListener("keyup", (e) => {
    const blockedKeys = [
      "Q",
      "W",
      "E",
      "R",
      "T",
      "Y",
      "U",
      "I",
      "O",
      "P",
      "A",
      "S",
      "D",
      "F",
      "G",
      "H",
      "J",
      "K",
      "L",
      "Z",
      "X",
      "C",
      "V",
      "B",
      "N",
      "M",
      ";",
      "/",
      "Shift",
      " ",
    ];

    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
    }
    let keyName = e.key.toUpperCase();

    if (e.code === "ShiftLeft") {
      keyName = "LSHIFT";
    }

    if (e.code === "ShiftRight") {
      keyName = "RSHIFT";
    }

    if (e.code === "Space") {
      keyName = "SPACE";
    }
    const key = keyMap[keyName];

    if (key && key.release) {
      key.release();
    }
  });
}
