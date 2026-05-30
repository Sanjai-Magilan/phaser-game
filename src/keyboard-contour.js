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
  const keyW = 60;
  const keyH = 35;
  const gapX = 10;
  const gapY = 10;
  const startX = 0;
  const startY = 20;
  const offsets = [0, 70, 140];
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
  ];

  const overlay = document.createElement("div");
  overlay.id = "keyboard-overlay";
  overlay.style.position = "absolute";
  overlay.style.left = "50%";
  overlay.style.top = "78%"; //////////////////////////////////////////////////////
  overlay.style.transform = "translate(-50%,-50%) rotateX(22deg) rotateZ(0deg)";
  overlay.style.width = "min(850px,75vw)"; ////////////////////////////////////////
  overlay.style.zIndex = "9999";
  overlay.style.pointerEvents = "auto";
  overlay.style.background = "rgba(35,35,45,0.05)"; ///////////////////////////////
  overlay.style.backdropFilter = "blur(2px)";
  overlay.style.webkitBackdropFilter = "blur(2px)";
  const svg = document.createElementNS(NS, "svg"); /////////////////////////////////
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
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
    const keyRect = document.createElementNS(NS, "polygon");

    const inset = 0;

    keyRect.setAttribute(
      "points",
      `${x + inset},${y}
   ${x + w - inset},${y}
   ${x + w},${y + h}
   ${x},${y + h}`,
    );
    keyRect.setAttribute("fill", "#ffffff");
    keyRect.setAttribute("fill-opacity", "0.04");

    keyRect.setAttribute("stroke", "#cfd5ff");

    keyRect.setAttribute("stroke-width", "1.2");

    g.appendChild(keyRect);
    const shine = document.createElementNS(NS, "polygon");

shine.setAttribute(
  "points",
  `${x + inset + 5},${y + 4}
   ${x + w - inset - 5},${y + 4}
   ${x + w - 10},${y + 16}
   ${x + 10},${y + 16}`
);

shine.setAttribute("fill", "#ffffff");
shine.setAttribute("fill-opacity", "0.04");

g.appendChild(shine);
    const txt = document.createElementNS(NS, "text");

    txt.setAttribute("x", String(x + w / 2));
    txt.setAttribute("y", String(y + h / 2 + 5));

    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("fill", "#d7d7d7");

    txt.setAttribute("font-size", "14");
    txt.setAttribute("font-family", "Arial");
    txt.setAttribute("font-weight", "600");

    txt.textContent = id.split("-")[0];

    g.appendChild(txt);

    if (id.startsWith("F")) {
  keyRect.setAttribute("stroke", "#f4d77a");

  keyRect.setAttribute("fill", "#f4d77a");
  keyRect.setAttribute("fill-opacity", "0.08");

  txt.setAttribute("fill", "#ffe49b");

  keyRect.style.filter =
    "drop-shadow(0 0 6px rgba(244,215,122,0.4))";
}

    const hit = document.createElementNS(NS, "rect");
    hit.setAttribute("x", String(x));
    hit.setAttribute("y", String(y));
    hit.setAttribute("width", String(w));
    hit.setAttribute("height", String(h));
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("pointer-events", "all");
    hit.style.cursor = "pointer";
    g.appendChild(hit);

    const press = () => g.setAttribute("transform", "translate(0,12)");
    const release = () => g.setAttribute("transform", "translate(0,0)");

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
  const shiftW = 150;
  const spaceBarW = 450;
  const spaceBarY = startY + 3 * (keyH + gapY);
  const gap = 15;

  const g1 = makeKey("LSHIFT", startX, spaceBarY, shiftW, keyH);
  svg.appendChild(g1);

  const g2 = makeKey(
    "SPACE",
    startX + shiftW + gap,
    spaceBarY,
    spaceBarW,
    keyH,
  );
  svg.appendChild(g2);

  const g3 = makeKey(
    "RSHIFT",
    startX + shiftW + gap + spaceBarW + gap,
    spaceBarY,
    shiftW,
    keyH,
  );
  svg.appendChild(g3);

  overlay.appendChild(svg);
  document.body.appendChild(overlay);
}
