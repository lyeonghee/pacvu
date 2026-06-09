// ============================================================
// T001_v2_renderer.js - SVG renderer
// Depends on T001_v2_spec.js, T001_v2_layout.js
// ============================================================

function T001_v2_renderSVG(cfg, appState) {
  const layout = T001_v2_getLayout(cfg.W, cfg.D, cfg.H);
  const { spec, grid, closedOuterPath, bleedPath, foldLines, bounds } = layout;
  const N = T001_v2_round;
  const pad = 80;
  const vbX = bounds.minX - pad;
  const vbY = bounds.minY - pad;
  const vbW = bounds.width + pad * 2;
  const vbH = bounds.height + pad * 2;

  let svg = `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"
    viewBox="${N(vbX)} ${N(vbY)} ${N(vbW)} ${N(vbH)}"
    width="100%" height="100%"
    preserveAspectRatio="xMidYMid meet">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="#111"/>
    </marker>
    <pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">
      <text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700"
        fill="#999" opacity="0.12">PacVu</text>
    </pattern>
    <style>
      .cut-area { fill:#ffffff; stroke:none; }
      .glue-area { fill:#d4d4d4; opacity:0.72; stroke:none; }
      .cut-fill { fill:none; stroke:#cc0000; stroke-width:0.45; stroke-linejoin:round; stroke-linecap:round; }
      .bleed { fill:none; stroke:#0055ff; stroke-width:0.45; stroke-linejoin:round; stroke-linecap:round; }
      .fold { fill:none; stroke:#1d6fe8; stroke-width:0.35; stroke-dasharray:2 1.6; }
      .label { fill:#333; font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif; pointer-events:none; }
      .dim { fill:#111; font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif; pointer-events:none; }
    </style>
  </defs>
  <rect x="${N(vbX)}" y="${N(vbY)}" width="${N(vbW)}" height="${N(vbH)}" fill="#d0d0d0" stroke="none"/>
  <g id="viewportGroup">
    <g id="layer-fill"><path id="fill-outer" class="cut-area" fill-rule="nonzero" d="${closedOuterPath}"/></g>
    ${T001_v2_buildGlueFillLayer(spec, grid)}
    <g id="layer-bleed"><path id="bleedPath" class="bleed" d="${bleedPath}"/></g>
    <g id="layer-cut"><path id="cutPath" class="cut-fill" fill-rule="nonzero" d="${closedOuterPath}"/></g>`;

  if (!appState || appState.showFolds) {
    svg += '\n    <g id="layer-fold">';
    foldLines.forEach(line => {
      svg += `\n      <line class="fold" data-fold-id="${line.id}" x1="${N(line.x1)}" y1="${N(line.y1)}" x2="${N(line.x2)}" y2="${N(line.y2)}"/>`;
    });
    svg += '\n    </g>';
  }

  if (!appState || appState.showLabels) {
    svg += T001_v2_buildLabelLayer(spec, grid);
  }

  if (!appState || appState.showDims) {
    svg += T001_v2_buildDimensionLayer(spec, grid);
  }

  svg += `
    <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>
  </g>
</svg>`;
  return svg;
}

function T001_v2_buildGlueFillLayer(spec, grid) {
  const N = T001_v2_round;
  const D = spec.D;
  const glueSlope = D * (6.699 / 57);
  const xL = grid.xGlueL;
  const xR = grid.xFrontL;
  const inset = 0.1;
  const topLeftY = grid.yBodyTop + glueSlope;
  const topRightY = grid.yBodyTop;
  const bottomRightY = grid.yBodyBottom;
  const bottomLeftY = grid.yBodyBottom - glueSlope;
  const onGluePanel = (t, yLeft, yRight) => ({
    x: xL + (xR - xL) * t,
    y: yLeft + (yRight - yLeft) * t
  });
  const topLeft = onGluePanel(inset, topLeftY, topRightY);
  const topRight = onGluePanel(1 - inset, topLeftY, topRightY);
  const bottomRight = onGluePanel(1 - inset, bottomLeftY, bottomRightY);
  const bottomLeft = onGluePanel(inset, bottomLeftY, bottomRightY);
  const d = [
    `M ${N(topLeft.x)},${N(topLeft.y)}`,
    `L ${N(topRight.x)},${N(topRight.y)}`,
    `L ${N(bottomRight.x)},${N(bottomRight.y)}`,
    `L ${N(bottomLeft.x)},${N(bottomLeft.y)}`,
    'Z'
  ].join(' ');
  return `\n    <g id="layer-glue-fill"><path id="glue-fill" class="glue-area" d="${d}"/></g>`;
}

function T001_v2_buildLabelLayer(spec, grid) {
  const N = T001_v2_round;
  const ySideFlapTop = grid.yBodyTop - spec.lidFlapHeight;
  const labels = [
    { name: 'Glue', x: grid.xGlueL, y: grid.yBodyTop, w: grid.xFrontL - grid.xGlueL, h: spec.H },
    { name: 'Front', x: grid.xFrontL, y: grid.yBodyTop, w: spec.W, h: spec.H },
    { name: 'Side(L)', x: grid.xFrontR, y: grid.yBodyTop, w: spec.D, h: spec.H },
    { name: 'Back', x: grid.xSideLR, y: grid.yBodyTop, w: spec.W, h: spec.H },
    { name: 'Side(R)', x: grid.xBackR, y: grid.yBodyTop, w: grid.xSideRR - grid.xBackR, h: spec.H },
    { name: 'Upper Tuck', x: grid.xFrontL, y: grid.yTop, w: spec.W, h: grid.yLidFold - grid.yTop },
    { name: 'Lid Top', x: grid.xFrontL, y: grid.yLidFold, w: spec.W, h: grid.yBodyTop - grid.yLidFold },
    { name: 'Lid Side Flap(L)', x: grid.xFrontR, y: ySideFlapTop, w: spec.D, h: spec.lidFlapHeight },
    { name: 'Lid Side Flap(R)', x: grid.xBackR, y: ySideFlapTop, w: grid.xSideRR - grid.xBackR, h: spec.lidFlapHeight },
    { name: 'Thumb Notch', x: grid.xSideLR, y: grid.yBodyTop, w: spec.W, h: spec.notchDepth },
    { name: 'Bottom Lock A', x: grid.xFrontL, y: grid.yBodyBottom, w: spec.W, h: grid.yLockBottom - grid.yBodyBottom },
    { name: 'Bottom Lock(L)', x: grid.xFrontR, y: grid.yBodyBottom, w: spec.D, h: grid.yLockBottom - grid.yBodyBottom },
    { name: 'Bottom Lock B', x: grid.xSideLR, y: grid.yBodyBottom, w: spec.W, h: grid.yLockBottom - grid.yBodyBottom },
    { name: 'Bottom Lock(R)', x: grid.xBackR, y: grid.yBodyBottom, w: grid.xSideRR - grid.xBackR, h: grid.yLockBottom - grid.yBodyBottom }
  ];

  let out = '\n    <g id="layer-labels">';
  labels.forEach(label => {
    const minDim = Math.min(Math.abs(label.w), Math.abs(label.h));
    if (minDim < 10) return;
    const fs = 4.5;
    out += `\n      <text class="label" x="${N(label.x + label.w / 2)}" y="${N(label.y + label.h / 2)}" font-size="${N(fs)}" text-anchor="middle" dominant-baseline="middle">${label.name}</text>`;
  });
  out += '\n    </g>';
  return out;
}

function T001_v2_buildDimensionLayer(spec, grid) {
  const N = T001_v2_round;
  const dim = [];
  const bodyMidY = (grid.yBodyTop + grid.yBodyBottom) / 2;
  const dimY = bodyMidY + spec.H * 0.18;
  const hDimX = grid.xFrontR - Math.min(10, spec.W * 0.18);

  function hDim(x1, x2, y, label) {
    const mid = (x1 + x2) / 2;
    const gap = Math.min(15, Math.abs(x2 - x1) / 3);
    dim.push(`
      <line x1="${N(x1 + 2)}" y1="${N(y)}" x2="${N(mid - gap)}" y2="${N(y)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <line x1="${N(x2 - 2)}" y1="${N(y)}" x2="${N(mid + gap)}" y2="${N(y)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <text class="dim" x="${N(mid)}" y="${N(y + 2.8)}" font-size="5.5" font-weight="600" text-anchor="middle">${label}</text>`);
  }

  function vDim(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const gap = Math.min(15, Math.abs(y2 - y1) / 3);
    dim.push(`
      <line x1="${N(x)}" y1="${N(y1 + 2)}" x2="${N(x)}" y2="${N(mid - gap)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <line x1="${N(x)}" y1="${N(y2 - 2)}" x2="${N(x)}" y2="${N(mid + gap)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <text class="dim" x="${N(x + 3)}" y="${N(mid)}" font-size="5.5" font-weight="600" transform="rotate(-90 ${N(x + 3)} ${N(mid)})" text-anchor="middle">${label}</text>`);
  }

  hDim(grid.xFrontL, grid.xFrontR, dimY, `W ${spec.W}mm`);
  hDim(grid.xFrontR, grid.xSideLR, dimY, `D ${spec.D}mm`);
  hDim(grid.xSideLR, grid.xBackR, dimY, `W ${spec.W}mm`);
  hDim(grid.xBackR, grid.xSideRR, dimY, `D ${spec.D}mm`);
  vDim(hDimX, grid.yBodyTop, grid.yBodyBottom, `H ${spec.H}mm`);

  return `\n    <g id="layer-dimensions">${dim.join('')}\n    </g>`;
}

function T001_v2_buildExportSVG(cfg) {
  const layout = T001_v2_getLayout(cfg.W, cfg.D, cfg.H);
  const { closedOuterPath, bleedPath, foldLines, bounds } = layout;
  const N = T001_v2_round;
  const pad = 5;
  const vbX = bounds.minX - pad;
  const vbY = bounds.minY - pad;
  const vbW = bounds.width + pad * 2;
  const vbH = bounds.height + pad * 2;

  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${N(vbX)} ${N(vbY)} ${N(vbW)} ${N(vbH)}" width="${N(vbW)}mm" height="${N(vbH)}mm">\n`;
  out += `  <path id="bleedPath" style="fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;" d="${bleedPath}"/>\n`;
  out += `  <path id="cutPath" style="fill:none;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;" d="${closedOuterPath}"/>\n`;
  out += '  <g id="foldLine">\n';
  foldLines.forEach(line => {
    out += `    <line id="${line.id}" style="fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;" x1="${N(line.x1)}" y1="${N(line.y1)}" x2="${N(line.x2)}" y2="${N(line.y2)}"/>\n`;
  });
  out += '  </g>\n</svg>';
  return out;
}

function T001_v2_buildDXF(cfg) {
  const layout = T001_v2_getLayout(cfg.W, cfg.D, cfg.H);
  const arr = ['0', 'SECTION', '2', 'ENTITIES'];
  layout.foldLines.forEach(line => {
    arr.push('0', 'LINE', '8', 'FOLD', '10', line.x1, '20', -line.y1, '30', '0', '11', line.x2, '21', -line.y2, '31', '0');
  });
  arr.push('0', 'ENDSEC', '0', 'EOF');
  return arr.join('\n');
}
