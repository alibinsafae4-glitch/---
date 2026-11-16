/* سجل الشكاوى */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { filters: { q: '', type: '', status: '' } };

  function typeDef(label) {
    return C.COMPLAINT_TYPES.filter(function (t) { return t.label === label; })[0] || C.COMPLAINT_TYPES[1];
  }
  function addWorkDays(iso, n) {
    var d = U.parseISO(iso), added = 0;
    while (added < n) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay(); /* 5=جمعة 6=سبت */
      if (wd !== 5 && wd !== 6) added++;
    }
    return U.toISO(d);
  }
  function nextRef() {
    var year = new Date().getFullYear();
    var max = 0;
    K.Store.data.complaints.forEach(function (c) {
      if (c.receivedDate.slice(0, 4) === String(year)) {
        var n = Number(String(c.refNo).split('-')[2]) || 0;
        if (n > max) max = n;
      }
    });
    return 'CMP-' + year + '-' + String(max + 1).padStart(4, '0');
  }

  function formHtml(c, isNew) {
    var branches = UI.branchOptions(false, false);
    var typeOpts = C.COMPLAINT_TYPES.map(function (t) { return { value: t.label, label: t.label + ' — ' + UI.slaText(t.sla) }; });
    return '<form id="cpForm">' +
      '<fieldset><legend>بيانات العميل والفرع</legend><div class="form-grid">' +
      UI.field('اسم العميل', UI.input('customerName', c.customerName, { req: true, placeholder: 'الاسم الكامل' }), { req: true }) +
      UI.field('رقم الحساب أو الهوية', UI.input('accountNo', c.accountNo, { placeholder: '****1234' })) +
      UI.field('الفرع', UI.select('branchId', branches, c.branchId, { req: true }), { req: true }) +
      UI.field('قناة استلام الشكوى', UI.select('channel', C.CHANNELS, c.channel)) +
      '</div></fieldset>' +
      '<fieldset><legend>بيانات الشكوى</legend><div class="form-grid">' +
      UI.field('نوع الشكوى', UI.select('type', typeOpts, c.type, { req: true }), { req: true, hint: 'يحدد النوع مهلة المعالجة تلقائيًا' }) +
      UI.field('تاريخ الاستلام', UI.input('receivedDate', c.receivedDate, { type: 'date', req: true }), { req: true }) +
      UI.field('موضوع الشكوى', UI.input('subject', c.subject, { req: true, placeholder: 'عنوان مختصر' }), { span: true, req: true }) +
      UI.field('وصف الشكوى', UI.textarea('description', c.description, { rows: 3, placeholder: 'تفاصيل ما حدث وطلبات العميل…' }), { span: true }) +
      '</div></fieldset>' +
      '<fieldset><legend>المعالجة والمهل</legend><div class="form-grid">' +
      UI.field('المسؤول عن المعالجة', UI.select('assignee', ['مسؤول خدمة العملاء', 'مدير الفرع', 'مسؤول العمليات', 'مسؤول الشكاوى', 'مسؤول الالتزام', 'مسؤول تقنية المعلومات'], c.assignee)) +
      UI.field('حالة الشكوى', UI.select('status', [{ value: 'new', label: 'مفتوحة' }, { value: 'progress', label: 'قيد المعالجة' }, { value: 'closed', label: 'مغلقة' }], c.status || 'new')) +
      UI.field('تاريخ الاستحقاق (وفق المهلة)', UI.input('dueDate', c.dueDate, { type: 'date' }), { hint: 'يُحسب تلقائيًا من نوع الشكوى ويمكن تعديله' }) +
      UI.field('تاريخ الرد على العميل', UI.input('responseDate', c.responseDate, { type: 'date' })) +
      '</div></fieldset>' +
      '<fieldset><legend>الإغلاق والإجراء التصحيحي</legend><div class="form-grid">' +
      UI.field('الإجراء المتخذ', UI.textarea('action', c.action, { rows: 2 }), { span: true }) +
      UI.field('السبب الجذري', UI.textarea('rootCause', c.rootCause, { rows: 2, placeholder: 'تحليل السبب الجذري (يُستكمل عند الإغلاق)' }), { span: true }) +
      UI.field('إجراء منع التكرار', UI.textarea('preventiveAction', c.preventiveAction, { rows: 2 }), { span: true }) +
      UI.field('تاريخ الإغلاق', UI.input('closedDate', c.closedDate, { type: 'date' })) +
      UI.field('رضا العميل عن الحل', UI.select('satisfaction', [{ value: '', label: 'لم يُحدد' }, { value: 'راضٍ', label: 'راضٍ' }, { value: 'غير راضٍ', label: 'غير راضٍ' }], c.satisfaction)) +
      '</div></fieldset>' +
      '</form>';
  }

  function openForm(existing, after) {
    if (!App.can('complaints.write')) { UI.toast('لا تملك صلاحية تسجيل الشكاوى', 'err'); return; }
    var isNew = !existing;
    var c = existing || {
      branchId: App.state.branchId || (App.state.user.role === 'branch' ? App.state.user.branchId : 'b2'),
      receivedDate: U.todayISO(), type: 'شكوى متوسطة', status: 'new', channel: 'مكتب خدمة العملاء',
      customerName: '', accountNo: '', subject: '', description: '', assignee: 'مسؤول خدمة العملاء',
      action: '', rootCause: '', preventiveAction: '', satisfaction: '', responseDate: '', closedDate: '',
      dueDate: addWorkDays(U.todayISO(), 3)
    };
    if (isNew) c.dueDate = addWorkDays(c.receivedDate, typeDef(c.type).sla);

    UI.modal({
      title: isNew ? 'تسجيل شكوى جديدة' : 'تعديل الشكوى ' + existing.refNo,
      sub: isNew ? 'سيتم إنشاء رقم مرجعي تلقائيًا وتطبيق المهلة حسب نوع الشكوى' : 'تحديث بيانات الشكوى وإجراءاتها',
      size: 'wide',
      body: formHtml(c, isNew),
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="cpSave">' + UI.icon('check') + ' حفظ الشكوى</button>',
      onMount: function (wrap, close) {
        var form = wrap.querySelector('#cpForm');
        var typeSel = form.querySelector('[name=type]');
        var recv = form.querySelector('[name=receivedDate]');
        var due = form.querySelector('[name=dueDate]');
        function syncDue(force) {
          if (!recv.value) return;
          if (!force && due.dataset.touched === '1') return;
          due.value = addWorkDays(recv.value, typeDef(typeSel.value).sla);
        }
        syncDue(true);
        typeSel.addEventListener('change', function () { syncDue(true); });
        recv.addEventListener('change', function () { syncDue(false); });
        due.addEventListener('change', function () { due.dataset.touched = '1'; });

        wrap.querySelector('#cpSave').addEventListener('click', function () {
          var f = UI.formValues(form);
          if (!f.customerName || !f.subject || !f.branchId) { UI.toast('يرجى إكمال الحقول الإلزامية (العميل، الموضوع، الفرع)', 'err'); return; }
          if (!f.receivedDate) { UI.toast('تاريخ الاستلام مطلوب', 'err'); return; }
          if (f.status === 'closed') {
            if (!f.action) { UI.toast('لا يمكن إغلاق الشكوى دون تسجيل الإجراء المتخذ', 'err'); return; }
            if (!f.closedDate) f.closedDate = U.todayISO();
            if (!f.responseDate) f.responseDate = f.closedDate;
          }
          var payload = {
            branchId: f.branchId, customerName: f.customerName, accountNo: f.accountNo, channel: f.channel,
            type: f.type, typeKey: typeDef(f.type).key, receivedDate: f.receivedDate, dueDate: f.dueDate || addWorkDays(f.receivedDate, typeDef(f.type).sla),
            subject: f.subject, description: f.description, assignee: f.assignee, status: f.status,
            action: f.action, rootCause: f.rootCause, preventiveAction: f.preventiveAction,
            satisfaction: f.satisfaction || null, responseDate: f.responseDate || null, closedDate: f.status === 'closed' ? f.closedDate : null,
            customerNotified: !!(f.responseDate || f.status === 'closed')
          };
          if (isNew) {
            payload.id = U.uid('cp');
            payload.refNo = nextRef();
            K.Store.data.complaints.push(payload);
          } else {
            Object.assign(existing, payload);
          }
          K.Store.save();
          close();
          UI.toast(isNew ? 'تم تسجيل الشكوى برقم ' + (payload.refNo || existing.refNo) : 'تم تحديث الشكوى');
          after();
        });
      }
    });
  }

  function closeModal(c, after) {
    UI.modal({
      title: 'إغلاق الشكوى ' + c.refNo,
      sub: 'يتطلب الإغلاق توثيق الإجراء والسبب الجذري ورضا العميل',
      body: '<form id="closeForm"><div class="form-grid">' +
        UI.field('الإجراء المتخذ', UI.textarea('action', c.action, { rows: 2, placeholder: 'ما تم تنفيذه لمعالجة الشكوى' }), { span: true }) +
        UI.field('السبب الجذري', UI.textarea('rootCause', c.rootCause, { rows: 2, placeholder: 'لماذا حدثت المشكلة؟' }), { span: true }) +
        UI.field('إجراء منع التكرار', UI.textarea('preventiveAction', c.preventiveAction, { rows: 2 }), { span: true }) +
        UI.field('تاريخ الإغلاق', UI.input('closedDate', c.closedDate || U.todayISO(), { type: 'date', req: true })) +
        UI.field('رضا العميل عن الحل', UI.select('satisfaction', [{ value: 'راضٍ', label: 'راضٍ' }, { value: 'غير راضٍ', label: 'غير راضٍ' }], c.satisfaction || 'راضٍ'), { req: true }) +
        '</div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="clSave">إغلاق الشكوى</button>',
      onMount: function (wrap, close) {
        wrap.querySelector('#clSave').addEventListener('click', function () {
          var f = UI.formValues(wrap.querySelector('#closeForm'));
          if (!f.action) { UI.toast('الإجراء المتخذ مطلوب للإغلاق', 'err'); return; }
          Object.assign(c, {
            action: f.action, rootCause: f.rootCause, preventiveAction: f.preventiveAction,
            closedDate: f.closedDate || U.todayISO(), satisfaction: f.satisfaction, status: 'closed',
            customerNotified: true, responseDate: c.responseDate || f.closedDate || U.todayISO()
          });
          K.Store.save();
          close();
          UI.toast('تم إغلاق الشكوى وتوثيق الإجراء');
          after();
        });
      }
    });
  }

  function detailModal(id, after) {
    var c = K.Store.data.complaints.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var t = U.todayISO();
    var late = c.status !== 'closed' && c.dueDate < t;
    var daysLeft = U.diffDays(t, c.dueDate);
    var stages = [
      { name: 'استلام الشكوى', done: true, meta: UI.date(c.receivedDate) },
      { name: 'تسجيلها برقم مرجعي', done: true, meta: c.refNo },
      { name: 'تصنيف نوع الشكوى', done: !!c.type, meta: c.type },
      { name: 'تحديد المسؤول عن المعالجة', done: !!c.assignee, meta: c.assignee || '' },
      { name: 'التحقيق في الشكوى', done: c.status !== 'new', meta: c.status === 'new' ? 'لم يبدأ' : 'جاري/منجز' },
      { name: 'اتخاذ الإجراء التصحيحي', done: !!c.action, meta: c.action ? 'موثق' : 'غير موثق' },
      { name: 'إبلاغ العميل بالنتيجة', done: !!c.responseDate || c.customerNotified, meta: c.responseDate ? UI.date(c.responseDate) : '' },
      { name: 'إغلاق الشكوى', done: c.status === 'closed', meta: c.closedDate ? UI.date(c.closedDate) : '' },
      { name: 'تحليل السبب الجذري', done: !!c.rootCause, meta: c.rootCause || '' },
      { name: 'منع تكرار المشكلة', done: !!c.preventiveAction, meta: c.preventiveAction || '' }
    ];
    var currentIdx = stages.findIndex(function (s) { return !s.done; });
    if (currentIdx === -1) currentIdx = stages.length - 1;

    var body = '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-bottom:16px">' +
      '<div><div class="small muted">الرقم المرجعي</div><div style="font-size:18px;font-weight:800">' + UI.esc(c.refNo) + '</div></div>' +
      '<div style="margin-inline-start:auto">' + UI.statusBadge(C.COMPLAINT_STATUS, c.status) + ' ' +
      (late ? UI.badge('متأخرة ' + Math.abs(daysLeft) + ' يومًا', 'b-red') : (c.status !== 'closed' ? UI.badge('متبقٍ ' + daysLeft + ' يومًا', 'b-amber') : UI.badge('أُغلقت في الوقت', 'b-green'))) + '</div></div>' +
      '<div class="report-meta" style="grid-template-columns:repeat(4,minmax(0,1fr))">' +
      meta('العميل', c.customerName) + meta('الحساب', c.accountNo) + meta('الفرع', UI.branchName(c.branchId)) +
      meta('نوع الشكوى', c.type) + meta('القناة', c.channel) + meta('المسؤول', c.assignee) +
      meta('الاستلام', UI.date(c.receivedDate)) + meta('الاستحقاق', UI.date(c.dueDate)) +
      '</div>' +
      '<hr class="sep">' +
      '<h4 style="font-size:13.5px;margin-bottom:8px">موضوع الشكوى</h4><p class="small">' + UI.esc(c.subject) + '</p>' +
      (c.description ? '<p class="small muted">' + UI.esc(c.description) + '</p>' : '') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px" class="grid-2">' +
      '<div><h4 style="font-size:13.5px;margin-bottom:10px">مسار معالجة الشكوى</h4><div class="stepper">' +
      stages.map(function (s, i) {
        var cls = s.done ? 'done' : (i === currentIdx ? 'current' : '');
        return '<div class="step ' + cls + '"><div class="dot">' + (s.done ? '✓' : (i + 1)) + '</div>' +
          '<div><div class="s-title">' + UI.esc(s.name) + '</div>' + (s.meta ? '<div class="s-meta">' + UI.esc(s.meta) + '</div>' : '') + '</div></div>';
      }).join('') + '</div></div>' +
      '<div><h4 style="font-size:13.5px;margin-bottom:10px">التوثيق</h4>' +
      doc('الإجراء المتخذ', c.action) + doc('السبب الجذري', c.rootCause) + doc('منع التكرار', c.preventiveAction) +
      doc('رضا العميل', c.satisfaction) + doc('تاريخ الرد', c.responseDate ? UI.date(c.responseDate) : '') +
      doc('تاريخ الإغلاق', c.closedDate ? UI.date(c.closedDate) : '') + '</div></div>';

    var canWrite = App.can('complaints.write');
    UI.modal({
      title: 'تفاصيل الشكوى',
      sub: UI.branchName(c.branchId) + ' · ' + UI.date(c.receivedDate),
      size: 'wide',
      body: body,
      footer: '<button class="btn btn-outline" data-close>إغلاق</button>' +
        (canWrite && c.status !== 'closed' ? '<button class="btn btn-gold" id="cpClose2">إغلاق الشكوى</button>' : '') +
        (canWrite ? '<button class="btn btn-primary" id="cpEdit2">' + UI.icon('edit') + ' تعديل</button>' : ''),
      onMount: function (wrap, close) {
        var e1 = wrap.querySelector('#cpEdit2');
        if (e1) e1.addEventListener('click', function () { close(); openForm(c, after); });
        var e2 = wrap.querySelector('#cpClose2');
        if (e2) e2.addEventListener('click', function () { close(); closeModal(c, after); });
      }
    });
  }

  function meta(k, v) { return '<div><span>' + UI.esc(k) + '</span>' + UI.esc(v || '—') + '</div>'; }
  function doc(k, v) {
    return '<div style="margin-bottom:10px"><div class="tiny muted">' + UI.esc(k) + '</div><div class="small">' + UI.esc(v || '— لم يُوثّق —') + '</div></div>';
  }

  K.views.complaints = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range(); var b = App.state.branchId; var f = V.filters; var t = U.todayISO();
      var all = M.complaintsOf(b, r.from, r.to).slice().sort(function (x, y) { return x.receivedDate < y.receivedDate ? 1 : -1; });
      var st = M.complaintStats(b, r.from, r.to);
      var list = all.slice();
      if (f.q) list = list.filter(function (c) { return (c.refNo + ' ' + c.customerName + ' ' + c.subject + ' ' + c.accountNo).toLowerCase().indexOf(f.q.toLowerCase()) > -1; });
      if (f.type) list = list.filter(function (c) { return c.type === f.type; });
      if (f.status) list = list.filter(function (c) { return c.status === f.status; });

      var html = '';
      html += '<div class="page-head"><div><h1>سجل الشكاوى المركزي</h1>' +
        '<div class="desc">استلام، تصنيف، إسناد، معالجة، وإغلاق الشكاوى — مع رقم مرجعي ومهلة زمنية لكل نوع، وتحليل السبب الجذري لمنع التكرار.</div></div>' +
        '<div class="actions"><button class="btn btn-outline" id="cpExport">' + UI.icon('download') + ' تصدير</button>' +
        (App.can('complaints.write') ? '<button class="btn btn-primary" id="cpNew">' + UI.icon('plus') + ' شكوى جديدة</button>' : '') + '</div></div>';

      html += '<div class="stats">' +
        UI.kpiCard({ label: 'إجمالي الشكاوى', icon: 'message', value: UI.n(st.total), unit: 'شكوى', foot: '<span>' + UI.esc(r.label) + '</span>', progress: st.total ? 100 : 0 }) +
        UI.kpiCard({ label: 'مفتوحة / قيد المعالجة', icon: 'clock', value: UI.n(st.open), unit: 'شكوى', foot: '<span>' + (st.overdue ? '<span class="delta down">' + st.overdue + ' متأخرة</span>' : 'ضمن المهل') + '</span>', progress: st.total ? st.open / st.total * 100 : 0, warn: st.open > 0, bad: st.overdue > 0 }) +
        UI.kpiCard({ label: 'مغلقة', icon: 'checkc', value: UI.n(st.closed), unit: 'شكوى', foot: '<span>نسبة الحل ' + (st.total ? UI.pct(st.resolutionRate) : '—') + '</span>', progress: st.total ? st.closed / st.total * 100 : 0 }) +
        UI.kpiCard({ label: 'متوسط زمن الحل', icon: 'clock', value: st.closed ? UI.n(st.avgDays, 1) : '—', unit: 'يوم', foot: '<span>الهدف أقل من 5 أيام</span>', progress: st.closed ? Math.min(100, st.avgDays / 5 * 100) : 0, bad: st.closed > 0 && st.avgDays > 5 }) +
        UI.kpiCard({ label: 'رضا العملاء عن الحل', icon: 'star', value: st.closed ? UI.n(st.satisfactionRate, 1) : '—', unit: '%', foot: '<span>من ' + UI.n(st.closed) + ' شكوى مغلقة</span>', progress: st.satisfactionRate || 0 }) +
        '</div>';

      /* فلاتر */
      html += '<div class="toolbar">' +
        '<div class="search" style="max-width:320px">' + UI.icon('search') + '<input type="text" id="cpQ" value="' + UI.esc(f.q) + '" placeholder="بحث بالرقم المرجعي أو العميل أو الموضوع"></div>' +
        '<select id="cpType" style="width:auto;min-width:170px"><option value="">كل الأنواع</option>' +
        C.COMPLAINT_TYPES.map(function (x) { return '<option value="' + x.label + '"' + (f.type === x.label ? ' selected' : '') + '>' + x.label + '</option>'; }).join('') + '</select>' +
        '<select id="cpStatus" style="width:auto;min-width:150px"><option value="">كل الحالات</option>' +
        Object.keys(C.COMPLAINT_STATUS).map(function (k2) { return '<option value="' + k2 + '"' + (f.status === k2 ? ' selected' : '') + '>' + C.COMPLAINT_STATUS[k2].label + '</option>'; }).join('') + '</select>' +
        '<div class="spacer"></div><span class="small muted">' + UI.n(list.length) + ' نتيجة</span></div>';

      /* جدول */
      html += '<div class="card"><div class="table-wrap" style="border:0;border-radius:14px"><table class="tbl"><thead><tr>' +
        '<th>الرقم المرجعي</th><th>العميل</th><th>الفرع</th><th>النوع</th><th>الموضوع</th><th>الاستحقاق</th><th>الحالة</th><th></th>' +
        '</tr></thead><tbody>';
      if (!list.length) html += UI.tableEmptyRow(8, 'لا توجد شكاوى مطابقة للفلاتر');
      list.slice(0, 150).forEach(function (c) {
        var late = c.status !== 'closed' && c.dueDate < t;
        var left = U.diffDays(t, c.dueDate);
        html += '<tr><td><b class="num">' + UI.esc(c.refNo) + '</b><div class="sub">' + UI.date(c.receivedDate, { noYear: true }) + '</div></td>' +
          '<td>' + UI.esc(c.customerName) + '<div class="sub">' + UI.esc(c.channel) + '</div></td>' +
          '<td>' + UI.esc(UI.branchName(c.branchId).replace('فرع ', '')) + '</td>' +
          '<td class="sub">' + UI.esc(c.type) + '</td>' +
          '<td class="wrap"><b style="font-weight:600">' + UI.esc(c.subject) + '</b><div class="sub">' + UI.esc(c.assignee) +
          (c.satisfaction ? ' · ' + UI.esc(c.satisfaction) : '') + '</div></td>' +
          '<td class="nowrap-cell">' + (c.status === 'closed' ? '<span class="sub">أُغلقت ' + UI.date(c.closedDate, { noYear: true }) + '</span>' :
            (late ? UI.badge('متأخرة ' + Math.abs(left) + ' يوم', 'b-red') : '<span class="small">' + UI.date(c.dueDate, { noYear: true }) + '</span>')) + '</td>' +
          '<td>' + UI.statusBadge(C.COMPLAINT_STATUS, c.status) + '</td>' +
          '<td><div class="row-actions"><button class="btn btn-ghost btn-xs" data-open="' + c.id + '">' + UI.icon('eye') + ' عرض</button>' +
          (App.can('complaints.write') && c.status !== 'closed' ? '<button class="btn btn-ghost btn-xs" data-close-cp="' + c.id + '">إغلاق</button>' : '') +
          '</div></td></tr>';
      });
      html += '</tbody></table></div></div>';
      if (list.length > 150) html += '<p class="small muted center mt-1">يتم عرض أحدث 150 شكوى — استخدم الفلاتر أو التصدير لعرض الكل.</p>';

      /* المهل ودورة المعالجة */
      html += '<div class="grid grid-2 mt-2">';
      html += '<div class="card"><div class="card-head"><h3>المهل المقترحة لكل نوع شكوى</h3></div><div class="card-body">' +
        '<table class="tbl" style="white-space:normal"><thead><tr><th>نوع الشكوى</th><th>مدة المعالجة</th><th>المتأخرة حاليًا</th></tr></thead><tbody>';
      C.COMPLAINT_TYPES.forEach(function (tt) {
        var n = st.openList.filter(function (c2) { return c2.typeKey === tt.key && c2.dueDate < t; }).length;
        html += '<tr><td>' + tt.label + '</td><td>' + UI.slaText(tt.sla) + '</td><td>' + (n ? UI.badge(n + ' شكوى', 'b-red') : '<span class="sub">لا يوجد</span>') + '</td></tr>';
      });
      html += '</tbody></table><div class="note-box mt-2 small">' + UI.esc(C.SLA_STAGE_NOTE) + '</div></div></div>';
      html += '<div class="card"><div class="card-head"><h3>دورة معالجة الشكوى (10 مراحل)</h3></div><div class="card-body">' +
        '<div class="pill-list">' + C.COMPLAINT_STAGES.map(function (s, i) {
          return '<span class="chip" style="cursor:default">' + (i + 1) + '. ' + UI.esc(s) + '</span>';
        }).join('') + '</div></div></div>';
      html += '</div>';

      return html;
    },
    mount: function (root) {
      var after = function () { App.refresh(); };
      var nb = root.querySelector('#cpNew');
      if (nb) nb.addEventListener('click', function () { openForm(null, after); });
      var ex = root.querySelector('#cpExport');
      if (ex) ex.addEventListener('click', function () {
        var r = App.range();
        var list = M.complaintsOf(App.state.branchId, r.from, r.to);
        UI.csv('سجل-الشكاوى-' + U.todayISO(),
          ['الرقم المرجعي', 'تاريخ الاستلام', 'العميل', 'رقم الحساب', 'الفرع', 'النوع', 'الموضوع', 'القناة', 'المسؤول', 'الاستحقاق', 'تاريخ الرد', 'تاريخ الإغلاق', 'الحالة', 'الإجراء', 'السبب الجذري', 'رضا العميل'],
          list.map(function (c) {
            return [c.refNo, c.receivedDate, c.customerName, c.accountNo, UI.branchName(c.branchId), c.type, c.subject, c.channel, c.assignee,
              c.dueDate, c.responseDate || '', c.closedDate || '', C.COMPLAINT_STATUS[c.status].label, c.action || '', c.rootCause || '', c.satisfaction || ''];
          }));
      });
      var q = root.querySelector('#cpQ');
      var restore = function () {
        var el = document.getElementById('cpQ');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      };
      if (q) q.addEventListener('input', function () { V.filters.q = this.value; App.refresh(); requestAnimationFrame(restore); });
      var ty = root.querySelector('#cpType');
      if (ty) ty.addEventListener('change', function () { V.filters.type = this.value; App.refresh(); });
      var st = root.querySelector('#cpStatus');
      if (st) st.addEventListener('change', function () { V.filters.status = this.value; App.refresh(); });
      root.querySelectorAll('[data-open]').forEach(function (b) {
        b.addEventListener('click', function () { detailModal(b.getAttribute('data-open'), after); });
      });
      root.querySelectorAll('[data-close-cp]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var c = K.Store.data.complaints.filter(function (x) { return x.id === b.getAttribute('data-close-cp'); })[0];
          if (c) closeModal(c, after);
        });
      });
    },
    openNew: function () { openForm(null, function () { App.refresh(); }); },
    openDetail: function (id) { detailModal(id, function () { App.refresh(); }); }
  };
})(window.KAK);
