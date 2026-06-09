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
