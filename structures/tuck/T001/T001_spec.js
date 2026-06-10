// ============================================================
// T001_spec.js - B-Type tuck box parametric geometry
// ============================================================

function T001_clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function T001_getSpec(input) {
  const W = Number(input && input.W) || 57;
  const D = Number(input && input.D) || 57;
  const H = Number(input && input.H) || 177;
  const minPanel = Math.max(1, Math.min(W, D));

  const glueWidth = T001_clamp(D * 0.44, 12, Math.max(14, W * 0.55));
  const lidTopHeight = D;
  const tuckHeight = T001_clamp(D * 0.40, 14, Math.max(18, H * 0.45));
  const lidFlapHeight = T001_clamp(D * 0.49, 12, Math.max(18, H * 0.45));
  const bottomLockDepth = T001_clamp(D * 0.76, 20, Math.max(24, H * 0.65));

  const lockStep = T001_clamp(D * 0.055, 2, 12);
  const lockCornerRadius = T001_clamp(D * 0.07, 2, 16);
  const lockAOuter = T001_clamp(D * 0.235, 6, W * 0.38);
  const lockAInner = T001_clamp(D * 0.305, lockAOuter + 2, W * 0.45);
  const lockBDiagWidth = T001_clamp(D * 0.325, 8, W * 0.42);
  const lockBGapHalf = T001_clamp(D * 0.105, 3, W * 0.18);
  const lockSideDiagX = T001_clamp(D * 0.53, 12, D * 0.82);
  const lockSideDiagY = T001_clamp(D * 0.325, 8, bottomLockDepth * 0.75);

  const neckWidth = T001_clamp(D * 0.32, 12, W * 0.55);
  const neckHeight = T001_clamp(D * 0.14, 5, lidFlapHeight * 0.55);
  const notchWidth = T001_clamp(D * (18 / 57), 12, Math.min(W * 0.42, D * 0.38, 70));
  const notchDepth = T001_clamp(D * (8 / 57), 4, Math.min(D * 0.18, H * 0.22, 32));
  const notchRadius = notchWidth / 2;
  const cornerRadius = T001_clamp(minPanel * 0.045, 1.5, 10);

  const sideFlapInset = T001_clamp(D * 0.07, 2, 18);
  const sideFlapFlat = T001_clamp(D * 0.25, 6, D * 0.45);
  const sideFlapToe = T001_clamp(D * 0.17, 5, D * 0.32);
  const sideFlapNeckGap = T001_clamp(D * 0.035, 1.5, 8);

  const foldGap = T001_clamp(minPanel * 0.005, 0.2, 1.5);
  const labelFontSize = T001_clamp(minPanel * 0.09, 4, 8);

  return {
    W, D, H,
    glueWidth,
    lidTopHeight,
    tuckHeight,
    lidFlapHeight,
    bottomLockDepth,
    lockStep,
    lockCornerRadius,
    lockAOuter,
    lockAInner,
    lockBDiagWidth,
    lockBGapHalf,
    lockSideDiagX,
    lockSideDiagY,
    neckWidth,
    neckHeight,
    notchWidth,
    notchRadius,
    notchDepth,
    cornerRadius,
    sideFlapInset,
    sideFlapFlat,
    sideFlapToe,
    sideFlapNeckGap,
    foldGap,
    labelFontSize
  };
}
