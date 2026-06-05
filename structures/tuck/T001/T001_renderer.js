// ============================================================
// T001_renderer.js — B-Type Tuck End Box
// 기준: 57-57-177-B-Type_T001_.svg (희야 승인 원본)
// Depends on: T001_layout.js → T001_getLayout()
// ============================================================

function T001_renderSVG(cfg, appState) {
  const { W, D, H } = cfg;
  const layout = T001_getLayout(W, D, H);
  const { cutPathD, bleedPathD, outerPath, foldLines, gluePathD, bounds, spec } = layout;

  const pad = 80;
  const vbX = bounds.minX - pad, vbY = bounds.minY - pad;
  const vbW = bounds.width  + pad * 2, vbH = bounds.height + pad * 2;
  const N = v => +v.toFixed(4);

  // ── spec에서 라벨 위치 계산 ─────────────────────────────
  const { xP1, xP2, xP3, xP4, xEnd, yTF, yLF, yBB, yLO } = spec;
  const xNeckC  = (xP3 + xP4) / 2;
  const yLSFTop = yLF - D * (28/57);

  // 패널명 + 사이즈 라벨 (W/D/H 자동갱신)
  const labels = [
    { name:'Upper-Tuck',     cx:(xP1+xP2)/2,  cy:yTF/2,               size:null       },
    { name:'lidTop',         cx:(xP1+xP2)/2,  cy:(yTF+yLF)/2,         size:null       },
    { name:'Glue',           cx:xP1*0.4,      cy:(yLF+yBB)/2,         size:null       },
    { name:'lidSideFlap(L)', cx:(xP2+xP3)/2,  cy:(yLSFTop+yLF)/2,     size:null       },
    { name:'Neck',           cx:xNeckC,       cy:yLF - D*(5/57),      size:null       },
    { name:'thumb notch',    cx:xNeckC,       cy:yLF + D*(10/57),     size:null       },
    { name:'lidSideFlap(R)', cx:(xP4+xEnd)/2, cy:(yLSFTop+yLF)/2,    size:null       },
    { name:'bottomLock-A',   cx:(xP1+xP2)/2,  cy:yBB + 4,             size:null       },
    { name:'bottomLock(L)',  cx:(xP2+xP3)/2,  cy:yBB + 4,             size:null       },
    { name:'bottomLock-B',   cx:(xP3+xP4)/2,  cy:yBB + 4,             size:null       },
    { name:'bottomLock(R)',  cx:(xP4+xEnd)/2, cy:yBB + 4,             size:null       },
    // 패널명만 (사이즈는 dimension line에서 표시)
    { name:'front',          cx:(xP1+xP2)/2,  cy:(yLF+yBB)/2,        size:null },
    { name:'sideL',          cx:(xP2+xP3)/2,  cy:(yLF+yBB)/2,        size:null },
    { name:'back',           cx:(xP3+xP4)/2,  cy:(yLF+yBB)/2,        size:null },
    { name:'sideR',          cx:(xP4+xEnd)/2, cy:(yLF+yBB)/2,        size:null },
  ];

  // ── dimension lines (M001 방식) ─────────────────────────────
  function hDimInside(x1, x2, y, label) {
    const mid = (x1+x2)/2, gap = Math.min(15, (x2-x1)/3);
    return `<line x1="${N(x1+2)}" y1="${N(y)}" x2="${N(mid-gap)}" y2="${N(y)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <line x1="${N(x2-2)}" y1="${N(y)}" x2="${N(mid+gap)}" y2="${N(y)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <text x="${N(mid)}" y="${N(y+2.5)}" font-size="5.5" font-weight="600" text-anchor="middle">${label}</text>`;
  }
  function vDimInside(x, y1, y2, label) {
    const mid = (y1+y2)/2, gap = Math.min(15, (y2-y1)/3);
    return `<line x1="${N(x)}" y1="${N(y1+2)}" x2="${N(x)}" y2="${N(mid-gap)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <line x1="${N(x)}" y1="${N(y2-2)}" x2="${N(x)}" y2="${N(mid+gap)}" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>
      <text x="${N(x+2.5)}" y="${N(mid)}" font-size="5.5" font-weight="600" transform="rotate(-90 ${N(x+2.5)} ${N(mid)})" text-anchor="middle">${label}</text>`;
  }

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
      .thomson { fill:#ffffff; stroke:#cc0000; stroke-width:0.45; stroke-linejoin:round; stroke-linecap:round; }
      .fold{fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;}
      .bleed   { fill:none; stroke:#0055ff; stroke-width:0.45; stroke-linejoin:round; stroke-linecap:round; }
      text { font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif; pointer-events:none; }
    </style>
  </defs>
  <rect x="${N(vbX)}" y="${N(vbY)}" width="${N(vbW)}" height="${N(vbH)}" fill="#d0d0d0" stroke="none"/>
  <g id="viewportGroup">`;

  // ① outerPath → fill:#ffffff + stroke:#cc0000 (M001 .thomson 방식)
  svg += `\n    <g id="layer-bg"><path class="thomson" d="${outerPath}"/></g>`;

// ② Glue 회색 - 안쪽 사다리꼴만 표시
const glueShadeD = [
  `M ${xP1 - 23} ${yLF + 10}`,
  `L ${xP1 - 2} ${yLF + 4}`,
  `L ${xP1 - 2} ${yBB - 4}`,
  `L ${xP1 - 23} ${yBB - 10}`,
  `Z`
].join(' ');

svg += `\n    <g id="layer-glue">
      <path d="${glueShadeD}" fill="#d9d9d9" stroke="none" opacity="0.95"/>
    </g>`;

  // ③ bleed 파란 외곽선
  svg += `\n    <g id="layer-bleed"><path class="bleed" d="${bleedPathD}"/></g>`;

  // ④ cut 빨간 선 (fill:none — 분리 조각이므로 fill 금지)
  svg += `\n    <g id="layer-cut"><path fill="none" stroke="#cc0000" stroke-width="0.45" stroke-linejoin="round" stroke-linecap="round" d="${cutPathD}"/></g>`;

  // fold lines — line만, id 텍스트 없음
  if (appState.showFolds) {
    svg += `\n    <g id="layer-fold">`;
    foldLines.forEach(f => {
      svg += `\n      <line class="fold" x1="${N(f.x1)}" y1="${N(f.y1)}" x2="${N(f.x2)}" y2="${N(f.y2)}"/>`;
    });
    svg += `\n    </g>`;
  }

  // labels — 패널명 + 사이즈 두 줄
  if (appState.showLabels) {
    svg += `\n    <g id="layer-labels">`;
    labels.forEach(l => {
      if (l.size) {
        svg += `\n      <text x="${N(l.cx)}" y="${N(l.cy)}" fill="#333" font-size="4.5" text-anchor="middle" dominant-baseline="middle">${l.name}</text>`;
        svg += `\n      <text x="${N(l.cx)}" y="${N(l.cy+5)}" fill="#555" font-size="4" text-anchor="middle" dominant-baseline="middle">${l.size}</text>`;
      } else {
        svg += `\n      <text x="${N(l.cx)}" y="${N(l.cy)}" fill="#333" font-size="4.5" text-anchor="middle" dominant-baseline="middle">${l.name}</text>`;
      }
    });
    svg += `\n    </g>`;
  }

  // dimension lines (M001 방식, showDims 토글)
  if (appState.showDims) {
    svg += `\n    <g id="layer-dimensions">`;
    svg += hDimInside(xP1, xP2, (yLF+yBB)/2 + 18, `W ${W}mm`);
    svg += hDimInside(xP2, xP3, (yLF+yBB)/2 + 18, `D ${D}mm`);
    svg += hDimInside(xP3, xP4, (yLF+yBB)/2 + 18, `W ${W}mm`);
    svg += hDimInside(xP4, xEnd, (yLF+yBB)/2 + 18, `D ${D}mm`);
    svg += vDimInside(xP2 - 10, yLF, yBB, `H ${H}mm`);
    svg += `\n    </g>`;
  }

  // watermark
  svg += `\n    <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>`;
  svg += `\n  </g>\n</svg>`;
  return svg;
}

// ─── Export SVG (Illustrator용) ───────────────────────────────
function T001_buildExportSVG(cfg) {
  const { W, D, H } = cfg;
  const layout = T001_getLayout(W, D, H);
  const { cutPathD, bleedPathD, foldLines, bounds } = layout;
  const pad = 5;
  const vbX = bounds.minX-pad, vbY = bounds.minY-pad;
  const vbW = bounds.width+pad*2, vbH = bounds.height+pad*2;
  const N = v => +v.toFixed(4);
  let out = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${N(vbX)} ${N(vbY)} ${N(vbW)} ${N(vbH)}" width="${N(vbW)}mm" height="${N(vbH)}mm">\n`;
  out += `  <path style="fill:none;stroke:#0055ff;stroke-width:0.45;" d="${bleedPathD}"/>\n`;
  out += `  <path style="fill:#ffffff;stroke:#cc0000;stroke-width:0.45;" d="${cutPathD}"/>\n`;
  foldLines.forEach(f => {
    out += `  <line style="fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;" x1="${N(f.x1)}" y1="${N(f.y1)}" x2="${N(f.x2)}" y2="${N(f.y2)}"/>\n`;
  });
  out += `</svg>`;
  return out;
}

// ─── DXF export ──────────────────────────────────────────────
function T001_buildDXF(cfg) {
  const { W, D, H } = cfg;
  const layout = T001_getLayout(W, D, H);
  const { foldLines } = layout;
  const arr = ['0','SECTION','2','ENTITIES'];
  foldLines.forEach(f => {
    arr.push('0','LINE','8','FOLD','10',f.x1,'20',-f.y1,'30','0','11',f.x2,'21',-f.y2,'31','0');
  });
  arr.push('0','ENDSEC','0','EOF');
  return arr.join('\n');
}
