// ============================================================
// T001_layout.js — B-Type Tuck End Box
// 원본 좌표: 57-57-177-B-Type_원본_좌표.svg (희야 승인)
// ============================================================
// 패널: [glue][front(W)][sideL(D)][back(W)][sideR(D)]
// grid: xP2=xP1+W / xP3=xP2+D / xP4=xP3+W
// ============================================================

function T001_getLayout(W, D, H) {

  // ── X 기준선 ──────────────────────────────────────────────
  var xP1  = D*(25/57);           // glue 오른쪽
  var xP2  = xP1 + W;             // front(W) 오른쪽
  var xP3  = xP2 + D;             // sideL(D) 오른쪽
  var xP4  = xP3 + W;             // back(W)  오른쪽
  var xEnd = xP4 + D*(55.504/57); // sideR(D) 오른쪽

  // ── Y 기준선 ──────────────────────────────────────────────
  var yTF  = D*(23/57);
  var yLF  = yTF + D;
  var yBB  = yLF + H;
  var yLO  = yBB + D*(43.5/57);

  // ── 보조 ──────────────────────────────────────────────────
  var yLSFTop  = yLF - D*(28/57);
  var yBVert   = yBB + D*(39.5/57);
  var yLRFlat  = yBB + D*(28.5/57);
  var glueSlope = D*(6.699/57);
  var lockStep  = D*(3/57);
  var lockCornerR = D*(4/57);
  var k = 0.5523;
  var lockLRDiagX = D*(30/57);
  var lockLRDiagY = D*(18.5/57);

  // ── tuck (front 상단) ──────────────────────────────────────
  var xTC = (xP1+xP2)/2;
  var tuckFlatHalf = D*(16.381/57);
  var xTFL = xTC - tuckFlatHalf,  xTFR = xTC + tuckFlatHalf;
  var tuckStraightTop = D*(10.898/57);
  var y36  = yTF + D*(55/57);
  var tL1x=xP1+D*(6.001/57), tL1y=-D*(0.001/57);
  var tL2x=xP1+D*(0.954/57), tL2y= D*(4.785/57);
  var tR1x=xP2-D*(0.954/57), tR1y= D*(4.785/57);
  var tR2x=xP2-D*(6.000/57), tR2y=-D*(0.001/57);
  function _p(x,y){var fx=+(+x).toFixed(4),fy=+(+y).toFixed(4);return fx+','+fy;}

  // ── sfR (sideR lid flap, D기준 형상) ──────────────────────
  var xEndCorn   = xEnd - D*(2.501/57),  yEndCorn = yLF - D*(2.503/57);
  var sfR_flat_R = xEnd - D*(3.837/57),  sfR_flat_L = xP4 + D*(14.395/57);
  var sR1x=xP4+D*(12.134/57), sR2x=xP4+D*(10.150/57), sR2y=yLSFTop+D*(1.519/57);
  var x28R=xP4+D*(9.565/57),  y28=yLSFTop+D*(3.71/57);
  var x29R=xP4+D*(6.003/57),  y29=yLSFTop+D*(17/57);
  var x30R=xP4+D*(2.003/57),  y30=yLSFTop+D*(21/57);

  // ── neck / thumb (back 중앙, D기준 형상) ──────────────────
  var xNeckC = (xP3+xP4)/2;
  var neckHalfW = D*(9/57);
  var xNeckL = xNeckC - neckHalfW,  xNeckR = xNeckC + neckHalfW;
  var yNeckBot = yLF + D*(8/57);
  var nL2x=xNeckL+D*(0.539/57), nL2y=yLF+D*(4.561/57);
  var nL1x=xNeckL+D*(4.407/57), nL1y=yNeckBot;
  var nR2x=xNeckR-D*(4.405/57), nR2y=yNeckBot;
  var nR1x=xNeckR-D*(0.539/57), nR1y=yLF+D*(4.561/57);

  // ── sfL (sideL lid flap, D기준 형상) ──────────────────────
  var x28L=xP3-D*(9.561/57), x29L=xP3-D*(5.998/57), x30L=xP3-D*(1.998/57);
  var sL1x=xP3-D*(10.146/57), sL1y=yLSFTop+D*(1.519/57);
  var sL2x=xP3-D*(12.129/57), sfL_bez_end=xP3-D*(14.390/57);
  var sfL_flat_R=xP2+D*(5.364/57);
  var x35=xP2+D*(4/57),  y35=yTF+D*(55.1/57);
  var urCP1y=y36+D*(1.084/57);
  var urCP2x=xP2+D*(0.865/57), urCP3x=xP2+D*(1.949/57);
  var urCP4x=xP2+D*(3.032/57), urCP5x=xP2+D*(3.941/57), urCP5y=yLF-D*(0.816/57);

  // ── bottomLock-A/B (front/back W기준 위치, D기준 형상) ────
  var lockAOuterX = D*(13.5/57),  lockAInnerX = D*(17.5/57);
  var lockBDiagW  = D*(18.5/57),  lockBGapHalf = D*(6/57);
  var lbInL=xP3+lockBDiagW,  lbInR=xP4-lockBDiagW;
  // lbInL/lbInR 역전 방지 (D가 지나치게 클 때)
  if (lbInL > lbInR) { lbInL = lbInR = xNeckC; }
  // lbGapL/lbGapR: lbInL+lockCornerR ~ lbInR-lockCornerR 범위 내로 clamp
  var lbGapL = Math.min(Math.max(xNeckC-lockBGapHalf, lbInL+lockCornerR), xNeckC);
  var lbGapR = Math.max(Math.min(xNeckC+lockBGapHalf, lbInR-lockCornerR), xNeckC);

  // ── cutPathD (M=17, Z=0) ──────────────────────────────────
  var cutPathD =
  // [0] sideR arc
  ['M '+_p(xP4+D*(26.122/57),yLRFlat),
   'C '+_p(xP4+D*(27.083/57),yLRFlat)+' '+_p(xP4+D*(27.983/57),yBB+D*(28.042/57))+' '+_p(xP4+D*(28.549/57),yBB+D*(27.264/57)),
   'C '+_p(xP4+D*(29.114/57),yBB+D*(26.487/57))+' '+_p(xP4+D*(29.272/57),yBB+D*(25.489/57))+' '+_p(xP4+D*(28.975/57),yBB+D*(24.574/57))
  ].join(' ')+' '
  // [1] lock-B gap right arc
  +['M '+_p(lbInR,yBVert),
    'C '+_p(lbInR,yLO-lockCornerR*(1-k))+' '+_p(lbInR-lockCornerR*(1-k),yLO)+' '+_p(lbInR-lockCornerR,yLO),
    'L '+_p(lbGapR,yLO)
  ].join(' ')+' '
  // [2] lock-B gap left arc + line
  +['M '+_p(lbInL,yBVert),
    'C '+_p(lbInL,yLO-lockCornerR*(1-k))+' '+_p(lbInL+lockCornerR*(1-k),yLO)+' '+_p(lbInL+lockCornerR,yLO),
    'L '+_p(lbGapL,yLO),
    'L '+_p(lbGapR,yLO)
  ].join(' ')+' '
  // [3] lock-L arc
  +['M '+_p(xP2+D*(28.087/57),yBB+D*(24.602/57)),
    'C '+_p(xP2+D*(27.801/57),yBB+D*(25.515/57))+' '+_p(xP2+D*(27.965/57),yBB+D*(26.506/57))+' '+_p(xP2+D*(28.531/57),yBB+D*(27.276/57)),
    'C '+_p(xP2+D*(29.097/57),yBB+D*(28.047/57))+' '+_p(xP2+lockLRDiagX,yLRFlat)+' '+_p(xP2+D*(30.949/57),yLRFlat)
  ].join(' ')+' '
  // [4] lock-A inner right arc
  +['M '+_p(xP2-lockAInnerX,yBVert),
    'C '+_p(xP2-lockAInnerX,yBVert+lockCornerR*k)+' '+_p(xP2-lockAOuterX-lockCornerR*k,yLO)+' '+_p(xP2-lockAOuterX,yLO)
  ].join(' ')+' '
  // [5] lock-A outer left arc
  +['M '+_p(xP1+lockAOuterX,yLO),
    'C '+_p(xP1+lockAOuterX+lockCornerR*k,yLO)+' '+_p(xP1+lockAInnerX,yLO-lockCornerR*(1-k))+' '+_p(xP1+lockAInnerX,yBVert)
  ].join(' ')+' '
  // [6] sideR body + sfR
  +['M '+_p(xEnd,yBB),'L '+_p(xEnd,yLF),'L '+_p(xEndCorn,yEndCorn),
    'L '+_p(sfR_flat_R,yLSFTop),'L '+_p(sfR_flat_L,yLSFTop),
    'C '+_p(sR1x,yLSFTop)+' '+_p(sR2x,sR2y)+' '+_p(x28R,y28),
    'L '+_p(x29R,y29),'L '+_p(x30R,y30),'L '+_p(x30R,yLF),'L '+_p(xNeckR,yLF)
  ].join(' ')+' '
  // [7] neck (thumb notch arc)
  +['M '+_p(xNeckL,yLF),
    'C '+_p(nL2x,nL2y)+' '+_p(nL1x,nL1y)+' '+_p(xNeckC,yNeckBot),
    'C '+_p(nR2x,nR2y)+' '+_p(nR1x,nR1y)+' '+_p(xNeckR,yLF)
  ].join(' ')+' '
  // [8] sfL
  +['M '+_p(xNeckL,yLF),
    'L '+_p(x30L,yLF),'L '+_p(x30L,y30),'L '+_p(x29L,y29),'L '+_p(x28L,y28),
    'C '+_p(sL1x,sL1y)+' '+_p(sL2x,yLSFTop)+' '+_p(sfL_bez_end,yLSFTop),
    'L '+_p(sfL_flat_R,yLSFTop),'L '+_p(x35,y35)
  ].join(' ')+' '
  // [9] U-return arc
  +['M '+_p(xP2,y36),
    'C '+_p(xP2,urCP1y)+' '+_p(urCP2x,yLF-D*(0.032/57))+' '+_p(urCP3x,yLF),
    'C '+_p(urCP4x,yLF+D*(0.025/57))+' '+_p(urCP5x,urCP5y)+' '+_p(x35,y35)
  ].join(' ')+' '
  // [10] glue + tuck
  +['M '+_p(xP1+lockAOuterX,yLO),
    'L '+_p(xP1+lockStep,yLO),'L '+_p(xP1+lockStep,yBB+lockStep),'L '+_p(xP1,yBB),
    'L '+_p(0,yBB-glueSlope),'L '+_p(0,yLF+glueSlope),'L '+_p(xP1,yLF),
    'L '+_p(xP1,yTF),'L '+_p(xP1+D*(0.634/57),tuckStraightTop),
    'C '+_p(tL2x,tL2y)+' '+_p(tL1x,tL1y)+' '+_p(xTFL,0),
    'L '+_p(xTFR,0),
    'C '+_p(tR2x,tR2y)+' '+_p(tR1x,tR1y)+' '+_p(xP2-D*(0.633/57),tuckStraightTop),
    'L '+_p(xP2,yTF),'L '+_p(xP2,y36)
  ].join(' ')
  // [11] sideR 상단 anchor (단독 M)
  +' M '+_p(xEnd,y36)+' '
  // [12] lock-R diagonal
  +['M '+_p(xEnd,yBB),
    'L '+_p(xP4+D*(27.003/57),yBB+lockLRDiagY),
    'L '+_p(xP4+D*(28.975/57),yBB+D*(24.574/57))
  ].join(' ')+' '
  // [13] lock-R plateau + lock-B right
  +['M '+_p(xP4+D*(26.122/57),yLRFlat),
    'L '+_p(xP4+lockStep,yLRFlat),'L '+_p(xP4+lockStep,yBB+lockStep),
    'L '+_p(xP4,yBB),'L '+_p(lbInR,yLRFlat),'L '+_p(lbInR,yBVert)
  ].join(' ')+' '
  // [14] lock-B left + lock-L plateau
  +['M '+_p(lbInL,yBVert),
    'L '+_p(lbInL,yLRFlat),'L '+_p(xP3,yBB),
    'L '+_p(xP3-lockStep,yBB+lockStep),'L '+_p(xP3-lockStep,yLRFlat),
    'L '+_p(xP2+D*(30.949/57),yLRFlat)
  ].join(' ')+' '
  // [15] lock-L diagonal + lock-A outer
  +['M '+_p(xP2+D*(28.087/57),yBB+D*(24.602/57)),
    'L '+_p(xP2+lockLRDiagX,yBB+lockLRDiagY),
    'L '+_p(xP2,yBB),'L '+_p(xP2-lockStep,yBB+lockStep),
    'L '+_p(xP2-lockStep,yLO),'L '+_p(xP2-lockAOuterX,yLO)
  ].join(' ')+' '
  // [16] lock-A inner plateau
  +['M '+_p(xP2-lockAInnerX,yBVert),
    'L '+_p(xP2-lockAInnerX,yLRFlat),
    'L '+_p(xP1+lockAInnerX,yLRFlat),
    'L '+_p(xP1+lockAInnerX,yBVert)
  ].join(' ');

  // ── bleedPathD (파라메트릭, bleed=3mm 고정) ──────────────────
  var b = 3;
  var bleedPathD = [
    'M '+_p(xP2+D*(25.268/57),yLRFlat-D*(4.796/57)),
    'C '+_p(xP2+D*(24.699/57),yLRFlat-D*(2.980/57))+' '+_p(xP2+D*(25.031/57),yLRFlat-D*(0.981/57))+' '+_p(xP2+D*(26.156/57),yLRFlat+D*(0.550/57)),
    'C '+_p(xP2+D*(27.282/57),yLRFlat+b-D*(0.916/57))+' '+_p(xP3-D*(27.910/57),yLRFlat+b)+' '+_p(xP3-D*(26.007/57),yLRFlat+b),
    'L '+_p(xP3-D*(25.224/57),yLRFlat+b),
    'L '+_p(xP3,yLRFlat+b),
    'L '+_p(xP3,yBB+b+D*(2.509/57)),
    'L '+_p(lbInL-b,yLRFlat+D*(0.888/57)),
    'L '+_p(lbInL-b,yBVert),
    'C '+_p(lbInL-b,yBVert+(lockCornerR+b)*k)+' '+_p(lbInL+lockCornerR-(lockCornerR+b)*k,yLO+b)+' '+_p(lbInL+lockCornerR,yLO+b),
    'L '+_p(lbGapL,yLO+b),
    'L '+_p(lbGapR,yLO+b),
    'L '+_p(lbInR-lockCornerR,yLO+b),
    'C '+_p(lbInR-lockCornerR+(lockCornerR+b)*k,yLO+b)+' '+_p(lbInR+b,yBVert+(lockCornerR+b)*k)+' '+_p(lbInR+b,yBVert),
    'L '+_p(lbInR+b,yLRFlat+D*(0.888/57)),
    'L '+_p(xP4,yBB+b+D*(2.510/57)),
    'L '+_p(xP4,yLRFlat+b),
    'L '+_p(xP4+D*(26.164/57),yLRFlat+b),
    'C '+_p(xEnd-D*(27.427/57),yLRFlat+b)+' '+_p(xEnd-D*(25.612/57),yLRFlat+b-D*(0.924/57))+' '+_p(xEnd-D*(24.486/57),yLRFlat+D*(0.527/57)),
    'C '+_p(xEnd-D*(23.361/57),yLRFlat-D*(1.021/57))+' '+_p(xEnd-D*(23.042/57),yLRFlat-D*(3.033/57))+' '+_p(xEnd-D*(23.633/57),yLRFlat-D*(4.853/57)),
    'C '+_p(xEnd-D*(24.224/57),yLRFlat-D*(6.673/57))+' '+_p(xEnd-D*(24.894/57),yLRFlat-D*(8.737/57))+' '+_p(xEnd-D*(24.894/57),yLRFlat-D*(8.737/57)),
    'L '+_p(xEnd+D*(1.675/57),yBB+b-D*(0.484/57)),
    'L '+_p(xEnd+D*(3.041/57),yBB+b-D*(1.461/57)),
    'L '+_p(xEnd+D*(3.041/57),yLF-D*(1.243/57)),
    'L '+_p(xEnd+D*(0.477/57),yLF-b-D*(0.807/57)),
    'L '+_p(xEnd-D*(0.949/57),yLSFTop-b),
    'L '+_p(sfR_flat_L-b,yLSFTop-b),  // sfR flat left bleed
    'C '+_p(xP4+D*(10.823/57),yLSFTop-b)+' '+_p(xP4+D*(7.645/57),yLSFTop-D*(0.562/57))+' '+_p(xP4+D*(6.710/57),yLSFTop+D*(2.929/57)),
    'L '+_p(xP4+D*(3.355/57),yLF-b-D*(9.553/57)),
    'L '+_p(xP4-D*(0.955/57),yLF-b-D*(5.243/57)),
    'L '+_p(xP4-D*(0.955/57),yLF-b),
    'L '+_p(xNeckR,yLF-b),
    'L '+_p(lbGapR+D*(0.182/57),yLF-b),
    'L '+_p(lbGapR,yLF-D*(0.352/57)),
    'C '+_p(lbGapR-D*(0.295/57),yLF+D*(2.699/57))+' '+_p(lbGapR-D*(2.883/57),yLF+D*(5.000/57))+' '+_p(lbGapR-D*(5.955/57),yLF+D*(5.000/57)),
    'C '+_p(lbGapL+D*(2.973/57),yLF+D*(5.000/57))+' '+_p(lbGapL+D*(0.385/57),yLF+D*(2.699/57))+' '+_p(lbGapL,yLF-D*(0.352/57)),
    'L '+_p(lbGapL,yLF-b+D*(0.102/57)),
    'L '+_p(xNeckL,yLF-b),
    'L '+_p(xP3+D*(1.045/57),yLF-b),
    'L '+_p(xP3+D*(1.045/57),yLF-b-D*(5.243/57)),
    'L '+_p(xP3-D*(3.265/57),yLF-b-D*(9.554/57)),
    'L '+_p(xP3-D*(6.619/57),yLSFTop+D*(2.929/57)),
    'C '+_p(xP3-D*(7.555/57),yLSFTop-D*(0.562/57))+' '+_p(xP3-D*(10.732/57),yLSFTop-b)+' '+_p(xP3-D*(14.346/57),yLSFTop-b),
    'L '+_p(xP2+D*(3.046/57),yLSFTop-b),
    'L '+_p(xP2+D*(3.046/57),yTF),
    'L '+_p(xP2+D*(2.407/57),D*(10.741/57)),
    'C '+_p(xP2+D*(2.003/57),D*(3.035/57))+' '+_p(xP2-D*(6/57),-b)+' '+_p(xTFR,-b),
    'L '+_p(xTFL,-b),
    'C '+_p(xP1+D*(6.001/57),-b)+' '+_p(xP1-D*(1.912/57),D*(3.035/57))+' '+_p(xP1-D*(2.316/57),D*(10.741/57)),
    'L '+_p(xP1-D*(2.955/57),yTF),
    'L '+_p(xP1-b,yTF),
    'L '+_p(xP1-b,yBB),
    'L '+_p(xP1,yBB+b+D*(1.242/57)),
    'L '+_p(xP1,yLO+b),
    'L '+_p(xP1+lockAInnerX-b-D*(0.954/57),yLO+b),
    'C '+_p(xP1+lockAInnerX-D*(0.095/57),yLO+b)+' '+_p(xP1+lockAInnerX+D*(3.045/57),yLO-D*(0.140/57))+' '+_p(xP1+lockAInnerX+D*(3.045/57),yBVert),
    'L '+_p(xP1+lockAInnerX+D*(3.045/57),yLRFlat+b),
    'L '+_p(xP2-lockAInnerX-D*(2.955/57),yLRFlat+b),
    'L '+_p(xP2-lockAInnerX-D*(2.955/57),yBVert),
    'C '+_p(xP2-lockAInnerX-D*(2.955/57),yLO-D*(0.141/57))+' '+_p(xP2-lockAInnerX+D*(0.185/57),yLO+b)+' '+_p(xP2-lockAInnerX+b+D*(1.045/57),yLO+b),
    'L '+_p(xP2,yLO+b),
    'L '+_p(xP2,yBB+b+D*(1.242/57)),
    'L '+_p(xP2+D*(0.490/57),yBB+b+D*(0.798/57)),
    'L '+_p(xP2+D*(26.484/57),yLRFlat-D*(8.672/57)),
    'L '+_p(xP2+D*(25.269/57),yLRFlat-D*(4.797/57)),
  ].join(' ');

  // ── foldLines (파라메트릭) ─────────────────────────────────
  var _fe=D*(0.3/57), _fe2=D*(2.3/57);
  var foldLines = [
    {x1:xEnd-_fe, y1:yBB, x2:xP4+_fe, y2:yBB},
    {x1:xP4-_fe,  y1:yBB, x2:xP3+_fe, y2:yBB},
    {x1:xP3-_fe,  y1:yBB, x2:xP2+_fe, y2:yBB},
    {x1:xP2-_fe,  y1:yBB, x2:xP1+_fe, y2:yBB},
    {x1:xP4, y1:yLF+_fe, x2:xP4, y2:yBB-_fe},
    {x1:xP2, y1:yLF+_fe, x2:xP2, y2:yBB-_fe},
    {x1:xP3, y1:yLF+_fe, x2:xP3, y2:yBB-_fe},
    {x1:xP1, y1:yLF+_fe, x2:xP1, y2:yBB-_fe},
    {x1:xEnd-_fe, y1:yLF, x2:xP4+_fe2, y2:yLF},
    {x1:xP3-_fe2, y1:yLF, x2:xP2+_fe2, y2:yLF},
    {x1:xP2-_fe, y1:yLF-D*(1/57), x2:xP1+_fe, y2:yLF-D*(1/57)},
    {x1:xP2-_fe, y1:yTF,           x2:xP1+_fe, y2:yTF},
  ];


  // ── outerPath: 단일 closed path (fill + stroke용, M001 방식) ──
  var outerPath = [
    'M '+_p(xP1+lockAOuterX,yLO),
    'L '+_p(xP1+lockStep,yLO),'L '+_p(xP1+lockStep,yBB+lockStep),'L '+_p(xP1,yBB),
    'L '+_p(0,yBB-glueSlope),'L '+_p(0,yLF+glueSlope),'L '+_p(xP1,yLF),
    'L '+_p(xP1,yTF),'L '+_p(xP1+D*(0.634/57),tuckStraightTop),
    'C '+_p(tL2x,tL2y)+' '+_p(tL1x,tL1y)+' '+_p(xTFL,0),
    'L '+_p(xTFR,0),
    'C '+_p(tR2x,tR2y)+' '+_p(tR1x,tR1y)+' '+_p(xP2-D*(0.633/57),tuckStraightTop),
    'L '+_p(xP2,yTF),'L '+_p(xP2,y36),
    'C '+_p(xP2,urCP1y)+' '+_p(urCP2x,yLF-D*(0.032/57))+' '+_p(urCP3x,yLF),
    'C '+_p(urCP4x,yLF+D*(0.025/57))+' '+_p(urCP5x,urCP5y)+' '+_p(x35,y35),
    'L '+_p(sfL_flat_R,yLSFTop),'L '+_p(sfL_bez_end,yLSFTop),
    'C '+_p(sL2x,yLSFTop)+' '+_p(sL1x,sL1y)+' '+_p(x28L,y28),
    'L '+_p(x29L,y29),'L '+_p(x30L,y30),'L '+_p(x30L,yLF),'L '+_p(xNeckL,yLF),
    'C '+_p(nL2x,nL2y)+' '+_p(nL1x,nL1y)+' '+_p(xNeckC,yNeckBot),
    'C '+_p(nR2x,nR2y)+' '+_p(nR1x,nR1y)+' '+_p(xNeckR,yLF),
    'L '+_p(x30R,yLF),'L '+_p(x30R,y30),'L '+_p(x29R,y29),'L '+_p(x28R,y28),
    'C '+_p(sR2x,sR2y)+' '+_p(sR1x,yLSFTop)+' '+_p(sfR_flat_L,yLSFTop),
    'L '+_p(sfR_flat_R,yLSFTop),'L '+_p(xEndCorn,yEndCorn),
    'L '+_p(xEnd,yLF),'L '+_p(xEnd,yBB),
    'L '+_p(xP4+D*(27.003/57),yBB+lockLRDiagY),
    'L '+_p(xP4+D*(28.975/57),yBB+D*(24.574/57)),
    'C '+_p(xP4+D*(29.272/57),yBB+D*(25.489/57))+' '+_p(xP4+D*(29.114/57),yBB+D*(26.487/57))+' '+_p(xP4+D*(28.549/57),yBB+D*(27.264/57)),
    'C '+_p(xP4+D*(27.983/57),yBB+D*(28.042/57))+' '+_p(xP4+D*(27.083/57),yLRFlat)+' '+_p(xP4+D*(26.122/57),yLRFlat),
    'L '+_p(xP4+lockStep,yLRFlat),'L '+_p(xP4+lockStep,yBB+lockStep),'L '+_p(xP4,yBB),
    'L '+_p(lbInR,yLRFlat),'L '+_p(lbInR,yBVert),
    'C '+_p(lbInR,yLO-lockCornerR*(1-k))+' '+_p(lbInR-lockCornerR*(1-k),yLO)+' '+_p(lbInR-lockCornerR,yLO),
    'L '+_p(lbGapR,yLO),
    'L '+_p(lbGapL,yLO),
    'L '+_p(lbInL+lockCornerR,yLO),
    'C '+_p(lbInL+lockCornerR*(1-k),yLO)+' '+_p(lbInL,yLO-lockCornerR*(1-k))+' '+_p(lbInL,yBVert),
    'L '+_p(lbInL,yLRFlat),'L '+_p(xP3,yBB),
    'L '+_p(xP3-lockStep,yBB+lockStep),'L '+_p(xP3-lockStep,yLRFlat),
    'L '+_p(xP2+D*(30.949/57),yLRFlat),
    'C '+_p(xP2+lockLRDiagX,yLRFlat)+' '+_p(xP2+D*(29.097/57),yBB+D*(28.047/57))+' '+_p(xP2+D*(28.531/57),yBB+D*(27.276/57)),
    'C '+_p(xP2+D*(27.965/57),yBB+D*(26.506/57))+' '+_p(xP2+D*(27.801/57),yBB+D*(25.515/57))+' '+_p(xP2+D*(28.087/57),yBB+D*(24.602/57)),
    'L '+_p(xP2+lockLRDiagX,yBB+lockLRDiagY),'L '+_p(xP2,yBB),
    'L '+_p(xP2-lockStep,yBB+lockStep),'L '+_p(xP2-lockStep,yLO),'L '+_p(xP2-lockAOuterX,yLO),
    'C '+_p(xP2-lockAOuterX-lockCornerR*k,yLO)+' '+_p(xP2-lockAInnerX,yBVert+lockCornerR*k)+' '+_p(xP2-lockAInnerX,yBVert),
    'L '+_p(xP2-lockAInnerX,yLRFlat),'L '+_p(xP1+lockAInnerX,yLRFlat),'L '+_p(xP1+lockAInnerX,yBVert),
    'C '+_p(xP1+lockAInnerX,yLO-lockCornerR*(1-k))+' '+_p(xP1+lockAOuterX+lockCornerR*k,yLO)+' '+_p(xP1+lockAOuterX,yLO),
    'Z'
  ].join(' ');

  // ── gluePathD ─────────────────────────────────────────────
  var yGD = D*(6.699/57);
  function P(x,y){var fx=+(+x).toFixed(4),fy=+(+y).toFixed(4);return fx+','+fy;}
  var gluePathD = ['M '+P(xP1,yLF),'L '+P(0,yLF+yGD),'L '+P(0,yBB-yGD),'L '+P(xP1,yBB),'Z'].join(' ');

  // ── bounds ────────────────────────────────────────────────
  var bounds = {
    minX: -D*(3/57), minY: -D*(3/57),
    maxX: xEnd+D*(3/57), maxY: yLO+D*(3/57),
    width: xEnd+D*(6/57), height: yLO+D*(6/57),
  };

  // ── labels ────────────────────────────────────────────────
  var labels = [
    { name:'Upper-Tuck',    cx:(xP1+xP2)/2,  cy:yTF/2              },
    { name:'lidTop',        cx:(xP1+xP2)/2,  cy:(yTF+yLF)/2        },
    { name:'Glue',          cx:xP1*0.4,      cy:(yLF+yBB)/2        },
    { name:'lidSideFlap(L)',cx:(xP2+xP3)/2,  cy:(yLSFTop+yLF)/2    },
    { name:'Neck',          cx:xNeckC,       cy:yLF-D*(5/57)       },
    { name:'thumb notch',   cx:xNeckC,       cy:yLF+D*(10/57)      },
    { name:'lidSideFlap(R)',cx:(xP3+xP4)/2,  cy:(yLSFTop+yLF)/2    },
    { name:'bottomLock-A',  cx:(xP1+xP2)/2,  cy:(yBB+yLO)/2        },
    { name:'bottomLock(L)', cx:(xP2+xP3)/2,  cy:(yBB+yLO)/2        },
    { name:'bottomLock-B',  cx:(xP3+xP4)/2,  cy:(yBB+yLO)/2        },
    { name:'bottomLock(R)', cx:(xP4+xEnd)/2, cy:(yBB+yLO)/2        },
  ];

  return {
    cutPathD, bleedPathD, outerPath, gluePathD,
    foldLines, labels, bounds,
    spec:{ W,D,H, xP1,xP2,xP3,xP4,xEnd, yTF,yLF,yBB,yLO }
  };
}
