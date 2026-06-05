// ============================================================
// dxfExport.js — DXF export
// buildDXF(cfg, engineKey) → DXF string
// ============================================================

function _buildM001DXF(cfg) {
  const g  = M001_getGrid(cfg);
  const fl = buildFoldLines(cfg, g);
  const sl = buildSlots(cfg, g);
  const ho = buildHoles(cfg, g);

  const arr = ['0', 'SECTION', '2', 'ENTITIES'];
  const al = (x1, y1, x2, y2, layer) =>
    arr.push('0','LINE','8',layer,'10',x1,'20',-y1,'30','0','11',x2,'21',-y2,'31','0');
  const ac = (cx, cy, r, layer) =>
    arr.push('0','CIRCLE','8',layer,'10',cx,'20',-cy,'30','0','40',r);

  fl.forEach(l => al(l.x1, l.y1, l.x2, l.y2, 'FOLD'));
  sl.forEach(s => {
    al(s.x,       s.y,       s.x+s.w, s.y,       'SLOT');
    al(s.x+s.w,   s.y,       s.x+s.w, s.y+s.h,   'SLOT');
    al(s.x+s.w,   s.y+s.h,   s.x,     s.y+s.h,   'SLOT');
    al(s.x,       s.y+s.h,   s.x,     s.y,        'SLOT');
  });
  ho.forEach(h => ac(h.cx, h.cy, h.r, 'HOLE'));
  arr.push('0','ENDSEC','0','EOF');
  return arr.join('\n');
}

function _buildT001DXF(cfg) {
  return T001_buildDXF(cfg);
}

function buildDXF(cfg, engineKey) {
  if (engineKey === 'gbox') return _buildM001DXF(cfg);
  if (engineKey === 'bbox') return _buildT001DXF(cfg);
  return '';
}
