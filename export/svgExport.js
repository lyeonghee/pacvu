// ============================================================
// svgExport.js — SVG / DXF export
// buildExportSVG(cfg, engineKey) → SVG string (Illustrator용)
// downloadFile(name, content, mime)
// ============================================================

function downloadFile(name, content, type) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type })),
    download: name
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── M001 (G-Type) export SVG ──────────────────────────────────
function _buildM001ExportSVG(cfg) {
  const g         = M001_getGrid(cfg);
  const outerPath = buildOuterPath(cfg, g);
  const foldLines = buildFoldLines(cfg, g);
  const slots     = buildSlots(cfg, g);
  const holes     = buildHoles(cfg, g);
  const bleedPath = buildBleedPath(cfg, g, 4);
  const bounds    = getBounds(outerPath, foldLines, slots, holes);

  const pad = 5;
  const vbX = +(bounds.minX - pad).toFixed(4);
  const vbY = +(bounds.minY - pad).toFixed(4);
  const vbW = +(bounds.width  + pad * 2).toFixed(4);
  const vbH = +(bounds.height + pad * 2).toFixed(4);

  const ST = {
    cut:  'fill:none;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;',
    fill: 'fill:#ffffff;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;',
    fold: 'fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;',
    slot: 'fill:none;stroke:#e53935;stroke-width:0.45;',
    hole: 'fill:none;stroke:#1f8f4f;stroke-width:0.45;',
    bleed:'fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;',
  };

  let out = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}mm" height="${vbH}mm">\n`;
  out += `  <path style="${ST.bleed}" d="${bleedPath}"/>\n`;
  out += `  <path style="${ST.fill}"  d="${outerPath}"/>\n`;
  foldLines.forEach(l => {
    out += `  <line style="${ST.fold}" x1="${+l.x1.toFixed(4)}" y1="${+l.y1.toFixed(4)}" x2="${+l.x2.toFixed(4)}" y2="${+l.y2.toFixed(4)}"/>\n`;
  });
  slots.forEach(s => { out += `  <path style="${ST.slot}" d="${roundRectPath(s.x, s.y, s.w, s.h, 2)}"/>\n`; });
  holes.forEach(h => { out += `  <path style="${ST.hole}" d="${circlePath(h.cx, h.cy, h.r)}"/>\n`; });
  out += `</svg>`;
  return out;
}

// ── T001 (B-Type) export SVG ─────────────────────────────────
function _buildT001ExportSVG(cfg) {
  return T001_buildExportSVG(cfg);
}

// ── dispatcher ───────────────────────────────────────────────
function buildExportSVG(cfg, engineKey) {
  if (engineKey === 'gbox') return _buildM001ExportSVG(cfg);
  if (engineKey === 'bbox') return _buildT001ExportSVG(cfg);
  return '';
}
