/* لجنة الجودة */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;

  function meetingModal(existing, after) {
    if (!App.can('meetings')) { UI.toast('لا تملك صلاحية إدارة اجتماعات اللجنة', 'err'); return; }
    var isNew = !existing;
    var m = existing || {
      date: U.todayISO(), type: 'شهري', title: 'اجتماع لجنة الجودة – شهري',
      attendees: 6, agenda: '', decisions: [], openActions: 0, status: 'قائم'
    };
    UI.modal({
      title: isNew ? 'اجتماع لجنة جودة جديد' : 'تعديل الاجتماع',
      body: '<form id="mtForm"><div class="form-grid">' +
        UI.field('التاريخ', UI.input('date', m.date, { type: 'date', req: true }), { req: true }) +
        UI.field('نوع الاجتماع', UI.select('type', ['أسبوعي', 'شهري', 'ربع سنوي', 'طارئ'], m.type), { req: true }) +
        UI.field('عدد الحاضرين', UI.input('attendees', m.attendees, { type: 'number', min: 1 })) +
        UI.field('الحالة', UI.select('status', ['قائم', 'مغلق', 'مؤجل'], m.status)) +
        UI.field('جدول الأعمال', UI.textarea('agenda', m.agenda, { rows: 2 }), { span: true }) +
        UI.field('القرارات (قرار في كل سطر)', UI.textarea('decisions', (m.decisions || []).join('\n'), { rows: 4 }), { span: true }) +
        UI.field('الإجراءات المفتوحة', UI.input('openActions', m.openActions, { type: 'number', min: 0 })) +
        '</div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="mtSave">حفظ</button>',
      onMount: function (wrap, close) {
        wrap.querySelector('#mtSave').addEventListener('click', function () {
          var f = UI.formValues(wrap.querySelector('#mtForm'));
          if (!f.date) { UI.toast('التاريخ مطلوب', 'err'); return; }
          var payload = {
            date: f.date, type: f.type, title: 'اجتماع لجنة الجودة – ' + f.type,
            attendees: Number(f.attendees) || 0, agenda: f.agenda,
            decisions: f.decisions.split('\n').map(function (x) { return x.trim(); }).filter(Boolean),
            openActions: Number(f.openActions) || 0, status: f.status
          };
          if (isNew) { payload.id = U.uid('mt'); K.Store.data.meetings.push(payload); }
          else Object.assign(existing, payload);
          K.Store.save(); close(); UI.toast('تم حفظ الاجتماع'); after();
        });
      }
    });
  }

  K.views.committee = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range();
      var meetings = K.Store.data.meetings.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      var openActions = U.sum(meetings, function (m) { return m.openActions || 0; });
      var decisions = U.sum(meetings, function (m) { return (m.decisions || []).length; });
      var last = meetings[0];

      var html = '';
      html += '<div class="page-head"><div><h1>لجنة الجودة</h1>' +
        '<div class="desc">لجنة دائمة برئاسة ممثل الإدارة العليا: متابعة أسبوعية للملاحظات العاجلة، مراجعة شهرية للمؤشرات والشكاوى، ومراجعة ربع سنوية لفعالية النظام.</div></div>' +
        '<div class="actions">' +
        (App.can('meetings') ? '<button class="btn btn-primary" id="mtNew">' + UI.icon('plus') + ' اجتماع جديد</button>' : '') + '</div></div>';

      html += '<div class="stats">' +
        UI.kpiCard({ label: 'الاجتماعات المسجلة', icon: 'users', value: UI.n(meetings.length), unit: 'اجتماع', foot: '<span>آخر اجتماع: ' + (last ? UI.date(last.date) : '—') + '</span>', progress: 100 }) +
        UI.kpiCard({ label: 'القرارات الصادرة', icon: 'checkc', value: UI.n(decisions), unit: 'قرار', foot: '<span>موثقة في محاضر الاجتماعات</span>', progress: 100 }) +
        UI.kpiCard({ label: 'إجراءات مفتوحة', icon: 'clock', value: UI.n(openActions), unit: 'إجراء', foot: '<span>قيد المتابعة من مقرر اللجنة</span>', progress: openActions ? 60 : 0, warn: openActions > 0, bad: openActions > 4 }) +
        UI.kpiCard({ label: 'أعضاء اللجنة', icon: 'shield', value: UI.n(C.COMMITTEE.length), unit: 'عضو', foot: '<span>بما فيهم الرئيس والمقرر</span>', progress: 100 }) +
        '</div>';

      html += '<div class="grid grid-main">';
      /* الاجتماعات */
      html += '<div class="card"><div class="card-head"><h3>محاضر الاجتماعات</h3><div class="tools"><span class="small muted">' + UI.esc(r.label) + '</span></div></div>' +
        '<div class="card-body" style="padding-top:6px">';
      if (!meetings.length) html += UI.empty('لا توجد اجتماعات مسجلة');
      meetings.forEach(function (m) {
        html += '<div style="border:1px solid var(--line-2);border-radius:12px;padding:13px 15px;margin-bottom:10px">' +
          '<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">' +
          '<span class="badge ' + (m.type === 'أسبوعي' ? 'b-blue' : m.type === 'شهري' ? 'b-teal' : m.type === 'ربع سنوي' ? 'b-gold' : 'b-amber') + '">' + UI.esc(m.type) + '</span>' +
          '<b class="small">' + UI.date(m.date) + '</b>' +
          '<span class="tiny muted">' + (m.attendees || 0) + ' حاضرًا</span>' +
          '<span style="margin-inline-start:auto">' + UI.badge(m.status || 'قائم', m.status === 'مغلق' ? 'b-green' : m.status === 'مؤجل' ? 'b-gray' : 'b-blue') + '</span></div>' +
          (m.agenda ? '<div class="small mt-1" style="color:#34473f">' + UI.esc(m.agenda) + '</div>' : '') +
          ((m.decisions || []).length ? '<ul style="margin:6px 0 0;padding-inline-start:18px;font-size:12px;color:#4a6157">' +
            m.decisions.map(function (d) { return '<li style="margin-bottom:3px">' + UI.esc(d) + '</li>'; }).join('') + '</ul>' : '') +
          '<div style="display:flex;gap:8px;margin-top:8px">' +
          (m.openActions ? '<span class="badge b-amber">' + m.openActions + ' إجراء مفتوح</span>' : '<span class="badge b-green">لا إجراءات معلقة</span>') +
          (App.can('meetings') ? '<button class="btn btn-ghost btn-xs" data-edit="' + m.id + '">' + UI.icon('edit') + ' تعديل</button>' : '') +
          '<button class="btn btn-ghost btn-xs" data-print-mt="' + m.id + '">' + UI.icon('printer') + ' محضر</button>' +
          '</div></div>';
      });
      html += '</div></div>';

      /* الأعضاء + الدورية */
      html += '<div style="display:grid;gap:16px;align-content:start">';
      html += '<div class="card"><div class="card-head"><h3>تشكيل اللجنة</h3></div><div class="card-body" style="padding-top:10px">' +
        C.COMMITTEE.map(function (c) {
          return '<div style="display:flex;gap:9px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line-2)">' +
            '<div class="avatar" style="width:28px;height:28px;font-size:10.5px;background:' + (c.role.indexOf('رئيس') > -1 ? 'linear-gradient(150deg,#26317f,#2f3c98);color:#fff' : 'linear-gradient(150deg,#e9ecf8,#d8dcef);color:#232a58') + '">' +
            (c.role.indexOf('رئيس') > -1 ? 'ر' : c.role.indexOf('مقرر') > -1 ? 'م' : 'ع') + '</div>' +
            '<div style="flex:1"><div class="small strong">' + UI.esc(c.role) + '</div><div class="tiny muted">' + UI.esc(c.member) + '</div></div></div>';
        }).join('') + '</div></div>';

      html += '<div class="card"><div class="card-head"><h3>دورية الاجتماعات</h3></div><div class="card-body" style="padding-top:10px">' +
        [['أسبوعيًا', 'متابعة الملاحظات العاجلة'], ['شهريًا', 'مراجعة المؤشرات والشكاوى'], ['ربع سنويًا', 'مراجعة فعالية النظام وتحديث الخطط']].map(function (x) {
          return '<div style="display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line-2)">' +
            '<span class="badge b-gold">' + x[0] + '</span><span class="small">' + x[1] + '</span></div>';
        }).join('') + '<div class="note-box mt-2 small">مقرر اللجنة مسؤول عن متابعة الملاحظات والتقارير وتوثيق القرارات والمهل.</div></div></div>';
      html += '</div></div>';

      return html;
    },
    mount: function (root) {
      var after = function () { App.refresh(); };
      var nb = root.querySelector('#mtNew'); if (nb) nb.addEventListener('click', function () { meetingModal(null, after); });
      root.querySelectorAll('[data-edit]').forEach(function (b) {
        b.addEventListener('click', function () {
          var m = K.Store.data.meetings.filter(function (x) { return x.id === b.getAttribute('data-edit'); })[0];
          if (m) meetingModal(m, after);
        });
      });
      root.querySelectorAll('[data-print-mt]').forEach(function (b) {
        b.addEventListener('click', function () {
          var m = K.Store.data.meetings.filter(function (x) { return x.id === b.getAttribute('data-print-mt'); })[0];
          if (m) printMinutes(m);
        });
      });
    }
  };

  function printMinutes(m) {
    var html = '<div class="report-sheet" id="minutesSheet">' +
      '<div class="report-head"><img class="report-logo" src="' + UI.asset('img/cac-logo.png') + '" alt="كاك بنك">' +
      '<div class="rh-main"><h2>محضر اجتماع لجنة الجودة</h2><div class="rh-sub">' + UI.esc(K.Store.data.settings.bankName) + ' — ' + UI.esc(K.Store.data.settings.unit) + ' · ' + UI.esc(K.Store.data.settings.dept) + '</div></div></div>' +
      '<div class="report-meta"><div><span>نوع الاجتماع</span>' + UI.esc(m.type) + '</div><div><span>التاريخ</span>' + UI.date(m.date) + '</div>' +
      '<div><span>عدد الحاضرين</span>' + (m.attendees || 0) + '</div><div><span>الحالة</span>' + UI.esc(m.status || '') + '</div></div>' +
      '<h3>جدول الأعمال</h3><p class="small">' + UI.esc(m.agenda || '—') + '</p>' +
      '<h3>القرارات والتوصيات</h3>' + ((m.decisions || []).length ?
        '<ol style="font-size:12.5px;padding-inline-start:20px">' + m.decisions.map(function (d) { return '<li style="margin-bottom:6px">' + UI.esc(d) + '</li>'; }).join('') + '</ol>' : '<p class="small">لا توجد قرارات مسجلة.</p>') +
      '<h3>الإجراءات المفتوحة</h3><p class="small">' + (m.openActions ? m.openActions + ' إجراء قيد المتابعة.' : 'لا توجد إجراءات معلقة.') + '</p>' +
      '<div class="sign"><div>مقرر اللجنة</div><div>رئيس اللجنة</div><div>اعتماد الإدارة العامة</div></div></div>';

    var mt = UI.modal({
      title: 'محضر الاجتماع', size: 'wide', body: html,
      footer: '<button class="btn btn-outline" data-close>إغلاق</button><button class="btn btn-primary" id="mtPrint">' + UI.icon('printer') + ' طباعة المحضر</button>',
      onMount: function (wrap) {
        wrap.querySelector('#mtPrint').addEventListener('click', function () { window.print(); });
      }
    });
  }
})(window.KAK);
