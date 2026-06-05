// ============================================================
// M001_layout.js — G-Type Mailer Box
// Grid coordinate system
// ============================================================

/**
 * M001_getGrid(cfg) → grid coordinate object
 * xBLL..xEnd: 수평 기준선, y0..y5: 수직 기준선
 */
function M001_getGrid(cfg) {
  const { W, D, H, LH, FG, BLW } = cfg;
  const xBLL = 0, xFL = BLW, xSL = BLW + FG, xCL = xSL + H;
  const xCR = xCL + W, xFR = xCR + H, xBLR = xFR + FG, xEnd = xBLR + BLW;
  const y0 = 0, y1 = H, y2 = H + LH, y3 = y2 + H, y4 = y3 + D, y5 = y4 + H;
  return { xBLL, xFL, xSL, xCL, xCR, xFR, xBLR, xEnd, y0, y1, y2, y3, y4, y5 };
}
