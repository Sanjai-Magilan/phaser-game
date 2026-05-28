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
  const keyW = 155;
  const keyH = 138;
  const gapX = 39;
  const gapY = 32;
  const startX = 130;
  const startY = 120;
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
  overlay.style.top = "72%";
  overlay.style.transform =
    "translate(-50%,-50%) rotateX(22deg) rotateZ(-8deg)";
  overlay.style.width = "min(1400px,94vw)";
  overlay.style.zIndex = "9999";
  overlay.style.pointerEvents = "auto";
  const svg = document.createElementNS(NS, "svg");
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
  svg.appendChild(imgEl);

  function makeKey(id, x, y, w, h) {
    const clip = document.createElementNS(NS, "clipPath");
    clip.id = `clip-${id}`;
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", String(x));
    r.setAttribute("y", String(y));
    r.setAttribute("width", String(w));
    r.setAttribute("height", String(h));
    r.setAttribute("rx", "20");
    clip.appendChild(r);
    defs.appendChild(clip);

    const g = document.createElementNS(NS, "g");
    g.classList.add("key-group");
    g.setAttribute("data-key", id);

    const imgCopy = document.createElementNS(NS, "image");
    imgCopy.setAttributeNS("http://www.w3.org/1999/xlink", "href", src);
    imgCopy.setAttribute("x", "0");
    imgCopy.setAttribute("y", "0");
    imgCopy.setAttribute("width", String(W));
    imgCopy.setAttribute("height", String(H));
    imgCopy.setAttribute("clip-path", `url(#clip-${id})`);
    g.appendChild(imgCopy);

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
  const shiftW = 335;
  const spaceBarW = 1050;
  const spaceBarY = startY + 3 * (keyH + gapY);
  const gap = 50;

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
