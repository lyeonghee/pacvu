// ============================================================
// PacVu G-Type v1 — Renderer  (Auto-Resize Redesign)
// 모든 geometry가 W / D / H / LH / FG / BLW 비율로 파생됨
// 축 혼용 없음, 고정 픽셀값 없음
// ============================================================
//
//  SECTIONS
//  ① STATE / RUNTIME          — state, FOLDING_LINES_NORMALIZED
//  ② INPUT / CONFIG           — val(), getCfg()
//  ③ LAYOUT GRID              — getGrid()
//  ④ GEOMETRY CONSTANTS       — getGeo()
//  ⑤ PRIMARY GEOMETRY BUILDER — arc18entry(), arc14entry(), buildOuterPath()
//  ⑥ SECONDARY GEOMETRY       — buildFoldLines(), buildSlots(), buildHoles()
//  ⑦ BLEED BUILDER            — buildBleedPath()
//  ⑧ SVG ASSEMBLY             — roundRectPath(), circlePath(), getBounds(), renderSVG()
//  ⑨ RENDER LOOP              — render(), scheduleRender()
//  ⑩ VIEWPORT / PAN / ZOOM    — applyTransform(), fitToScreen(), snapZoom(), zoomAt()
//  ⑪ EXPORT                   — downloadFile(), svgToDXF()
//  ⑫ UI BINDINGS / INIT       — bindAll(), init
// ============================================================


// ============================================================
// ① STATE / RUNTIME
// ============================================================

const state = {
  showSlots: true, showHoles: true, showLabels: true,
  zoom: 1, panX: 0, panY: 0,
  isDragging: false, dragStartX: 0, dragStartY: 0,
  startPanX: 0, startPanY: 0,
  currentSVGString: '', fitInitialized: false,
  baseVB: null  // fitToScreen이 계산한 기준 viewBox {x,y,w,h,cx,cy}
};

let FOLDING_LINES_NORMALIZED = { foldingLines: [] };


// ============================================================
// ② INPUT / CONFIG
// ============================================================

// ── Input helpers ────────────────────────────────────────────
function val(id, fb = 0) {
  const el = document.getElementById(id);
  if (!el) return fb;
  const n = parseFloat(el.value);
  return Number.isFinite(n) ? n : fb;
}

function getCfg() {
  const D = val('baseD', 229);
  const H = val('panelH', 91);
  return {
    W: val('baseW', 235),
    D,
    H,
    LH: D,
    FG: val('foldGap', 5),
    BLW: H,  // ★ lockFlap 폭 = sidePanel 폭(H) 연동
    BIH: val('backInsertH', 80),
    FIH: val('frontInsertH', 80),
    CR: val('chamfer', 8),
    ni: val('lockNeckInset', 10),
    td: val('lockTabDepth', 12),
    th: val('lockTabHeight', 18),
    SK: val('insertSkew', 8),
    holeDia: val('holeDia', 6),
    holeGap: val('holeGap', 70),
    holeOffsetY: val('holeOffsetY', 45)
  };
}

// ============================================================
// ③ LAYOUT GRID
// ============================================================

// ── Coordinate grid ──────────────────────────────────────────
function getGrid(cfg) {
  const { W, D, H, LH, FG, BLW } = cfg;
  const xBLL = 0, xFL = BLW, xSL = BLW + FG, xCL = xSL + H;
  const xCR = xCL + W, xFR = xCR + H, xBLR = xFR + FG, xEnd = xBLR + BLW;
  const y0 = 0, y1 = H, y2 = H + LH, y3 = y2 + H, y4 = y3 + D, y5 = y4 + H;
  return { xBLL, xFL, xSL, xCL, xCR, xFR, xBLR, xEnd, y0, y1, y2, y3, y4, y5 };
}

// ============================================================
// ④ GEOMETRY CONSTANTS
// ============================================================

// ── Geometry constants (비율 파생) ───────────────────────────
// 기준형 W=235, D=229, H=91, LH=229 에서 역산
// 각 상수가 어느 축에 속하는지 명시
function getGeo(cfg) {
  const { W, D, H, LH, FG } = cfg;

  // ■ H 기준 (side panel = 박스 높이)
  const neckR = H * 0.026;       // lid neck arc radius
  const sfDX = H * 0.841;       // ★ 기존 W*0.326 → H 기준 (76.5/91)
  const sfDY = H * 0.227;       // lid side flap diagonal Y
  const dfH1 = H * 0.665;       // dust flap height
  const dfNY = H * 0.951;       // dust flap neck Y
  const r19 = H * 0.104;       // 1-9 arc radius
  const r11 = H * 0.0165;      // 1-11 locking arc radius
  const insertW = Math.min(H * 0.863, W * 0.4);  // ★ W 축소 시 backInsert 교차 방지
  const fiR = H * 0.104;       // ★ 기존 9.5 고정  → H 기준 (= r19)
  const fiTopDrop = H * 0.049;       // ★ 기존 4.5 고정  → H 기준
  const fiStepY = H * 0.011;       // ★ 기존 1.0 고정  → H 기준
  const bzOff = H * 0.110;       // ★ 기존 10 고정   → H 기준
  const bzTan13 = H * 0.143;       // ★ 기존 13 고정   → H 기준
  const bzTan8 = H * 0.088;       // ★ 기존 8 고정    → H 기준
  const bzTan1 = H * 0.011;       // ★ 기존 1 고정    → H 기준
  const dustMarg = H * 0.027;       // ★ 기존 2.5 고정  → H 기준
  const dust73 = H * 0.802;       // ★ 기존 73 고정   → H 기준

  // ■ LH 기준 (뚜껑 깊이) ★ 기존 H*1.75 → LH 기준
  const TC_V = Math.max(LH * 0.697, H * 0.8);  // ★ D 축소 시 찌그러짐 방지

  // ■ W 기준
  const dfW = Math.min(W * 0.351, H * 0.92);  // ★ W 확장 시 dustFlap 늘어남 방지
  const dfNeckX = dfW * 0.769;     // ★ 기존 63.42 고정 → dfW 비율 (63.42/82.5)

  // ■ D 기준
  const dROP = D * 0.010;      // lid front top drop
  const outerLockInset = D * (35.0 / 229);
  const outerLockH = D * (35.0 / 229);
  const outerLockOut = D * (5.0 / 229);
  const outerLockDiag = D * (1.5 / 229);
  const outerLockOuterStr = D * (32.0 / 229);
  const outerLockGap = D * (85.0 / 229); // ★ 기존 85 고정 → D 기준

  // ■ FG 기준 (fold gap) ★ 기존 2 고정 → FG 기준
  const foldNotch = FG * 0.4;

  return {
    neckR, sfDX, sfDY, dfH1, dfNY, r19, r11,
    insertW, fiR, fiTopDrop, fiStepY,
    bzOff, bzTan13, bzTan8, bzTan1, dustMarg, dust73,
    TC_V, dfW, dfNeckX, dROP,
    outerLockInset, outerLockH, outerLockOut, outerLockDiag,
    outerLockOuterStr, outerLockGap, foldNotch
  };
}

// ============================================================
// ⑤ PRIMARY GEOMETRY BUILDER
// ============================================================

// ── Arc helpers ──────────────────────────────────────────────
function arc18entry(qx, qy, cx, cy, R) {
  const dcx = cx - qx, dcy = cy - qy, d = Math.sqrt(dcx * dcx + dcy * dcy);
  const t = Math.sqrt(Math.max(0, d * d - R * R)), ang = Math.atan2(dcy, dcx);
  const th = Math.asin(Math.min(1, R / d));
  const T1 = [qx + t * Math.cos(ang - th), qy + t * Math.sin(ang - th)];
  const T2 = [qx + t * Math.cos(ang + th), qy + t * Math.sin(ang + th)];
  return T1[1] <= T2[1] ? T1 : T2;
}
function arc14entry(qx, qy, cx, cy, R) {
  const dcx = cx - qx, dcy = cy - qy, d = Math.sqrt(dcx * dcx + dcy * dcy);
  const t = Math.sqrt(Math.max(0, d * d - R * R)), ang = Math.atan2(dcy, dcx);
  const th = Math.asin(Math.min(1, R / d));
  const T1 = [qx + t * Math.cos(ang - th), qy + t * Math.sin(ang - th)];
  const T2 = [qx + t * Math.cos(ang + th), qy + t * Math.sin(ang + th)];
  return T1[1] >= T2[1] ? T1 : T2;
}

// ── Outer Thomson path ───────────────────────────────────────
function buildOuterPath(cfg, g) {
  const { ni, td, th, D } = cfg;
  const { xBLL, xFL, xSL, xCL, xCR, xFR, xBLR, xEnd, y0, y1, y2, y3, y4, y5 } = g;
  const geo = getGeo(cfg);
  const {
    neckR, sfDX, sfDY, dfH1, dfNY, r19, r11,
    insertW, fiR, fiTopDrop, fiStepY,
    bzOff, bzTan13, bzTan8, bzTan1, dustMarg, dust73,
    TC_V, dfW, dfNeckX, dROP,
    outerLockInset, outerLockH, outerLockOut, outerLockDiag,
    outerLockOuterStr, outerLockGap, foldNotch
  } = geo;

  const sfNorm = Math.sqrt(sfDX * sfDX + sfDY * sfDY);

  // lock tab (D 비율, 변경 없음)
  const lY1 = y3 + D * 0.32, lY2 = y3 + D * 0.50 - th / 2, lY3 = y3 + D * 0.50 + th / 2, lY4 = y3 + D * 0.68;
  const lNI = Math.min(ni, cfg.BLW * 0.35), lTD = Math.min(td, cfg.BLW * 0.35);

  // top shape
  const neckY = y0 + dROP + dfNY;
  const y16Top = y1 + sfDY + bzTan13;
  const y16Bot = y16Top + TC_V;

  // Left 1-4L ~ 1-9L
  const e4L = arc14entry(xCL - sfDX, y1 + sfDY, xCL, y1, neckR);
  const h4Lx = xCL, h4Ly = y1 - neckR;
  const x15eL = xCL - sfDX, y15eL = y1 + sfDY;
  const c15_1x = xSL, c15_1y = y16Top - bzTan8;
  const c15_2x = x15eL - (sfDX / sfNorm) * bzOff, c15_2y = y15eL + (sfDY / sfNorm) * bzOff;
  const x16L = xSL;
  const x17sL = xSL + bzOff, y17sL = y16Bot + bzTan13;
  const x17eL = xSL, y17eL = y16Bot;
  const c17_1x = x17sL - (sfDX / sfNorm) * bzOff, c17_1y = y17sL - (sfDY / sfNorm) * bzOff;
  const c17_2x = x17eL, c17_2y = y17eL + bzTan1;
  const e18L = arc18entry(xSL + bzOff, y16Bot + bzTan13, xCL, y2, neckR);

  // Right 1-4R ~ 1-9R
  const e4R = arc14entry(xCR + sfDX, y1 + sfDY, xCR, y1, neckR);
  const x15eR = xFR, y15eR = y16Top;
  const c15R_1x = (xCR + sfDX) + (sfDX / sfNorm) * bzOff, c15R_1y = (y1 + sfDY) + (sfDY / sfNorm) * bzOff;
  const c15R_2x = x15eR, c15R_2y = y15eR - bzTan8;
  const e18R = arc18entry(xFR - bzOff, y16Bot + bzTan13, xCR, y2, neckR);

  // insert geometry
  const xInsL = xCL - insertW, xInsR = xCR + insertW;
  const backDiagDy = fiTopDrop - 2 * r11, backDiagStartY = y3 - 2 * r11 - backDiagDy;
  const outerLockTopY = y3 + foldNotch;
  const outerLock1StartY = outerLockTopY + outerLockInset;
  const outerLock1EndY = outerLock1StartY + outerLockH;
  const outerLock2StartY = outerLock1EndY + outerLockGap;
  const outerLock2EndY = outerLock2StartY + outerLockH;
  const outerLockBottomY = y4 - foldNotch;
  const y18Top = y4 + fiTopDrop, y18Bot = y5 - (fiR + fiStepY), y20 = y5 - fiStepY;
  const x21L = xCL + r11, x21R = xCR - r11;

  const p = [];
  p.push(`M ${xCL} ${y0 + dROP}`);
  p.push(`L ${xCL} ${y0}`, `L ${xCR} ${y0}`, `L ${xCR} ${y0 + dROP}`);

  // dust flap right
  p.push(`C ${xCR + dfW * 0.552} ${y0 + dROP} ${xCR + dfW} ${y0 + dROP + dfH1 * 0.448} ${xCR + dfW} ${y0 + dROP + dfH1}`);
  p.push(`C ${xCR + dfW} ${y0 + dROP + dust73} ${xCR + dfW - dustMarg} ${y0 + dROP + dfNY} ${xCR + dfNeckX} ${y0 + dROP + dfNY}`);

  // right top
  p.push(`L ${xCR} ${neckY}`, `L ${xCR} ${y1 - neckR}`);
  p.push(`A ${neckR} ${neckR} 0 0 0 ${e4R[0]} ${e4R[1]}`);
  p.push(`L ${xCR + sfDX} ${y1 + sfDY}`);
  p.push(`C ${c15R_1x} ${c15R_1y} ${c15R_2x} ${c15R_2y} ${x15eR} ${y15eR}`);
  p.push(`L ${xFR} ${y16Bot}`);
  p.push(`C ${xFR} ${y16Bot + bzTan1} ${xFR - bzOff + (sfDX / sfNorm) * bzOff} ${y16Bot + bzTan13 - (sfDY / sfNorm) * bzOff} ${xFR - bzOff} ${y16Bot + bzTan13}`);
  p.push(`L ${e18R[0]} ${e18R[1]}`);
  p.push(`A ${neckR} ${neckR} 0 0 0 ${xCR} ${y2 + neckR}`);
  p.push(`L ${xInsR - r19} ${y2 + neckR}`);
  p.push(`A ${r19} ${r19} 0 0 1 ${xInsR} ${y2 + neckR + r19}`);

  // back insert right
  p.push(`L ${xInsR} ${backDiagStartY}`, `L ${xCR} ${y3 - 2 * r11}`);
  p.push(`A ${r11} ${r11} 0 0 0 ${xCR} ${y3}`);

  // base right + lock flap right
  p.push(`L ${xFR} ${y3}`, `L ${xBLR} ${y3 + foldNotch}`, `L ${xEnd} ${y3 + foldNotch}`);
  p.push(`L ${xEnd} ${outerLock1StartY}`);
  p.push(`L ${xEnd + outerLockOut} ${outerLock1StartY + outerLockDiag}`);
  p.push(`L ${xEnd + outerLockOut} ${outerLock1StartY + outerLockDiag + outerLockOuterStr}`);
  p.push(`L ${xEnd} ${outerLock1EndY}`, `L ${xEnd} ${outerLock2StartY}`);
  p.push(`L ${xEnd + outerLockOut} ${outerLock2StartY + outerLockDiag}`);
  p.push(`L ${xEnd + outerLockOut} ${outerLock2StartY + outerLockDiag + outerLockOuterStr}`);
  p.push(`L ${xEnd} ${outerLock2EndY}`, `L ${xEnd} ${outerLockBottomY}`);

  // front insert right
  p.push(`L ${xBLR} ${y4 - foldNotch}`, `L ${xFR} ${y4}`, `L ${xCR} ${y4}`);
  p.push(`A ${r11} ${r11} 0 0 0 ${xCR} ${y4 + 2 * r11}`);
  p.push(`L ${xInsR} ${y18Top}`, `L ${xInsR} ${y18Bot}`);
  p.push(`A ${fiR} ${fiR} 0 0 1 ${xInsR - fiR} ${y20}`);
  p.push(`L ${xCR} ${y20}`, `L ${x21R} ${y5}`, `L ${x21L} ${y5}`);

  // front insert left
  p.push(`L ${xCL} ${y20}`, `L ${xInsL + fiR} ${y20}`);
  p.push(`A ${fiR} ${fiR} 0 0 1 ${xInsL} ${y18Bot}`);
  p.push(`L ${xInsL} ${y18Top}`, `L ${xCL} ${y4 + 2 * r11}`);
  p.push(`A ${r11} ${r11} 0 0 0 ${xCL} ${y4}`);
  p.push(`L ${xSL} ${y4}`, `L ${xFL} ${y4 - foldNotch}`, `L ${xBLL} ${y4 - foldNotch}`);

  // lock flap left
  p.push(`L ${xBLL} ${outerLock2EndY}`);
  p.push(`L ${xBLL - outerLockOut} ${outerLock2StartY + outerLockDiag + outerLockOuterStr}`);
  p.push(`L ${xBLL - outerLockOut} ${outerLock2StartY + outerLockDiag}`, `L ${xBLL} ${outerLock2StartY}`);
  p.push(`L ${xBLL} ${outerLock1EndY}`);
  p.push(`L ${xBLL - outerLockOut} ${outerLock1StartY + outerLockDiag + outerLockOuterStr}`);
  p.push(`L ${xBLL - outerLockOut} ${outerLock1StartY + outerLockDiag}`, `L ${xBLL} ${outerLock1StartY}`);
  p.push(`L ${xBLL} ${outerLockTopY}`);

  // back insert left
  p.push(`L ${xFL} ${y3 + foldNotch}`, `L ${xSL} ${y3}`, `L ${xCL} ${y3}`);
  p.push(`A ${r11} ${r11} 0 0 0 ${xCL} ${y3 - 2 * r11}`);
  p.push(`L ${xInsL} ${backDiagStartY}`);

  // left top
  p.push(`L ${xInsL} ${y2 + neckR + r19}`);
  p.push(`A ${r19} ${r19} 0 0 1 ${xInsL + r19} ${y2 + neckR}`);
  p.push(`L ${xCL} ${y2 + neckR}`);
  p.push(`A ${neckR} ${neckR} 0 0 0 ${e18L[0]} ${e18L[1]}`);
  p.push(`L ${x17sL} ${y17sL}`);
  p.push(`C ${c17_1x} ${c17_1y} ${c17_2x} ${c17_2y} ${x17eL} ${y17eL}`);
  p.push(`L ${x16L} ${y16Top}`);
  p.push(`C ${c15_1x} ${c15_1y} ${c15_2x} ${c15_2y} ${x15eL} ${y15eL}`);
  p.push(`L ${e4L[0]} ${e4L[1]}`);
  p.push(`A ${neckR} ${neckR} 0 0 0 ${h4Lx} ${h4Ly}`);
  p.push(`L ${xCL - dfNeckX} ${h4Ly}`);

  // dust flap left
  p.push(`C ${xCL - dfW + dustMarg} ${h4Ly} ${xCL - dfW} ${y0 + dROP + dust73} ${xCL - dfW} ${y0 + dROP + dfH1}`);
  p.push(`C ${xCL - dfW} ${y0 + dROP + dfH1 * 0.448} ${xCL - dfW * 0.552} ${y0 + dROP} ${xCL} ${y0 + dROP}`);
  p.push(`Z`);
  return p.join(' ');
}

// ============================================================
// ⑥ SECONDARY GEOMETRY
// ============================================================

// ── Fold lines — 완전 동적 계산 (JSON 의존 없음) ─────────────
function buildFoldLines(cfg, g) {
  const { D } = cfg;
  const { xBLL, xFL, xSL, xCL, xCR, xFR, xBLR, y0, y1, y2, y3, y4, y5 } = g;
  const { neckR, r11, dROP, foldNotch } = getGeo(cfg);

  const baseCenterY = y3 + D / 2;
  const slotH = D * (35 / 229);
  const slot1Y = baseCenterY - D * 0.334;
  const slot2Y = baseCenterY + D * 0.190;
  const fm = foldNotch;

  const L = [];
  // f-1: lidFront 수직
  L.push({ x1: xCL, y1: y0 + dROP, x2: xCL, y2: y1 - neckR });
  L.push({ x1: xCR, y1: y0 + dROP, x2: xCR, y2: y1 - neckR });
  // f-2: lid 상단 수평
  L.push({ x1: xCL + fm, y1: y1, x2: xCR - fm, y2: y1 });
  // f-3: lid 수직
  L.push({ x1: xCL + fm, y1: y1, x2: xCL + fm, y2: y2 });
  L.push({ x1: xCR - fm, y1: y1, x2: xCR - fm, y2: y2 });
  // f-4: back 상단 수평
  L.push({ x1: xCL + fm, y1: y2, x2: xCR - fm, y2: y2 });
  // f-5: back 수직
  L.push({ x1: xCL + fm, y1: y2, x2: xCL + fm, y2: y3 - fm });
  L.push({ x1: xCR - fm, y1: y2, x2: xCR - fm, y2: y3 - fm });
  // f-6: base 상단 수평
  L.push({ x1: xCL, y1: y3, x2: xCR, y2: y3 });
  // f-7 outer: lockFlap 수직 ★ foldNotch만큼 짧게 (inner f-7L-2/R-2와 단차)
  L.push({ x1: xFL, y1: y3 + fm, x2: xFL, y2: y4 - fm });  // f-7L-1
  L.push({ x1: xBLR, y1: y3 + fm, x2: xBLR, y2: y4 - fm });  // f-7R-1
  // f-7 inner: sidePanel 수직
  L.push({ x1: xSL, y1: y3, x2: xSL, y2: y4 });           // f-7L-2
  L.push({ x1: xFR, y1: y3, x2: xFR, y2: y4 });           // f-7R-2
  // f-7 slot 연결 (xCL/xCR 수직, slot 사이 끊어서)
  // f-7 slot 연결 (xCL/xCR 수직, slot 사이 끊어서)
  L.push({ x1: xCL, y1: y3, x2: xCL, y2: slot1Y });
  L.push({ x1: xCL, y1: slot1Y + slotH, x2: xCL, y2: slot2Y });
  L.push({ x1: xCL, y1: slot2Y + slotH, x2: xCL, y2: y4 });

  L.push({ x1: xCR, y1: y3, x2: xCR, y2: slot1Y });
  L.push({ x1: xCR, y1: slot1Y + slotH, x2: xCR, y2: slot2Y });
  L.push({ x1: xCR, y1: slot2Y + slotH, x2: xCR, y2: y4 });
  // f-8: front 상단 수평
  L.push({ x1: xCL, y1: y4, x2: xCR, y2: y4 });
  // f-9: frontInsert 수직 (x21 정렬과 동일)
  L.push({ x1: xCL + r11, y1: y4, x2: xCL + r11, y2: y5 });
  L.push({ x1: xCR - r11, y1: y4, x2: xCR - r11, y2: y5 });

  return L;
}

// ── Slots ─────────────────────────────────────────────────────
function buildSlots(cfg, g) {
  const { D } = cfg;
  const { xCL, xCR, y3 } = g;
  const baseCenterX = (xCL + xCR) / 2, baseCenterY = y3 + D / 2;
  const slotW = D * (5 / 229), slotH = D * (35 / 229);
  const leftX = baseCenterX - (xCR - xCL) / 2;
  const rightX = baseCenterX + (xCR - xCL) / 2 - slotW;
  const slot1Y = baseCenterY - D * 0.334, slot2Y = baseCenterY + D * 0.190;
  return [
    { x: leftX, y: slot1Y, w: slotW, h: slotH },
    { x: leftX, y: slot2Y, w: slotW, h: slotH },
    { x: rightX, y: slot1Y, w: slotW, h: slotH },
    { x: rightX, y: slot2Y, w: slotW, h: slotH }
  ];
}

// ── Holes ─────────────────────────────────────────────────────
function buildHoles(cfg, g) {
  const { holeDia, holeGap, holeOffsetY } = cfg;
  const { xCL, xCR, y2 } = g;
  const r = holeDia / 2, cx = (xCL + xCR) / 2, cy = y2 + holeOffsetY;
  return [{ cx: cx - holeGap / 2, cy, r }, { cx: cx + holeGap / 2, cy, r }];
}

// ============================================================
// ⑧ SVG ASSEMBLY
// ============================================================

// ── SVG helpers ───────────────────────────────────────────────
function roundRectPath(x, y, w, h, r = 2) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + rr} ${y}L${x + w - rr} ${y}Q${x + w} ${y} ${x + w} ${y + rr}L${x + w} ${y + h - rr}Q${x + w} ${y + h} ${x + w - rr} ${y + h}L${x + rr} ${y + h}Q${x} ${y + h} ${x} ${y + h - rr}L${x} ${y + rr}Q${x} ${y} ${x + rr} ${y}Z`;
}
function circlePath(cx, cy, r) {
  return `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
}

// ============================================================
// ⑦ BLEED BUILDER
//
//  buildBleedPath(cfg, g, d)
//  d = bleed offset mm (기본 4mm)
//
//  내부 구성 순서 (시계방향):
//  [A] lidFront top          — 상단 수평선 좌우 연장
//  [B] dustFlap right        — 우측 dust flap 베지어 (1-3R)
//  [C] neck right / 1-5R     — neck V-apex → 대각선 bleed
//  [D] lidSideFlap right     — 1-5R 베지어 → 수직 → 1-7R 베지어
//  [E] backInsert right      — 1-9R arc → 수직
//  [F] base right            — 수평 → lockFlap right (사다리꼴 3면)
//  [G] frontInsert right     — 수직 → 하단 arc
//  [H] front bottom          — 하단 수평
//  [I] frontInsert left      — 하단 arc → 수직 (left)
//  [J] lockFlap left         — 사다리꼴 3면 (going UP)
//  [K] backInsert left       — 수직 → 1-9L arc
//  [L] 1-7L bezier / 1-5L   — 수직 → 1-7L 베지어 → 대각선 bleed
//  [M] neck left             — V-apex → neck 수평
//  [N] dustFlap left         — 좌측 dust flap 베지어 (1-3L)
// ============================================================

// ──  bleed line ───────────────────────────────────────────────
function buildBleedPath(cfg, g, d) {
  const { xBLL, xFL, xSL, xCL, xCR, xFR, xBLR, xEnd, y0, y1, y2, y3, y4, y5 } = g;
  const geo = getGeo(cfg);
  const {
    neckR, dfH1, dfNY, r19, r11, insertW, fiR, fiTopDrop, fiStepY,
    dustMarg, dust73, dfW, dfNeckX, dROP,
    outerLockInset, outerLockH, outerLockOut, outerLockDiag,
    outerLockOuterStr, outerLockGap, foldNotch,
    sfDX, sfDY, bzOff, bzTan13, bzTan8, bzTan1, TC_V
  } = geo;

  const sfNorm = Math.sqrt(sfDX * sfDX + sfDY * sfDY);
  const y16Top = y1 + sfDY + bzTan13;
  const y16Bot = y16Top + TC_V;

  // ── 기본 오프셋 ──────────────────────────────────────────────────
  const by0  = y0 - d,  by5 = y5 + d;
  const by3  = y3 - d,  by4 = y4 + d;
  const bBLL = xBLL - d, bEnd = xEnd + d;
  const bFR  = xFR + d,  bSL  = xSL - d;
  const bdfW     = dfW + d * 1.15;  // ★ 1-3L 처짐 보정
  const bdfNeckX = bdfW * (dfNeckX / dfW);
  const bDust73  = dust73 * (bdfW / dfW);  // ★ Y비율 비례
  const bInsR = xCR + insertW + d, bInsL = xCL - insertW - d;
  const xInsL = xCL - insertW;
  const br19 = r19 + d, bfiR = fiR + d;
  const bneckY = y0 + dROP + dfNY + d;  // ★ 실제 neck Y + 5mm 오프셋

  // lidSideFlap bezier 제어점
  const c15R_1x = (xCR + sfDX) + (sfDX / sfNorm) * bzOff;
  const c15R_1y = (y1 + sfDY)  + (sfDY / sfNorm) * bzOff;
  const x15eL   = xCL - sfDX,    y15eL = y1 + sfDY;
  const c15_1x  = xSL,           c15_1y = y16Top - bzTan8;
  const c15_2x  = x15eL - (sfDX / sfNorm) * bzOff;
  const c15_2y  = y15eL + (sfDY / sfNorm) * bzOff;
  const x17sL   = xSL + bzOff,   y17sL = y16Bot + bzTan13;
  const c17_1x  = x17sL - (sfDX / sfNorm) * bzOff;
  const c17_1y  = y17sL - (sfDY / sfNorm) * bzOff;
  const c17_2x  = xSL,           c17_2y = y16Bot + bzTan1;

  // ★ 대각선 5mm 법선 오프셋 (1-5, 1-14 끝점)
  const nxD    = sfDY / sfNorm,  nyD = sfDX / sfNorm;
  const bDiagRx = xCR + sfDX + nxD * d;
  const bDiagLx = xCL - sfDX - nxD * d;
  const bDiagY  = y1 + sfDY - nyD * d;

  // ★ Neck V apex: 수평 bleed(y=bneckY) 과 대각선 bleed 의 교점 X (클램프 적용)
  const vNeckRxRaw = bDiagRx - sfDX * (bDiagY - bneckY) / sfDY - 5;
  const vNeckRx = Math.min(vNeckRxRaw, xCR + bdfNeckX - 1);
  const vNeckLxRaw = bDiagLx + sfDX * (bDiagY - bneckY) / sfDY + 5;
  const vNeckLx = Math.max(vNeckLxRaw, xCL - bdfNeckX + 1);

  // ★ BackInsert V (y2): 1-7 offset 끝에서 1-9 horizontal offset 으로 직행
  // 1-9 horizontal 5mm 위 = y2+neckR (기존 유지, x만 확장)
  // 1-7 bezier 끝 (bFR-bzOff, y16Bot+bzTan13) → straight to (bInsR-br19, y2+neckR)

  // lockFlap Y
  const outerLockTopY    = y3 + foldNotch;
  const outerLock1StartY = outerLockTopY + outerLockInset;
  const outerLock1EndY   = outerLock1StartY + outerLockH;
  const outerLock2StartY = outerLock1EndY + outerLockGap;
  const outerLock2EndY   = outerLock2StartY + outerLockH;
  const outerLockBottomY = y4 - foldNotch;



  // frontInsert 하단
  const by18Bot = by5 - (bfiR + fiStepY), by20 = by5 - fiStepY;
  const x21L = xCL + r11, x21R = xCR - r11;

  const p = [];

  // ── [A] lidFront top ─────────────────────────────────────────────
  p.push(`M ${xCL - d} ${by0 + dROP}`);
  p.push(`L ${xCL - d} ${by0}`, `L ${xCR + d} ${by0}`, `L ${xCR + d} ${by0 + dROP}`);

  // ── [B] dustFlap right (1-3R) ────────────────────────────────────
  p.push(`C ${xCR + bdfW * 0.552} ${by0 + dROP} ${xCR + bdfW} ${y0 + dROP + dfH1 * 0.448} ${xCR + bdfW} ${y0 + dROP + dfH1}`);
  p.push(`C ${xCR + bdfW} ${by0 + dROP + bDust73} ${xCR + bdfW - dustMarg} ${bneckY} ${xCR + bdfNeckX} ${bneckY}`);

  // ── [C] neck right V-apex → 1-5R 대각선 ─────────────────────────
  p.push(`L ${vNeckRx} ${bneckY}`);          // 수평·대각 bleed 교점
  p.push(`L ${bDiagRx} ${bDiagY}`);          // 1-5R 대각선 bleed 시작

// ── [D] lidSideFlap right: 1-5R 베지어 → 수직 → 1-7R 베지어 ──
const c15R_2x = xFR;
const c15R_2y = y16Top - bzTan8;

p.push(`C ${c15R_1x + nxD * d * 1.2} ${c15R_1y - nyD * d * 1.2} ${bFR} ${y16Top - bzTan8} ${bFR} ${y16Top}`);
p.push(`L ${bFR} ${y16Bot}`);

const _n17r = Math.sqrt(bzOff * bzOff + bzTan13 * bzTan13);
const _nxr = bzTan13 / _n17r, _nyr = bzOff / _n17r;
const c17R_2x = bFR;                                                         // CP1: 수직접선
const c17R_2y = y16Bot + bzTan1;
const c17R_1x = xFR - bzOff + (sfDX / sfNorm) * bzOff + _nxr * d * 1.25;
const c17R_1y = y16Bot + bzTan13 - (sfDY / sfNorm) * bzOff + _nyr * d * 1.25;
const ep7Rx = xFR - bzOff + _nxr * d * 1.25;
const ep7Ry = y16Bot + bzTan13 + _nyr * d * 1.25;

// ── 1-7R: mirror of 1-7L ───────────────────────────────────────
p.push(`C ${c17R_2x} ${c17R_2y} ${c17R_1x} ${c17R_1y} ${ep7Rx} ${ep7Ry}`);

// ── [E] 1-7R 끝 → 1-9R backInsert ──────────────────────────────
p.push(`L ${xCR + d + 10} ${y2 - neckR}`);
p.push(`L ${bInsR - br19} ${y2 - neckR}`);
p.push(`A ${br19} ${br19} 0 0 1 ${bInsR} ${y2 - neckR + br19}`);
p.push(`L ${bInsR} ${by3}`);

  // ── [F] base right + lockFlap right (사다리꼴 3면 5mm) ─────────
  p.push(`L ${xFR} ${by3}`);
  p.push(`L ${xBLR} ${by3 + foldNotch}`);
  p.push(`L ${bEnd} ${by3 + foldNotch}`);
  p.push(`L ${bEnd} ${outerLock1StartY - d}`);
  p.push(`L ${bEnd + outerLockOut} ${outerLock1StartY + outerLockDiag - d}`);
  p.push(`L ${bEnd + outerLockOut} ${outerLock1StartY + outerLockDiag + outerLockOuterStr + d}`);
  p.push(`L ${bEnd} ${outerLock1EndY + d}`);
  p.push(`L ${bEnd} ${outerLock2StartY - d}`);
  p.push(`L ${bEnd + outerLockOut} ${outerLock2StartY + outerLockDiag - d}`);
  p.push(`L ${bEnd + outerLockOut} ${outerLock2StartY + outerLockDiag + outerLockOuterStr + d}`);
  p.push(`L ${bEnd} ${outerLock2EndY + d}`);
  p.push(`L ${bEnd} ${by4 - foldNotch}`);

  // ── [G] frontInsert right ────────────────────────────────────
  p.push(`L ${xBLR} ${by4 - foldNotch}`);
  p.push(`L ${xFR} ${by4}`);
  p.push(`L ${bInsR} ${by4}`);
  p.push(`L ${bInsR} ${by18Bot}`);
  p.push(`A ${bfiR} ${bfiR} 0 0 1 ${bInsR - bfiR} ${by20}`);
  p.push(`L ${xCR} ${by20}`, `L ${x21R} ${by5}`, `L ${x21L} ${by5}`);

  // ── [H] front bottom + [I] frontInsert left ──────────────────
  p.push(`L ${xCL} ${by20}`, `L ${bInsL + bfiR} ${by20}`);
  p.push(`A ${bfiR} ${bfiR} 0 0 1 ${bInsL} ${by18Bot}`);
  p.push(`L ${bInsL} ${by4}`);
  p.push(`L ${xSL} ${by4}`);
  p.push(`L ${xFL} ${by4 - foldNotch}`);
  p.push(`L ${bBLL} ${by4 - foldNotch}`);

  // ── [J] lockFlap left (사다리꼴 3면 5mm, going UP) ───────────
  p.push(`L ${bBLL} ${outerLock2EndY + d}`);
  p.push(`L ${bBLL - outerLockOut} ${outerLock2StartY + outerLockDiag + outerLockOuterStr + d}`);
  p.push(`L ${bBLL - outerLockOut} ${outerLock2StartY + outerLockDiag - d}`);
  p.push(`L ${bBLL} ${outerLock2StartY - d}`);
  p.push(`L ${bBLL} ${outerLock1EndY + d}`);
  p.push(`L ${bBLL - outerLockOut} ${outerLock1StartY + outerLockDiag + outerLockOuterStr + d}`);
  p.push(`L ${bBLL - outerLockOut} ${outerLock1StartY + outerLockDiag - d}`);
  p.push(`L ${bBLL} ${outerLock1StartY - d}`);
  p.push(`L ${bBLL} ${by3 + foldNotch}`);

  // ── [K] backInsert left ──────────────────────────────────────
  p.push(`L ${xFL} ${by3 + foldNotch}`);
  p.push(`L ${xSL} ${by3}`);
  p.push(`L ${bInsL} ${by3}`);
  p.push(`L ${bInsL} ${y2 - neckR + br19}`);
  p.push(`A ${br19} ${br19} 0 0 1 ${xInsL + r19} ${y2 - neckR}`);

  // ── [L] 1-9L 끝 → 1-7L 베지어 → 1-5L 대각선 ────────────────
 p.push(`L ${xCL - d - 10} ${y2 - neckR}`);               // ★ V apex 위로
  const _n17 = Math.sqrt(bzOff*bzOff + bzTan13*bzTan13);
  const _nx = bzTan13 / _n17, _ny = bzOff / _n17;
p.push(`L ${x17sL - _nx * d * 1.25} ${y17sL + _ny * d * 1.25}`); // 1-7L베지어곡선

p.push(`C ${c17_1x - _nx * d * 1.25} ${c17_1y + _ny * d * 1.25} ${c17_2x - _nx * d * 1.25} ${c17_2y + _ny * d * 1.25} ${bSL} ${y16Bot}`);
  p.push(`L ${bSL} ${y16Top}`);
p.push(`C ${bSL} ${y16Top - bzTan8} ${c15_2x - nxD * d * 1.3} ${c15_2y - nyD * d * 1.3} ${bDiagLx} ${bDiagY}`);


  // ── [M] neck left V-apex → neck 수평 ────────────────────────
  p.push(`L ${vNeckLx} ${bneckY}`);          // 수평·대각 bleed 교점
  p.push(`L ${xCL - bdfNeckX} ${bneckY}`);  // neck 수평

  // ── [N] dustFlap left (1-3L) → Z close ──────────────────────
  p.push(`C ${xCL - bdfW + dustMarg} ${bneckY} ${xCL - bdfW} ${by0 + dROP + bDust73} ${xCL - bdfW} ${y0 + dROP + dfH1}`);
  p.push(`C ${xCL - bdfW} ${y0 + dROP + dfH1 * 0.448} ${xCL - bdfW * 0.552} ${by0 + dROP} ${xCL - d} ${by0 + dROP}`);
  p.push(`Z`);
  return p.join(' ');
}


function getBounds(outerPath, foldLines, slots, holes) {
  const nums = outerPath.match(/-?\d+(\.\d+)?/g) || [];
  const xs = [], ys = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(+nums[i]); ys.push(+nums[i + 1]); }
  foldLines.forEach(l => { xs.push(l.x1, l.x2); ys.push(l.y1, l.y2); });
  slots.forEach(s => { xs.push(s.x, s.x + s.w); ys.push(s.y, s.y + s.h); });
  holes.forEach(h => { xs.push(h.cx - h.r, h.cx + h.r); ys.push(h.cy - h.r, h.cy + h.r); });
  return {
    minX: Math.min(...xs), minY: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys)
  };
}

// ── SVG render ────────────────────────────────────────────────
function renderSVG(cfg) {
  const g = getGrid(cfg);
  const outerPath = buildOuterPath(cfg, g);
  const foldLines = buildFoldLines(cfg, g);
  const slots = buildSlots(cfg, g);
  const holes = buildHoles(cfg, g);
  const bleedPath = buildBleedPath(cfg, g, 4);
  const bounds = getBounds(outerPath, foldLines, slots, holes);
  const pad = 80, vbX = bounds.minX - pad, vbY = bounds.minY - pad;
  const vbW = bounds.width + pad * 2, vbH = bounds.height + pad * 2;

  let svg = `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"
    viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}mm" height="${vbH}mm">
    <defs><style>
      .thomson{fill:#ffffff;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;}
      .fold{fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;}
      .slot{fill:none;stroke:#e53935;stroke-width:0.45;}
      .hole{fill:none;stroke:#1f8f4f;stroke-width:0.45;}
      .bleed{fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;}
      text{font-family:Arial,sans-serif;pointer-events:none;}
    </style></defs>
    
    <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="#d0d0d0" stroke="none"/>
    <g id="viewportGroup">

     <g id="layer-bleed"><path class="bleed" d="${bleedPath}"/></g>
    <g id="layer-cut"><path class="thomson" d="${outerPath}"/></g>
   
    
    <g id="layer-fold">`;

  foldLines.forEach(l => svg += `<line class="fold" x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}"/>`);
  svg += `</g>`;
  if (state.showSlots) slots.forEach(s => svg += `<path class="slot" d="${roundRectPath(s.x, s.y, s.w, s.h, 2.5)}"/>`);
  if (state.showHoles) holes.forEach(h => svg += `<path class="hole" d="${circlePath(h.cx, h.cy, h.r)}"/>`);
  if (state.showLabels) {
    const { xCL, xCR, xSL, y0, y1, y2, y3, y4 } = g;
    const { H, LH, D, BIH, FIH, BLW } = cfg;
    [{ name: 'lidFront', x: xCL, y: y0, w: xCR - xCL, h: H }, { name: 'lid', x: xCL, y: y1, w: xCR - xCL, h: LH },
    { name: 'back', x: xCL, y: y2, w: xCR - xCL, h: H }, { name: 'base', x: xCL, y: y3, w: xCR - xCL, h: D },
    { name: 'front', x: xCL, y: y4, w: xCR - xCL, h: H }, { name: 'sidePanelLeft', x: xSL, y: y3, w: H, h: D },
    { name: 'sidePanelRight', x: xCR, y: y3, w: H, h: D }, { name: 'lidSideFlapLeft', x: xSL, y: y1, w: H, h: LH },
    { name: 'lidSideFlapRight', x: xCR, y: y1, w: H, h: LH }, { name: 'dustFlapLeft', x: xSL, y: y0, w: H, h: H },
    { name: 'dustFlapRight', x: xCR, y: y0, w: H, h: H }, { name: 'backInsertL', x: xSL, y: y2, w: H, h: BIH },
    { name: 'backInsertR', x: xCR, y: y2, w: H, h: BIH }, { name: 'frontInsertL', x: xSL, y: y4, w: H, h: FIH },
    { name: 'frontInsertR', x: xCR, y: y4, w: H, h: FIH }, { name: 'lockFlapLeft', x: g.xBLL, y: y3, w: BLW, h: D },
    { name: 'lockFlapRight', x: g.xBLR, y: y3, w: BLW, h: D }
    ].forEach(l => {
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
      const minDim = Math.min(l.w, l.h);
      const fs = Math.max(3, Math.min(8, minDim * 0.065));
      if (minDim < fs * 2) return;  // 패널 너무 작으면 숨김
      const rot = l.h > l.w ? `transform="rotate(-90 ${cx} ${cy})"` : '';
      svg += `<text x="${cx}" y="${cy}" fill="#333" font-size="${fs}" text-anchor="middle" dominant-baseline="middle" ${rot}>${l.name}</text>`;
    });
  }
  svg += `</g></svg>`;
  return svg;
}

// ============================================================
// ⑨ RENDER LOOP
// ============================================================

// ── Render loop ───────────────────────────────────────────────
let renderTimer = null;

function render(forceFit = false) {
  const cfg = getCfg(), svgStr = renderSVG(cfg);
  state.currentSVGString = svgStr;
  const host = document.getElementById('svgHost');
  if (!host) return;
  host.innerHTML = svgStr;
  state.baseVB = null;  // 새 SVG 삽입 후 기준 viewBox 리셋
if (forceFit || !state.fitInitialized) {
  state.panX = 0;
  state.panY = 0;

  fitToScreen(cfg);
  state.fitInitialized = true;
}
  else applyTransform();
}

// debounce 180ms — 연속 입력 시 중간 상태 노출 방지
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    render(true);
  }, 180);
}

// ============================================================
// ⑩ VIEWPORT / PAN / ZOOM
// ============================================================

// ── Pan / zoom ────────────────────────────────────────────────
function applyTransform() {
  const sv = document.getElementById('mainSvg');
  if (!sv || !state.baseVB) return;

  const b = state.baseVB;
  // zoom: viewBox를 중심 기준으로 축소/확대
  const nw = b.w / state.zoom;
  const nh = b.h / state.zoom;
  // panX/Y는 SVG 단위(mm)로 viewBox 이동
  const nx = b.cx - nw / 2 - state.panX;
  const ny = b.cy - nh / 2 - state.panY;
  sv.setAttribute('viewBox', `${nx} ${ny} ${nw} ${nh}`);

  // <g> transform은 사용하지 않음 (viewBox가 모든 변환 담당)
  const g = document.getElementById('mainGroup') ||
            document.getElementById('viewportGroup') ||
            document.querySelector('#mainSvg g');
  if (g) g.removeAttribute('transform');

  const sb = document.getElementById('statusBox');
  if (sb) sb.textContent = `Zoom ${Math.round(state.zoom * 100)}%`;
}

function fitToScreen(cfg){
  requestAnimationFrame(() => {
    const sv   = document.getElementById('mainSvg');
    const host = document.getElementById('svgHost');
    if (!sv || !host) return;

    // ① SVG가 svgHost를 100% 채우게 설정
    sv.setAttribute('width',  '100%');
    sv.setAttribute('height', '100%');

    // ② svgHost 실제 픽셀 크기
    const hr = host.getBoundingClientRect();
    if (!hr.width || !hr.height) return;

    // ③ 도형 전체 bounds 계산
    const c      = cfg || getCfg();
    const g2     = getGrid(c);
    const bounds = getBounds(
      buildOuterPath(c, g2), buildFoldLines(c, g2),
      buildSlots(c, g2),     buildHoles(c, g2)
    );

    // ④ 화면에 꽉 차도록 scale 계산 (여백 40px)
    const pad    = 40;
    const scaleX = (hr.width  - pad * 2) / bounds.width;
    const scaleY = (hr.height - pad * 2) / bounds.height;
    const scale  = Math.min(scaleX, scaleY);

    // ⑤ viewBox 크기 = 화면 크기 / scale  (SVG 단위 = mm)
    const vbW = hr.width  / scale;
    const vbH = hr.height / scale;

    // ⑥ 도형 중심을 viewBox 중심으로 → 정중앙
    const contentCX = bounds.minX + bounds.width  / 2;
    const contentCY = bounds.minY + bounds.height / 2;
    const vbX = contentCX - vbW / 2;
    const vbY = contentCY - vbH / 2;

    // ⑦ viewBox 적용
    sv.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);

    // ⑧ baseVB 저장 (zoom 기준)
    state.baseVB = { x: vbX, y: vbY, w: vbW, h: vbH, cx: contentCX, cy: contentCY };
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;

    // ⑨ <g> transform 제거
    const g = document.getElementById('mainGroup') ||
              document.getElementById('viewportGroup') ||
              document.querySelector('#mainSvg g');
    if (g) g.removeAttribute('transform');

    const sb = document.getElementById('statusBox');
    if (sb) sb.textContent = 'Zoom 100%';
  });
  }


const ZOOM_STEPS = [0.5, 1.0, 1.5, 2.0];

function snapZoom(current, dir) {
  const i = ZOOM_STEPS.findIndex(z => Math.abs(z - current) < 0.001);

  if (dir > 0) {
    if (i >= 0) return ZOOM_STEPS[Math.min(i + 1, ZOOM_STEPS.length - 1)];
    return ZOOM_STEPS.find(z => z > current) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1];
  } else {
    if (i >= 0) return ZOOM_STEPS[Math.max(i - 1, 0)];
    const prev = [...ZOOM_STEPS].reverse().find(z => z < current);
    return prev ?? ZOOM_STEPS[0];
  }
}

function zoomAt(nextZoom) {
  state.zoom = Math.max(0.5, Math.min(2.0, nextZoom));
  applyTransform();
}

// ============================================================
// ⑪ EXPORT
// ============================================================

// ── Download ──────────────────────────────────────────────────
function downloadFile(name, content, type) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([content], { type })), download: name });
  a.click(); URL.revokeObjectURL(a.href);
}
function svgToDXF(cfg) {
  const g = getGrid(cfg), fl = buildFoldLines(cfg, g), sl = buildSlots(cfg, g), ho = buildHoles(cfg, g);
  const arr = ['0', 'SECTION', '2', 'ENTITIES'];
  const al = (x1, y1, x2, y2, l) => arr.push('0', 'LINE', '8', l, '10', x1, '20', -y1, '30', '0', '11', x2, '21', -y2, '31', '0');
  const ac = (cx, cy, r, l) => arr.push('0', 'CIRCLE', '8', l, '10', cx, '20', -cy, '30', '0', '40', r);
  fl.forEach(l => al(l.x1, l.y1, l.x2, l.y2, 'FOLD'));
  sl.forEach(s => {
    al(s.x, s.y, s.x + s.w, s.y, 'SLOT'); al(s.x + s.w, s.y, s.x + s.w, s.y + s.h, 'SLOT');
    al(s.x + s.w, s.y + s.h, s.x, s.y + s.h, 'SLOT'); al(s.x, s.y + s.h, s.x, s.y, 'SLOT');
  });
  ho.forEach(h => ac(h.cx, h.cy, h.r, 'HOLE'));
  arr.push('0', 'ENDSEC', '0', 'EOF'); return arr.join('\n');
}

// ============================================================
// ⑫ UI BINDINGS / INIT
// ============================================================

// ── Bindings ──────────────────────────────────────────────────
// 'input' 이벤트에서 render 호출 제거 → 중간 상태 노출 방지
// 'change' + debounce 180ms 만 사용
function bindAll() {
  document.querySelectorAll('input[type=number]').forEach(el => el.addEventListener('change', scheduleRender));
  const get = id => document.getElementById(id);
  get('fitBtn')?.addEventListener('click', () => fitToScreen());

get('zoomInBtn')?.addEventListener('click', () => {
  zoomAt(snapZoom(state.zoom, +1));
});

get('zoomOutBtn')?.addEventListener('click', () => {
  zoomAt(snapZoom(state.zoom, -1));
});

  get('downloadSvgBtn')?.addEventListener('click', () => downloadFile('pacvu-g-type.svg', state.currentSVGString, 'image/svg+xml'));
  get('downloadDxfBtn')?.addEventListener('click', () => downloadFile('pacvu-g-type.dxf', svgToDXF(getCfg()), 'application/dxf'));
  const sidebar = get('sidebar');
  get('toggleSidebarBtn')?.addEventListener('click', () => sidebar?.classList.add('collapsed'));
  get('showSidebarBtn')?.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
  const host = get('svgHost'); if (!host) return;
  host.addEventListener('mousedown', e => {
    state.isDragging = true; state.dragStartX = e.clientX; state.dragStartY = e.clientY;
    state.startPanX = state.panX; state.startPanY = state.panY; host.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!state.isDragging) return;
    const sv = get('mainSvg'); if (!sv) return;
    const sr = sv.getBoundingClientRect(), vb = sv.viewBox.baseVal, ppm = sr.width / vb.width;
    state.panX = state.startPanX + (e.clientX - state.dragStartX) / ppm;
    state.panY = state.startPanY + (e.clientY - state.dragStartY) / ppm; applyTransform();
  });
  window.addEventListener('mouseup', () => { state.isDragging = false; host.classList.remove('dragging'); });

  host.addEventListener('wheel', e => {
  e.preventDefault();

  const zoomFactor = Math.exp(-e.deltaY * 0.0015);
  const newZoom = state.zoom * zoomFactor;

  zoomAt(newZoom);
}, { passive: false });

  host.addEventListener('dblclick', () => fitToScreen());
  window.addEventListener('resize', () => fitToScreen());
}

// ── Init ──────────────────────────────────────────────────────
bindAll();
render(true);

