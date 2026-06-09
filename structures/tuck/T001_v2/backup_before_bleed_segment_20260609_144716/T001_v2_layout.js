// ============================================================
// T001_v2_layout.js - B-Type tuck box stable reference layout
// Depends on T001_v2_spec.js
// ============================================================

function T001_v2_round(value) {
  return +(+value).toFixed(4);
}

function T001_v2_point(x, y) {
  return T001_v2_round(x) + ',' + T001_v2_round(y);
}

function T001_v2_getGrid(spec) {
  const D = spec.D;
  const xGlueL = 0;
  const xFrontL = D * (25 / 57);
  const xFrontR = xFrontL + spec.W;
  const xSideLR = xFrontR + spec.D;
  const xBackR = xSideLR + spec.W;
  const xSideRR = xBackR + spec.D * (55.504 / 57);

  const yTop = 0;
  const yLidFold = D * (23 / 57);
  const yBodyTop = yLidFold + D;
  const yBodyBottom = yBodyTop + spec.H;
  const yLockBottom = yBodyBottom + D * (43.5 / 57);

  return {
    xGlueL,
    xFrontL,
    xFrontR,
    xSideLR,
    xBackR,
    xSideRR,
    yTop,
    yLidFold,
    yBodyTop,
    yBodyBottom,
    yLockBottom
  };
}

function T001_v2_buildOuterPath(spec, grid) {
  const W = spec.W;
  const D = spec.D;
  const {
    xGlueL,
    xFrontL: xP1,
    xFrontR: xP2,
    xSideLR: xP3,
    xBackR: xP4,
    xSideRR: xEnd,
    yTop,
    yLidFold: yTF,
    yBodyTop: yLF,
    yBodyBottom: yBB,
    yLockBottom: yLO
  } = grid;

  const P = T001_v2_point;
  const k = 0.5523;

  const yLSFTop = yLF - D * (28 / 57);
  const yBVert = yBB + D * (39.5 / 57);
  const yLRFlat = yBB + D * (28.5 / 57);
  const glueSlope = D * (6.699 / 57);
  const lockStep = D * (3 / 57);
  const lockCornerR = D * (4 / 57);
  const lockLRDiagX = D * (30 / 57);
  const lockLRDiagY = D * (18.5 / 57);

  const xTC = (xP1 + xP2) / 2;
  const tuckFlatHalf = D * (16.381 / 57);
  const xTFL = xTC - tuckFlatHalf;
  const xTFR = xTC + tuckFlatHalf;
  const tuckStraightTop = D * (10.898 / 57);
  const y36 = yTF + D * (55 / 57);
  const tL1x = xP1 + D * (6.001 / 57);
  const tL1y = yTop - D * (0.001 / 57);
  const tL2x = xP1 + D * (0.954 / 57);
  const tL2y = D * (4.785 / 57);
  const tR1x = xP2 - D * (0.954 / 57);
  const tR1y = D * (4.785 / 57);
  const tR2x = xP2 - D * (6 / 57);
  const tR2y = yTop - D * (0.001 / 57);

  const xEndCorn = xEnd - D * (2.501 / 57);
  const yEndCorn = yLF - D * (2.503 / 57);
  const sfRFlatR = xEnd - D * (3.837 / 57);
  const sfRFlatL = xP4 + D * (14.395 / 57);
  const sR1x = xP4 + D * (12.134 / 57);
  const sR2x = xP4 + D * (10.150 / 57);
  const sR2y = yLSFTop + D * (1.519 / 57);
  const x28R = xP4 + D * (9.565 / 57);
  const y28 = yLSFTop + D * (3.71 / 57);
  const x29R = xP4 + D * (6.003 / 57);
  const y29 = yLSFTop + D * (17 / 57);
  const x30R = xP4 + D * (2.003 / 57);
  const y30 = yLSFTop + D * (21 / 57);

  const xNeckC = (xP3 + xP4) / 2;
  const neckHalfW = D * (9 / 57);
  const xNeckL = xNeckC - neckHalfW;
  const xNeckR = xNeckC + neckHalfW;
  const yNeckBot = yLF + D * (8 / 57);
  const nL2x = xNeckL + D * (0.539 / 57);
  const nL2y = yLF + D * (4.561 / 57);
  const nL1x = xNeckL + D * (4.407 / 57);
  const nL1y = yNeckBot;
  const nR2x = xNeckR - D * (4.405 / 57);
  const nR2y = yNeckBot;
  const nR1x = xNeckR - D * (0.539 / 57);
  const nR1y = yLF + D * (4.561 / 57);

  const x28L = xP3 - D * (9.561 / 57);
  const x29L = xP3 - D * (5.998 / 57);
  const x30L = xP3 - D * (1.998 / 57);
  const sL1x = xP3 - D * (10.146 / 57);
  const sL1y = yLSFTop + D * (1.519 / 57);
  const sL2x = xP3 - D * (12.129 / 57);
  const sfLBezEnd = xP3 - D * (14.390 / 57);
  const sfLFlatR = xP2 + D * (5.364 / 57);
  const x35 = xP2 + D * (4 / 57);
  const y35 = yTF + D * (55.1 / 57);
  const urCP1y = y36 + D * (1.084 / 57);
  const urCP2x = xP2 + D * (0.865 / 57);
  const urCP3x = xP2 + D * (1.949 / 57);
  const urCP4x = xP2 + D * (3.032 / 57);
  const urCP5x = xP2 + D * (3.941 / 57);
  const urCP5y = yLF - D * (0.816 / 57);

  const lockAOuterX = D * (13.5 / 57);
  const lockAInnerX = D * (17.5 / 57);
  const lockBDiagW = D * (18.5 / 57);
  const lockBGapHalf = D * (6 / 57);
  let lbInL = xP3 + lockBDiagW;
  let lbInR = xP4 - lockBDiagW;
  if (lbInL > lbInR) {
    lbInL = xNeckC;
    lbInR = xNeckC;
  }
  const lbGapL = Math.min(Math.max(xNeckC - lockBGapHalf, lbInL + lockCornerR), xNeckC);
  const lbGapR = Math.max(Math.min(xNeckC + lockBGapHalf, lbInR - lockCornerR), xNeckC);

  return [
    'M ' + P(xP1 + lockAOuterX, yLO),
    'L ' + P(xP1 + lockStep, yLO),
    'L ' + P(xP1 + lockStep, yBB + lockStep),
    'L ' + P(xP1, yBB),
    'L ' + P(xGlueL, yBB - glueSlope),
    'L ' + P(xGlueL, yLF + glueSlope),
    'L ' + P(xP1, yLF),
    'L ' + P(xP1, yTF),
    'L ' + P(xP1 + D * (0.634 / 57), tuckStraightTop),
    'C ' + P(tL2x, tL2y) + ' ' + P(tL1x, tL1y) + ' ' + P(xTFL, yTop),
    'L ' + P(xTFR, yTop),
    'C ' + P(tR2x, tR2y) + ' ' + P(tR1x, tR1y) + ' ' + P(xP2 - D * (0.633 / 57), tuckStraightTop),
    'L ' + P(xP2, yTF),
    'L ' + P(xP2, y36),
    'C ' + P(xP2, urCP1y) + ' ' + P(urCP2x, yLF - D * (0.032 / 57)) + ' ' + P(urCP3x, yLF),
    'C ' + P(urCP4x, yLF + D * (0.025 / 57)) + ' ' + P(urCP5x, urCP5y) + ' ' + P(x35, y35),
    'L ' + P(sfLFlatR, yLSFTop),
    'L ' + P(sfLBezEnd, yLSFTop),
    'C ' + P(sL2x, yLSFTop) + ' ' + P(sL1x, sL1y) + ' ' + P(x28L, y28),
    'L ' + P(x29L, y29),
    'L ' + P(x30L, y30),
    'L ' + P(x30L, yLF),
    'L ' + P(xNeckL, yLF),
    'C ' + P(nL2x, nL2y) + ' ' + P(nL1x, nL1y) + ' ' + P(xNeckC, yNeckBot),
    'C ' + P(nR2x, nR2y) + ' ' + P(nR1x, nR1y) + ' ' + P(xNeckR, yLF),
    'L ' + P(x30R, yLF),
    'L ' + P(x30R, y30),
    'L ' + P(x29R, y29),
    'L ' + P(x28R, y28),
    'C ' + P(sR2x, sR2y) + ' ' + P(sR1x, yLSFTop) + ' ' + P(sfRFlatL, yLSFTop),
    'L ' + P(sfRFlatR, yLSFTop),
    'L ' + P(xEndCorn, yEndCorn),
    'L ' + P(xEnd, yLF),
    'L ' + P(xEnd, yBB),
    'L ' + P(xP4 + D * (27.003 / 57), yBB + lockLRDiagY),
    'L ' + P(xP4 + D * (28.975 / 57), yBB + D * (24.574 / 57)),
    'C ' + P(xP4 + D * (29.272 / 57), yBB + D * (25.489 / 57)) + ' ' + P(xP4 + D * (29.114 / 57), yBB + D * (26.487 / 57)) + ' ' + P(xP4 + D * (28.549 / 57), yBB + D * (27.264 / 57)),
    'C ' + P(xP4 + D * (27.983 / 57), yBB + D * (28.042 / 57)) + ' ' + P(xP4 + D * (27.083 / 57), yLRFlat) + ' ' + P(xP4 + D * (26.122 / 57), yLRFlat),
    'L ' + P(xP4 + lockStep, yLRFlat),
    'L ' + P(xP4 + lockStep, yBB + lockStep),
    'L ' + P(xP4, yBB),
    'L ' + P(lbInR, yLRFlat),
    'L ' + P(lbInR, yBVert),
    'C ' + P(lbInR, yLO - lockCornerR * (1 - k)) + ' ' + P(lbInR - lockCornerR * (1 - k), yLO) + ' ' + P(lbInR - lockCornerR, yLO),
    'L ' + P(lbGapR, yLO),
    'L ' + P(lbGapL, yLO),
    'L ' + P(lbInL + lockCornerR, yLO),
    'C ' + P(lbInL + lockCornerR * (1 - k), yLO) + ' ' + P(lbInL, yLO - lockCornerR * (1 - k)) + ' ' + P(lbInL, yBVert),
    'L ' + P(lbInL, yLRFlat),
    'L ' + P(xP3, yBB),
    'L ' + P(xP3 - lockStep, yBB + lockStep),
    'L ' + P(xP3 - lockStep, yLRFlat),
    'L ' + P(xP2 + D * (30.949 / 57), yLRFlat),
    'C ' + P(xP2 + lockLRDiagX, yLRFlat) + ' ' + P(xP2 + D * (29.097 / 57), yBB + D * (28.047 / 57)) + ' ' + P(xP2 + D * (28.531 / 57), yBB + D * (27.276 / 57)),
    'C ' + P(xP2 + D * (27.965 / 57), yBB + D * (26.506 / 57)) + ' ' + P(xP2 + D * (27.801 / 57), yBB + D * (25.515 / 57)) + ' ' + P(xP2 + D * (28.087 / 57), yBB + D * (24.602 / 57)),
    'L ' + P(xP2 + lockLRDiagX, yBB + lockLRDiagY),
    'L ' + P(xP2, yBB),
    'L ' + P(xP2 - lockStep, yBB + lockStep),
    'L ' + P(xP2 - lockStep, yLO),
    'L ' + P(xP2 - lockAOuterX, yLO),
    'C ' + P(xP2 - lockAOuterX - lockCornerR * k, yLO) + ' ' + P(xP2 - lockAInnerX, yBVert + lockCornerR * k) + ' ' + P(xP2 - lockAInnerX, yBVert),
    'L ' + P(xP2 - lockAInnerX, yLRFlat),
    'L ' + P(xP1 + lockAInnerX, yLRFlat),
    'L ' + P(xP1 + lockAInnerX, yBVert),
    'C ' + P(xP1 + lockAInnerX, yLO - lockCornerR * (1 - k)) + ' ' + P(xP1 + lockAOuterX + lockCornerR * k, yLO) + ' ' + P(xP1 + lockAOuterX, yLO),
    'Z'
  ].join(' ');
}

function T001_v2_buildBleedPath_referenceMapLegacy(spec, grid) {
  const ref = {
    W: 57,
    D: 57,
    H: 177,
    xFrontL: 25,
    xFrontR: 82,
    xSideLR: 139,
    xBackR: 196,
    xSideRR: 251.504,
    yTop: 0,
    yLidFold: 23,
    yBodyTop: 80,
    yBodyBottom: 257,
    yLockBottom: 300.5
  };
  const bleedD = [
    'M 107.2676,280.7042',
    'C 106.6986,282.5196 107.0309,284.5188 108.1559,286.0502',
    'C 109.2816,287.5841 111.0896,288.4996 112.9925,288.4996',
    'L 113.7756,288.5003',
    'L 113.7756,288.4996',
    'L 112.9925,288.4996',
    'L 139.0451,288.4996',
    'L 139.0451,262.509',
    'L 154.5451,286.3878',
    'L 154.5451,296.4995',
    'C 154.5451,300.3596 157.6851,303.5 161.5452,303.5',
    'L 173.5453,303.5',
    'C 177.405,303.5 180.5454,300.3599 180.5454,296.4995',
    'L 180.5454,286.3878',
    'L 196.0451,262.5094',
    'L 196.0451,288.4996',
    'L 222.164,288.4996',
    'C 224.0771,288.4996 225.8914,287.5756 227.0179,286.0266',
    'C 228.1432,284.4782 228.4618,282.4667 227.8705,280.6467',
    'L 227.8705,280.6467',
    'L 226.6094,276.7626',
    'L 253.1784,259.5154',
    'L 254.5451,258.5385',
    'L 254.5451,78.7568',
    'L 251.9804,76.1929',
    'L 250.5552,48.9997',
    'L 210.4366,48.9997',
    'C 206.8224,48.9997 203.645,51.4381 202.7094,54.9292',
    'L 199.3552,67.4471',
    'L 195.045,71.7574',
    'L 195.045,76.9997',
    'L 176.545,76.9997',
    'L 173.6822,77.036',
    'L 173.5654,79.6476',
    'C 173.2052,82.6988 170.6165,84.9999 167.5445,84.9999',
    'C 164.4726,84.9999 161.8842,82.6991 161.524,79.648',
    'L 161.4419,77.1023',
    'L 158.5448,76.9993',
    'L 140.0448,76.9993',
    'L 140.0448,71.757',
    'L 135.735,67.4464',
    'L 132.3808,54.9285',
    'C 131.4452,51.4374 128.2677,48.999 124.6535,48.999',
    'L 85.0454,48.999',
    'L 85.0454,22.9997',
    'L 84.4069,10.7407',
    'C 84.0026,3.0353 77.6424,-3.0007 69.9268,-3.0007',
    'L 37.164,-3.0007',
    'C 29.4477,-3.0007 23.0875,3.0353 22.6839,10.7407',
    'L 22.0451,22.921',
    'L 22.1015,86.1987',
    'L 22.3992,131.1506',
    'L 22.1555,216.1216',
    'L 21.9981,258.802',
    'L 25.0451,261.2412',
    'L 25.0451,303.4989',
    'L 38.5455,303.4989',
    'C 42.4052,303.4989 45.5453,300.3589 45.5453,296.4984',
    'L 45.5453,296.4984',
    'L 45.5453,288.4985',
    'L 61.5452,288.4985',
    'L 61.5452,296.4984',
    'C 61.5452,300.3585 64.6853,303.4989 68.5453,303.4989',
    'L 82.0454,303.4989',
    'L 82.0454,261.2412',
    'L 82.4896,260.797',
    'L 108.4843,276.8272',
    'L 107.2687,280.7021'
  ].join(' ');

  function near(value, anchor) {
    return Math.abs(value - anchor) <= 3.6;
  }

  function legacyMapX(x) {
    if (near(x, ref.xFrontL)) return grid.xFrontL + (x - ref.xFrontL);
    if (near(x, ref.xFrontR)) return grid.xFrontR + (x - ref.xFrontR);
    if (near(x, ref.xSideLR)) return grid.xSideLR + (x - ref.xSideLR);
    if (near(x, ref.xBackR)) return grid.xBackR + (x - ref.xBackR);
    if (near(x, ref.xSideRR)) return grid.xSideRR + (x - ref.xSideRR);
    if (x < ref.xFrontL) return grid.xFrontL + (x - ref.xFrontL);
    if (x < ref.xFrontR) return grid.xFrontL + ((x - ref.xFrontL) / ref.W) * spec.W;
    if (x < ref.xSideLR) return grid.xFrontR + ((x - ref.xFrontR) / ref.D) * spec.D;
    if (x < ref.xBackR) return grid.xSideLR + ((x - ref.xSideLR) / ref.W) * spec.W;
    if (x < ref.xSideRR) return grid.xBackR + ((x - ref.xBackR) / (ref.xSideRR - ref.xBackR)) * (grid.xSideRR - grid.xBackR);
    return grid.xSideRR + (x - ref.xSideRR);
  }

  function legacyMapY(y) {
    if (near(y, ref.yTop)) return grid.yTop + (y - ref.yTop);
    if (near(y, ref.yLidFold)) return grid.yLidFold + (y - ref.yLidFold);
    if (near(y, ref.yBodyTop)) return grid.yBodyTop + (y - ref.yBodyTop);
    if (near(y, ref.yBodyBottom)) return grid.yBodyBottom + (y - ref.yBodyBottom);
    if (near(y, ref.yLockBottom)) return grid.yLockBottom + (y - ref.yLockBottom);
    if (y < ref.yLidFold) return grid.yTop + ((y - ref.yTop) / ref.D) * spec.D;
    if (y < ref.yBodyTop) return grid.yLidFold + ((y - ref.yLidFold) / ref.D) * spec.D;
    if (y < ref.yBodyBottom) return grid.yBodyTop + ((y - ref.yBodyTop) / ref.H) * spec.H;
    return grid.yBodyBottom + ((y - ref.yBodyBottom) / ref.D) * spec.D;
  }

  return bleedD.replace(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g, pair => {
    const [x, y] = pair.split(',').map(Number);
    return T001_v2_point(legacyMapX(x), legacyMapY(y));
  });
}

function T001_v2_buildBleedPath(spec, grid) {
  const D = spec.D;
  const {
    xFrontL: xP1,
    xFrontR: xP2,
    xSideLR: xP3,
    xBackR: xP4,
    xSideRR: xEnd,
    yLidFold: yTF,
    yBodyTop: yLF,
    yBodyBottom: yBB,
    yLockBottom: yLO
  } = grid;

  const P = T001_v2_point;
  const b = 3;
  const k = 0.5523;

  const yLSFTop = yLF - D * (28 / 57);
  const yBVert = yBB + D * (39.5 / 57);
  const yLRFlat = yBB + D * (28.5 / 57);
  const lockCornerR = D * (4 / 57);
  const lockAInnerX = D * (17.5 / 57);
  const lockBDiagW = D * (18.5 / 57);
  const lockBGapHalf = D * (6 / 57);

  const xTC = (xP1 + xP2) / 2;
  const tuckFlatHalf = D * (16.381 / 57);
  const xTFL = xTC - tuckFlatHalf;
  const xTFR = xTC + tuckFlatHalf;

  const xNeckC = (xP3 + xP4) / 2;
  const neckHalfW = D * (9 / 57);
  const xNeckL = xNeckC - neckHalfW;
  const xNeckR = xNeckC + neckHalfW;
  let lbInL = xP3 + lockBDiagW;
  let lbInR = xP4 - lockBDiagW;
  if (lbInL > lbInR) {
    lbInL = xNeckC;
    lbInR = xNeckC;
  }
  const lbGapL = Math.min(Math.max(xNeckC - lockBGapHalf, lbInL + lockCornerR), xNeckC);
  const lbGapR = Math.max(Math.min(xNeckC + lockBGapHalf, lbInR - lockCornerR), xNeckC);
  const sfRFlatL = xP4 + D * (14.395 / 57);

  return [
    'M ' + P(xP2 + D * (25.268 / 57), yLRFlat - D * (4.796 / 57)),
    'C ' + P(xP2 + D * (24.699 / 57), yLRFlat - D * (2.980 / 57)) + ' ' + P(xP2 + D * (25.031 / 57), yLRFlat - D * (0.981 / 57)) + ' ' + P(xP2 + D * (26.156 / 57), yLRFlat + D * (0.550 / 57)),
    'C ' + P(xP2 + D * (27.282 / 57), yLRFlat + b - D * (0.916 / 57)) + ' ' + P(xP3 - D * (27.910 / 57), yLRFlat + b) + ' ' + P(xP3 - D * (26.007 / 57), yLRFlat + b),
    'L ' + P(xP3 - D * (25.224 / 57), yLRFlat + b),
    'L ' + P(xP3, yLRFlat + b),
    'L ' + P(xP3, yBB + b + D * (2.509 / 57)),
    'L ' + P(lbInL - b, yLRFlat + D * (0.888 / 57)),
    'L ' + P(lbInL - b, yBVert),
    'C ' + P(lbInL - b, yBVert + (lockCornerR + b) * k) + ' ' + P(lbInL + lockCornerR - (lockCornerR + b) * k, yLO + b) + ' ' + P(lbInL + lockCornerR, yLO + b),
    'L ' + P(lbGapL, yLO + b),
    'L ' + P(lbGapR, yLO + b),
    'L ' + P(lbInR - lockCornerR, yLO + b),
    'C ' + P(lbInR - lockCornerR + (lockCornerR + b) * k, yLO + b) + ' ' + P(lbInR + b, yBVert + (lockCornerR + b) * k) + ' ' + P(lbInR + b, yBVert),
    'L ' + P(lbInR + b, yLRFlat + D * (0.888 / 57)),
    'L ' + P(xP4, yBB + b + D * (2.510 / 57)),
    'L ' + P(xP4, yLRFlat + b),
    'L ' + P(xP4 + D * (26.164 / 57), yLRFlat + b),
    'C ' + P(xEnd - D * (27.427 / 57), yLRFlat + b) + ' ' + P(xEnd - D * (25.612 / 57), yLRFlat + b - D * (0.924 / 57)) + ' ' + P(xEnd - D * (24.486 / 57), yLRFlat + D * (0.527 / 57)),
    'C ' + P(xEnd - D * (23.361 / 57), yLRFlat - D * (1.021 / 57)) + ' ' + P(xEnd - D * (23.042 / 57), yLRFlat - D * (3.033 / 57)) + ' ' + P(xEnd - D * (23.633 / 57), yLRFlat - D * (4.853 / 57)),
    'C ' + P(xEnd - D * (24.224 / 57), yLRFlat - D * (6.673 / 57)) + ' ' + P(xEnd - D * (24.894 / 57), yLRFlat - D * (8.737 / 57)) + ' ' + P(xEnd - D * (24.894 / 57), yLRFlat - D * (8.737 / 57)),
    'L ' + P(xEnd + D * (1.675 / 57), yBB + b - D * (0.484 / 57)),
    'L ' + P(xEnd + D * (3.041 / 57), yBB + b - D * (1.461 / 57)),
    'L ' + P(xEnd + D * (3.041 / 57), yLF - D * (1.243 / 57)),
    'L ' + P(xEnd + D * (0.477 / 57), yLF - b - D * (0.807 / 57)),
    'L ' + P(xEnd - D * (0.949 / 57), yLSFTop - b),
    'L ' + P(sfRFlatL - b, yLSFTop - b),
    'C ' + P(xP4 + D * (10.823 / 57), yLSFTop - b) + ' ' + P(xP4 + D * (7.645 / 57), yLSFTop - D * (0.562 / 57)) + ' ' + P(xP4 + D * (6.710 / 57), yLSFTop + D * (2.929 / 57)),
    'L ' + P(xP4 + D * (3.355 / 57), yLF - b - D * (9.553 / 57)),
    'L ' + P(xP4 - D * (0.955 / 57), yLF - b - D * (5.243 / 57)),
    'L ' + P(xP4 - D * (0.955 / 57), yLF - b),
    'L ' + P(xNeckR, yLF - b),
    'L ' + P(lbGapR + D * (0.182 / 57), yLF - b),
    'L ' + P(lbGapR, yLF - D * (0.352 / 57)),
    'C ' + P(lbGapR - D * (0.295 / 57), yLF + D * (2.699 / 57)) + ' ' + P(lbGapR - D * (2.883 / 57), yLF + D * (5.000 / 57)) + ' ' + P(lbGapR - D * (5.955 / 57), yLF + D * (5.000 / 57)),
    'C ' + P(lbGapL + D * (2.973 / 57), yLF + D * (5.000 / 57)) + ' ' + P(lbGapL + D * (0.385 / 57), yLF + D * (2.699 / 57)) + ' ' + P(lbGapL, yLF - D * (0.352 / 57)),
    'L ' + P(lbGapL, yLF - b + D * (0.102 / 57)),
    'L ' + P(xNeckL, yLF - b),
    'L ' + P(xP3 + D * (1.045 / 57), yLF - b),
    'L ' + P(xP3 + D * (1.045 / 57), yLF - b - D * (5.243 / 57)),
    'L ' + P(xP3 - D * (3.265 / 57), yLF - b - D * (9.554 / 57)),
    'L ' + P(xP3 - D * (6.619 / 57), yLSFTop + D * (2.929 / 57)),
    'C ' + P(xP3 - D * (7.555 / 57), yLSFTop - D * (0.562 / 57)) + ' ' + P(xP3 - D * (10.732 / 57), yLSFTop - b) + ' ' + P(xP3 - D * (14.346 / 57), yLSFTop - b),
    'L ' + P(xP2 + D * (3.046 / 57), yLSFTop - b),
    'L ' + P(xP2 + D * (3.046 / 57), yTF),
    'L ' + P(xP2 + D * (2.407 / 57), D * (10.741 / 57)),
    'C ' + P(xP2 + D * (2.003 / 57), D * (3.035 / 57)) + ' ' + P(xP2 - D * (6 / 57), -b) + ' ' + P(xTFR, -b),
    'L ' + P(xTFL, -b),
    'C ' + P(xP1 + D * (6.001 / 57), -b) + ' ' + P(xP1 - D * (1.912 / 57), D * (3.035 / 57)) + ' ' + P(xP1 - D * (2.316 / 57), D * (10.741 / 57)),
    'L ' + P(xP1 - D * (2.955 / 57), yTF),
    'L ' + P(xP1 - b, yTF),
    'L ' + P(xP1 - b, yBB),
    'L ' + P(xP1, yBB + b + D * (1.242 / 57)),
    'L ' + P(xP1, yLO + b),
    'L ' + P(xP1 + lockAInnerX - b - D * (0.954 / 57), yLO + b),
    'C ' + P(xP1 + lockAInnerX - D * (0.095 / 57), yLO + b) + ' ' + P(xP1 + lockAInnerX + D * (3.045 / 57), yLO - D * (0.140 / 57)) + ' ' + P(xP1 + lockAInnerX + D * (3.045 / 57), yBVert),
    'L ' + P(xP1 + lockAInnerX + D * (3.045 / 57), yLRFlat + b),
    'L ' + P(xP2 - lockAInnerX - D * (2.955 / 57), yLRFlat + b),
    'L ' + P(xP2 - lockAInnerX - D * (2.955 / 57), yBVert),
    'C ' + P(xP2 - lockAInnerX - D * (2.955 / 57), yLO - D * (0.141 / 57)) + ' ' + P(xP2 - lockAInnerX + D * (0.185 / 57), yLO + b) + ' ' + P(xP2 - lockAInnerX + b + D * (1.045 / 57), yLO + b),
    'L ' + P(xP2, yLO + b),
    'L ' + P(xP2, yBB + b + D * (1.242 / 57)),
    'L ' + P(xP2 + D * (0.490 / 57), yBB + b + D * (0.798 / 57)),
    'L ' + P(xP2 + D * (26.484 / 57), yLRFlat - D * (8.672 / 57)),
    'L ' + P(xP2 + D * (25.269 / 57), yLRFlat - D * (4.797 / 57))
  ].join(' ');
}

function T001_v2_buildFoldLines(spec, grid) {
  const D = spec.D;
  const fe = D * (0.3 / 57);
  const fe2 = D * (2.3 / 57);
  const {
    xFrontL: xP1,
    xFrontR: xP2,
    xSideLR: xP3,
    xBackR: xP4,
    xSideRR: xEnd,
    yLidFold: yTF,
    yBodyTop: yLF,
    yBodyBottom: yBB
  } = grid;

  return [
    { id: 'fold-sideR-bottomLockR', x1: xEnd - fe, y1: yBB, x2: xP4 + fe, y2: yBB, axis: 'x' },
    { id: 'fold-back-bottomLockB', x1: xP4 - fe, y1: yBB, x2: xP3 + fe, y2: yBB, axis: 'x' },
    { id: 'fold-sideL-bottomLockL', x1: xP3 - fe, y1: yBB, x2: xP2 + fe, y2: yBB, axis: 'x' },
    { id: 'fold-front-bottomLockA', x1: xP2 - fe, y1: yBB, x2: xP1 + fe, y2: yBB, axis: 'x' },
    { id: 'fold-back-sideR', x1: xP4, y1: yLF + fe, x2: xP4, y2: yBB - fe, axis: 'y' },
    { id: 'fold-front-sideL', x1: xP2, y1: yLF + fe, x2: xP2, y2: yBB - fe, axis: 'y' },
    { id: 'fold-sideL-back', x1: xP3, y1: yLF + fe, x2: xP3, y2: yBB - fe, axis: 'y' },
    { id: 'fold-glue-front', x1: xP1, y1: yLF + fe, x2: xP1, y2: yBB - fe, axis: 'y' },
    { id: 'fold-sideR-lidSideFlapR', x1: xEnd - fe, y1: yLF, x2: xP4 + fe2, y2: yLF, axis: 'x' },
    { id: 'fold-sideL-lidSideFlapL', x1: xP3 - fe2, y1: yLF, x2: xP2 + fe2, y2: yLF, axis: 'x' },
    { id: 'fold-front-lidTop', x1: xP2 - fe, y1: yLF - D * (1 / 57), x2: xP1 + fe, y2: yLF - D * (1 / 57), axis: 'x' },
    { id: 'fold-lidTop-upperTuck', x1: xP2 - fe, y1: yTF, x2: xP1 + fe, y2: yTF, axis: 'x' }
  ];
}

function T001_v2_getPathBounds(paths, foldLines) {
  const xs = [];
  const ys = [];
  paths.forEach(path => {
    const nums = path.match(/-?\d+(?:\.\d+)?/g) || [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      xs.push(+nums[i]);
      ys.push(+nums[i + 1]);
    }
  });
  foldLines.forEach(line => {
    xs.push(line.x1, line.x2);
    ys.push(line.y1, line.y2);
  });
  return {
    minX: T001_v2_round(Math.min(...xs)),
    minY: T001_v2_round(Math.min(...ys)),
    maxX: T001_v2_round(Math.max(...xs)),
    maxY: T001_v2_round(Math.max(...ys)),
    width: T001_v2_round(Math.max(...xs) - Math.min(...xs)),
    height: T001_v2_round(Math.max(...ys) - Math.min(...ys))
  };
}

function T001_v2_getLayout(W, D, H) {
  const spec = T001_v2_getSpec({ W, D, H });
  const grid = T001_v2_getGrid(spec);
  const outerPath = T001_v2_buildOuterPath(spec, grid);
  const bleedPath = T001_v2_buildBleedPath(spec, grid);
  const foldLines = T001_v2_buildFoldLines(spec, grid);
  const xBackC = (grid.xSideLR + grid.xBackR) / 2;

  const notchSegment = {
    id: 'thumbNotch',
    type: 'notch',
    parentPanel: 'back',
    centerX: T001_v2_round(xBackC),
    y: T001_v2_round(grid.yBodyTop),
    width: T001_v2_round(D * (18 / 57)),
    depth: T001_v2_round(D * (8 / 57))
  };

  return {
    spec,
    grid,
    cutPath: outerPath,
    closedOuterPath: outerPath,
    bleedPath,
    cutPaths: [outerPath],
    cutSegments: [{ id: 'cutPath', type: 'outer', path: outerPath }],
    notchSegment,
    foldLines,
    referencePoints: [],
    panels: [],
    labels: [],
    bounds: T001_v2_getPathBounds([outerPath], foldLines)
  };
}
