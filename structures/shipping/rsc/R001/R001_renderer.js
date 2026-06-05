// ============================================================
// R001_renderer.js — A-Type Regular Slotted Container (RSC)
// Depends on: R001_spec.js, R001_layout.js
// 스타일 기준: M001 완전 동일 (변경 금지)
// ============================================================

function R001_renderSVG(cfg, appState) {
  var { W, D, H } = cfg;
  var layout = R001_getLayout(W, D, H);
  var { outerPath, bleedPathD, gluePathD, foldLines, labels, bounds } = layout;

  var pad = 80;
  var vbX = bounds.minX - pad, vbY = bounds.minY - pad;
  var vbW = bounds.width  + pad * 2, vbH = bounds.height + pad * 2;
  var N = function(v) { return (+v).toFixed(4); };

  var svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"' +
    ' viewBox="' + N(vbX) + ' ' + N(vbY) + ' ' + N(vbW) + ' ' + N(vbH) + '"' +
    ' width="100%" height="100%"' +
    ' preserveAspectRatio="xMidYMid meet">\n';

  svg += '  <defs>\n';
  svg += '    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">\n';
  svg += '      <path d="M0,0 L10,5 L0,10 Z" fill="#111"/>\n';
  svg += '    </marker>\n';
  svg += '    <pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">\n';
  svg += '      <text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700"' +
         ' fill="#999" opacity="0.12">PacVu</text>\n';
  svg += '    </pattern>\n';
  svg += '    <style>\n';
  svg += '      .thomson { fill:#ffffff; stroke:#cc0000; stroke-width:0.45; stroke-linejoin:round; stroke-linecap:round; }\n';
  svg += '      .fold    { fill:none; stroke:#1d6fe8; stroke-width:0.35; stroke-dasharray:2 1.6; }\n';
  svg += '      .glue    { fill:#d9d9d9; stroke:none; opacity:0.95; }\n';
  svg += '      .bleed   { fill:none; stroke:#0055ff; stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round; }\n';
  svg += '      text     { font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif; pointer-events:none; }\n';
  svg += '    </style>\n';
  svg += '  </defs>\n';

  svg += '  <rect x="' + N(vbX) + '" y="' + N(vbY) + '" width="' + N(vbW) + '" height="' + N(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '  <g id="viewportGroup">\n';

  // ① 외곽 Thomson path
  svg += '    <g id="layer-bg"><path class="thomson" d="' + outerPath + '"/></g>\n';

  // ② 풀칠면
  svg += '    <g id="layer-glue"><path class="glue" d="' + gluePathD + '"/></g>\n';

  // ③ bleed (칼선 위에 표시)
  if (bleedPathD) {
    svg += '    <g id="layer-bleed"><path class="bleed" d="' + bleedPathD + '"/></g>\n';
  }

  // ④ 접힘선
  if (appState.showFolds) {
    svg += '    <g id="layer-fold">\n';
    foldLines.forEach(function(f) {
      svg += '      <line class="fold"' +
        ' x1="' + N(f.x1) + '" y1="' + N(f.y1) + '"' +
        ' x2="' + N(f.x2) + '" y2="' + N(f.y2) + '"/>\n';
    });
    svg += '    </g>\n';
  }

  // ⑤ 라벨
  if (appState.showLabels) {
    svg += '    <g id="layer-labels">\n';
    labels.forEach(function(l) {
      var fs = l.name.indexOf('Flap') >= 0 ? 6 : 8;
      svg += '      <text x="' + N(l.cx) + '" y="' + N(l.cy) + '"' +
        ' fill="#333" font-size="' + fs + '" text-anchor="middle" dominant-baseline="middle">' +
        l.name + '</text>\n';
    });
    svg += '    </g>\n';
  }

  svg += '    <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';

  // ⑥ 사이즈 dimension lines (M001 방식)
  if (appState.showDims) {
    var { xGlueL, xFrontL, xFrontR, xSideLR, xBackR, xSideRR,
          yTop, yFoldTop, yFoldBot, yBot } = layout.spec;
    var yCB = (yFoldTop + yFoldBot) / 2;  // 본체 수직 중앙
    var dimY = yCB + H * 0.3;             // 하단 1/3 지점 (내부)
    function hDimR(x1, x2, y, label) {
      var mid = (x1+x2)/2, gap = Math.min(15, (x2-x1)/3);
      return '    <line x1="'+N(x1+2)+'" y1="'+N(y)+'" x2="'+N(mid-gap)+'" y2="'+N(y)+'" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>\n' +
             '    <line x1="'+N(x2-2)+'" y1="'+N(y)+'" x2="'+N(mid+gap)+'" y2="'+N(y)+'" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>\n' +
             '    <text x="'+N(mid)+'" y="'+N(y+3)+'" font-size="5.5" font-weight="600" fill="#111" text-anchor="middle">'+label+'</text>\n';
    }
    function vDimR(x, y1, y2, label) {
      var mid = (y1+y2)/2, gap = Math.min(15, (y2-y1)/3);
      return '    <line x1="'+N(x)+'" y1="'+N(y1+2)+'" x2="'+N(x)+'" y2="'+N(mid-gap)+'" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>\n' +
             '    <line x1="'+N(x)+'" y1="'+N(y2-2)+'" x2="'+N(x)+'" y2="'+N(mid+gap)+'" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)"/>\n' +
             '    <text x="'+N(x+3)+'" y="'+N(mid)+'" font-size="5.5" font-weight="600" fill="#111" transform="rotate(-90 '+N(x+3)+' '+N(mid)+')" text-anchor="middle">'+label+'</text>\n';
    }
    svg += '    <g id="layer-dimensions">\n';
    svg += hDimR(xFrontL, xFrontR, dimY, 'W '+W+'mm');
    svg += hDimR(xFrontR, xSideLR, dimY, 'D '+D+'mm');
    svg += hDimR(xSideLR, xBackR,  dimY, 'W '+W+'mm');
    svg += hDimR(xBackR,  xSideRR, dimY, 'D-2 '+(D-2)+'mm');
    var yFoldTop_arc = layout.spec.yFoldTop_arc || (yFoldTop + 2.5);
    var yFoldBot_arc = layout.spec.yFoldBot_arc || (yFoldBot - 2.5);
    svg += vDimR(xFrontR + (xSideLR-xFrontR)*0.35, yFoldTop_arc, yFoldBot_arc, 'H '+H+'mm');
    svg += '    </g>\n';
  }

  svg += '  </g>\n</svg>';
  return svg;
}

// ── Export SVG (Illustrator용, 워터마크 없음) ─────────────────
function R001_buildExportSVG(cfg) {
  var { W, D, H } = cfg;
  var layout = R001_getLayout(W, D, H);
  var { outerPath, bleedPathD, gluePathD, foldLines, bounds } = layout;
  var pad = 5;
  var vbX = bounds.minX-pad, vbY = bounds.minY-pad;
  var vbW = bounds.width+pad*2, vbH = bounds.height+pad*2;
  var N = function(v) { return (+v).toFixed(4); };

  var out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg"' +
    ' viewBox="' + N(vbX) + ' ' + N(vbY) + ' ' + N(vbW) + ' ' + N(vbH) + '"' +
    ' width="' + N(vbW) + 'mm" height="' + N(vbH) + 'mm">\n';
  if (bleedPathD) {
    out += '  <!-- Bleed: outerPath + stroke-width 6mm (fill:none) -->\n';
    out += '  <g id="layer-bleed">\n';
    out += '    <path style="fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;" d="' + bleedPathD + '"/>\n';
    out += '  </g>\n';
  }
  out += '  <path style="fill:#d9d9d9;stroke:none;" d="' + gluePathD + '"/>\n';
  out += '  <path style="fill:#ffffff;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;" d="' + outerPath + '"/>\n';
  foldLines.forEach(function(f) {
    out += '  <line style="fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;"' +
      ' x1="' + N(f.x1) + '" y1="' + N(f.y1) + '"' +
      ' x2="' + N(f.x2) + '" y2="' + N(f.y2) + '"/>\n';
  });
  out += '</svg>';
  return out;
}
