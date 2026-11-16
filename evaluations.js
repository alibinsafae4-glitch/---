/* بطاقة تقييم الجودة */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { filters: { q: '', cls: '' } };

  function totalOf(items) {
    return C.EVAL_ITEMS.reduce(function (s, it) { return s + (Number(items[it.key]) || 0); }, 0);
  }

  function confirmDelete(list, id, label, after) {
    UI.confirmDelete('سيتم حذف ' + label + ' نهائيًا. هذا الإجراء لا يمكن التراجع عنه.', function () {
      var idx = list.findIndex(function (x) { return x.id === id; });
      if (idx > -1) list.splice(idx, 1);
      K.Store.save();
      UI.toast('تم الحذف بنجاح');
      after();
    });
  }

  function evalModal(existing, after) {
    var isNew = !existing;
    var e = existing || { branchId: App.state.branchId || 'b2', date: U.todayISO(), evaluator: App.state.user.name, items: {}, notes: '' };
    var rows = C.EVAL_ITEMS.map(function (it, i) {
      var v = e.items[it.key] !== undefined ? e.items[it.key] : '';
      return '<div class="eval-row"><div class="e-name">' + UI.esc(it.name) + '<small>الوزن الأقصى ' + it.weight + ' درجات</small></div>' +
        '<input type="number" data-key="' + it.key + '" min="0" max="' + it.weight + '" step="1" value="' + v + '" placeholder="0">' +
        '<div class="e-w">من ' + it.weight + '</div></div>';
    }).join('');

    var body = '<form id="evalForm">' +
      '<div class="form-grid mb-2">' +
      UI.field('الفرع / الإدارة', UI.select('branchId', UI.branchOptions(false), e.branchId, { req: true }), { req: true }) +
      UI.field('تاريخ التقييم', UI.input('date', e.date, { type: 'date', req: true }), { req: true }) +
      UI.field('المقيّم', UI.input('evaluator', e.evaluator, { req: true }), { span: true, req: true }) +
      '</div>' +
      '<fieldset><legend>عناصر التقييم (المجموع 100 درجة)</legend><div class="eval-rows">' + rows + '</div></fieldset>' +
      UI.field('ملاحظات التقييم', UI.textarea('notes', e.notes, { rows: 2, placeholder: 'ملاحظات أو نقاط تحسين مقترحة…' })) +
      '</form>';

    UI.modal({
      title: isNew ? 'بطاقة تقييم جودة جديدة' : 'تعديل بطاقة التقييم',
      sub: 'وفق بطاقة التقييم المعتمدة (100 درجة)',
      size: 'wide',
      body: body,
      footer: '<div class="spacer" style="display:flex;align-items:center;gap:8px">' +
        '<span class="small muted">الإجمالي:</span><b id="evalTotal" dir="ltr" style="font-size:20px">0 / 100</b><span id="evalCls"></span></div>' +
        '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="evalSave">حفظ البطاقة</button>',
      onMount: function (wrap, close) {
        var form = wrap.querySelector('#evalForm');
        var totalEl = wrap.querySelector('#evalTotal');
        var clsEl = wrap.querySelector('#evalCls');
        function recalc() {
          var total = 0;
          C.EVAL_ITEMS.forEach(function (it) {
            var inp = form.querySelector('[data-key="' + it.key + '"]');
            var v = U.clamp(Number(inp.value) || 0, 0, it.weight);
            if (inp.value !== '' && Number(inp.value) !== v) inp.value = v;
            total += v;
          });
          totalEl.textContent = total + ' / 100';
          var c = M.rating(total);
          clsEl.innerHTML = ' <span class="badge ' + c.tone + '">' + c.label + '</span>';
        }
        form.addEventListener('input', recalc);
        recalc();
        wrap.querySelector('#evalSave').addEventListener('click', function () {
          var f = UI.formValues(form);
          if (!f.branchId || !f.date) { UI.toast('يرجى اختيار الفرع والتاريخ', 'err'); return; }
          var items = {}, missing = false;
          C.EVAL_ITEMS.forEach(function (it) {
            var inp = form.querySelector('[data-key="' + it.key + '"]');
            if (inp.value === '') missing = true;
            items[it.key] = U.clamp(Number(inp.value) || 0, 0, it.weight);
          });
          if (missing) { UI.toast('يرجى إدخال درجة لكل عنصر (أو صفر)', 'err'); return; }
          var total = totalOf(items);
          if (total > 100) { UI.toast('المجموع لا يمكن أن يتجاوز 100', 'err'); return; }
          if (isNew) {
            K.Store.data.evaluations.push({
              id: U.uid('ev'), branchId: f.branchId, date: f.date, evaluator: f.evaluator,
              items: items, total: total, notes: f.notes, status: 'معتمدة'
            });
          } else {
            Object.assign(existing, { branchId: f.branchId, date: f.date, evaluator: f.evaluator, items: items, total: total, notes: f.notes });
          }
          K.Store.save();
          close();
          UI.toast(isNew ? 'تم حفظ بطاقة التقييم بنجاح' : 'تم تحديث البطاقة');
          after();
        });
      }
    });
  }

  function detailModal(ev, after) {
    var c = M.rating(ev.total);
    var items = C.EVAL_ITEMS.map(function (it) {
      var v = ev.items[it.key] || 0, pct = v / it.weight * 100;
      return '<div style="margin-bottom:11px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px">' +
        '<span>' + UI.esc(it.name) + '</span><b>' + v + ' / ' + it.weight + '</b></div>' +
        '<div class="progress ' + (pct < 70 ? 'red' : pct < 85 ? 'amber' : '') + '" style="height:7px"><span style="width:' + pct + '%"></span></div></div>';
    }).join('');

    UI.modal({
      title: 'بطاقة تقييم — ' + UI.branchName(ev.branchId),
      sub: UI.date(ev.date) + ' · المقيّم: ' + ev.evaluator,
      body: '<div style="display:flex;gap:20px;align-items:center;margin-bottom:18px;flex-wrap:wrap">' +
        UI.scoreRing(ev.total) +
        '<div><div class="muted small">التقييم النهائي</div><div style="font-size:22px;font-weight:800" dir="ltr">' + ev.total + ' / 100</div>' +
        '<div class="mt-1">' + UI.badge(c.label, c.tone) + ' <span class="small muted">الإجراء: ' + UI.esc(c.action) + '</span></div></div></div>' +
        '<hr class="sep"><div style="display:grid;gap:2px">' + items + '</div>' +
        (ev.notes ? '<div class="note-box mt-2">' + UI.esc(ev.notes) + '</div>' : '') +
        '<div class="note-box gold mt-2 small">تصنيف النتيجة: 90–100 ممتاز (شكر وتحفيز) · 80–89 جيد (تحسينات بسيطة) · 70–79 يحتاج تحسينًا (خطة تصحيح خلال 15 يومًا) · أقل من 70 ضعيف (خطة عاجلة ومتابعة أسبوعية).</div>',
      footer: '<button class="btn btn-outline" data-close>إغلاق</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="evEdit">' + UI.icon('edit') + ' تعديل</button>' : ''),
      onMount: function (wrap, close) {
        var b = wrap.querySelector('#evEdit');
        if (b) b.addEventListener('click', function () { close(); evalModal(ev, after); });
      }
    });
  }

  K.views.evaluations = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    filters: V.filters,
    render: function () {
      var r = App.range(); var b = App.state.branchId; var f = V.filters;
      var list = M.evalOf(b, r.from, r.to).slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; });
      var avg = list.length ? U.avg(list, function (x) { return x.total; }) : null;
      var best = list.slice().sort(function (a, c) { return c.total - a.total; })[0];
      var worst = list.slice().sort(function (a, c) { return a.total - c.total; })[0];
      var dist = C.CLASSIFICATION.map(function (c) { return { label: c.label, tone: c.tone, n: list.filter(function (x) { return M.rating(x.total).label === c.label; }).length }; });

      if (f.q) list = list.filter(function (x) {
        return (UI.branchName(x.branchId) + ' ' + x.evaluator + ' ' + x.notes).toLowerCase().indexOf(f.q.toLowerCase()) > -1;
      });
      if (f.cls) list = list.filter(function (x) { return M.rating(x.total).label === f.cls; });

      var html = '';
      html += '<div class="page-head"><div><h1>بطاقة تقييم الجودة</h1>' +
        '<div class="desc">أداة القياس المعتمدة: 8 عناصر بوزن إجمالي 100 درجة، تُطبّق على الفروع والإدارات وتُحوّل إلى تصنيف وإجراء.</div></div>' +
        '<div class="actions">' +
        '<button class="btn btn-outline" id="evExport">' + UI.icon('download') + ' تصدير</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="evNew">' + UI.icon('plus') + ' تقييم جديد</button>' : '') +
        '</div></div>';

      html += '<div class="stats">' +
        UI.kpiCard({ label: 'متوسط الدرجات', icon: 'clipboard', value: avg === null ? '—' : UI.n(avg, 1), unit: 'من 100', foot: '<span>' + UI.n(M.evalOf(b, r.from, r.to).length) + ' بطاقة في الفترة</span>', progress: avg || 0, bad: avg !== null && avg < 70, warn: avg !== null && avg < 80 }) +
        UI.kpiCard({ label: 'أعلى تقييم', icon: 'award', value: best ? best.total : '—', unit: 'من 100', foot: '<span>' + UI.esc(best ? UI.branchName(best.branchId) : '—') + '</span>', progress: best ? best.total : 0 }) +
        UI.kpiCard({ label: 'أدنى تقييم', icon: 'alert', value: worst ? worst.total : '—', unit: 'من 100', foot: '<span>' + UI.esc(worst ? UI.branchName(worst.branchId) : '—') + '</span>', progress: worst ? worst.total : 0, bad: worst && worst.total < 70 }) +
        UI.kpiCard({ label: 'بطاقات ممتازة', icon: 'star', value: UI.n(dist[0].n), unit: 'بطاقة', foot: '<span>من ' + UI.n(list.length) + ' بعد الفلترة</span>', progress: list.length ? dist[0].n / list.length * 100 : 0 }) +
        '</div>';

      /* المرجعية */
      html += '<div class="grid grid-main mb-2">';
      html += '<div class="card"><div class="card-head"><h3>عناصر البطاقة والأوزان</h3><div class="tools"><span class="sub">مجموع الأوزان 100</span></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr><th>البند</th><th>الوزن</th><th>الأداء في الفترة</th></tr></thead><tbody>';
      C.EVAL_ITEMS.forEach(function (it) {
        var vals = M.evalOf(b, r.from, r.to).map(function (x) { return x.items[it.key] || 0; });
        var av = vals.length ? U.avg(vals) : 0;
        var pct = it.weight ? av / it.weight * 100 : 0;
        html += '<tr><td>' + UI.esc(it.name) + '</td><td class="num">' + it.weight + '</td>' +
          '<td style="min-width:170px"><div style="display:flex;align-items:center;gap:9px"><div class="progress ' + (pct < 70 ? 'red' : pct < 85 ? 'amber' : '') + '" style="flex:1;height:6px"><span style="width:' + pct + '%"></span></div>' +
          '<span class="num small">' + UI.n(av, 1) + '/' + it.weight + '</span></div></td></tr>';
      });
      html += '<tr style="background:#f7faf8"><td><b>الإجمالي</b></td><td class="num"><b>100</b></td><td><b>' + (avg === null ? '—' : UI.n(avg, 1) + ' / 100') + '</b></td></tr>';
      html += '</tbody></table></div></div>';

      html += '<div class="card"><div class="card-head"><h3>تصنيف النتائج والإجراء</h3></div><div class="card-body">' +
        '<div style="display:grid;gap:10px">';
      C.CLASSIFICATION.forEach(function (c) {
        html += '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--line-2);border-radius:11px">' +
          '<span class="badge ' + c.tone + '">' + c.label + '</span>' +
          '<span class="small muted">' + c.min + '–' + c.max + ' درجة</span>' +
          '<span class="small" style="margin-inline-start:auto;text-align:end">' + UI.esc(c.action) + '</span></div>';
      });
      html += '</div><div class="note-box mt-2 small">تُعتمد البطاقة كأداة تطوير ودعم، لا كأداة عقاب. ترتبط نتائجها بخطط التدريب والتحسين وبالتقييم السنوي للأداء.</div></div></div>';
      html += '</div>';

      /* القائمة */
      html += '<div class="card"><div class="card-head"><h3>سجل بطاقات التقييم <span class="sub">(' + UI.n(list.length) + ')</span></h3>' +
        '<div class="tools"><div class="search" style="width:220px;position:relative"><span style="position:absolute;inset-inline-start:10px;top:50%;transform:translateY(-50%);color:#90a49b">' + UI.icon('search') + '</span>' +
        '<input type="text" id="evQ" value="' + UI.esc(f.q) + '" placeholder="بحث بالفرع أو المقيّم" style="padding-inline-start:34px"></div>' +
        '<select id="evCls" style="width:auto;min-width:140px"><option value="">كل التصنيفات</option>' +
        C.CLASSIFICATION.map(function (c) { return '<option value="' + c.label + '"' + (f.cls === c.label ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') +
        '</select></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr>' +
        '<th>التاريخ</th><th>الفرع / الإدارة</th><th>المقيّم</th><th>الدرجة</th><th>التصنيف</th><th>الإجراء المقترح</th><th>ملاحظات</th><th></th>' +
        '</tr></thead><tbody>';
      if (!list.length) html += UI.tableEmptyRow(8, 'لا توجد بطاقات تقييم مطابقة');
      list.slice(0, 200).forEach(function (x) {
        var c = M.rating(x.total);
        html += '<tr><td>' + UI.date(x.date) + '</td>' +
          '<td><b>' + UI.esc(UI.branchName(x.branchId)) + '</b></td>' +
          '<td class="sub">' + UI.esc(x.evaluator) + '</td>' +
          '<td><span class="num" dir="ltr" style="font-size:14px">' + x.total + ' / 100</span></td>' +
          '<td>' + UI.badge(c.label, c.tone) + '</td>' +
          '<td class="sub">' + UI.esc(c.action) + '</td>' +
          '<td class="wrap sub">' + UI.esc(x.notes || '—') + '</td>' +
          '<td><div class="row-actions"><button class="btn btn-ghost btn-xs" data-view="' + x.id + '">' + UI.icon('eye') + ' عرض</button>' +
          (App.can('write') ? '<button class="btn btn-ghost btn-xs" data-del="' + x.id + '">' + UI.icon('trash') + '</button>' : '') + '</div></td></tr>';
      });
      html += '</tbody></table></div></div>';

      return html;
    },
    mount: function (root) {
      var self = this;
      var after = function () { App.refresh(); };
      var btn = root.querySelector('#evNew');
      if (btn) btn.addEventListener('click', function () { evalModal(null, after); });
      root.querySelector('#evExport').addEventListener('click', function () {
        var r = App.range();
        var list = M.evalOf(App.state.branchId, r.from, r.to);
        UI.csv('بطاقات-تقييم-الجودة-' + U.todayISO(), ['التاريخ', 'الفرع', 'المقيّم', 'الدرجة', 'التصنيف'].concat(C.EVAL_ITEMS.map(function (i) { return i.name; })).concat(['ملاحظات']),
          list.map(function (x) {
            return [x.date, UI.branchName(x.branchId), x.evaluator, x.total, M.rating(x.total).label]
              .concat(C.EVAL_ITEMS.map(function (i) { return x.items[i.key] || 0; }))
              .concat([x.notes || '']);
          }));
      });
      var q = root.querySelector('#evQ');
      if (q) q.addEventListener('input', function () { V.filters.q = this.value; App.refresh(); requestAnimationFrame(function () { var el = document.getElementById('evQ'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }); });
      var cl = root.querySelector('#evCls');
      if (cl) cl.addEventListener('change', function () { V.filters.cls = this.value; App.refresh(); });
      root.querySelectorAll('[data-view]').forEach(function (b2) {
        b2.addEventListener('click', function () {
          var ev = K.Store.data.evaluations.filter(function (x) { return x.id === b2.getAttribute('data-view'); })[0];
          if (ev) detailModal(ev, after);
        });
      });
      root.querySelectorAll('[data-del]').forEach(function (b2) {
        b2.addEventListener('click', function () {
          confirmDelete(K.Store.data.evaluations, b2.getAttribute('data-del'), 'بطاقة التقييم', after);
        });
      });
    }
  };
})(window.KAK);
