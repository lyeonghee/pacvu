// ============================================================
// M001_renderer.js — G-Type Mailer Box
// Geometry builders + SVG renderer
// Depends on: M001_spec.js → M001_getGeo()
//             M001_layout.js → M001_getGrid()
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
  const geo = M001_getGeo(cfg);
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
  const flapTopL = xCL - sfDX;
  const flapTopR = xCR + sfDX;
  const flapBotL = xSL;
  const flapBotR = xFR;

  // FIX-lidSideFlap ①: TC_V의 H*0.8 floor가 H>>LH(예:W200/D150/H300)에서
  //   y16Bot > y2 를 유발 → buildOuterPath 내에서 geometry-correct 값으로 override.
  //   TC_V_safe = LH에서 상·하 전이 구간(sfDY+bzTan13) 각 1회씩 제거한 순수 수직 길이.
  //   cfg.LH === cfg.D (getCfg 참고). 모든 값이 정의된 후에 계산 → NaN 불가.
  const TC_V_safe  = Math.max(cfg.LH - 2 * (sfDY + bzTan13), 0);
  const y16BotSafe = y16Top + TC_V_safe;   // 항상 y16Top ≤ y16BotSafe < y2

  // FIX-lidSideFlap ②: 1-5/1-7 bezier CP 거리를 실제 flap X-span(H-sfDX) 기준으로 계산.
  //   bzOff/bzTan8(H 비례)는 H>>sfDX 극단치수에서 CP가 너무 작아 꺾임 → chord/3 으로 교체.
  //   flapSpanH = xFR-(xCR+sfDX) = H-sfDX. sfDX ≤ H*0.841 이므로 flapSpanH > 0 보장.
  const flapSpanH = cfg.H - sfDX;
  const bzLidFlap = Math.sqrt(flapSpanH * flapSpanH + bzTan13 * bzTan13) / 3;

  // Left 1-4L ~ 1-9L
  const e4L = arc14entry(xCL - sfDX, y1 + sfDY, xCL, y1, neckR);
  const h4Lx = xCL, h4Ly = y1 - neckR;
  const x15eL = xCL - sfDX, y15eL = y1 + sfDY;
  const c15_1x = xSL, c15_1y = y16Top - bzLidFlap;                                                   // FIX-lidSideFlap ③
  const c15_2x = x15eL - (sfDX / sfNorm) * bzLidFlap, c15_2y = y15eL + (sfDY / sfNorm) * bzLidFlap; // FIX-lidSideFlap ③
  const x16L = xSL;

  // 1-7L 하단 대각선 끝점 = 상단 1-5L과 동일한 sfDX/sfDY 벡터로 대칭
  const e18L = arc18entry(xCL - sfDX, y2 - sfDY, xCL, y2, neckR);

  // Right 1-4R ~ 1-9R
  const e4R = arc14entry(xCR + sfDX, y1 + sfDY, xCR, y1, neckR);
  const x15eR = xFR, y15eR = y16Top;
  const c15R_1x = (xCR + sfDX) + (sfDX / sfNorm) * bzLidFlap, c15R_1y = (y1 + sfDY) + (sfDY / sfNorm) * bzLidFlap; // FIX-lidSideFlap ④
  const c15R_2x = x15eR, c15R_2y = y15eR - bzLidFlap;                                                               // FIX-lidSideFlap ④

  // 1-7R 하단 대각선 끝점 = 상단 1-5R과 동일한 sfDX/sfDY 벡터로 대칭
  const e18R = arc18entry(xCR + sfDX, y2 - sfDY, xCR, y2, neckR);

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
  p.push(`L ${xCR} ${y1 - neckR}`);
  p.push(`A ${neckR} ${neckR} 0 0 0 ${e4R[0]} ${e4R[1]}`);
  p.push(`L ${xCR + sfDX} ${y1 + sfDY}`);
  p.push(`C ${c15R_1x} ${c15R_1y} ${c15R_2x} ${c15R_2y} ${x15eR} ${y15eR}`);
  p.push(`L ${xFR} ${y16BotSafe}`);                                                   // FIX-lidSideFlap ⑤

  // 1-7R: FIX-lidSideFlap ⑥ — y16BotSafe(경계 보장) + bzLidFlap(span 비례 CP)
p.push(`C ${xFR} ${y16BotSafe + bzLidFlap * 1.3} ${xCR + sfDX + (sfDX / sfNorm) * bzLidFlap * 1.3} ${y2 - sfDY - (sfDY / sfNorm) * bzLidFlap * 1.3} ${xCR + sfDX} ${y2 - sfDY}`);
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
  p.push(`L ${xCL - sfDX} ${y2 - sfDY}`);

  // 1-7L: FIX-lidSideFlap ⑦ — y16BotSafe(경계 보장) + bzLidFlap(span 비례 CP), 1-7R과 완전 대칭
p.push(`C ${xCL - sfDX - (sfDX / sfNorm) * bzLidFlap * 1.3} ${y2 - sfDY - (sfDY / sfNorm) * bzLidFlap * 1.3} ${xSL} ${y16BotSafe + bzLidFlap * 1.3} ${xSL} ${y16BotSafe}`);
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
  const { neckR, r11, dROP, foldNotch } = M001_getGeo(cfg);

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
  const geo = M001_getGeo(cfg);
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
  const by0 = y0 - d, by5 = y5 + d;
  const by3 = y3 - d, by4 = y4 + d;
  const bBLL = xBLL - d, bEnd = xEnd + d;
  const bFR = xFR + d, bSL = xSL - d;
  const bdfW = dfW + d * 1.15;  // ★ 1-3L 처짐 보정
  const bdfNeckX = bdfW * (dfNeckX / dfW);
  const bDust73 = dust73 * (bdfW / dfW);  // ★ Y비율 비례
  const bInsR = xCR + insertW + d, bInsL = xCL - insertW - d;
  const xInsL = xCL - insertW;
  const br19 = r19 + d, bfiR = fiR + d;
  const bneckY = y0 + dROP + dfNY + d;  // ★ 실제 neck Y + 5mm 오프셋

  // lidSideFlap bezier 제어점 (1-5 구간용, 변경 없음)
  const c15R_1x = (xCR + sfDX) + (sfDX / sfNorm) * bzOff;
  const c15R_1y = (y1 + sfDY) + (sfDY / sfNorm) * bzOff;
  const x15eL = xCL - sfDX, y15eL = y1 + sfDY;
  const c15_1x = xSL, c15_1y = y16Top - bzTan8;
  const c15_2x = x15eL - (sfDX / sfNorm) * bzOff;
  const c15_2y = y15eL + (sfDY / sfNorm) * bzOff;
  // FIX-bleed-1-7: c17/x17 계열 제거 — 아래 full parallel offset 으로 교체
  // FIX-bleed-1-7: bzLidFlap — buildOuterPath 와 동일 기준 (flapSpan chord/3)
  const flapSpanH = cfg.H - sfDX;
  const bzLidFlap = Math.sqrt(flapSpanH * flapSpanH + bzTan13 * bzTan13) / 3;

  // ★ 대각선 5mm 법선 오프셋 (1-5, 1-14 끝점)
  const nxD = sfDY / sfNorm, nyD = sfDX / sfNorm;
  const bDiagRx = xCR + sfDX + nxD * d;
  const bDiagLx = xCL - sfDX - nxD * d;
  const bDiagY = y1 + sfDY - nyD * d;

  // ★ Neck V apex: 수평 bleed(y=bneckY) 과 대각선 bleed 의 교점 X (클램프 적용)
  const vNeckRxRaw = bDiagRx - sfDX * (bDiagY - bneckY) / sfDY - 5;
  const vNeckRx = Math.min(vNeckRxRaw, xCR + bdfNeckX - 1);
  const vNeckLxRaw = bDiagLx + sfDX * (bDiagY - bneckY) / sfDY + 5;
  const vNeckLx = Math.max(vNeckLxRaw, xCL - bdfNeckX + 1);

  // ★ BackInsert V (y2): 1-7 offset 끝에서 1-9 horizontal offset 으로 직행
  // 1-9 horizontal 5mm 위 = y2+neckR (기존 유지, x만 확장)
  // 1-7 bezier 끝 (bFR-bzOff, y16Bot+bzTan13) → straight to (bInsR-br19, y2+neckR)

  // lockFlap Y
  const outerLockTopY = y3 + foldNotch;
  const outerLock1StartY = outerLockTopY + outerLockInset;
  const outerLock1EndY = outerLock1StartY + outerLockH;
  const outerLock2StartY = outerLock1EndY + outerLockGap;
  const outerLock2EndY = outerLock2StartY + outerLockH;
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

p.push(`C ${c15R_1x + nxD * d} ${c15R_1y - nyD * d} ${bFR} ${y16Top - bzTan8 - d} ${bFR} ${y16Top}`);
  p.push(`L ${bFR} ${y16Bot}`);

  // ── FIX-bleed-1-7R ──────────────────────────────────────────────
  // start+CP1: (+d, 0) — 수직 1-6R과 접선 연속
  // CP2+end:   (nxD*d, nyD*d) — 대각 끝점의 실제 법선 방향으로 5mm 유지
  //   (+d,0)만 쓰면 수직거리 = d*nxD ≈ 1.3mm → 너무 근접
  const bz13 = bzLidFlap * 1.7;
  p.push(`C ${bFR} ${y16Bot + bz13}` +
         ` ${xCR + sfDX + (sfDX / sfNorm) * bz13 + nxD * d} ${y2 - sfDY - (sfDY / sfNorm) * bz13 + nyD * d}` +
         ` ${xCR + sfDX + nxD * d} ${y2 - sfDY + nyD * d}`);

  // ── [E] 1-7R 끝 → backInsert V-apex → 1-9R ─────────────────────
  // ★ 꼭지점 위치 조정: vBot7_NUDGE 값만 바꾸면 됨
  //   양수(+) → 꼭지가 바깥쪽(오른쪽)으로 이동
  //   음수(-) → 꼭지가 안쪽(왼쪽)으로 이동
  const vBot7_NUDGE = -7;  // ← 여기 숫자 조정 (예: 10, 20, -5)
  const dyVbot7R = Math.max(0, (y2 - neckR) - (y2 - sfDY + nyD * d));
  const vBot7Rx  = (xCR + sfDX + nxD * d) - sfDX * dyVbot7R / sfDY + vBot7_NUDGE;
  p.push(`L ${vBot7Rx} ${y2 - neckR}`);
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
  // FIX-bleed-1-7L: start+CP1: (-nxD*d, nyD*d) — 대각 시작점 법선 방향 5mm
  //                 CP2+end:   (-d, 0)           — 수직 1-6L 접선 연속
  // V-apex = 1-7L 입구방향(+sfDX,+sfDY)과 backInsert bleed 수평(y2−neckR)의 교점 (1-7R mirror)
  const dyVbot7L = Math.max(0, (y2 - neckR) - (y2 - sfDY + nyD * d));  // = sfDY-neckR-nyD*d
  const vBot7Lx  = (xCL - sfDX - nxD * d) + sfDX * dyVbot7L / sfDY - vBot7_NUDGE;  // mirror ✓
  p.push(`L ${vBot7Lx} ${y2 - neckR}`);                              // K 끝 → neck 전이
  p.push(`L ${xCL - sfDX - nxD * d} ${y2 - sfDY + nyD * d}`);       // 1-7L bleed start (법선 5mm)
  p.push(`C ${xCL - sfDX - (sfDX / sfNorm) * bz13 - nxD * d} ${y2 - sfDY - (sfDY / sfNorm) * bz13 + nyD * d}` +
         ` ${bSL} ${y16Bot + bz13}` +
         ` ${bSL} ${y16Bot}`);
  p.push(`L ${bSL} ${y16Top}`);
 p.push(`C ${bSL} ${y16Top - bzTan8 - d} ${c15_2x - nxD * d} ${c15_2y - nyD * d} ${bDiagLx} ${bDiagY}`);


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

  for (let i = 0; i < nums.length - 1; i += 2) {
    xs.push(+nums[i]);
    ys.push(+nums[i + 1]);
  }

  foldLines.forEach(l => {
    xs.push(l.x1, l.x2);
    ys.push(l.y1, l.y2);
  });

  slots.forEach(s => {
    xs.push(s.x, s.x + s.w);
    ys.push(s.y, s.y + s.h);
  });

  holes.forEach(h => {
    xs.push(h.cx - h.r, h.cx + h.r);
    ys.push(h.cy - h.r, h.cy + h.r);
  });

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

function buildDimensionLines(cfg, g, bounds) {
  const { W, D, H } = cfg;
  const { xCL, xCR, y2, y3, y4 } = g;

  const dim = [];

  function hDim(x1, x2, y, label) {
    dim.push(`
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"
      stroke="#111" stroke-width="0.35"
      marker-start="url(#arrow)" marker-end="url(#arrow)"/>
    <text x="${(x1 + x2) / 2}" y="${y - 2}"
      font-size="5.5" text-anchor="middle">${label}</text>
  `);
  }

  function vDim(x, y1, y2, label) {
    dim.push(`
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"
      stroke="#111" stroke-width="0.35"
      marker-start="url(#arrow)" marker-end="url(#arrow)"/>
    <text x="${x - 5}" y="${(y1 + y2) / 2}"
      font-size="5.5"
      transform="rotate(-90 ${x - 5} ${(y1 + y2) / 2})"
      text-anchor="middle">${label}</text>
  `);
  }

  function hDimInside(x1, x2, y, label) {
    const mid = (x1 + x2) / 2;
    const pad = 2;
    const gap = 18;

    dim.push(`
    <line x1="${x1 + pad}" y1="${y}" x2="${mid - gap}" y2="${y}"
      stroke="#111" stroke-width="0.35"
      marker-start="url(#arrow)"/>

    <line x1="${x2 - pad}" y1="${y}" x2="${mid + gap}" y2="${y}"
      stroke="#111" stroke-width="0.35"
      marker-start="url(#arrow)"/>

    <text x="${mid}" y="${y + 2.5}" font-size="7" font-weight="600" text-anchor="middle">${label}</text>
  `);
  }

  function vDimInside(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const pad = 2;
    const gap = 18;

    dim.push(`
    <line x1="${x}" y1="${y1 + pad}" x2="${x}" y2="${mid - gap}"
      stroke="#111" stroke-width="0.35"
      marker-start="url(#arrow)"/>

    <line x1="${x}" y1="${y2 - pad}" x2="${x}" y2="${mid + gap}"
      stroke="#111" stroke-width="0.35"
      marker-start="url(#arrow)"/>

    <text x="${x + 2.5}" y="${mid}"
      font-size="7" font-weight="600"
      transform="rotate(-90 ${x + 2.5} ${mid})"
      text-anchor="middle">${label}</text>
  `);
  }


  hDimInside(xCL, xCR, y4 - 18, `W ${W}`);
  vDimInside(xCR - 18, y3, y4, `D ${D}`);
  vDimInside(xCR - 35, y2, y3, `H ${H}`);

  return `<g id="layer-dimensions">${dim.join('')}</g>`;
}

// ── SVG render ────────────────────────────────────────────────
function M001_renderSVG(cfg) {
  const g = M001_getGrid(cfg);
  const outerPath = buildOuterPath(cfg, g);
  const foldLines = buildFoldLines(cfg, g);
  const slots = buildSlots(cfg, g);
  const holes = buildHoles(cfg, g);
  const bleedPath = buildBleedPath(cfg, g, 4);
const bounds = getBounds(outerPath, foldLines, slots, holes);

const pad = 5;
const pad2 = 80, vbX = bounds.minX - pad2, vbY = bounds.minY - pad2;
const vbW = bounds.width + pad2 * 2, vbH = bounds.height + pad2 * 2;

  let svg = `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"
    viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}mm" height="${vbH}mm">
    <defs>
<marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 Z" fill="#111"/>
</marker>
<style>
      .thomson{fill:#ffffff;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;}
      .fold{fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;}
      .slot{fill:none;stroke:#e53935;stroke-width:0.45;}
      .hole{fill:none;stroke:#1f8f4f;stroke-width:0.45;}
      .bleed{fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;}
      text{
  font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;
  pointer-events:none;
}
    </style></defs>
    
    <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="#d0d0d0" stroke="none"/>
    <g id="viewportGroup">

     <g id="layer-bleed"><path class="bleed" d="${bleedPath}"/></g>
    <g id="layer-cut"><path class="thomson" d="${outerPath}"/></g>
   
    
    <g id="layer-fold">`;

  if (state.showFolds) {
  foldLines.forEach(l => {
    svg += `<line class="fold" x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}"/>`;
  });
}

svg += `</g>`;

  if (state.showSlots) slots.forEach(s => svg += `<path class="slot" d="${roundRectPath(s.x, s.y, s.w, s.h, 2.5)}"/>`);
  if (state.showHoles) holes.forEach(h => svg += `<path class="hole" d="${circlePath(h.cx, h.cy, h.r)}"/>`);
  if (state.showLabels) {
    const { xCL, xCR, xSL, y0, y1, y2, y3, y4 } = g;
    const { H, LH, D, BIH, FIH, BLW } = cfg;
    [{ name: 'lidFront', x: xCL, y: y0, w: xCR - xCL, h: H },
    { name: 'lid', x: xCL, y: y1, w: xCR - xCL, h: LH },
    { name: 'back', x: xCL, y: y2, w: xCR - xCL, h: H },
    { name: 'base', x: xCL, y: y3, w: xCR - xCL, h: D },
    { name: 'front', x: xCL, y: y4, w: xCR - xCL, h: H },
    { name: 'sidePL', x: xSL, y: y3, w: H, h: D },
    { name: 'sidePR', x: xCR, y: y3, w: H, h: D },
    { name: 'lidSFL', x: xSL, y: y1, w: H, h: LH },
    { name: 'lidSFR', x: xCR, y: y1, w: H, h: LH },
    { name: 'dustFL', x: xSL, y: y0, w: H, h: H },
    { name: 'dustFR', x: xCR, y: y0, w: H, h: H },
    { name: 'backInsL', x: xSL, y: y2, w: H, h: BIH },
    { name: 'backInsR', x: xCR, y: y2, w: H, h: BIH },
    { name: 'frontInsL', x: xSL, y: y4, w: H, h: FIH },
    { name: 'frontInsR', x: xCR, y: y4, w: H, h: FIH },
    { name: 'lockFlapL', x: g.xBLL, y: y3, w: BLW, h: D },
    { name: 'lockFlapR', x: g.xBLR, y: y3, w: BLW, h: D }
    ].forEach(l => {
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
      const minDim = Math.min(l.w, l.h);
      const fs = 7;
      if (minDim < 12) return;// 패널 너무 작으면 숨김
    const rot = '';
      svg += `<text x="${cx}" y="${cy}" fill="#333" font-size="${fs}" text-anchor="middle" dominant-baseline="middle" ${rot}>${l.name}</text>`;
    });
  }

if (state.showDims) {
  svg += buildDimensionLines(cfg, g, bounds);
}

// 🔽 워터마크 추가
const watermark = `
<defs>
  <pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">
    <text x="24" y="60"
      font-size="22"
      font-family="Arial, sans-serif"
      font-weight="700"
      fill="#999"
      opacity="0.12">
      PacVu
    </text>
  </pattern>
</defs>

<rect x="-5000" y="-5000"
      width="10000"
      height="10000"
      fill="url(#wm)"
      pointer-events="none" />
`;

svg += watermark;

svg += '</svg>';
return svg;
}
// ── public aliases ───────────────────────────────────────────
// app.js는 M001_renderSVG(cfg, state) 를 호출
