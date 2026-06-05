// ============================================================
// M001_spec.js — G-Type Mailer Box
// Geometry constants (W/D/H/LH/FG 비율 파생)
// ============================================================

/**
 * getGeo(cfg) → geometry constants object
 * 기준형: W=235, D=229, H=91, LH=229
 * 모든 값은 cfg 비율로 파생 (고정 px 없음)
 */
function M001_getGeo(cfg) {
  const { W, D, H, LH, FG } = cfg;

  // ■ H 기준
  const neckR = H * 0.026;
  const sfDX_raw = H * 0.841;
  const sfDY_raw = H * 0.227;
  const scale = Math.min(1, (W * 0.45) / sfDX_raw);
  const sfDX = sfDX_raw * scale;
  const sfDY = sfDY_raw * scale;
  const dfH1     = H * 0.665;
  const dfNY     = H * 0.951;
  const r19      = H * 0.104;
  const r11      = H * 0.0165;
  const insertW  = Math.min(H * 0.863, W * 0.4);
  const fiR      = H * 0.104;
  const fiTopDrop = H * 0.049;
  const fiStepY  = H * 0.011;
  const bzOff    = H * 0.110;
  const bzScale  = Math.min(1, W / (H * 1.2));
  const bzTan13  = H * 0.143 * bzScale;
  const bzTan8   = H * 0.088 * bzScale;
  const bzTan1   = H * 0.011 * bzScale;
  const dustMarg = H * 0.027;
  const dust73   = H * 0.802;

  // ■ LH 기준
  const TC_V = Math.max(LH - sfDY * 2 - bzTan13 * 2, H * 0.8);

  // ■ W 기준
  const dfW     = Math.min(W * 0.351, H * 0.92);
  const dfNeckX = dfW * 0.769;

  // ■ D 기준
  const dROP             = D * 0.010;
  const outerLockInset   = D * (35.0 / 229);
  const outerLockH       = D * (35.0 / 229);
  const outerLockOut     = D * (5.0  / 229);
  const outerLockDiag    = D * (1.5  / 229);
  const outerLockOuterStr= D * (32.0 / 229);
  const outerLockGap     = D * (85.0 / 229);

  // ■ FG 기준
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
