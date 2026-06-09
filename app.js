// ============================================================
// app.js — PacVu Engine Lab
// UI 바인딩 + State + Render loop
// Engine dispatch: gbox -> M001, bbox -> T001, bbox_v2 -> T001 v2, rbox -> R001
// ============================================================

// ============================================================
// STATE
// ============================================================
const state = {
  showSlots:  true,
  showHoles:  true,
  showFolds:  true,
  showLabels: true,
  showDims:   true,
  zoom: 1, panX: 0, panY: 0,
  isDragging: false, dragStartX: 0, dragStartY: 0,
  startPanX: 0, startPanY: 0,
  currentSVGString: '', fitInitialized: false,
  baseVB: null
};

let selectedBoxMeta = {
  categoryKey: 'mailer',
  engineKey:   'gbox',
  variantKey:  'default'
};

let BOX_LIBRARY = [];

// ============================================================
// INPUT / CONFIG
// ============================================================
function val(id, fb = 0) {
  const el = document.getElementById(id);
  if (!el) return fb;
  const n = parseFloat(el.value);
  return Number.isFinite(n) ? n : fb;
}

// M001 (G-Type) config
function getCfg() {
  const D = val('baseD', 229);
  const H = val('panelH', 91);
  return {
    W: val('baseW', 235), D, H,
    LH: D,
    FG: val('foldGap', 5),
    BLW: H,
    BIH: val('backInsertH', 80),
    FIH: val('frontInsertH', 80),
    CR:  val('chamfer', 8),
    ni:  val('lockNeckInset', 10),
    td:  val('lockTabDepth', 12),
    th:  val('lockTabHeight', 18),
    SK:  val('insertSkew', 8),
    holeDia:     val('holeDia', 6),
    holeGap:     val('holeGap', 70),
    holeOffsetY: val('holeOffsetY', 45)
  };
}

// T001 (B-Type) config
function getCfgT001() {
  return {
    W: val('baseW', 57),
    D: val('baseD', 57),
    H: val('panelH', 177)
  };
}

// R001 (A-Type RSC) config
function getCfgR001() {
  return {
    W: val('baseW', 285),
    D: val('baseD', 170),
    H: val('panelH', 120)
  };
}

// ============================================================
// DIMENSION VALIDATE (M001용)
// ============================================================
function validateDimensions(W, D, H) {
  const minBase = Math.min(W, D);
  const ratio   = H / minBase;

  let warningBox = document.getElementById('dimensionWarning');
  const hInput   = document.getElementById('panelH');

  if (!warningBox) {
    warningBox = document.createElement('div');
    warningBox.id = 'dimensionWarning';
    Object.assign(warningBox.style, {
      marginTop: '8px', padding: '6px 4px', background: 'transparent',
      border: 'none', fontSize: '11px', lineHeight: '1.5',
      fontWeight: '400', width: '100%', display: 'block', whiteSpace: 'nowrap'
    });
    const section =
      hInput?.closest('.option-card') || hInput?.closest('.setting-card') ||
      hInput?.closest('.control-card') || hInput?.closest('.panel-card') ||
      hInput?.closest('.panel-section') || hInput?.parentElement;
    section?.appendChild(warningBox);
  }

  if (ratio > 0.8) {
    warningBox.style.display = 'block';
    warningBox.style.color   = '#d93025';
    warningBox.textContent   = '⚠️비율 초과: H를 낮추거나 W/D를 높혀주세요.';
    if (hInput) hInput.style.border = '1px solid #d93025';
    return false;
  }
  if (ratio > 0.65) {
    warningBox.style.display = 'block';
    warningBox.style.color   = '#e37400';
    warningBox.textContent   = '주의: 비율이 높아 형태가 변형될 수 있습니다.';
    if (hInput) hInput.style.border = '1px solid #e37400';
    return true;
  }
  warningBox.style.display = 'none';
  warningBox.textContent   = '';
  if (hInput) hInput.style.border = '1px solid #ddd';
  return true;
}

// ============================================================
// RENDER LOOP
// ============================================================
let renderTimer = null;

function render(forceFit = false) {
  let svgStr = '';
  const eng = selectedBoxMeta.engineKey;

  if (eng === 'gbox') {
    const cfg = getCfg();
    validateDimensions(cfg.W, cfg.D, cfg.H);
    svgStr = M001_renderSVG(cfg, state);

  } else if (eng === 'bbox') {
    const c = getCfgT001();
    svgStr = T001_renderSVG(c, state);

  } else if (eng === 'bbox_v2') {
    const c = getCfgT001();
    svgStr = T001_v2_renderSVG(c, state);

  } else if (eng === 'rbox') {
    // ── R001 A-Type RSC ──────────────────────────────────────
    const c = getCfgR001();
    svgStr = R001_renderSVG(c, state);

  } else {
    // 준비 중
    svgStr = `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 200" width="400mm" height="200mm">
      <rect width="400" height="200" fill="#d0d0d0"/>
      <text x="200" y="100" text-anchor="middle" font-size="16" fill="#999"
            font-family="Arial,sans-serif">준비 중</text>
    </svg>`;
  }

  state.currentSVGString = svgStr;
  const host = document.getElementById('svgHost');
  if (!host) return;

  host.innerHTML = svgStr;
  state.baseVB = null;

  if (forceFit || !state.fitInitialized) {
    state.panX = 0; state.panY = 0;
    fitToScreen();
    state.fitInitialized = true;
  } else {
    applyTransform();
  }
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => render(true), 180);
}

// ============================================================
// VIEWPORT / PAN / ZOOM
// ============================================================
function applyTransform() {
  const sv = document.getElementById('mainSvg');
  if (!sv || !state.baseVB) return;
  const b  = state.baseVB;
  const nw = b.w / state.zoom, nh = b.h / state.zoom;
  const nx = b.cx - nw / 2 - state.panX;
  const ny = b.cy - nh / 2 - state.panY;
  sv.setAttribute('viewBox', `${nx} ${ny} ${nw} ${nh}`);
  const g = document.getElementById('mainGroup') ||
            document.getElementById('viewportGroup') ||
            document.querySelector('#mainSvg g');
  if (g) g.removeAttribute('transform');
  const sb = document.getElementById('statusBox');
  if (sb) sb.textContent = `Zoom ${Math.round(state.zoom * 100)}%`;
}

function fitToScreen() {
  requestAnimationFrame(() => {
    const sv   = document.getElementById('mainSvg');
    const host = document.getElementById('svgHost');
    if (!sv || !host) return;
    sv.setAttribute('width', '100%');
    sv.setAttribute('height', '100%');
    const hr = host.getBoundingClientRect();
    if (!hr.width || !hr.height) return;

    // bounds 계산 — engine별
    let bounds;
    const eng = selectedBoxMeta.engineKey;
    if (eng === 'gbox') {
      const c  = getCfg();
      const g2 = M001_getGrid(c);
      bounds = getBounds(
        buildOuterPath(c, g2), buildFoldLines(c, g2),
        buildSlots(c, g2), buildHoles(c, g2)
      );
    } else if (eng === 'bbox') {
      const c = getCfgT001();
      const layout = T001_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'bbox_v2') {
      const c = getCfgT001();
      const layout = T001_v2_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'rbox') {
      // ── R001 bounds ─────────────────────────────────────────
      const c = getCfgR001();
      const layout = R001_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else {
      bounds = { minX:0, minY:0, width:400, height:200 };
    }

    const pad   = 40;
    const scaleX = (hr.width  - pad*2) / bounds.width;
    const scaleY = (hr.height - pad*2) / bounds.height;
    const scale  = Math.min(scaleX, scaleY);
    const vbW    = hr.width  / scale;
    const vbH    = hr.height / scale;
    const contentCX = bounds.minX + bounds.width  / 2;
    const contentCY = bounds.minY + bounds.height / 2;
    const vbX    = contentCX - vbW / 2;
    const vbY    = contentCY - vbH / 2;
    sv.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    state.baseVB = { x:vbX, y:vbY, w:vbW, h:vbH, cx:contentCX, cy:contentCY };
    state.zoom = 1; state.panX = 0; state.panY = 0;
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
    if (i >= 0) return ZOOM_STEPS[Math.min(i+1, ZOOM_STEPS.length-1)];
    return ZOOM_STEPS.find(z => z > current) ?? ZOOM_STEPS[ZOOM_STEPS.length-1];
  } else {
    if (i >= 0) return ZOOM_STEPS[Math.max(i-1, 0)];
    return [...ZOOM_STEPS].reverse().find(z => z < current) ?? ZOOM_STEPS[0];
  }
}
function zoomAt(nextZoom) {
  state.zoom = Math.max(0.5, Math.min(2.0, nextZoom));
  applyTransform();
}

// ============================================================
// EXPORT SVG / DXF
// ============================================================
function buildExportSVG(cfg, eng) {
  if (eng === 'gbox') return M001_buildExportSVG ? M001_buildExportSVG(cfg) : '';
  if (eng === 'bbox') return T001_buildExportSVG ? T001_buildExportSVG(cfg) : '';
  if (eng === 'bbox_v2') return typeof T001_v2_buildExportSVG === 'function' ? T001_v2_buildExportSVG(cfg) : '';
  if (eng === 'rbox') return R001_buildExportSVG ? R001_buildExportSVG(cfg) : '';
  return '';
}

function buildDXF(cfg, eng) {
  if (eng === 'gbox') return typeof buildDXF_M001 === 'function' ? buildDXF_M001(cfg) : '';
  if (eng === 'bbox') return T001_buildDXF ? T001_buildDXF(cfg) : '';
  if (eng === 'bbox_v2') return typeof T001_v2_buildDXF === 'function' ? T001_v2_buildDXF(cfg) : '';
  if (eng === 'rbox') return R001_buildDXF ? R001_buildDXF(cfg) : '';
  return '';
}

// ============================================================
// BOX LIBRARY SELECT
// ============================================================
function initBoxLibrarySelect() {
  const categoryEl = document.getElementById('boxCategory');
  const typeEl     = document.getElementById('boxType');
  if (!categoryEl || !typeEl) return;

  categoryEl.innerHTML = '';
  BOX_LIBRARY.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.categoryKey;
    opt.textContent = cat.categoryLabel;
    categoryEl.appendChild(opt);
  });

  const fillTypeSelect = () => {
    const cat = BOX_LIBRARY.find(c => c.categoryKey === categoryEl.value) || BOX_LIBRARY[0];
    typeEl.innerHTML = '';
    if (!cat.items.length) {
      const empty = document.createElement('option');
      empty.value = ''; empty.textContent = '준비 중';
      typeEl.appendChild(empty);
      selectedBoxMeta = { categoryKey: cat.categoryKey, engineKey: '', variantKey: '' };
      return;
    }
    cat.items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = `${item.engineKey}:${item.variantKey}`;
      opt.textContent = item.label;
      opt.dataset.engine     = item.engineKey;
      opt.dataset.variant    = item.variantKey;
      opt.dataset.fefco      = item.fefcoCode;
      opt.dataset.koreanName = item.koreanName;
      opt.dataset.defaultW   = item.defaultDims?.W ?? 235;
      opt.dataset.defaultD   = item.defaultDims?.D ?? 229;
      opt.dataset.defaultH   = item.defaultDims?.H ?? 91;
      typeEl.appendChild(opt);
    });
    _applySelectedBox(cat.items[0], typeEl.options[0]);
  };

  categoryEl.addEventListener('change', () => { fillTypeSelect(); scheduleRender(); });
  typeEl.addEventListener('change', () => {
    const opt = typeEl.selectedOptions[0];
    const item = BOX_LIBRARY
      .find(c => c.categoryKey === categoryEl.value)?.items
      .find(i => `${i.engineKey}:${i.variantKey}` === opt?.value);
    if (item) _applySelectedBox(item, opt);
    scheduleRender();
  });

  // 초기값: mailer 카테고리
  categoryEl.value = 'mailer';
  fillTypeSelect();
}

function _applySelectedBox(item, opt) {
  selectedBoxMeta = {
    categoryKey: '',
    engineKey:   item.engineKey,
    variantKey:  item.variantKey,
    fefcoCode:   item.fefcoCode,
    koreanName:  item.koreanName
  };
  if (item.defaultDims) {
    const dW = document.getElementById('baseW');
    const dD = document.getElementById('baseD');
    const dH = document.getElementById('panelH');
    if (dW) dW.value = item.defaultDims.W;
    if (dD) dD.value = item.defaultDims.D;
    if (dH) dH.value = item.defaultDims.H;
  }
}

// ============================================================
// UI BINDINGS
// ============================================================
function bindAll() {
  fetch('./data/boxLibrary.json')
    .then(r => r.json())
    .then(data => {
      BOX_LIBRARY = data;
      initBoxLibrarySelect();
      render(true);
    })
    .catch(() => {
      BOX_LIBRARY = _fallbackLibrary();
      initBoxLibrarySelect();
      render(true);
    });

  document.querySelectorAll('input[type=number]').forEach(
    el => el.addEventListener('change', scheduleRender)
  );

  const get = id => document.getElementById(id);

  get('showDims')?.addEventListener('change',   e => { state.showDims   = e.target.checked; render(true); });
  get('showHoles')?.addEventListener('change',  e => { state.showHoles  = e.target.checked; render(true); });
  get('showFolds')?.addEventListener('change',  e => { state.showFolds  = e.target.checked; render(true); });
  get('showLabels')?.addEventListener('change', e => { state.showLabels = e.target.checked; render(true); });

  get('fitBtn')?.addEventListener('click',     () => fitToScreen());
  get('zoomInBtn')?.addEventListener('click',  () => zoomAt(snapZoom(state.zoom, +1)));
  get('zoomOutBtn')?.addEventListener('click', () => zoomAt(snapZoom(state.zoom, -1)));

  get('downloadSvgBtn')?.addEventListener('click', () => {
    const eng = selectedBoxMeta.engineKey;
    const cfg = eng === 'bbox' || eng === 'bbox_v2' ? getCfgT001()
              : eng === 'rbox' ? getCfgR001()
              : getCfg();
    const dim  = `${cfg.W}x${cfg.D}x${cfg.H}`;
    const name = `PacVu_${eng}_${dim}mm.svg`;
    downloadFile(name, buildExportSVG(cfg, eng), 'image/svg+xml');
  });

  get('downloadDxfBtn')?.addEventListener('click', () => {
    const eng = selectedBoxMeta.engineKey;
    const cfg = eng === 'bbox' || eng === 'bbox_v2' ? getCfgT001()
              : eng === 'rbox' ? getCfgR001()
              : getCfg();
    const dim  = `${cfg.W}x${cfg.D}x${cfg.H}`;
    const name = `PacVu_${eng}_${dim}mm.dxf`;
    downloadFile(name, buildDXF(cfg, eng), 'application/dxf');
  });

  const sidebar = get('sidebar');
  get('toggleSidebarBtn')?.addEventListener('click', () => sidebar?.classList.add('collapsed'));
  get('showSidebarBtn')?.addEventListener('click',   () => sidebar?.classList.toggle('collapsed'));

  const host = get('svgHost');
  if (!host) return;

  host.addEventListener('mousedown', e => {
    state.isDragging = true;
    state.dragStartX = e.clientX; state.dragStartY = e.clientY;
    state.startPanX  = state.panX; state.startPanY = state.panY;
    host.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!state.isDragging) return;
    const sv = get('mainSvg'); if (!sv) return;
    const sr = sv.getBoundingClientRect(), vb = sv.viewBox.baseVal;
    const ppm = sr.width / vb.width;
    state.panX = state.startPanX + (e.clientX - state.dragStartX) / ppm;
    state.panY = state.startPanY + (e.clientY - state.dragStartY) / ppm;
    applyTransform();
  });
  window.addEventListener('mouseup', () => { state.isDragging = false; host.classList.remove('dragging'); });
  host.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(state.zoom * Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });
  host.addEventListener('dblclick', () => fitToScreen());
  window.addEventListener('resize',  () => fitToScreen());
}

function _fallbackLibrary() {
  return [
    { categoryKey:'mailer', categoryLabel:'04 Mailer box', items:[
      { label:'G-Type Standard', koreanName:'G형 기본형', fefcoCode:'0427',
        engineKey:'gbox', variantKey:'default', defaultDims:{W:235,D:229,H:91} }
    ]},
    { categoryKey:'tuck', categoryLabel:'03 Tuck box', items:[
      { label:'B형 타입 / 기본 칼라박스', koreanName:'B형 타입', fefcoCode:'0471',
        engineKey:'bbox', variantKey:'default', defaultDims:{W:57,D:57,H:177} }
    ]}
  ];
}

// ============================================================
// INIT
// ============================================================
bindAll();
if (window.innerWidth < 768) fitToScreen();
