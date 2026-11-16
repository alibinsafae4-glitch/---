/* التفتيش الميداني */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { filters: { q: '', type: '' } };

  function calcScore(items) { return Math.round(U.sum(items, function (x) { return x.score; }) / (items.length * 5) * 100); }

  function formHtml(ins, isNew) {
    var items = C.INSPECTION_ITEMS.map(function (name, i) {
      var cur = (ins.items && ins.items[i] && ins.items[i].score) || 0;
      return '<div class="chk-row"><div class="c-name"><span class="idx">' + (i + 1) + '</span>' + UI.esc(name) + '</div>' +
        '<div class="rating" data-row="' + i + '">' +
        [5, 4, 3, 2, 1].map(function (v) { return '<button type="button" data-val="' + v + '" class="' + (cur === v ? 'on' : '') + '" title="' + v + ' من 5">' + v + '</button>'; }).join('') +
        '</div></div>';
    }).join('');

    return '<form id="inForm">' +
      '<div class="form-grid mb-2">' +
      UI.field('الفرع', UI.select('branchId', UI.branchOptions(false, true), ins.branchId, { req: true }), { req: true }) +
      UI.field('تاريخ التفتيش', UI.input('date', ins.date, { type: 'date', req: true }), { req: true }) +
      UI.field('نوع التفتيش', UI.select('type', C.INSPECTION_TYPES, ins.type), { req: true }) +
      UI.field('المفتش', UI.input('inspector', ins.inspector, { req: true })) +
      '</div>' +
      '<fieldset><legend>عناصر التفتيش (12 عنصرًا — تقييم من 1 إلى 5)</legend>' +
      '<div class="small muted mb-1">5 = مطابق تمامًا · 4 = مطابق · 3 = ملاحظات بسيطة · 2 = قصور واضح · 1 = مخالفة جوهرية</div>' +
      '<div class="checklist">' + items + '</div></fieldset>' +
      UI.field('ملاحظات عامة / توصيات', UI.textarea('notes', ins.notes, { rows: 3 })) +
      '</form>';
  }

  function openForm(existing, after) {
    if (!App.can('write')) { UI.toast('لا تملك صلاحية تنفيذ التفتيش', 'err'); return; }
    var isNew = !existing;
    var ins = existing || {
      branchId: App.state.branchId && App.state.branchId !== 'b1' ? App.state.branchId : 'b2',
      date: U.todayISO(), type: 'مفاجئ', inspector: App.state.user.name,
      items: C.INSPECTION_ITEMS.map(function (n) { return { name: n, score: 0, note: '' }; }), notes: ''
    };

    UI.modal({
      title: isNew ? 'تفتيش ميداني جديد' : 'تعديل التفتيش',
      sub: 'كل عنصر يُقيَّم من 1 إلى 5 — الدرجة النهائية نسبة مئوية',
      size: 'wide',
      body: formHtml(ins, isNew),
      footer: '<div class="spacer" style="display:flex;align-items:center;gap:8px"><span class="small muted">الدرجة:</span><b id="inScore" style="font-size:20px">0%</b></div>' +
        '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="inSave">حفظ التفتيش</button>',
      onMount: function (wrap, close) {
        var form = wrap.querySelector('#inForm');
        var scores = C.INSPECTION_ITEMS.map(function (n, i) { return (ins.items && ins.items[i] && ins.items[i].score) || 0; });
        var scoreEl = wrap.querySelector('#inScore');
        function recalc() {
          var s = Math.round(U.sum(scores) / (scores.length * 5) * 100);
          scoreEl.textContent = s + '%';
          scoreEl.style.color = s >= 85 ? '#1f286d' : s >= 70 ? '#b54708' : '#b42318';
        }
        recalc();
        wrap.querySelectorAll('.rating').forEach(function (grp) {
          grp.querySelectorAll('button').forEach(function (b) {
            b.addEventListener('click', function () {
              var row = +grp.getAttribute('data-row');
              var val = +b.getAttribute('data-val');
              scores[row] = val;
              grp.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', +x.getAttribute('data-val') === val); });
              recalc();
            });
          });
        });
        wrap.querySelector('#inSave').addEventListener('click', function () {
          var f = UI.formValues(form);
          if (!f.branchId || !f.date || !f.inspector) { UI.toast('يرجى إكمال بيانات التفتيش الأساسية', 'err'); return; }
          if (scores.some(function (s) { return !s; })) { UI.toast('يرجى تقييم جميع عناصر التفتيش الـ12', 'err'); return; }
          var items = C.INSPECTION_ITEMS.map(function (n, i) { return { name: n, score: scores[i], note: '' }; });
          var payload = { branchId: f.branchId, date: f.date, type: f.type, inspector: f.inspector, items: items, score: calcScore(items), notes: f.notes, status: 'مكتمل' };
          if (isNew) {
            payload.id = U.uid('in');
            K.Store.data.inspections.push(payload);
          } else { Object.assign(existing, payload); }
          K.Store.save();
          close();
          UI.toast('تم حفظ التفتيش — الدرجة ' + payload.score + '%');
          if (payload.score < 85) {
            setTimeout(function () {
              UI.confirm({
                title: 'تسجيل ملاحظة تصحيحية؟',
                message: 'درجة التفتيش ' + payload.score + '% أقل من 85%. هل تريد إنشاء ملاحظة وإجراء تصحيحي مرتبط بهذا التفتيش الآن؟',
                ok: 'إنشاء ملاحظة',
                onOk: function () {
                  if (K.views.findings && K.views.findings.openNew) {
                    K.views.findings.openNew({ branchId: payload.branchId, foundDate: payload.date, source: 'تفتيش ميداني', refInspection: payload.id });
                  }
                }
              });
            }, 220);
          }
          after();
        });
      }
    });
  }

  function detailModal(ins, after) {
    var items = ins.items.map(function (it, i) {
      var pct = it.score / 5 * 100;
      return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px">' +
        '<span>' + (i + 1) + '. ' + UI.esc(it.name) + '</span><b>' + it.score + '/5</b></div>' +
        '<div class="progress ' + (pct < 60 ? 'red' : pct < 80 ? 'amber' : '') + '" style="height:6px"><span style="width:' + pct + '%"></span></div>' +
        (it.note ? '<div class="tiny muted" style="margin-top:3px">' + UI.esc(it.note) + '</div>' : '') + '</div>';
    }).join('');
    var linked = K.Store.data.findings.filter(function (f) { return f.refInspection === ins.id; });

    UI.modal({
      title: 'تقرير التفتيش — ' + UI.branchName(ins.branchId),
      sub: UI.date(ins.date) + ' · ' + ins.type + ' · المفتش: ' + ins.inspector,
      size: 'wide',
      body: '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-bottom:16px">' + UI.scoreRing(ins.score, 100) +
        '<div><div class="muted small">الدرجة النهائية</div><div style="font-size:22px;font-weight:800">' + ins.score + '%</div>' +
        '<div class="mt-1">' + UI.badge(ins.score >= 85 ? 'مطابق للمعايير' : ins.score >= 70 ? 'يحتاج تحسينًا' : 'قصور جوهري', ins.score >= 85 ? 'b-green' : ins.score >= 70 ? 'b-amber' : 'b-red') +
        ' <span class="small muted">' + linked.length + ' ملاحظة مرتبطة</span></div></div></div>' +
        '<hr class="sep"><div class="grid grid-2" style="gap:22px"><div>' + items + '</div>' +
        '<div>' + (ins.notes ? '<div class="note-box">' + UI.esc(ins.notes) + '</div>' : '') +
        (linked.length ? '<h4 style="font-size:13px;margin:16px 0 8px">الملاحظات المرتبطة</h4>' + linked.map(function (f) {
          return '<div class="alert-row ' + (f.status !== 'closed' ? 'red' : '') + '"><div class="a-ico">' + UI.icon('alert') + '</div>' +
            '<div class="a-main"><b>' + UI.esc(f.desc) + '</b><span>' + UI.esc(f.category) + ' · ' + UI.date(f.foundDate) + '</span></div>' +
            '<span class="a-link" data-fn="' + f.id + '">عرض</span></div>';
        }).join('') : '') + '</div></div>',
      footer: '<button class="btn btn-outline" data-close>إغلاق</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="inEdit">' + UI.icon('edit') + ' تعديل</button>' : ''),
      onMount: function (wrap, close) {
        var b = wrap.querySelector('#inEdit');
        if (b) b.addEventListener('click', function () { close(); openForm(ins, after); });
        wrap.querySelectorAll('[data-fn]').forEach(function (el) {
          el.addEventListener('click', function () { close(); if (K.views.findings && K.views.findings.openDetail) K.views.findings.openDetail(el.getAttribute('data-fn')); });
        });
      }
    });
  }

  K.views.inspections = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range(); var b = App.state.branchId; var f = V.filters;
      var list = M.inspectionsOf(b, r.from, r.to).slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; });
      var avg = list.length ? U.avg(list, function (x) { return x.score; }) : null;
      var best = list.slice().sort(function (a, c) { return c.score - a.score; })[0];
      var worst = list.slice().sort(function (a, c) { return a.score - c.score; })[0];
      var weak = 0;
      list.forEach(function (x) { x.items.forEach(function (it) { if (it.score <= 2) weak++; }); });

      var filtered = list.slice();
      if (f.q) filtered = filtered.filter(function (x) { return (UI.branchName(x.branchId) + ' ' + x.inspector + ' ' + x.type).indexOf(f.q) > -1; });
      if (f.type) filtered = filtered.filter(function (x) { return x.type === f.type; });

      var html = '';
      html += '<div class="page-head"><div><h1>التفتيش الميداني</h1>' +
        '<div class="desc">تفتيش مفاجئ ودوري وربع سنوي وبناءً على شكوى أو مؤشر منخفض — 12 عنصرًا لكل زيارة، والدرجة النهائية نسبة مئوية.</div></div>' +
        '<div class="actions"><button class="btn btn-outline" id="inExport">' + UI.icon('download') + ' تصدير</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="inNew">' + UI.icon('plus') + ' تفتيش جديد</button>' : '') + '</div></div>';

      html += '<div class="stats">' +
        UI.kpiCard({ label: 'متوسط درجة التفتيش', icon: 'search', value: avg === null ? '—' : UI.n(avg, 1), unit: '%', foot: '<span>' + UI.n(list.length) + ' زيارة · الهدف 85%</span>', progress: avg || 0, bad: avg !== null && avg < 70, warn: avg !== null && avg < 85 }) +
        UI.kpiCard({ label: 'أفضل زيارة', icon: 'award', value: best ? best.score : '—', unit: '%', foot: '<span>' + UI.esc(best ? UI.branchName(best.branchId) : '—') + '</span>', progress: best ? best.score : 0 }) +
        UI.kpiCard({ label: 'أدنى زيارة', icon: 'alert', value: worst ? worst.score : '—', unit: '%', foot: '<span>' + UI.esc(worst ? UI.branchName(worst.branchId) : '—') + '</span>', progress: worst ? worst.score : 0, bad: worst && worst.score < 70 }) +
        UI.kpiCard({ label: 'عناصر دون المستوى', icon: 'down', value: UI.n(weak), unit: 'عنصر', foot: '<span>حصلت على 2 أو أقل من 5</span>', progress: list.length ? weak / (list.length * 12) * 100 : 0, warn: weak > 0 }) +
        '</div>';

      html += '<div class="toolbar">' +
        '<div class="search" style="max-width:300px">' + UI.icon('search') + '<input type="text" id="inQ" value="' + UI.esc(f.q) + '" placeholder="بحث بالفرع أو المفتش"></div>' +
        '<select id="inType" style="width:auto;min-width:190px"><option value="">كل أنواع التفتيش</option>' +
        C.INSPECTION_TYPES.map(function (x) { return '<option value="' + x + '"' + (f.type === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select>' +
        '<div class="spacer"></div><span class="small muted">' + UI.n(filtered.length) + ' زيارة</span></div>';

      html += '<div class="card"><div class="table-wrap" style="border:0;border-radius:14px"><table class="tbl"><thead><tr>' +
        '<th>التاريخ</th><th>الفرع</th><th>النوع</th><th>المفتش</th><th>الدرجة</th><th>الملاحظات</th><th></th></tr></thead><tbody>';
      if (!filtered.length) html += UI.tableEmptyRow(7, 'لا توجد زيارات تفتيش مطابقة');
      filtered.slice(0, 100).forEach(function (x) {
        var n = K.Store.data.findings.filter(function (fn) { return fn.refInspection === x.id; }).length;
        html += '<tr><td>' + UI.date(x.date) + '</td>' +
          '<td><b>' + UI.esc(UI.branchName(x.branchId)) + '</b></td>' +
          '<td><span class="badge b-gray">' + UI.esc(x.type) + '</span></td>' +
          '<td class="sub">' + UI.esc(x.inspector) + '</td>' +
          '<td><div style="display:flex;align-items:center;gap:8px"><div class="progress ' + (x.score < 70 ? 'red' : x.score < 85 ? 'amber' : '') + '" style="width:56px;height:6px"><span style="width:' + x.score + '%"></span></div><b class="num">' + x.score + '%</b></div></td>' +
          '<td>' + (n ? UI.badge(n + ' ملاحظة', 'b-amber') : '<span class="sub">—</span>') + '</td>' +
          '<td><div class="row-actions"><button class="btn btn-ghost btn-xs" data-open="' + x.id + '">' + UI.icon('eye') + ' تقرير</button>' +
          (App.can('write') ? '<button class="btn btn-ghost btn-xs" data-del="' + x.id + '">' + UI.icon('trash') + '</button>' : '') + '</div></td></tr>';
      });
      html += '</tbody></table></div></div>';

      html += '<div class="grid grid-2 mt-2">';
      html += '<div class="card"><div class="card-head"><h3>عناصر التفتيش ومتوسط الأداء</h3></div><div class="card-body">';
      var itemAvg = C.INSPECTION_ITEMS.map(function (name, i) {
        var vals = [];
        list.forEach(function (x) { if (x.items[i]) vals.push(x.items[i].score); });
        return { label: name, value: vals.length ? U.avg(vals) : 0, display: (vals.length ? UI.n(U.avg(vals), 1) : '—') + '/5', tone: vals.length && U.avg(vals) < 3 ? 'warn' : '' };
      }).sort(function (a, c) { return a.value - c.value; });
      html += UI.charts.hbars(itemAvg, { max: 5, dec: 1 });
      html += '<div class="note-box mt-2 small">أقل العناصر أداءً تُترجم إلى ملاحظات وإجراءات تصحيحية، وتُدرج في خطة التدريب والتفتيش القادم.</div></div></div>';

      var byType = C.INSPECTION_TYPES.map(function (t2) {
        var rows = list.filter(function (x) { return x.type === t2; });
        return { label: t2, value: rows.length, display: rows.length ? UI.n(rows.length) + ' زيارة · ' + UI.n(U.avg(rows, function (x) { return x.score; }), 0) + '%' : '0' };
      });
      html += '<div class="card"><div class="card-head"><h3>التفتيش حسب النوع والأداء</h3></div><div class="card-body">' +
        UI.charts.hbars(byType, { max: Math.max.apply(null, byType.map(function (x) { return x.value; }).concat([1])) }) +
        '<hr class="sep"><div class="small muted">إجمالي الزيارات في الفترة: <b>' + UI.n(list.length) + '</b> — متوسط الدرجة: <b>' + (avg === null ? '—' : UI.n(avg, 1) + '%') + '</b></div>' +
        '<div class="note-box mt-2 small">التفتيش المفاجئ هو الأداة الأكثر كشفًا للمخالفات، ويُوصى بألا يقل عن زيارة واحدة لكل فرع شهريًا.</div></div></div>';
      html += '</div>';

      return html;
    },
    mount: function (root) {
      var after = function () { App.refresh(); };
      var nb = root.querySelector('#inNew');
      if (nb) nb.addEventListener('click', function () { openForm(null, after); });
      root.querySelector('#inExport').addEventListener('click', function () {
        var r = App.range();
        var list = M.inspectionsOf(App.state.branchId, r.from, r.to);
        UI.csv('التفتيش-الميداني-' + U.todayISO(),
          ['التاريخ', 'الفرع', 'النوع', 'المفتش', 'الدرجة %'].concat(C.INSPECTION_ITEMS),
          list.map(function (x) { return [x.date, UI.branchName(x.branchId), x.type, x.inspector, x.score].concat(x.items.map(function (i) { return i.score; })); }));
      });
      var q = root.querySelector('#inQ');
      if (q) q.addEventListener('input', function () {
        V.filters.q = this.value; App.refresh();
        requestAnimationFrame(function () { var el = document.getElementById('inQ'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
      });
      var ty = root.querySelector('#inType');
      if (ty) ty.addEventListener('change', function () { V.filters.type = this.value; App.refresh(); });
      root.querySelectorAll('[data-open]').forEach(function (b) {
        b.addEventListener('click', function () {
          var x = K.Store.data.inspections.filter(function (i) { return i.id === b.getAttribute('data-open'); })[0];
          if (x) detailModal(x, after);
        });
      });
      root.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmDelete('سيتم حذف تقرير التفتيش ودرجاته نهائيًا.', function () {
            var arr = K.Store.data.inspections;
            arr.splice(arr.findIndex(function (x) { return x.id === b.getAttribute('data-del'); }), 1);
            K.Store.save(); UI.toast('تم حذف التفتيش'); after();
          });
        });
      });
    }
  };
})(window.KAK);
