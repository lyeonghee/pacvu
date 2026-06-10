// ============================================================
// T001_spec.js — B-Type Tuck End Box
// T001_getSpec(W, D, H) → spec 객체 반환
//
// 기준: 57×57×177mm, Geometry Lock v1.5
// 규칙: 단순 산술 계산만 / var 통일 / 에러 발생 없음 보장
// bezier CP는 layout에서 계산
// ============================================================

function T001_getSpec(W, D, H) {

  /* ── X 기준선 ─────────────────────────────────────────────── */
  var xP1  = D * (25.0   / 57);
  var xP2  = xP1 + D;
  var xP3  = xP2 + W;
  var xP4  = xP3 + D;
  var xEnd = xP4 + D * (55.504 / 57);

  var xTC       = (xP1 + xP2) / 2;
  var tuckFlatH = D * (16.381 / 57);   /* tuck cap half-width */
  var xTFL      = xTC - tuckFlatH;
  var xTFR      = xTC + tuckFlatH;

  /* ── Y 기준선 ─────────────────────────────────────────────── */
  var yTF = D * (23.0  / 57);
  var yLF = yTF + D;
  var yBB = yLF + H;
  var yLO = yBB + D * (43.5 / 57);

  var yTS     = D * (10.898 / 57);     /* tuck straight top */
  var yGD     = D * (6.699  / 57);     /* glue slope delta  */
  var yLSFTop = yLF - D * (28.0 / 57);/* lid side flap top */
  var yLF2    = yTF + D * (56.0 / 57);/* f-2 fold y (=79mm for D=57) */

  /* ── Neck ─────────────────────────────────────────────────── */
  var xNeckC   = (xP3 + xP4) / 2;
  var halfNeckW = W * (9.0 / 57);
  var xNeckL   = xNeckC - halfNeckW;
  var xNeckR   = xNeckC + halfNeckW;
  var yNeckBot = yLF + D * (8.0 / 57);

  /* ── U-return ─────────────────────────────────────────────── */
  var x35   = xP2 + D * (4.0   / 57);
  var y35   = yTF + D * (55.1  / 57);
  var y36   = yTF + D * (55.0  / 57);
  var arcRu = D   * (2.0   / 57);

  /* ── Lock 치수 (D 비율) ───────────────────────────────────── */
  var lockStep     = D * (3.0   / 57);
  var lockAOuter   = D * (13.5  / 57);
  var lockAInner   = D * (17.5  / 57);
  var lockASlotD   = D * (28.5  / 57);
  var lockACornerR = D * (4.0   / 57);
  var lockLRDiagX  = D * (30.0  / 57);
  var lockLRDiagY  = D * (18.5  / 57);
  var lockLRDepth  = D * (28.5  / 57);
  var lockBDiagX   = D * (18.5  / 57);
  var lockBVertBot = D * (39.5  / 57);
  var lockBCornerR = D * (4.0   / 57);

  /* ── Lock-A/B 파생 좌표 ────────────────────────────────────── */
  var yLockAFlat  = yBB + lockLRDepth;
  var yLockBVert  = yBB + lockBVertBot;
  var lbInL       = xP3 + lockBDiagX;
  var lbInR       = xP4 - lockBDiagX;
  var lbGapHalf   = W * (6.0 / 57);
  var lbGapL      = xNeckC - lbGapHalf + lockBCornerR;
  var lbGapR      = xNeckC + lbGapHalf - lockBCornerR;

  /* ── Lid side flap finger 연결점 ──────────────────────────── */
  var x29R = xP4 - D * (24.0 / 57);
  var y29  = yLSFTop + D * (17.0 / 57);
  var x30R = xP4 - D * (28.0 / 57);
  var y30  = yLSFTop + D * (21.0 / 57);
  var x29L = xP3 + D * (24.0 / 57);
  var x30L = xP3 + D * (28.0 / 57);

  /* ── 1-28 (sfR/sfL bezier 끝점) ──────────────────────────── */
  var x28R = xNeckR + W * (29.06 / 57);
  var x28L = xNeckL - W * (29.06 / 57);
  var y28  = yLSFTop + D * (3.71 / 57);

  /* ── xEnd 우측 corner ─────────────────────────────────────── */
  var xEndCorn = xEnd - D * (2.5 / 57);
  var yEndCorn = yLF  - D * (2.5 / 57);

  return {
    W: W, D: D, H: H,
    /* X grid */
    xP1: xP1, xP2: xP2, xP3: xP3, xP4: xP4, xEnd: xEnd,
    xTC: xTC, xTFL: xTFL, xTFR: xTFR,
    /* Y grid */
    yTF: yTF, yLF: yLF, yBB: yBB, yLO: yLO,
    yTS: yTS, yGD: yGD, yLSFTop: yLSFTop, yLF2: yLF2,
    /* neck */
    xNeckC: xNeckC, xNeckL: xNeckL, xNeckR: xNeckR, yNeckBot: yNeckBot,
    /* U-return */
    x35: x35, y35: y35, y36: y36, arcRu: arcRu,
    /* lock */
    lockStep: lockStep,
    lockAOuter: lockAOuter, lockAInner: lockAInner,
    lockASlotD: lockASlotD, lockACornerR: lockACornerR,
    lockLRDiagX: lockLRDiagX, lockLRDiagY: lockLRDiagY, lockLRDepth: lockLRDepth,
    lockBDiagX: lockBDiagX, lockBVertBot: lockBVertBot, lockBCornerR: lockBCornerR,
    /* lock derived */
    yLockAFlat: yLockAFlat, yLockBVert: yLockBVert,
    lbInL: lbInL, lbInR: lbInR, lbGapL: lbGapL, lbGapR: lbGapR,
    /* lid finger */
    x29R: x29R, y29: y29, x30R: x30R, y30: y30, x29L: x29L, x30L: x30L,
    /* 1-28 */
    x28R: x28R, x28L: x28L, y28: y28,
    /* xEnd corner */
    xEndCorn: xEndCorn, yEndCorn: yEndCorn,
  };
}
