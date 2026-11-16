/* ============================================================
   أدوات الواجهة: أيقونات، رسوم بيانية، نوافذ، نماذج، تصدير
   ============================================================ */
window.KAK = window.KAK || {};
(function (K) {
  'use strict';
  var UI = {};

  /* ---------------- أيقونات ---------------- */
  var P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><polyline points="9 13 11 15 15 11"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    up: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    down: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    arrow: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    checkc: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    bars: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'
  };

  UI.icon = function (name, cls) {
    var body = P[name] || P.info;
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  };

  /* مسار الأصول (يعمل من الجذر ومن مجلد الاختبارات) */
  UI.base = (function () {
    try {
      var s = document.querySelector('script[src*="assets/js/ui.js"]');
      if (s && s.src) return s.src.replace(/assets\/js\/ui\.js.*$/, '');
    } catch (e) { }
    return '';
  })();
  UI.asset = function (p) { return UI.base + 'assets/' + p; };
  UI.logo = function (size) {
    var s = size || 44;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
      '<rect x="1" y="1" width="46" height="46" rx="14" fill="url(#kg)"/>' +
      '<defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#16926c"/><stop offset="1" stop-color="#0a5138"/></linearGradient></defs>' +
      '<path d="M24 34V13" stroke="#f0d489" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M24 19c-4.4 0-7-2.4-7-6 4.6 0 7 2.6 7 6z" fill="#e6c05f"/>' +
      '<path d="M24 19c4.4 0 7-2.4 7-6-4.6 0-7 2.6-7 6z" fill="#f5dc9a"/>' +
      '<path d="M24 26c-4.4 0-7-2.4-7-6 4.6 0 7 2.6 7 6z" fill="#e6c05f"/>' +
      '<path d="M24 26c4.4 0 7-2.4 7-6-4.6 0-7 2.6-7 6z" fill="#f5dc9a"/>' +
      '<path d="M17.5 33h13" stroke="#f0d489" stroke-width="2.2" stroke-linecap="round"/>' +
      '</svg>';
  };

  /* ---------------- أدوات نصية ---------------- */
  UI.esc = function (s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  UI.n = function (v, d) {
    if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
    var n = Number(v);
    var out = d === undefined ? (Number.isInteger(n) ? String(n) : n.toFixed(1)) : n.toFixed(d);
    return out.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  UI.pct = function (v, d) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return '<span class="ltr">' + UI.n(v, d === undefined ? 1 : d) + '%</span>';
  };
  /* عزل الأرقام والوحدات اللاتينية داخل نص عربي (يمنع انقلاب % و /) */
  UI.ltr = function (s) { return '<span class="ltr">' + s + '</span>'; };
  /* صياغة عربية سليمة لمدة المهلة بالأيام */
  UI.slaText = function (n) {
    if (n === 1) return 'يوم عمل واحد';
    if (n === 2) return 'يومان';
    if (n >= 3 && n <= 10) return n + ' أيام عمل';
    return n + ' يوم عمل';
  };
  UI.monthLabel = K.U.monthName;
  UI.date = function (iso, opts) { return K.U.fmtDate(iso, !(opts && opts.noYear)); };

  UI.badge = function (label, tone, dot) {
    return '<span class="badge ' + (tone || 'b-gray') + '">' + (dot ? '<span class="dot"></span>' : '') + UI.esc(label) + '</span>';
  };
  UI.statusBadge = function (map, key) {
    var s = map[key] || { label: key, tone: 'b-gray' };
    return UI.badge(s.label, s.tone, true);
  };
  UI.scoreBadge = function (total) {
    var c = K.M.rating(total);
    return UI.badge(c.label, c.tone);
  };
  UI.severityBadge = function (key) {
    var s = K.C.SEVERITY.filter(function (x) { return x.key === key; })[0];
    return s ? UI.badge(s.label, s.tone, true) : '';
  };

  /* ---------------- الرسوم البيانية ---------------- */
  var PALETTE = ['#1f286d', '#4655b8', '#e0a52f', '#b54708', '#b42318', '#175cd3', '#6941c6', '#0e7090'];

  var Charts = {};

  Charts.columns = function (o) {
    var values = o.values || [];
    var max = o.max || Math.max.apply(null, values.concat([1]));
    var html = '<div class="bars" style="--chart-h:' + (o.height || 190) + 'px">';
    values.forEach(function (v, i) {
      var h = v === null || v === undefined ? 0 : Math.max(2, Math.round(v / max * 100));
      html += '<div class="bar-col">' +
        '<div class="track"><div class="bar ' + (o.gold && o.gold.indexOf(i) > -1 ? 'gold' : '') + '" style="height:' + h + '%">' +
        '<span class="val">' + (v === null ? '—' : UI.n(v, o.dec || 0)) + '</span></div></div>' +
        '<div class="lbl">' + UI.esc((o.labels || [])[i] || '') + '</div></div>';
    });
    return html + '</div>' + (o.legend ? '<div class="chart-legend">' + o.legend + '</div>' : '');
  };

  Charts.hbars = function (items, o) {
    o = o || {};
    var max = o.max || Math.max.apply(null, items.map(function (x) { return x.value || 0; }).concat([1]));
    var html = '<div class="hbars">';
    items.forEach(function (it) {
      var w = Math.max(2, Math.round((it.value || 0) / max * 100));
      var cls = it.tone === 'warn' ? 'warn' : (it.tone === 'bad' ? 'bad' : '');
      html += '<div class="hbar ' + cls + '"><div class="lbl" title="' + UI.esc(it.label) + '">' + UI.esc(it.label) + '</div>' +
        '<div class="track"><span style="width:' + w + '%"></span></div>' +
        '<div class="val">' + (it.display || UI.n(it.value, o.dec || 0)) + '</div></div>';
    });
    return html + '</div>';
  };

  Charts.donut = function (items, o) {
    o = o || {};
    var total = items.reduce(function (s, x) { return s + (x.value || 0); }, 0);
    var size = o.size || 132, sw = o.stroke || 15;
    var r = (size - sw) / 2, c = 2 * Math.PI * r;
    var html = '<div class="donut-wrap"><div class="donut" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#eef3f0" stroke-width="' + sw + '"/>';
    var acc = 0;
    items.forEach(function (it, i) {
      if (!it.value) return;
      var len = it.value / total * c;
      var col = it.color || PALETTE[i % PALETTE.length];
      html += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" ' +
        'stroke-dasharray="' + len + ' ' + (c - len) + '" stroke-dashoffset="' + (-acc) + '" stroke-linecap="butt"/>';
      acc += len;
    });
    html += '</svg><div class="center"><div><b>' + UI.n(o.centerValue !== undefined ? o.centerValue : total) + '</b><small>' + UI.esc(o.centerLabel || 'الإجمالي') + '</small></div></div></div>';
    html += '<div class="legend-list">';
    items.forEach(function (it, i) {
      html += '<div class="legend-row"><i style="background:' + (it.color || PALETTE[i % PALETTE.length]) + '"></i>' +
        '<span class="n">' + UI.esc(it.label) + '</span><span class="v">' + UI.n(it.value) +
        (total ? ' <span class="tiny muted">(' + UI.pct(it.value / total * 100, 0) + ')</span>' : '') + '</span></div>';
    });
    return html + '</div></div>';
  };

  Charts.line = function (o) {
    var w = 620, h = o.height || 210, pad = { t: 16, r: 14, b: 26, l: 34 };
    var series = o.series || [];
    var labels = o.labels || [];
    var all = [];
    series.forEach(function (s) { s.data.forEach(function (v) { if (v !== null && v !== undefined) all.push(v); }); });
    if (o.target !== undefined && o.target !== null) all.push(o.target);
    if (!all.length) all = [0, 1];
    var min = o.min !== undefined ? o.min : Math.min.apply(null, all);
    var max = o.max !== undefined ? o.max : Math.max.apply(null, all);
    if (max === min) { max = min + 1; }
    if (o.min === undefined) min = Math.max(0, min - (max - min) * .12);
    if (o.max === undefined) max = max + (max - min) * .12;
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    function X(i) { return pad.l + (labels.length <= 1 ? iw / 2 : i * iw / (labels.length - 1)); }
    function Y(v) { return pad.t + ih - ((v - min) / (max - min)) * ih; }
    var g = '';
    for (var i = 0; i <= 4; i++) {
      var val = min + (max - min) * i / 4, y = Y(val);
      g += '<line class="grid-l" x1="' + pad.l + '" y1="' + y.toFixed(1) + '" x2="' + (w - pad.r) + '" y2="' + y.toFixed(1) + '"/>' +
        '<text x="' + (pad.l - 6) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end">' + UI.n(val, o.dec || 0) + '</text>';
    }
    labels.forEach(function (l, i) {
      g += '<text x="' + X(i).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + UI.esc(l) + '</text>';
    });
    if (o.target !== undefined && o.target !== null) {
      g += '<line class="target-l" x1="' + pad.l + '" y1="' + Y(o.target).toFixed(1) + '" x2="' + (w - pad.r) + '" y2="' + Y(o.target).toFixed(1) + '"/>' +
        '<text x="' + (w - pad.r) + '" y="' + (Y(o.target) - 5).toFixed(1) + '" text-anchor="end" fill="#a8801f">الهدف ' + UI.n(o.target) + '</text>';
    }
    series.forEach(function (s, si) {
      var col = s.color || PALETTE[si % PALETTE.length];
      var pts = [], area = [];
      s.data.forEach(function (v, i) {
        if (v === null || v === undefined) return;
        pts.push(X(i).toFixed(1) + ',' + Y(v).toFixed(1));
      });
      if (!pts.length) return;
      if (s.area !== false && series.length === 1) {
        area.push(pad.l + ',' + (pad.t + ih));
        area = area.concat(pts);
        area.push(X(labels.length - 1) + ',' + (pad.t + ih));
        g += '<polygon points="' + area.join(' ') + '" fill="' + col + '" opacity=".08"/>';
      }
      g += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + col + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
      s.data.forEach(function (v, i) {
        if (v === null || v === undefined) return;
        g += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.4" fill="#fff" stroke="' + col + '" stroke-width="2"/>';
      });
    });
    return '<svg class="line-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + g + '</svg>' +
      (series.length > 1 ? '<div class="chart-legend">' + series.map(function (s, i) {
        return '<span><i style="background:' + (s.color || PALETTE[i % PALETTE.length]) + '"></i>' + UI.esc(s.name || '') + '</span>';
      }).join('') + '</div>' : '');
  };

  Charts.spark = function (values, color) {
    var vals = values.filter(function (v) { return v !== null && v !== undefined; });
    if (vals.length < 2) return '';
    var w = 120, h = 32, min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (max === min) max = min + 1;
    var pts = vals.map(function (v, i) {
      return (i * w / (vals.length - 1)).toFixed(1) + ',' + (h - 3 - ((v - min) / (max - min)) * (h - 8)).toFixed(1);
    }).join(' ');
    return '<svg class="sparkline" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><polyline points="' + pts + '" fill="none" stroke="' + (color || '#4655b8') + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  };

  UI.charts = Charts;
  UI.palette = PALETTE;
  UI.clamp = K.U.clamp;

  /* ---------------- النوافذ ---------------- */
  var modalStack = [];
  UI.modal = function (o) {
    var root = document.getElementById('modalRoot');
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<div class="modal-panel ' + (o.size || '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div><h3>' + UI.esc(o.title || '') + '</h3>' + (o.sub ? '<div class="sub">' + UI.esc(o.sub) + '</div>' : '') + '</div>' +
      '<button class="close" type="button" aria-label="إغلاق">' + UI.icon('x') + '</button></div>' +
      '<div class="modal-body">' + (o.body || '') + '</div>' +
      (o.footer === false ? '' : '<div class="modal-foot">' + (o.footer || '<button class="btn btn-outline" data-close>إغلاق</button>') + '</div>') +
      '</div>';
    root.appendChild(wrap);
    modalStack.push(wrap);
    var close = function () {
      wrap.remove();
      modalStack = modalStack.filter(function (x) { return x !== wrap; });
      document.body.style.overflow = modalStack.length ? 'hidden' : '';
      if (o.onClose) o.onClose();
    };
    wrap.querySelector('.close').addEventListener('click', close);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap && o.dismissible !== false) close(); });
    wrap.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    document.body.style.overflow = 'hidden';
    if (o.onMount) o.onMount(wrap, close);
    return { el: wrap, close: close, body: wrap.querySelector('.modal-body') };
  };

  UI.confirm = function (o) {
    var m = UI.modal({
      title: o.title || 'تأكيد الإجراء',
      size: 'narrow',
      body: '<div class="note-box ' + (o.tone === 'red' ? 'red' : '') + '">' + UI.esc(o.message || '') + '</div>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn ' + (o.tone === 'red' ? 'btn-danger' : 'btn-primary') + '" id="cfmOk">' + UI.esc(o.ok || 'تأكيد') + '</button>',
      onMount: function (wrap, close) {
        wrap.querySelector('#cfmOk').addEventListener('click', function () { close(); if (o.onOk) o.onOk(); });
      }
    });
    return m;
  };

  UI.confirmDelete = function (message, onOk) {
    return UI.confirm({ title: 'تأكيد الحذف', message: message, ok: 'نعم، احذف', tone: 'red', onOk: onOk });
  };

  /* ---------------- تنبيهات ---------------- */
  UI.toast = function (msg, type) {
    var root = document.getElementById('toastRoot');
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'err' ? ' err' : '');
    t.innerHTML = UI.icon(type === 'err' ? 'alert' : 'checkc') + '<span>' + UI.esc(msg) + '</span>';
    root.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s, transform .25s';
      t.style.opacity = '0'; t.style.transform = 'translateY(8px)';
      setTimeout(function () { t.remove(); }, 260);
    }, 3200);
  };

  /* ---------------- نماذج ---------------- */
  UI.field = function (label, inputHtml, opts) {
    opts = opts || {};
    return '<div class="field ' + (opts.span ? 'span-2' : '') + '">' +
      '<label>' + UI.esc(label) + (opts.req ? ' <span class="req">*</span>' : '') + '</label>' + inputHtml +
      (opts.hint ? '<div class="hint">' + UI.esc(opts.hint) + '</div>' : '') + '</div>';
  };
  UI.input = function (name, value, opts) {
    opts = opts || {};
    return '<input type="' + (opts.type || 'text') + '" name="' + name + '" id="f_' + name + '" value="' + UI.esc(value === undefined || value === null ? '' : value) + '"' +
      (opts.placeholder ? ' placeholder="' + UI.esc(opts.placeholder) + '"' : '') +
      (opts.min !== undefined ? ' min="' + opts.min + '"' : '') + (opts.max !== undefined ? ' max="' + opts.max + '"' : '') +
      (opts.step !== undefined ? ' step="' + opts.step + '"' : '') + (opts.req ? ' required' : '') +
      (opts.attrs || '') + '>';
  };
  UI.textarea = function (name, value, opts) {
    opts = opts || {};
    return '<textarea name="' + name + '" id="f_' + name + '" rows="' + (opts.rows || 3) + '" placeholder="' + UI.esc(opts.placeholder || '') + '">' + UI.esc(value || '') + '</textarea>';
  };
  UI.select = function (name, options, selected, opts) {
    opts = opts || {};
    var html = '<select name="' + name + '" id="f_' + name + '"' + (opts.req ? ' required' : '') + '>';
    if (opts.placeholder) html += '<option value="">' + UI.esc(opts.placeholder) + '</option>';
    options.forEach(function (o) {
      var v = typeof o === 'string' ? o : o.value;
      var l = typeof o === 'string' ? o : o.label;
      html += '<option value="' + UI.esc(v) + '"' + (String(v) === String(selected) ? ' selected' : '') + '>' + UI.esc(l) + '</option>';
    });
    return html + '</select>';
  };
  UI.branchOptions = function (includeAll, excludeHQ) {
    var list = K.Store.data.branches.filter(function (b) { return !excludeHQ || b.type !== 'إدارة عامة'; })
      .map(function (b) { return { value: b.id, label: b.name }; });
    if (includeAll) return [{ value: '', label: 'كل الفروع' }].concat(list);
    return list;
  };
  UI.deptOptions = function () {
    return K.Store.data.departments.map(function (d) { return { value: d, label: d }; });
  };
  UI.formValues = function (form) {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      out[el.name] = el.value.trim ? el.value.trim() : el.value;
    });
    return out;
  };
  UI.todayInput = function () { return K.U.todayISO(); };

  /* ---------------- أدوات الجدول ---------------- */
  UI.empty = function (msg, sub) {
    return '<div class="empty-state">' + UI.icon('layers') + '<b>' + UI.esc(msg || 'لا توجد بيانات') + '</b>' +
      '<span class="small">' + UI.esc(sub || 'لم تُسجل أي بيانات مطابقة للفلاتر الحالية.') + '</span></div>';
  };
  UI.tableEmptyRow = function (cols, msg) {
    return '<tr><td class="tbl-empty" colspan="' + cols + '">' + UI.esc(msg || 'لا توجد بيانات مطابقة') + '</td></tr>';
  };
  UI.branchName = function (id) {
    var b = K.Store.data.branches.filter(function (x) { return x.id === id; })[0];
    return b ? b.name : '—';
  };

  /* ---------------- تصدير ---------------- */
  UI.csv = function (filename, headers, rows) {
    var esc = function (v) {
      var s = v === null || v === undefined ? '' : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    };
    var lines = [headers.map(esc).join(',')];
    rows.forEach(function (r) { lines.push(r.map(esc).join(',')); });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename.replace(/[\\/:*?"<>|]/g, '-') + '.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    UI.toast('تم تصدير الملف: ' + a.download);
  };

  UI.backup = function () {
    var blob = new Blob([JSON.stringify(K.Store.data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kak-quality-backup-' + K.U.todayISO() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    UI.toast('تم تنزيل نسخة احتياطية كاملة من قاعدة البيانات');
  };

  UI.print = function () { window.print(); };

  UI.downloadText = function (filename, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------------- عناصر مركبة ---------------- */
  UI.scoreRing = function (value, size, color) {
    var s = size || 92, sw = 8, r = (s - sw) / 2, c = 2 * Math.PI * r;
    var v = K.U.clamp(value || 0, 0, 100);
    var col = color || (v >= 85 ? '#1f286d' : v >= 70 ? '#b54708' : '#b42318');
    return '<div class="score-ring" style="width:' + s + 'px;height:' + s + 'px">' +
      '<svg width="' + s + '" height="' + s + '"><circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="#eef3f0" stroke-width="' + sw + '"/>' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round" ' +
      'stroke-dasharray="' + (v / 100 * c) + ' ' + c + '"/></svg>' +
      '<div class="v">' + UI.n(v, 0) + '<small style="font-size:11px;font-weight:600">%</small></div></div>';
  };

  UI.kpiCard = function (o) {
    var cls = o.warn ? 'warn' : (o.bad ? 'bad' : '');
    var valHtml = o.unit === '%'
      ? '<span class="ltr">' + o.value + '%</span>'
      : (o.value + (o.unit ? '<small>' + UI.esc(o.unit) + '</small>' : ''));
    return '<div class="stat ' + cls + '">' +
      '<div class="s-top"><div class="s-icon">' + UI.icon(o.icon || 'target') + '</div><span>' + UI.esc(o.label) + '</span></div>' +
      '<div class="s-val">' + valHtml + '</div>' +
      '<div class="s-foot">' + (o.foot || '') + '</div>' +
      (o.progress !== undefined ? '<div class="mini-progress"><span style="width:' + K.U.clamp(o.progress, 0, 100) + '%"></span></div>' : '') +
      '</div>';
  };

  K.UI = UI;
})(window.KAK);
