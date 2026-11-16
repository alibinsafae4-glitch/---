/* لوحة المعلومات */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;

  function delta(cur, prev, invert) {
    if (cur === null || cur === undefined || prev === null || prev === undefined) return '<span class="delta flat">—</span>';
    var d = cur - prev;
    var good = invert ? d < 0 : d > 0;
    var cls = Math.abs(d) < .05 ? 'flat' : (good ? 'up' : 'down');
    var arrow = Math.abs(d) < .05 ? '—' : (d > 0 ? '▲' : '▼');
    return '<span class="delta ' + cls + '">' + arrow + ' ' + UI.n(Math.abs(d), 1) + '</span>';
  }

  function shortMonth(mk) { return U.monthName(mk).split(' ')[0]; }

  function overallScore(branchId, from, to) {
    var parts = [];
    var ev = M.evalScore(branchId, from, to); if (ev !== null) parts.push({ w: .32, v: ev });
    var sat = M.satisfaction(branchId, from, to); if (sat) parts.push({ w: .24, v: sat.value });
    var ins = M.inspectionScore(branchId, from, to); if (ins !== null) parts.push({ w: .2, v: ins });
    var cs = M.complaintStats(branchId, from, to); parts.push({ w: .14, v: cs.total ? cs.resolutionRate : 0 });
    var fs = M.findingStats(branchId, from, to); parts.push({ w: .1, v: fs.total ? fs.closureRate : 0 });
    var tw = U.sum(parts, function (p) { return p.w; });
    return tw ? U.sum(parts, function (p) { return p.w * p.v; }) / tw : 0;
  }

  K.views.dashboard = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var db = K.Store.data;
      var r = App.range(), prev = M.prevRange(r);
      var b = App.state.branchId;
      var sat = M.satisfaction(b, r.from, r.to), satPrev = M.satisfaction(b, prev.from, prev.to);
      var insp = M.inspectionScore(b, r.from, r.to), inspPrev = M.inspectionScore(b, prev.from, prev.to);
      var evs = M.evalScore(b, r.from, r.to), evsPrev = M.evalScore(b, prev.from, prev.to);
      var cs = M.complaintStats(b, r.from, r.to), csPrev = M.complaintStats(b, prev.from, prev.to);
      var fs = M.findingStats(b, r.from, r.to), fsPrev = M.findingStats(b, prev.from, prev.to);
      var training = M.trainingRate(r.from, r.to);
      var score = overallScore(b, r.from, r.to);
      var scorePrev = overallScore(b, prev.from, prev.to);
      var months = U.lastMonths(6);
      var u = App.state.user;

      /* بيانات الرسوم */
      var satSeries = months.map(function (mk) { var bb = U.monthBounds(mk); var s = M.satisfaction(b, bb.from, bb.to); return s ? s.value : null; });
      var inspSeries = months.map(function (mk) { var bb = U.monthBounds(mk); var s = M.inspectionScore(b, bb.from, bb.to); return s === null ? null : Math.round(s * 10) / 10; });
      var evalSeries = months.map(function (mk) { var bb = U.monthBounds(mk); var s = M.evalScore(b, bb.from, bb.to); return s === null ? null : Math.round(s * 10) / 10; });
      var compSeries = months.map(function (mk) { var bb = U.monthBounds(mk); return M.complaintsOf(b, bb.from, bb.to).length; });
      var types = M.complaintsByType(b, r.from, r.to);
      var rank = M.ranking(r.from, r.to);
      var satByBranch = db.branches.filter(function (x) { return x.type === 'فرع'; }).map(function (x) {
        var s = M.satisfaction(x.id, r.from, r.to);
        return { label: x.name.replace('فرع ', ''), value: s ? s.value : 0, display: s ? UI.pct(s.value) : '—', tone: s && s.value < 80 ? 'bad' : (s && s.value < 85 ? 'warn' : '') };
      }).sort(function (a, c) { return c.value - a.value; }).slice(0, 7);

      var recent = M.complaintsOf(b, r.from, r.to).slice().sort(function (x, y) { return x.receivedDate < y.receivedDate ? 1 : -1; }).slice(0, 6);
      var alerts = M.alerts(b);
      var t = U.todayISO();

      var html = '';
      html += '<div class="page-head"><div>' +
        '<h1>مرحبًا، ' + UI.esc(u.name.replace('أ. ', '')) + '</h1>' +
        '<div class="desc">ملخص أداء الجودة في ' + UI.esc(b ? UI.branchName(b) : 'الإدارة العامة وجميع الفروع') + ' خلال ' + UI.esc(r.label) + ' — ' + UI.date(r.from) + ' إلى ' + UI.date(r.to) + '.</div></div>' +
        '<div class="actions">' +
        (App.can('complaints.write') ? '<button class="btn btn-outline" id="quickComplaint">' + UI.icon('plus') + ' تسجيل شكوى</button>' : '') +
        '<button class="btn btn-primary" id="quickReport">' + UI.icon('file') + ' تقرير الجودة</button></div></div>';

      /* ===== مؤشر الجودة العام ===== */
      html += '<div class="card card-pad mb-2" style="background:linear-gradient(120deg,#171f52,#1f286d 60%,#2f3c98);border:0;color:#fff;position:relative;overflow:hidden">' +
        '<div style="position:absolute;inset-inline-end:-60px;top:-70px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(200,161,58,.35),transparent 65%)"></div>' +
        '<div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap;position:relative">' +
        '<div style="display:flex;align-items:center;gap:16px">' +
        '<div style="position:relative;width:96px;height:96px;flex:0 0 auto">' +
        '<svg width="96" height="96" style="transform:rotate(-90deg)"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="9"/>' +
        '<circle cx="48" cy="48" r="42" fill="none" stroke="#e6c05f" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (score / 100 * 264) + ' 264"/></svg>' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">' + UI.ltr('<span style="font-size:27px;font-weight:800">' + UI.n(score, 0) + '</span><span style="font-size:12px;font-weight:600;opacity:.75;margin-top:7px">%</span>') + '</div></div>' +
        '<div><div style="font-size:12px;color:rgba(255,255,255,.65);font-weight:600">مؤشر الجودة العام (مركّب)</div>' +
        '<div style="font-size:20px;font-weight:800;margin-top:2px">' + (score >= 90 ? 'أداء ممتاز' : score >= 80 ? 'أداء جيد' : score >= 70 ? 'يحتاج تحسينًا' : 'أداء ضعيف') + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.7)">مقارنة بالفترة السابقة: ' + (scorePrev ? (score >= scorePrev ? '▲ تحسن ' + UI.n(score - scorePrev, 1) + ' نقطة' : '▼ تراجع ' + UI.n(scorePrev - score, 1) + ' نقطة') : 'لا توجد بيانات سابقة') + '</div></div></div>' +
        '<div style="flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:14px;min-width:280px">' +
        miniMetric('بطاقة التقييم', evs, '%') + miniMetric('التفتيش الميداني', insp, '%') +
        miniMetric('رضا العملاء', sat ? sat.value : null, '%') + miniMetric('إغلاق الملاحظات', fs.total ? fs.closureRate : null, '%') +
        '</div></div></div>';

      /* ===== بطاقات المؤشرات ===== */
      html += '<div class="stats stats-6">';
      html += UI.kpiCard({
        label: 'رضا العملاء', icon: 'star', value: sat ? UI.n(sat.value, 1) : '—', unit: '%',
        foot: delta(sat && sat.value, satPrev && satPrev.value) + '<span>عن ' + (sat ? UI.n(sat.count) + ' مشارك</span>' : 'مشارك</span>'),
        progress: sat ? sat.value : 0, bad: sat && sat.value < 80, warn: sat && sat.value < 85
      });
      html += UI.kpiCard({
        label: 'درجة التفتيش', icon: 'search', value: insp === null ? '—' : UI.n(insp, 1), unit: '%',
        foot: delta(insp, inspPrev) + '<span>هدف 85%</span>', progress: insp || 0, bad: insp !== null && insp < 75, warn: insp !== null && insp < 85
      });
      html += UI.kpiCard({
        label: 'الشكاوى المفتوحة', icon: 'message', value: UI.n(cs.open), unit: 'شكوى',
        foot: '<span class="badge ' + (cs.overdue ? 'b-red' : 'b-green') + '">' + (cs.overdue ? cs.overdue + ' متأخرة' : 'ضمن المهل') + '</span><span>من ' + UI.n(cs.total) + '</span>',
        progress: cs.total ? Math.round(cs.closed / cs.total * 100) : 0, bad: cs.overdue > 0
      });
      html += UI.kpiCard({
        label: 'نسبة حل الشكاوى', icon: 'checkc', value: cs.total ? UI.n(cs.resolutionRate, 1) : '—', unit: '%',
        foot: delta(cs.total ? cs.resolutionRate : null, csPrev.total ? csPrev.resolutionRate : null) + '<span>هدف 90%</span>',
        progress: cs.total ? cs.resolutionRate : 0, bad: cs.total > 0 && cs.resolutionRate < 80
      });
      html += UI.kpiCard({
        label: 'ملاحظات متأخرة', icon: 'alert', value: UI.n(fs.overdue), unit: 'ملاحظة',
        foot: '<span class="badge ' + (fs.critical ? 'b-red' : 'b-gray') + '">' + fs.critical + ' حرجة</span><span>من ' + UI.n(fs.total) + '</span>',
        progress: fs.total ? Math.round((fs.total - fs.open) / fs.total * 100) : 0, bad: fs.overdue > 0
      });
      html += UI.kpiCard({
        label: 'نسبة إغلاق الملاحظات', icon: 'shield', value: fs.total ? UI.n(fs.closureRate, 1) : '—', unit: '%',
        foot: delta(fs.total ? fs.closureRate : null, fsPrev.total ? fsPrev.closureRate : null) + '<span>هدف 90%</span>',
        progress: fs.total ? fs.closureRate : 0, bad: fs.total > 0 && fs.closureRate < 80
      });
      html += '</div>';

      /* ===== الرسم الخطي + الدونات ===== */
      html += '<div class="grid grid-main mb-2">';
      html += '<div class="card"><div class="card-head"><h3>اتجاه مؤشرات الجودة <span class="sub">— آخر 6 أشهر</span></h3>' +
        '<div class="tools"><span class="badge b-gray">هدف التفتيش 85%</span></div></div>' +
        '<div class="card-body">' +
        UI.charts.line({
          labels: months.map(shortMonth),
          min: 50, max: 100, target: 85,
          series: [
            { name: 'رضا العملاء', data: satSeries, color: '#4655b8' },
            { name: 'درجة التفتيش', data: inspSeries, color: '#e0a52f' },
            { name: 'بطاقة التقييم', data: evalSeries, color: '#0e7490' }
          ]
        }) +
        '</div></div>';

      html += '<div class="card"><div class="card-head"><h3>توزيع الشكاوى حسب النوع</h3><div class="tools"><span class="sub">' + UI.n(cs.total) + ' شكوى</span></div></div>' +
        '<div class="card-body">' + UI.charts.donut(types, { centerValue: UI.n(cs.total), centerLabel: 'شكوى', size: 138 }) +
        topTypeNote(types) + '</div></div>';
      html += '</div>';

      /* ===== الأعمدة + رضا الفروع ===== */
      html += '<div class="grid grid-2 mb-2">';
      html += '<div class="card"><div class="card-head"><h3>الشكاوى المستلمة شهريًا</h3><div class="tools"><span class="sub">اتجاه تنازلي = تحسّن</span></div></div>' +
        '<div class="card-body">' + UI.charts.columns({ labels: months.map(shortMonth), values: compSeries, gold: [compSeries.length - 1] }) +
        '<div class="chart-legend"><span><i style="background:#1f286d"></i>شكاوى مستلمة</span><span><i style="background:#e0a52f"></i>الشهر الحالي</span></div></div></div>';

      html += '<div class="card"><div class="card-head"><h3>رضا العملاء حسب الفرع</h3><div class="tools"><span class="sub">الهدف 85%</span></div></div>' +
        '<div class="card-body">' + (satByBranch.length ? UI.charts.hbars(satByBranch, { max: 100 }) : UI.empty('لا توجد استبيانات')) + '</div></div>';
      html += '</div>';

      /* ===== ترتيب الفروع + التنبيهات ===== */
      html += '<div class="grid grid-main mb-2">';
      html += '<div class="card"><div class="card-head"><h3>ترتيب الفروع حسب مؤشر الجودة المركّب</h3>' +
        '<div class="tools"><a class="btn btn-ghost btn-sm" href="#/kpis">تفاصيل المؤشرات ' + UI.icon('arrow') + '</a></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr>' +
        '<th>#</th><th>الفرع</th><th>الدرجة المركبة</th><th>رضا العملاء</th><th>درجة التفتيش</th><th>الحالة</th>' +
        '</tr></thead><tbody>';
      if (!rank.length) html += UI.tableEmptyRow(6);
      rank.forEach(function (x, i) {
        var tone = x.score >= 88 ? 'b-green' : x.score >= 80 ? 'b-teal' : x.score >= 70 ? 'b-amber' : 'b-red';
        html += '<tr><td class="num">' + (i + 1) + '</td>' +
          '<td><b>' + UI.esc(x.branch.name) + '</b><div class="sub">' + UI.esc(x.branch.city) + ' · ' + UI.esc(x.branch.manager) + '</div></td>' +
          '<td><div style="display:flex;align-items:center;gap:8px"><b style="font-size:14px;min-width:34px" class="ltr">' + UI.n(x.score, 1) + '</b>' +
          '<div class="progress ' + (x.score < 70 ? 'red' : x.score < 85 ? 'amber' : '') + '" style="width:64px;height:6px"><span style="width:' + x.score + '%"></span></div></div></td>' +
          '<td>' + (x.satisfaction ? UI.pct(x.satisfaction.value) : '—') + '</td>' +
          '<td>' + (x.inspection === null ? '—' : UI.pct(x.inspection)) + '</td>' +
          '<td>' + UI.badge(x.score >= 85 ? 'مطابق' : x.score >= 75 ? 'يحتاج متابعة' : 'أولوية تصحيح', tone) + '</td></tr>';
      });
      html += '</tbody></table></div></div>';

      html += '<div class="card"><div class="card-head"><h3>تنبيهات المهل</h3><div class="tools"><span class="badge ' + (alerts.length ? 'b-red' : 'b-green') + '">' + alerts.length + '</span></div></div>' +
        '<div class="card-body" style="padding-top:12px">';
      if (!alerts.length) {
        html += '<div class="note-box">' + UI.icon('checkc') + ' لا توجد شكاوى أو ملاحظات متأخرة. الالتزام بالمهل جيد.</div>';
      } else {
        alerts.forEach(function (a) {
          html += '<div class="alert-row ' + (a.level === 'red' ? 'red' : '') + '"><div class="a-ico">' + UI.icon(a.kind === 'complaint' ? 'message' : 'alert') + '</div>' +
            '<div class="a-main"><b>' + UI.esc(a.title) + '</b><span>' + UI.esc(a.sub) + '</span></div>' +
            '<span class="a-link" data-goto="' + UI.esc(a.link) + '">فتح</span></div>';
        });
      }
      html += '</div></div>';
      html += '</div>';

      /* ===== أحدث الشكاوى ===== */
      html += '<div class="card"><div class="card-head"><h3>أحدث الشكاوى</h3><div class="tools"><a class="btn btn-ghost btn-sm" href="#/complaints">كل الشكاوى ' + UI.icon('arrow') + '</a></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr>' +
        '<th>الرقم المرجعي</th><th>التاريخ</th><th>العميل</th><th>الفرع</th><th>الموضوع</th><th>النوع</th><th>الحالة</th><th>الاستحقاق</th></tr></thead><tbody>';
      if (!recent.length) html += UI.tableEmptyRow(8);
      recent.forEach(function (c) {
        var late = c.status !== 'closed' && c.dueDate < t;
        html += '<tr class="row-click" data-open="' + c.id + '"><td class="num">' + UI.esc(c.refNo) + '</td>' +
          '<td>' + UI.date(c.receivedDate, { noYear: true }) + '</td>' +
          '<td>' + UI.esc(c.customerName) + '</td>' +
          '<td>' + UI.esc(UI.branchName(c.branchId).replace('فرع ', '')) + '</td>' +
          '<td class="wrap">' + UI.esc(c.subject) + '</td>' +
          '<td class="sub">' + UI.esc(c.type) + '</td>' +
          '<td>' + UI.statusBadge(C.COMPLAINT_STATUS, c.status) + '</td>' +
          '<td>' + (c.status === 'closed' ? '<span class="sub">' + UI.date(c.closedDate, { noYear: true }) + '</span>' : '<span class="' + (late ? 'badge b-red' : 'sub') + '">' + UI.date(c.dueDate, { noYear: true }) + '</span>') + '</td></tr>';
      });
      html += '</tbody></table></div></div>';

      return html;
    },
    mount: function (root) {
      var qc = root.querySelector('#quickComplaint');
      if (qc) qc.addEventListener('click', function () {
        if (K.views.complaints && K.views.complaints.openNew) K.views.complaints.openNew();
      });
      root.querySelector('#quickReport').addEventListener('click', function () { App.go('#/reports'); });
      root.querySelectorAll('[data-goto]').forEach(function (el) {
        el.addEventListener('click', function () { App.go(el.getAttribute('data-goto')); });
      });
      root.querySelectorAll('[data-open]').forEach(function (tr) {
        tr.addEventListener('click', function () {
          if (K.views.complaints && K.views.complaints.openDetail) K.views.complaints.openDetail(tr.getAttribute('data-open'));
        });
      });
      /* احتساب أداء التدريب في الشهر */
      var tr = root.querySelector('#trainingMini');
      if (tr) return;
    }
  };

  function miniMetric(label, val, unit) {
    var v = val === null || val === undefined ? '—' : UI.n(val, 1);
    var vHtml = unit === '%'
      ? (v === '—' ? v : '<span class="ltr">' + v + '%</span>')
      : v + '<span style="font-size:11px;font-weight:600;color:rgba(255,255,255,.7)"> ' + unit + '</span>';
    return '<div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px">' +
      '<div style="font-size:11px;color:rgba(255,255,255,.7)">' + UI.esc(label) + '</div>' +
      '<div style="font-size:19px;font-weight:800;margin-top:2px">' + vHtml + '</div></div>';
  }

  function topTypeNote(types) {
    var sorted = types.slice().sort(function (a, b) { return b.value - a.value; });
    var t = sorted[0];
    if (!t || !t.value) return '';
    var total = U.sum(types, function (x) { return x.value; });
    return '<div class="note-box small" style="margin-top:14px">' + UI.icon('bars') +
      ' النوع الأكثر تكرارًا: <b>' + UI.esc(t.label) + '</b> — ' + UI.n(t.value) + ' شكوى من ' + UI.n(total) + ' (' + UI.pct(t.value / total * 100, 0) + ')</div>';
  }
})(window.KAK);
