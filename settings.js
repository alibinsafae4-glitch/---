/* الإعدادات والمرجعية */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { tab: 'general' };

  function canEdit() { return App.can('settings'); }

  function tabGeneral() {
    var s = K.Store.data.settings;
    var dis = canEdit() ? '' : ' disabled';
    var html = '<div class="grid grid-main">';
    html += '<div class="card"><div class="card-head"><h3>بيانات البنك والإدارة</h3></div><div class="card-body">' +
      '<form id="setGeneral"><div class="form-grid">' +
      UI.field('اسم البنك', UI.input('bankName', s.bankName, { attrs: dis }), { span: true }) +
      UI.field('الاسم المختصر', UI.input('shortName', s.shortName, { attrs: dis })) +
      UI.field('الإدارة العامة', UI.input('unit', s.unit, { attrs: dis })) +
      UI.field('الإدارة المسؤولة', UI.input('dept', s.dept, { attrs: dis })) +
      UI.field('شعار البنك اللفظي', UI.input('slogan', s.slogan, { attrs: dis })) +
      '</div>' +
      '<div class="field mt-2"><label>سياسة الجودة المعتمدة</label>' +
      UI.textarea('policy', s.policy, { rows: 6 }) + '</div>' +
      '<div class="form-grid mt-2">' +
      UI.field('تاريخ آخر مراجعة للنظام', UI.input('lastReview', s.lastReview, { type: 'date', attrs: dis })) +
      UI.field('تاريخ المراجعة القادمة (كل 6 أشهر)', UI.input('nextReview', s.nextReview, { type: 'date', attrs: dis })) +
      '</div>' +
      (canEdit() ? '<div class="mt-2" style="display:flex;gap:8px"><button class="btn btn-primary" id="btnSaveGeneral">' + UI.icon('check') + ' حفظ الإعدادات</button></div>' :
        '<div class="note-box mt-2 small">لديك صلاحية اطلاع فقط — تعديل الإعدادات متاح لمدير النظام ومسؤول الجودة.</div>') +
      '</form></div></div>';

    html += '<div class="card"><div class="card-head"><h3>هوية المنصة</h3></div><div class="card-body">' +
      '<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:linear-gradient(150deg,#1f286d,#171f52);border-radius:14px;padding:16px;color:#fff">' +
      '<div class="brand-plaque" style="width:150px"><img src="' + UI.asset('img/cac-logo.png') + '" alt="كاك بنك"></div>' +
      '<div><div style="font-weight:800;font-size:14px">' + UI.esc(s.bankName) + '</div>' +
      '<div style="font-size:11.5px;color:rgba(255,255,255,.65)">' + UI.esc(s.unit) + ' · ' + UI.esc(s.dept) + '</div>' +
      '<div style="font-size:11px;color:#e6c05f;margin-top:2px">«' + UI.esc(s.slogan) + '»</div></div></div>' +
      '<div class="mt-2 small muted">اسم الإدارة المسؤولة عن النظام: <b>' + UI.esc(s.dept) + '</b> — مسؤولة عن تنفيذ النظام وجمع البيانات وإعداد التقارير.</div>' +
      '<div class="note-box mt-2 small">' + UI.icon('shield') + ' تُحفظ البيانات محليًا في متصفح هذا الجهاز. للاستخدام المؤسسي متعدد المستخدمين يُنصح بتشغيل المنصة على خادم داخلي مع ربطها بقاعدة بيانات البنك.</div>' +
      '</div></div>';
    html += '</div>';
    return html;
  }

  function tabTargets() {
    var t = K.Store.data.settings.targets || {};
    var dis = canEdit() ? '' : ' disabled';
    var html = '<div class="card"><div class="card-head"><h3>مستهدفات مؤشرات الأداء</h3><div class="tools"><span class="small muted">تُستخدم في التقارير ولوحة المؤشرات</span></div></div><div class="card-body">' +
      '<form id="setTargets"><div class="form-grid">' +
      UI.field('رضا العملاء (%)', UI.input('satisfaction', t.satisfaction, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('درجة التفتيش (%)', UI.input('inspection', t.inspection, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('نسبة حل الشكاوى (%)', UI.input('resolution', t.resolution, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('زمن حل الشكوى (يوم)', UI.input('resolutionTime', t.resolutionTime, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('نسبة الأخطاء (%)', UI.input('errors', t.errors, { type: 'number', step: '0.01', attrs: dis })) +
      UI.field('زمن الانتظار (دقيقة)', UI.input('wait', t.wait, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('الالتزام بالوقت (%)', UI.input('ontime', t.ontime, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('نسبة إغلاق الملاحظات (%)', UI.input('closure', t.closure, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('نسبة التدريب (%)', UI.input('training', t.training, { type: 'number', step: '0.1', attrs: dis })) +
      UI.field('توافر الأنظمة (%)', UI.input('availability', t.availability, { type: 'number', step: '0.01', attrs: dis })) +
      '</div>' +
      (canEdit() ? '<div class="mt-2"><button class="btn btn-primary" id="btnSaveTargets">' + UI.icon('check') + ' حفظ المستهدفات</button></div>' : '') +
      '</form></div></div>';

    html += '<div class="card mt-2"><div class="card-head"><h3>تعريف المؤشرات وطرق حسابها</h3></div>' +
      '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr><th>المؤشر</th><th>طريقة الحساب</th><th>الهدف</th><th>المصدر</th><th>النوع</th></tr></thead><tbody>' +
      C.KPIS.map(function (d) {
        return '<tr><td><b>' + UI.esc(d.name) + '</b></td><td class="wrap sub" style="min-width:240px">' + UI.esc(d.calc) + '</td>' +
          '<td class="num">' + (d.unit === '%' ? UI.pct(t[d.id] !== undefined ? t[d.id] : d.target, 1) : UI.n(t[d.id] !== undefined ? t[d.id] : d.target) + ' ' + d.unit) + '</td>' +
          '<td class="sub">' + UI.esc(d.source) + '</td>' +
          '<td>' + UI.badge(d.auto ? 'آلي' : 'إدخال يدوي', d.auto ? 'b-green' : 'b-gray') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';

    html += '<div class="card mt-2"><div class="card-head"><h3>مؤشرات نجاح النظام</h3></div><div class="card-body"><div class="pill-list">' +
      C.SUCCESS.map(function (s) { return '<span class="chip" style="cursor:default">' + UI.icon('check') + UI.esc(s) + '</span>'; }).join('') +
      '</div></div></div>';
    return html;
  }

  function tabOrg() {
    var db = K.Store.data;
    var dis = canEdit();
    var html = '<div class="card"><div class="card-head"><h3>الفروع والإدارات</h3><div class="tools">' +
      (dis ? '<button class="btn btn-primary btn-sm" id="brNew">' + UI.icon('plus') + ' فرع</button>' : '') + '</div></div>' +
      '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr><th>الرمز</th><th>الاسم</th><th>المدينة</th><th>المدير</th><th>النوع</th><th></th></tr></thead><tbody>';
    db.branches.forEach(function (b) {
      html += '<tr><td class="num">' + UI.esc(b.code) + '</td><td><b>' + UI.esc(b.name) + '</b></td><td class="sub">' + UI.esc(b.city) + '</td>' +
        '<td class="sub">' + UI.esc(b.manager) + '</td><td>' + UI.badge(b.type, b.type === 'إدارة عامة' ? 'b-gold' : 'b-teal') + '</td>' +
        '<td><div class="row-actions">' + (dis ? '<button class="btn btn-ghost btn-xs" data-bredit="' + b.id + '">' + UI.icon('edit') + '</button>' +
          '<button class="btn btn-ghost btn-xs" data-brdel="' + b.id + '">' + UI.icon('trash') + '</button>' : '') + '</div></td></tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div class="card mt-2"><div class="card-head"><h3>المستخدمون والصلاحيات</h3><div class="tools">' +
      (dis ? '<button class="btn btn-primary btn-sm" id="usrNew">' + UI.icon('plus') + ' مستخدم</button>' : '') + '</div></div>' +
      '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>الفرع</th><th>المسمى</th><th></th></tr></thead><tbody>';
    db.users.forEach(function (u) {
      html += '<tr><td><b>' + UI.esc(u.name) + '</b></td><td class="sub mono">' + UI.esc(u.username) + '</td>' +
        '<td>' + UI.badge(C.ROLES[u.role] || u.role, u.role === 'admin' ? 'b-gold' : u.role === 'quality' ? 'b-green' : 'b-gray') + '</td>' +
        '<td class="sub">' + UI.esc(UI.branchName(u.branchId)) + '</td><td class="sub">' + UI.esc(u.title || '') + '</td>' +
        '<td><div class="row-actions">' + (dis ? '<button class="btn btn-ghost btn-xs" data-uredit="' + u.id + '">' + UI.icon('edit') + '</button>' +
          (u.username !== 'admin' ? '<button class="btn btn-ghost btn-xs" data-rdel="' + u.id + '">' + UI.icon('trash') + '</button>' : '') : '') + '</div></td></tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div class="card mt-2"><div class="card-head"><h3>الأدوار والصلاحيات</h3></div><div class="card-body"><div class="table-wrap"><table class="tbl">' +
      '<thead><tr><th>الدور</th><th>الاطلاع</th><th>تسجيل الشكاوى</th><th>إدارة الجودة والتقييم</th><th>الاجتماعات</th><th>الإعدادات</th></tr></thead><tbody>' +
      [['admin', 1, 1, 1, 1, 1], ['quality', 1, 1, 1, 1, 1], ['committee', 1, 0, 0, 1, 0], ['branch', 1, 1, 0, 0, 0], ['viewer', 1, 0, 0, 0, 0]].map(function (r) {
        return '<tr><td><b>' + C.ROLES[r[0]] + '</b></td>' + r.slice(1).map(function (v) {
          return '<td>' + (v ? '<span class="badge b-green">مسموح</span>' : '<span class="badge b-gray">—</span>') + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="note-box mt-2 small">مدير الفرع يرى بيانات فرعه فقط ويستطيع تسجيل الشكاوى ومتابعتها. عضو لجنة الجودة يطّلع على كل البيانات ويدير الاجتماعات دون تعديل سجلات الجودة.</div>' +
      '</div></div>';
    return html;
  }

  function tabGovernance() {
    var html = '<div class="card"><div class="card-head"><h3>الجهات المسؤولة والمسؤوليات</h3></div>' +
      '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr><th>الجهة</th><th>المسؤولية</th></tr></thead><tbody>' +
      C.GOVERNANCE.map(function (g) { return '<tr><td><b>' + UI.esc(g.entity) + '</b></td><td class="wrap" style="min-width:320px">' + UI.esc(g.duty) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>';

    html += '<div class="grid grid-2 mt-2">';
    html += '<div class="card"><div class="card-head"><h3>خطة التنفيذ الزمنية</h3></div><div class="card-body" style="padding-top:8px">' +
      C.PLAN.map(function (p, i) {
        return '<div style="display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--line-2)">' +
          '<div class="avatar" style="width:28px;height:28px;font-size:11px;background:linear-gradient(150deg,#e4efe9,#d3e5dc);color:#20503f">' + (i + 1) + '</div>' +
          '<div style="flex:1"><div class="small strong">' + UI.esc(p.phase) + ' <span class="tiny muted">(' + UI.esc(p.duration) + ')</span></div>' +
          '<div class="tiny" style="color:#4a6157">' + UI.esc(p.task) + '</div></div></div>';
      }).join('') + '</div></div>';

    html += '<div class="card"><div class="card-head"><h3>معايير الجودة المعتمدة</h3></div><div class="card-body" style="padding-top:12px">' +
      [['جودة خدمة العملاء', ['الاستقبال الجيد للعميل', 'سرعة الاستجابة', 'توضيح الخدمات والمتطلبات', 'التعامل باحترام وسرية', 'عدم ترك العميل دون متابعة', 'تقديم بدائل عند تعذر تنفيذ الخدمة', 'معالجة الشكاوى في الوقت المحدد']],
        ['جودة العمليات المصرفية', ['دقة البيانات المدخلة', 'اكتمال المستندات', 'الالتزام بالصلاحيات', 'مراجعة المعاملة قبل الاعتماد', 'عدم وجود تأخير غير مبرر', 'حفظ سجلات العمليات', 'تصحيح الأخطاء فور اكتشافها']],
        ['جودة الامتثال', ['الالتزام بالتعليمات المصرفية', 'تطبيق إجراءات مكافحة غسل الأموال', 'التحقق من هوية العميل', 'حفظ المستندات المطلوبة', 'عدم تجاوز الصلاحيات', 'الإبلاغ عن الحالات المشبوهة']],
        ['أمن المعلومات', ['حماية كلمات المرور', 'عدم مشاركة بيانات الدخول', 'قفل الشاشة عند مغادرة الجهاز', 'عدم الإفصاح عن بيانات العملاء', 'الإبلاغ عن محاولات الاختراق أو الأعطال', 'الالتزام بسياسات النسخ الاحتياطي']]
      ].map(function (g) {
        return '<div style="margin-bottom:12px"><div class="small strong" style="color:var(--green-800);margin-bottom:5px">' + UI.esc(g[0]) + '</div>' +
          '<div class="pill-list">' + g[1].map(function (x) { return '<span class="chip" style="cursor:default;font-weight:400">' + UI.esc(x) + '</span>'; }).join('') + '</div></div>';
      }).join('') + '</div></div>';
    html += '</div>';

    /* التحفيز والمساءلة */
    var inc = [
      ['منح شهادات تقدير للموظفين المتميزين', 'award'],
      ['ربط نتائج الجودة بتقييم الأداء السنوي', 'target'],
      ['تكريم الفروع ذات الأداء الأفضل', 'star'],
      ['تنبيه المسؤولين عند تكرار الملاحظات', 'bell'],
      ['إجراء تحقيق عند وجود مخالفة جسيمة', 'shield'],
      ['تحميل المسؤولين مهلة واضحة لمعالجة الملاحظات', 'clock']
    ];
    var top = K.M.ranking(U.addDays(U.todayISO(), -89), U.todayISO()).slice(0, 3);
    html += '<div class="card mt-2"><div class="card-head"><h3>التحفيز والمساءلة</h3>' +
      '<div class="tools"><span class="small muted">أداة تطوير ودعم — لا أداة عقاب</span></div></div><div class="card-body">' +
      '<div class="grid grid-2" style="gap:14px"><div>' + inc.map(function (x) {
        return '<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line-2)">' +
          '<span style="color:var(--gold);margin-top:2px">' + UI.icon(x[1]) + '</span><span class="small">' + UI.esc(x[0]) + '</span></div>';
      }).join('') + '</div>' +
      '<div><div class="small strong" style="margin-bottom:8px;color:var(--green-800)">الفروع المتميزة (آخر 90 يومًا)</div>' +
      (top.length ? top.map(function (x, i) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line-2);border-radius:10px;margin-bottom:7px">' +
          '<span class="badge ' + (i === 0 ? 'b-gold' : 'b-gray') + '">' + (i + 1) + '</span>' +
          '<span class="small strong" style="flex:1">' + UI.esc(x.branch.name) + '</span>' +
          '<span class="small num">' + UI.n(x.score, 1) + '</span>' +
          (i === 0 ? '<span class="badge b-gold">' + UI.icon('award') + ' متميز</span>' : '') + '</div>';
      }).join('') : '<div class="note-box small">لا توجد بيانات كافية.</div>') +
      '<div class="note-box gold small mt-2">تُستخدم النتائج للتحفيز والتطوير وربط الأداء السنوي، مع تنبيه المسؤولين عند تكرار الملاحظات وفتح تحقيق عند المخالفات الجسيمة فقط.</div>' +
      '</div></div></div></div>';
    return html;
  }

  function tabBackup() {
    var db = K.Store.data;
    var size = 0;
    try { size = Math.round(JSON.stringify(db).length / 1024); } catch (e) { }
    var html = '<div class="grid grid-2">';
    html += '<div class="card"><div class="card-head"><h3>النسخ الاحتياطي والاستعادة</h3></div><div class="card-body">' +
      '<p class="small muted">تصدير كامل لقاعدة بيانات المنصة (شكاوى، ملاحظات، تقييمات، تفتيش، استبيانات، تدريب، اجتماعات، إعدادات) بصيغة JSON، واستعادتها على أي جهاز.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<button class="btn btn-primary" id="btnBackup">' + UI.icon('download') + ' تنزيل نسخة احتياطية</button>' +
      '<label class="btn btn-outline" style="cursor:pointer">' + UI.icon('upload') + ' استعادة من ملف<input type="file" id="fileImport" accept=".json,application/json" style="display:none"></label>' +
      '</div>' +
      '<div class="note-box mt-2 small">حجم البيانات الحالي: <b>' + UI.n(size) + ' كيلوبايت</b> · عدد السجلات: ' + UI.n(db.complaints.length + db.findings.length + db.evaluations.length + db.inspections.length + db.surveys.length) + ' سجل.</div>' +
      '<hr class="sep"><div class="small strong" style="color:var(--red)">منطقة الخطر</div>' +
      '<p class="small muted">إعادة التهيئة تحذف كل البيانات الحالية وتعيد البيانات التجريبية الافتراضية.</p>' +
      '<button class="btn btn-danger" id="btnReset">' + UI.icon('refresh') + ' إعادة تهيئة البيانات</button>' +
      '</div></div>';

    html += '<div class="card"><div class="card-head"><h3>معلومات النظام</h3></div><div class="card-body">' +
      '<dl class="kv">' +
      '<dt>اسم النظام</dt><dd>منصة مراقبة الجودة</dd>' +
      '<dt>الجهة</dt><dd>' + UI.esc(db.settings.bankName) + '</dd>' +
      '<dt>الإدارة</dt><dd>' + UI.esc(db.settings.dept) + '</dd>' +
      '<dt>الإصدار</dt><dd>1.0</dd>' +
      '<dt>تاريخ التهيئة</dt><dd>' + (db.createdAt ? U.fmtDate(db.createdAt.slice(0, 10)) : '—') + '</dd>' +
      '<dt>نمط التخزين</dt><dd>' + (K.Store.persistent ? 'تخزين محلي في المتصفح (localStorage)' : 'ذاكرة مؤقتة — تعذّر التخزين') + '</dd>' +
      '<dt>عدد الفروع</dt><dd>' + db.branches.length + '</dd>' +
      '<dt>عدد المستخدمين</dt><dd>' + db.users.length + '</dd>' +
      '</dl>' +
      '<div class="note-box gold mt-2 small">للنشر المؤسسي: تُستضاف المنصة على خادم داخلي (Intranet) مع HTTPS، وتُربط بأنظمة الفروع (Core Banking) لتغذية مؤشرات المعاملات والعملاء آليًا، مع نسخ احتياطي دوري وصلاحيات مركزية.</div>' +
      '</div></div>';
    html += '</div>';
    return html;
  }

  K.views.settings = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var tabs = [['general', 'البيانات والسياسة'], ['targets', 'المؤشرات والمستهدفات'], ['org', 'الفروع والمستخدمون'], ['governance', 'الحوكمة والمرجعية'], ['backup', 'النسخ الاحتياطي']];
      var html = '<div class="page-head"><div><h1>الإعدادات والمرجعية</h1>' +
        '<div class="desc">بيانات البنك وسياسة الجودة والمستهدفات، وإدارة الفروع والمستخدمين، والمرجعية الكاملة للنظام.</div></div>' +
        '<div class="actions">' + (canEdit() ? UI.badge('صلاحية تعديل كاملة', 'b-green', true) : UI.badge('اطلاع فقط', 'b-gray', true)) + '</div></div>';
      html += '<div class="tabs" id="setTabs">' + tabs.map(function (t) {
        return '<button data-tab="' + t[0] + '" class="' + (V.tab === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
      }).join('') + '</div>';
      var body = V.tab === 'targets' ? tabTargets() : V.tab === 'org' ? tabOrg() : V.tab === 'governance' ? tabGovernance() : V.tab === 'backup' ? tabBackup() : tabGeneral();
      html += body;
      return html;
    },
    mount: function (root) {
      root.querySelectorAll('[data-tab]').forEach(function (b) {
        b.addEventListener('click', function () { V.tab = b.getAttribute('data-tab'); App.refresh(); });
      });
      var g = root.querySelector('#btnSaveGeneral');
      if (g) g.addEventListener('click', function () {
        var f = UI.formValues(root.querySelector('#setGeneral'));
        Object.assign(K.Store.data.settings, { bankName: f.bankName, shortName: f.shortName, unit: f.unit, dept: f.dept, slogan: f.slogan, policy: f.policy, lastReview: f.lastReview, nextReview: f.nextReview });
        K.Store.save(); UI.toast('تم حفظ إعدادات البنك وسياسة الجودة'); App.refresh();
      });
      var tg = root.querySelector('#btnSaveTargets');
      if (tg) tg.addEventListener('click', function () {
        var f = UI.formValues(root.querySelector('#setTargets'));
        var t = {};
        Object.keys(f).forEach(function (k) { var n = Number(f[k]); if (!isNaN(n) && f[k] !== '') t[k] = n; });
        K.Store.data.settings.targets = t;
        K.Store.save(); UI.toast('تم تحديث مستهدفات المؤشرات'); App.refresh();
      });
      var bnew = root.querySelector('#brNew');
      if (bnew) bnew.addEventListener('click', function () { branchModal(null); });
      root.querySelectorAll('[data-bredit]').forEach(function (b) {
        b.addEventListener('click', function () { branchModal(K.Store.data.branches.filter(function (x) { return x.id === b.getAttribute('data-bredit'); })[0]); });
      });
      root.querySelectorAll('[data-brdel]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-brdel');
          if (K.Store.data.branches.length <= 1) { UI.toast('لا يمكن حذف الفرع الوحيد', 'err'); return; }
          UI.confirmDelete('سيتم حذف الفرع من القوائم. السجلات المرتبطة به ستبقى لكن دون اسم فرع.', function () {
            var arr = K.Store.data.branches;
            arr.splice(arr.findIndex(function (x) { return x.id === id; }), 1);
            K.Store.save(); UI.toast('تم حذف الفرع'); App.refresh();
          });
        });
      });
      var unew = root.querySelector('#usrNew');
      if (unew) unew.addEventListener('click', function () { userModal(null); });
      root.querySelectorAll('[data-uredit]').forEach(function (b) {
        b.addEventListener('click', function () { userModal(K.Store.data.users.filter(function (x) { return x.id === b.getAttribute('data-uredit'); })[0]); });
      });
      root.querySelectorAll('[data-rdel]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmDelete('سيتم حذف حساب المستخدم نهائيًا.', function () {
            var arr = K.Store.data.users;
            arr.splice(arr.findIndex(function (x) { return x.id === b.getAttribute('data-rdel'); }), 1);
            K.Store.save(); UI.toast('تم حذف المستخدم'); App.refresh();
          });
        });
      });
      var bk = root.querySelector('#btnBackup');
      if (bk) bk.addEventListener('click', UI.backup);
      var fi = root.querySelector('#fileImport');
      if (fi) fi.addEventListener('change', function () {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var obj = JSON.parse(reader.result);
            if (!obj || !obj.branches || !obj.settings) throw new Error('bad');
            UI.confirm({
              title: 'استعادة نسخة احتياطية',
              message: 'سيتم استبدال جميع البيانات الحالية ببيانات الملف. هل تريد المتابعة؟',
              ok: 'استعادة', tone: 'red',
              onOk: function () {
                K.Store.replace(obj);
                UI.toast('تمت استعادة البيانات بنجاح');
                setTimeout(function () { location.reload(); }, 600);
              }
            });
          } catch (e) { UI.toast('ملف غير صالح — تأكد أنه نسخة احتياطية من المنصة', 'err'); }
        };
        reader.readAsText(file);
      });
      var rs = root.querySelector('#btnReset');
      if (rs) rs.addEventListener('click', function () {
        UI.confirm({
          title: 'إعادة تهيئة البيانات', tone: 'red', ok: 'نعم، أعد التهيئة',
          message: 'سيتم حذف كل السجلات الحالية واستبدالها بالبيانات التجريبية. لا يمكن التراجع.',
          onOk: function () {
            K.Store.reset();
            UI.toast('تمت إعادة تهيئة البيانات');
            setTimeout(function () { location.reload(); }, 600);
          }
        });
      });
    }
  };

  function branchModal(existing) {
    var isNew = !existing;
    var b = existing || { id: '', code: '', name: '', city: 'عدن', manager: '', type: 'فرع' };
    UI.modal({
      title: isNew ? 'إضافة فرع' : 'تعديل الفرع',
      body: '<form id="brForm"><div class="form-grid">' +
        UI.field('اسم الفرع', UI.input('name', b.name, { req: true }), { span: true, req: true }) +
        UI.field('الرمز', UI.input('code', b.code)) +
        UI.field('المدينة', UI.input('city', b.city)) +
        UI.field('مدير الفرع', UI.input('manager', b.manager)) +
        UI.field('النوع', UI.select('type', ['فرع', 'إدارة عامة', 'إدارة'], b.type)) +
        '</div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="brSave">حفظ</button>',
      onMount: function (wrap, close) {
        wrap.querySelector('#brSave').addEventListener('click', function () {
          var f = UI.formValues(wrap.querySelector('#brForm'));
          if (!f.name) { UI.toast('اسم الفرع مطلوب', 'err'); return; }
          if (isNew) K.Store.data.branches.push({ id: U.uid('b'), code: f.code, name: f.name, city: f.city, manager: f.manager, type: f.type });
          else Object.assign(existing, f);
          K.Store.save(); close(); UI.toast('تم الحفظ'); App.refresh();
        });
      }
    });
  }

  function userModal(existing) {
    var isNew = !existing;
    var u = existing || { id: '', name: '', username: '', password: '', role: 'viewer', branchId: 'b1', title: '' };
    UI.modal({
      title: isNew ? 'إضافة مستخدم' : 'تعديل المستخدم',
      body: '<form id="usrForm"><div class="form-grid">' +
        UI.field('الاسم الكامل', UI.input('name', u.name, { req: true }), { span: true, req: true }) +
        UI.field('اسم المستخدم', UI.input('username', u.username, { req: true }), { req: true }) +
        UI.field('كلمة المرور', UI.input('password', u.password, { req: isNew ? true : false }), { req: isNew, hint: isNew ? '' : 'اتركها فارغة للإبقاء على الحالية' }) +
        UI.field('الدور', UI.select('role', Object.keys(C.ROLES).map(function (k) { return { value: k, label: C.ROLES[k] }; }), u.role)) +
        UI.field('الفرع', UI.select('branchId', UI.branchOptions(false, false), u.branchId)) +
        UI.field('المسمى الوظيفي', UI.input('title', u.title)) +
        '</div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="usrSave">حفظ</button>',
      onMount: function (wrap, close) {
        wrap.querySelector('#usrSave').addEventListener('click', function () {
          var f = UI.formValues(wrap.querySelector('#usrForm'));
          if (!f.name || !f.username) { UI.toast('الاسم واسم المستخدم مطلوبان', 'err'); return; }
          var dup = K.Store.data.users.some(function (x) { return x.username === f.username && x.id !== u.id; });
          if (dup) { UI.toast('اسم المستخدم مستخدم مسبقًا', 'err'); return; }
          if (isNew) {
            if (!f.password) { UI.toast('كلمة المرور مطلوبة للمستخدم الجديد', 'err'); return; }
            K.Store.data.users.push({ id: U.uid('u'), name: f.name, username: f.username, password: f.password, role: f.role, branchId: f.branchId, title: f.title });
          } else {
            var payload = { name: f.name, username: f.username, role: f.role, branchId: f.branchId, title: f.title };
            if (f.password) payload.password = f.password;
            Object.assign(existing, payload);
          }
          K.Store.save(); close(); UI.toast('تم حفظ المستخدم'); App.refresh();
        });
      }
    });
  }
})(window.KAK);
