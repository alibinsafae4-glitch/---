/* الملاحظات والإجراءات التصحيحية */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { filters: { q: '', sev: '', status: '', cat: '' } };

  function sevOf(key) { return C.SEVERITY.filter(function (s) { return s.key === key; })[0] || C.SEVERITY[2]; }
  function dueFrom(sevKey, iso) {
    var s = sevOf(sevKey);
    return U.addDays(iso, s.hours ? 1 : s.days);
  }

  function formHtml(f, isNew) {
    var statusOpts = Object.keys(C.FINDING_STATUS).map(function (k) { return { value: k, label: C.FINDING_STATUS[k].label }; });
    return '<form id="fnForm"><div class="form-grid">' +
      UI.field('وصف الملاحظة', UI.input('desc', f.desc, { req: true, placeholder: 'وصف دقيق وقابل للقياس' }), { span: true, req: true }) +
      UI.field('الفرع / الإدارة', UI.select('branchId', UI.branchOptions(false, false), f.branchId, { req: true }), { req: true }) +
      UI.field('الإدارة المسؤولة', UI.select('departmentId', UI.deptOptions(), f.departmentId)) +
      UI.field('تصنيف الملاحظة', UI.select('category', C.FINDING_CATEGORIES, f.category)) +
      UI.field('تاريخ الكشف', UI.input('foundDate', f.foundDate, { type: 'date', req: true }), { req: true }) +
      UI.field('درجة الخطورة', UI.select('severity', C.SEVERITY.map(function (s) { return { value: s.key, label: s.label + ' — ' + s.sla }; }), f.severity, { req: true }), { req: true, hint: 'تحدد المهلة الزمنية للمعالجة' }) +
      UI.field('تاريخ الإنجاز المستهدف', UI.input('dueDate', f.dueDate, { type: 'date' })) +
      UI.field('ملاحظة المصدر', UI.select('source', ['تفتيش ميداني', 'شكوى عميل', 'مراجعة داخلية', 'متابعة لجنة الجودة', 'بلاغ موظف', 'مراقبة مؤشرات'], f.source)) +
      UI.field('السبب الجذري', UI.textarea('rootCause', f.rootCause, { rows: 2 }), { span: true }) +
      UI.field('الإجراء التصحيحي', UI.textarea('action', f.action, { rows: 2 }), { span: true }) +
      UI.field('المسؤول عن التنفيذ', UI.input('responsible', f.responsible)) +
      UI.field('طريقة التحقق', UI.select('verifyMethod', ['إعادة تفتيش ميداني', 'مراجعة مستندات', 'اختبار عينة معاملات', 'تقرير من مدير الفرع', 'متابعة عبر النظام'], f.verifyMethod)) +
      UI.field('حالة الإغلاق', UI.select('status', statusOpts, f.status || 'open')) +
      UI.field('تاريخ الإغلاق', UI.input('closedDate', f.closedDate, { type: 'date' })) +
      '</div></form>';
  }

  function openForm(existing, after) {
    if (!App.can('write')) { UI.toast('لا تملك صلاحية تسجيل الملاحظات', 'err'); return; }
    var isNew = !existing;
    var f = existing || {
      branchId: App.state.branchId || 'b2', departmentId: C.DEPARTMENTS[0], category: C.FINDING_CATEGORIES[0],
      foundDate: U.todayISO(), severity: 'medium', desc: '', rootCause: '', action: '', responsible: 'مدير الفرع',
      verifyMethod: 'إعادة تفتيش ميداني', status: 'open', source: 'تفتيش ميداني', closedDate: '', dueDate: ''
    };
    if (isNew) f.dueDate = dueFrom(f.severity, f.foundDate);

    UI.modal({
      title: isNew ? 'تسجيل ملاحظة / إجراء تصحيحي' : 'تعديل الملاحظة',
      sub: 'كل ملاحظة تُوثَّق بالحالة والمسؤول والمهلة وطريقة التحقق',
      size: 'wide',
      body: formHtml(f, isNew),
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="fnSave">حفظ الملاحظة</button>',
      onMount: function (wrap, close) {
        var form = wrap.querySelector('#fnForm');
        var sev = form.querySelector('[name=severity]');
        var found = form.querySelector('[name=foundDate]');
        var due = form.querySelector('[name=dueDate]');
        due.value = f.dueDate || dueFrom(sev.value, found.value || U.todayISO());
        sev.addEventListener('change', function () { due.value = dueFrom(sev.value, found.value || U.todayISO()); });
        found.addEventListener('change', function () { due.value = dueFrom(sev.value, found.value || U.todayISO()); });

        wrap.querySelector('#fnSave').addEventListener('click', function () {
          var v = UI.formValues(form);
          if (!v.desc || !v.branchId) { UI.toast('الوصف والفرع مطلوبان', 'err'); return; }
          if (v.status === 'closed' && !v.closedDate) v.closedDate = U.todayISO();
          var payload = {
            desc: v.desc, branchId: v.branchId, departmentId: v.departmentId, category: v.category,
            foundDate: v.foundDate, severity: v.severity, dueDate: v.dueDate || dueFrom(v.severity, v.foundDate),
            rootCause: v.rootCause, action: v.action, responsible: v.responsible, verifyMethod: v.verifyMethod,
            status: v.status, closedDate: v.status === 'closed' ? v.closedDate : null,
            source: v.source, refInspection: f.refInspection || null, refComplaint: f.refComplaint || null
          };
          if (isNew) { payload.id = U.uid('fn'); K.Store.data.findings.push(payload); }
          else { Object.assign(existing, payload); }
          K.Store.save(); close();
          UI.toast(isNew ? 'تم تسجيل الملاحظة وتحديد مهلة المعالجة' : 'تم تحديث الملاحظة');
          after();
        });
      }
    });
  }

  function closeModal(f, after) {
    UI.modal({
      title: 'إغلاق الملاحظة',
      sub: UI.esc(f.desc),
      body: '<form id="fncForm"><div class="form-grid">' +
        UI.field('الإجراء المنجز', UI.textarea('action', f.action, { rows: 2, placeholder: 'ما تم تنفيذه فعليًا' }), { span: true }) +
        UI.field('طريقة التحقق', UI.select('verifyMethod', ['إعادة تفتيش ميداني', 'مراجعة مستندات', 'اختبار عينة معاملات', 'تقرير من مدير الفرع', 'متابعة عبر النظام'], f.verifyMethod)) +
        UI.field('تاريخ الإغلاق', UI.input('closedDate', U.todayISO(), { type: 'date', req: true })) +
        '</div><div class="note-box gold small mt-2">لا تُغلق الملاحظة إلا بعد التحقق من فعالية الإجراء، ويُعاد فتحها عند تكرار المشكلة.</div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="fncSave">تأكيد الإغلاق</button>',
      onMount: function (wrap, close) {
        wrap.querySelector('#fncSave').addEventListener('click', function () {
          var v = UI.formValues(wrap.querySelector('#fncForm'));
          if (!v.action) { UI.toast('يرجى توثيق الإجراء المنجز قبل الإغلاق', 'err'); return; }
          Object.assign(f, { action: v.action, verifyMethod: v.verifyMethod, closedDate: v.closedDate || U.todayISO(), status: 'closed' });
          K.Store.save(); close();
          UI.toast('تم إغلاق الملاحظة وتوثيق التحقق');
          after();
        });
      }
    });
  }

  function detailModal(f, after) {
    var t = U.todayISO();
    var late = f.status !== 'closed' && f.dueDate < t;
    var s = sevOf(f.severity);
    var rec = M.isRecurring(f);
    UI.modal({
      title: 'تفاصيل الملاحظة',
      sub: UI.branchName(f.branchId) + ' · ' + UI.date(f.foundDate),
      body: '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
        UI.severityBadge(f.severity) + UI.statusBadge(C.FINDING_STATUS, f.status) +
        (rec ? UI.badge('ملاحظة متكررة', 'b-red') : '') +
        (late ? UI.badge('تجاوزت المهلة ' + Math.abs(U.diffDays(t, f.dueDate)) + ' يومًا', 'b-red') : '') + '</div>' +
        '<h3 style="font-size:15px;margin-bottom:8px">' + UI.esc(f.desc) + '</h3>' +
        '<div class="report-meta">' + meta('الفرع', UI.branchName(f.branchId)) + meta('الإدارة', f.departmentId) +
        meta('التصنيف', f.category) + meta('خطورة', s.label + ' — ' + s.desc) + meta('تاريخ الكشف', UI.date(f.foundDate)) +
        meta('الاستحقاق', UI.date(f.dueDate)) + meta('المسؤول', f.responsible) + meta('طريقة التحقق', f.verifyMethod) + '</div>' +
        '<hr class="sep"><div class="grid grid-2" style="gap:16px">' +
        '<div><h4 style="font-size:13px;margin-bottom:6px">السبب الجذري</h4><p class="small">' + UI.esc(f.rootCause || '— لم يُحدد —') + '</p></div>' +
        '<div><h4 style="font-size:13px;margin-bottom:6px">الإجراء التصحيحي</h4><p class="small">' + UI.esc(f.action || '— لم يُوثّق —') + '</p></div></div>' +
        (f.closedDate ? '<div class="note-box mt-2 small">تم الإغلاق في ' + UI.date(f.closedDate) + ' بعد تحقق بطريقة: ' + UI.esc(f.verifyMethod) + '.</div>' : ''),
      footer: '<button class="btn btn-outline" data-close>إغلاق</button>' +
        (App.can('write') && f.status !== 'closed' ? '<button class="btn btn-gold" id="fnClose2">إغلاق الملاحظة</button>' : '') +
        (App.can('write') ? '<button class="btn btn-primary" id="fnEdit2">' + UI.icon('edit') + ' تعديل</button>' : ''),
      onMount: function (wrap, close) {
        var a = wrap.querySelector('#fnEdit2');
        if (a) a.addEventListener('click', function () { close(); openForm(f, after); });
        var b = wrap.querySelector('#fnClose2');
        if (b) b.addEventListener('click', function () { close(); closeModal(f, after); });
      }
    });
  }
  function meta(k, v) { return '<div><span>' + UI.esc(k) + '</span>' + UI.esc(v || '—') + '</div>'; }

  K.views.findings = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range(); var b = App.state.branchId; var f = V.filters; var t = U.todayISO();
      var all = M.findingsOf(b, r.from, r.to).slice().sort(function (x, y) { return x.foundDate < y.foundDate ? 1 : -1; });
      var st = M.findingStats(b, r.from, r.to);
      var mttr = (function () {
        var closed = all.filter(function (x) { return x.closedDate; }).map(function (x) { return Math.max(0, U.diffDays(x.foundDate, x.closedDate)); });
        return closed.length ? U.avg(closed) : null;
      })();
      var list = all.slice();
      if (f.q) list = list.filter(function (x) { return (x.desc + ' ' + x.category + ' ' + x.responsible + ' ' + UI.branchName(x.branchId)).toLowerCase().indexOf(f.q.toLowerCase()) > -1; });
      if (f.sev) list = list.filter(function (x) { return x.severity === f.sev; });
      if (f.status === 'overdue') list = list.filter(function (x) { return x.status !== 'closed' && x.dueDate < t; });
      else if (f.status) list = list.filter(function (x) { return x.status === f.status; });
      if (f.cat) list = list.filter(function (x) { return x.category === f.cat; });

      var bySev = M.findingsBySeverity(b, r.from, r.to);
      var html = '';
      html += '<div class="page-head"><div><h1>الملاحظات والإجراءات التصحيحية</h1>' +
        '<div class="desc">سجل موحد للملاحظات: الوصف، الفرع، تاريخ الكشف، الخطورة، السبب الجذري، الإجراء، المسؤول، تاريخ الإنجاز، طريقة التحقق، حالة الإغلاق.</div></div>' +
        '<div class="actions"><button class="btn btn-outline" id="fnExport">' + UI.icon('download') + ' تصدير</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="fnNew">' + UI.icon('plus') + ' ملاحظة جديدة</button>' : '') + '</div></div>';

      html += '<div class="stats stats-6">' +
        UI.kpiCard({ label: 'إجمالي الملاحظات', icon: 'alert', value: UI.n(st.total), unit: 'ملاحظة', foot: '<span>منها ' + st.critical + ' حرجة</span>', progress: st.total ? 100 : 0 }) +
        UI.kpiCard({ label: 'مفتوحة', icon: 'clock', value: UI.n(st.open), unit: 'ملاحظة', foot: '<span>قيد المعالجة والمتابعة</span>', progress: st.total ? st.open / st.total * 100 : 0, warn: st.open > 0 }) +
        UI.kpiCard({ label: 'متأخرة عن المهلة', icon: 'down', value: UI.n(st.overdue), unit: 'ملاحظة', foot: '<span>' + (st.overdue ? 'تحتاج تدخلًا عاجلًا' : 'لا يوجد تأخير') + '</span>', progress: st.total ? st.overdue / st.total * 100 : 0, bad: st.overdue > 0 }) +
        UI.kpiCard({ label: 'نسبة الإغلاق', icon: 'checkc', value: st.total ? UI.n(st.closureRate, 1) : '—', unit: '%', foot: '<span>الهدف 90%</span>', progress: st.closureRate || 0, bad: st.total > 0 && st.closureRate < 80 }) +
        UI.kpiCard({ label: 'نسبة التكرار', icon: 'refresh', value: st.total ? UI.n(st.repeatRate, 1) : '—', unit: '%', foot: '<span>ملاحظات متكررة في نفس الفرع</span>', progress: st.repeatRate || 0, warn: st.repeatRate > 15 }) +
        UI.kpiCard({ label: 'متوسط زمن الإغلاق', icon: 'clock', value: mttr === null ? '—' : UI.n(mttr, 1), unit: 'يوم', foot: '<span>من الكشف إلى الإغلاق</span>', progress: mttr === null ? 0 : Math.min(100, mttr / 15 * 100) }) +
        '</div>';

      html += '<div class="toolbar">' +
        '<div class="search" style="max-width:300px">' + UI.icon('search') + '<input type="text" id="fnQ" value="' + UI.esc(f.q) + '" placeholder="بحث في الوصف أو المسؤول"></div>' +
        '<select id="fnSev" style="width:auto;min-width:140px"><option value="">كل الدرجات</option>' +
        C.SEVERITY.map(function (s) { return '<option value="' + s.key + '"' + (f.sev === s.key ? ' selected' : '') + '>' + s.label + '</option>'; }).join('') + '</select>' +
        '<select id="fnStatus" style="width:auto;min-width:150px"><option value="">كل الحالات</option>' +
        '<option value="open"' + (f.status === 'open' ? ' selected' : '') + '>مفتوحة</option>' +
        '<option value="progress"' + (f.status === 'progress' ? ' selected' : '') + '>قيد المعالجة</option>' +
        '<option value="closed"' + (f.status === 'closed' ? ' selected' : '') + '>مغلقة</option>' +
        '<option value="overdue"' + (f.status === 'overdue' ? ' selected' : '') + '>متأخرة</option></select>' +
        '<select id="fnCat" style="width:auto;min-width:170px"><option value="">كل التصنيفات</option>' +
        C.FINDING_CATEGORIES.map(function (c) { return '<option value="' + c + '"' + (f.cat === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>' +
        '<div class="spacer"></div><span class="small muted">' + UI.n(list.length) + ' نتيجة</span></div>';

      html += '<div class="card"><div class="table-wrap" style="border:0;border-radius:14px"><table class="tbl"><thead><tr>' +
        '<th>الملاحظة</th><th>الفرع</th><th>الخطورة</th><th>الكشف / الاستحقاق</th><th>الحالة</th><th></th>' +
        '</tr></thead><tbody>';
      if (!list.length) html += UI.tableEmptyRow(6, 'لا توجد ملاحظات مطابقة');
      list.slice(0, 150).forEach(function (x) {
        var late = x.status !== 'closed' && x.dueDate < t;
        var rec = M.isRecurring(x);
        html += '<tr><td class="wrap" style="min-width:250px"><b style="font-weight:600">' + UI.esc(x.desc) + '</b>' +
          '<div class="sub">' + UI.esc(x.category) + ' · ' + UI.esc(x.responsible) + (rec ? ' · <span style="color:#b42318">متكررة</span>' : '') + '</div></td>' +
          '<td>' + UI.esc(UI.branchName(x.branchId).replace('فرع ', '')) + '</td>' +
          '<td>' + UI.severityBadge(x.severity) + '</td>' +
          '<td class="nowrap-cell"><span class="small">' + UI.date(x.foundDate, { noYear: true }) + '</span><div class="sub">' +
          (late ? '<span style="color:#b42318;font-weight:700">متأخرة ' + Math.abs(U.diffDays(t, x.dueDate)) + ' يوم</span>' :
            'تُستحق ' + UI.date(x.dueDate, { noYear: true })) + '</div></td>' +
          '<td>' + UI.statusBadge(C.FINDING_STATUS, x.status) + '</td>' +
          '<td><div class="row-actions"><button class="btn btn-ghost btn-xs" data-open="' + x.id + '">' + UI.icon('eye') + '</button>' +
          (App.can('write') && x.status !== 'closed' ? '<button class="btn btn-ghost btn-xs" data-close-fn="' + x.id + '" title="إغلاق">' + UI.icon('check') + '</button>' : '') +
          (App.can('write') ? '<button class="btn btn-ghost btn-xs" data-del="' + x.id + '">' + UI.icon('trash') + '</button>' : '') + '</div></td></tr>';
      });
      html += '</tbody></table></div></div>';

      html += '<div class="grid grid-3 mt-2">';
      html += '<div class="card"><div class="card-head"><h3>التوزيع حسب الخطورة</h3></div><div class="card-body">' +
        UI.charts.donut(bySev, { centerValue: UI.n(st.total), centerLabel: 'ملاحظة', size: 128 }) +
        (st.openList.filter(function (x) { return x.severity === 'critical'; }).length
          ? '<div class="note-box red small mt-2">' + UI.icon('alert') + ' توجد ' + st.openList.filter(function (x) { return x.severity === 'critical'; }).length + ' ملاحظة حرجة مفتوحة — مهلة المعالجة 24 ساعة وتُرفع للجنة الجودة.</div>'
          : '<div class="note-box small mt-2">' + UI.icon('checkc') + ' لا توجد ملاحظات حرجة مفتوحة حاليًا.</div>') +
        '</div></div>';
      html += '<div class="card"><div class="card-head"><h3>مهل المعالجة حسب الخطورة</h3></div><div class="card-body" style="padding-top:10px">' +
        C.SEVERITY.map(function (s) {
          var n = st.openList.filter(function (x) { return x.severity === s.key; }).length;
          return '<div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--line-2)">' +
            UI.badge(s.label, s.tone) + '<span class="small muted" style="flex:1">' + UI.esc(s.desc) + '</span>' +
            '<span class="small strong" style="white-space:nowrap">' + s.sla + '</span>' +
            (n ? ' <span class="badge b-gray">' + n + '</span>' : '') + '</div>';
        }).join('') + '</div></div>';
      html += '<div class="card card-pad"><div class="note-box gold small">' + UI.icon('info') +
        ' الملاحظة المتكررة تُرفع تلقائيًا في درجة الخطورة وتُعرض على لجنة الجودة، ويُعاد فتح الملاحظة المغلقة عند تكرار المشكلة.</div></div>';
      html += '</div>';

      return html;
    },
    mount: function (root) {
      var after = function () { App.refresh(); };
      var nb = root.querySelector('#fnNew');
      if (nb) nb.addEventListener('click', function () { openForm(null, after); });
      root.querySelector('#fnExport').addEventListener('click', function () {
        var r = App.range();
        var list = M.findingsOf(App.state.branchId, r.from, r.to);
        UI.csv('الملاحظات-والإجراءات-' + U.todayISO(),
          ['الملاحظة', 'الفرع', 'الإدارة', 'التصنيف', 'الخطورة', 'تاريخ الكشف', 'الاستحقاق', 'السبب الجذري', 'الإجراء', 'المسؤول', 'طريقة التحقق', 'الحالة', 'تاريخ الإغلاق'],
          list.map(function (x) {
            return [x.desc, UI.branchName(x.branchId), x.departmentId, x.category, sevOf(x.severity).label, x.foundDate, x.dueDate,
              x.rootCause || '', x.action || '', x.responsible, x.verifyMethod, C.FINDING_STATUS[x.status].label, x.closedDate || ''];
          }));
      });
      var q = root.querySelector('#fnQ');
      if (q) q.addEventListener('input', function () {
        V.filters.q = this.value; App.refresh();
        requestAnimationFrame(function () { var el = document.getElementById('fnQ'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
      });
      var sv = root.querySelector('#fnSev'); if (sv) sv.addEventListener('change', function () { V.filters.sev = this.value; App.refresh(); });
      var st = root.querySelector('#fnStatus'); if (st) st.addEventListener('change', function () { V.filters.status = this.value; App.refresh(); });
      var ct = root.querySelector('#fnCat'); if (ct) ct.addEventListener('change', function () { V.filters.cat = this.value; App.refresh(); });
      root.querySelectorAll('[data-open]').forEach(function (b) {
        b.addEventListener('click', function () {
          var x = K.Store.data.findings.filter(function (i) { return i.id === b.getAttribute('data-open'); })[0];
          if (x) detailModal(x, after);
        });
      });
      root.querySelectorAll('[data-close-fn]').forEach(function (b) {
        b.addEventListener('click', function () {
          var x = K.Store.data.findings.filter(function (i) { return i.id === b.getAttribute('data-close-fn'); })[0];
          if (x) closeModal(x, after);
        });
      });
      root.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmDelete('سيتم حذف الملاحظة نهائيًا.', function () {
            var arr = K.Store.data.findings;
            arr.splice(arr.findIndex(function (x) { return x.id === b.getAttribute('data-del'); }), 1);
            K.Store.save(); UI.toast('تم حذف الملاحظة'); after();
          });
        });
      });
    },
    openNew: function (prefill) {
      var after = function () { App.refresh(); };
      /* استخدام النموذج مع القيم المسبقة */
      if (prefill) {
        var f = {
          branchId: prefill.branchId || 'b2', departmentId: C.DEPARTMENTS[0], category: C.FINDING_CATEGORIES[0],
          foundDate: prefill.foundDate || U.todayISO(), severity: 'high', desc: '', rootCause: '', action: '',
          responsible: 'مدير الفرع', verifyMethod: 'إعادة تفتيش ميداني', status: 'open',
          source: prefill.source || 'تفتيش ميداني', closedDate: '', dueDate: '',
          refInspection: prefill.refInspection || null
        };
        f.dueDate = dueFrom(f.severity, f.foundDate);
        openForm(f, after);
      } else openForm(null, after);
    },
    openDetail: function (id) {
      var x = K.Store.data.findings.filter(function (i) { return i.id === id; })[0];
      if (x) detailModal(x, function () { App.refresh(); });
    }
  };
})(window.KAK);
