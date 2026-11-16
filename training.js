/* التدريب والتطوير */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { q: '', cat: '' };

  function empName(id) {
    var e = K.Store.data.employees.filter(function (x) { return x.id === id; })[0];
    return e ? e.name : id;
  }

  function courseModal(existing, after) {
    if (!App.can('write')) { UI.toast('لا تملك صلاحية إدارة التدريب', 'err'); return; }
    var isNew = !existing;
    var c = existing || {
      title: C.TRAINING_TOPICS[0], category: 'خدمة العملاء', date: U.todayISO(), trainer: '',
      hours: 6, mode: 'حضوري', target: 30, attendees: [], notes: '', branchId: 'b1', status: 'مخطط'
    };
    var empRows = K.Store.data.employees.map(function (e) {
      var on = c.attendees.indexOf(e.id) > -1;
      return '<label class="check" data-emp="' + e.id + '" style="padding:5px 4px;border-bottom:1px solid var(--line-2);cursor:pointer">' +
        '<input type="checkbox" value="' + e.id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="small">' + UI.esc(e.name) + '</span>' +
        '<span class="tiny muted" style="margin-inline-start:auto">' + UI.esc(UI.branchName(e.branchId).replace('فرع ', '')) + ' · ' + UI.esc(e.jobTitle) + '</span></label>';
    }).join('');

    UI.modal({
      title: isNew ? 'برنامج تدريبي جديد' : 'تعديل البرنامج التدريبي',
      sub: 'التدريب الدوري على خدمة العملاء والامتثال وأمن المعلومات ومهارات الإدارة',
      size: 'wide',
      body: '<form id="trForm"><div class="form-grid">' +
        UI.field('عنوان البرنامج', UI.input('title', c.title, { req: true }), { req: true }) +
        UI.field('التصنيف', UI.select('category', ['خدمة العملاء', 'الامتثال وأمن المعلومات', 'مهارات إدارية', 'إجراءات مصرفية'], c.category)) +
        UI.field('التاريخ', UI.input('date', c.date, { type: 'date', req: true }), { req: true }) +
        UI.field('المدرب', UI.input('trainer', c.trainer, { placeholder: 'اسم المدرب أو الجهة' })) +
        UI.field('عدد الساعات', UI.input('hours', c.hours, { type: 'number', min: 1 })) +
        UI.field('نمط التنفيذ', UI.select('mode', ['حضوري', 'افتراضي', 'مختلط'], c.mode)) +
        UI.field('العدد المستهدف', UI.input('target', c.target, { type: 'number', min: 1 })) +
        UI.field('الحالة', UI.select('status', ['مخطط', 'منفذ', 'ملغى'], c.status)) +
        UI.field('ملاحظات', UI.textarea('notes', c.notes, { rows: 2 }), { span: true }) +
        '</div>' +
        '<div class="field mt-2"><label>المشاركون <span class="tiny muted" id="attCount"></span></label>' +
        '<div style="max-height:210px;overflow:auto;border:1px solid var(--line);border-radius:11px;padding:4px 10px" id="empList">' + empRows + '</div>' +
        '<div class="hint">حدّد الموظفين الذين حضروا أو سيحضرون البرنامج.</div></div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="trSave">حفظ البرنامج</button>',
      onMount: function (wrap, close) {
        var form = wrap.querySelector('#trForm');
        var cnt = wrap.querySelector('#attCount');
        function upd() {
          var n = wrap.querySelectorAll('#empList input:checked').length;
          cnt.textContent = '(' + n + ' مشارك)';
        }
        upd();
        wrap.querySelector('#empList').addEventListener('change', upd);
        wrap.querySelector('#trSave').addEventListener('click', function () {
          var f = UI.formValues(form);
          if (!f.title || !f.date) { UI.toast('العنوان والتاريخ مطلوبان', 'err'); return; }
          var att = Array.prototype.map.call(wrap.querySelectorAll('#empList input:checked'), function (x) { return x.value; });
          var payload = {
            title: f.title, category: f.category, date: f.date, trainer: f.trainer, hours: Number(f.hours) || 0,
            mode: f.mode, target: Number(f.target) || att.length, status: f.status, notes: f.notes,
            attendees: att, branchId: c.branchId || 'b1'
          };
          if (isNew) { payload.id = U.uid('tr'); K.Store.data.courses.push(payload); }
          else Object.assign(existing, payload);
          K.Store.save(); close(); UI.toast(isNew ? 'تم إنشاء البرنامج التدريبي' : 'تم تحديث البرنامج'); after();
        });
      }
    });
  }

  K.views.training = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range();
      var list = M.coursesOf(null, r.from, r.to).sort(function (x, y) { return x.date < y.date ? 1 : -1; });
      var tr = M.trainingRate(r.from, r.to);
      var uniqueAtt = {};
      list.forEach(function (c) { c.attendees.forEach(function (id) { uniqueAtt[id] = 1; }); });
      var covered = Object.keys(uniqueAtt).length;
      var totalEmp = K.Store.data.employees.length;
      var categories = ['خدمة العملاء', 'الامتثال وأمن المعلومات', 'مهارات إدارية', 'إجراءات مصرفية'].map(function (cat, i) {
        var rows = list.filter(function (c) { return c.category === cat; });
        return { label: cat, value: rows.length, display: rows.length + ' برنامج', tone: '' };
      });
      var months = U.lastMonths(6);
      var monthAtt = months.map(function (mk) {
        var bb = U.monthBounds(mk);
        return U.sum(K.Store.data.courses.filter(function (c) { return M.within(c.date, bb.from, bb.to); }), function (c) { return c.attendees.length; });
      });

      var filtered = list.slice();
      if (V.q) filtered = filtered.filter(function (c) { return (c.title + ' ' + c.trainer + ' ' + c.category).indexOf(V.q) > -1; });
      if (V.cat) filtered = filtered.filter(function (c) { return c.category === V.cat; });

      var html = '';
      html += '<div class="page-head"><div><h1>التدريب والتطوير</h1>' +
        '<div class="desc">تنفيذ تدريب دوري في خدمة العملاء، الاتصال الفعال، إدارة الشكاوى، الإجراءات المصرفية، مكافحة غسل الأموال، أمن المعلومات، الأخلاقيات وإدارة الوقت.</div></div>' +
        '<div class="actions">' +
        (App.can('write') ? '<button class="btn btn-primary" id="trNew">' + UI.icon('plus') + ' برنامج تدريبي</button>' : '') + '</div></div>';

      html += '<div class="stats">' +
        UI.kpiCard({ label: 'نسبة تغطية التدريب', icon: 'book', value: tr.value ? UI.n(tr.value, 1) : '—', unit: '%', foot: '<span>' + tr.attended + ' مشارك من ' + tr.target + ' مستهدف</span>', progress: tr.value || 0, bad: tr.value > 0 && tr.value < 70, warn: tr.value > 0 && tr.value < 100 }) +
        UI.kpiCard({ label: 'البرامج المنفذة', icon: 'layers', value: UI.n(list.length), unit: 'برنامج', foot: '<span>' + UI.esc(r.label) + '</span>', progress: 100 }) +
        UI.kpiCard({ label: 'الموظفون المدربون', icon: 'users', value: UI.n(covered), unit: 'موظف', foot: '<span>من أصل ' + totalEmp + ' موظفًا مسجلًا</span>', progress: covered / totalEmp * 100 }) +
        UI.kpiCard({ label: 'إجمالي ساعات التدريب', icon: 'clock', value: UI.n(U.sum(list, function (c) { return c.hours * c.attendees.length; })), unit: 'ساعة', foot: '<span>مجموع ساعات مشاركة الموظفين</span>', progress: 100 }) +
        '</div>';

      html += '<div class="grid grid-main mb-2">';
      html += '<div class="card"><div class="card-head"><h3>المشاركون شهريًا <span class="sub">— آخر 6 أشهر</span></h3></div><div class="card-body">' +
        UI.charts.columns({ labels: months.map(function (mk) { return U.monthName(mk).split(' ')[0]; }), values: monthAtt, gold: [monthAtt.length - 1] }) + '</div></div>';
      html += '<div class="card"><div class="card-head"><h3>البرامج حسب التصنيف</h3></div><div class="card-body">' +
        UI.charts.hbars(categories, { max: Math.max(1, categories[0].value) }) +
        '<div class="note-box mt-2 small">يُوسَّع التدريب ليشمل جميع موظفي الخدمة والفروع، بناءً على نتائج التقييم والتفتيش والشكاوى.</div></div></div>';
      html += '</div>';

      html += '<div class="card"><div class="card-head"><h3>سجل البرامج التدريبية</h3>' +
        '<div class="tools"><div style="position:relative"><span style="position:absolute;inset-inline-start:9px;top:50%;transform:translateY(-50%);color:#90a49b">' + UI.icon('search') + '</span>' +
        '<input type="text" id="trQ" value="' + UI.esc(V.q) + '" placeholder="بحث" style="width:170px;padding-inline-start:32px;padding-block:6px;font-size:12.5px"></div>' +
        '<select id="trCat" style="width:auto;min-width:150px;padding-block:6px;font-size:12.5px"><option value="">كل التصنيفات</option>' +
        ['خدمة العملاء', 'الامتثال وأمن المعلومات', 'مهارات إدارية', 'إجراءات مصرفية'].map(function (c) { return '<option value="' + c + '"' + (V.cat === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr>' +
        '<th>البرنامج</th><th>التاريخ</th><th>الساعات</th><th>المستهدف</th><th>المشاركون</th><th>التغطية</th><th>الحالة</th><th></th></tr></thead><tbody>';
      if (!filtered.length) html += UI.tableEmptyRow(8, 'لا توجد برامج تدريبية مطابقة');
      filtered.forEach(function (c) {
        var cov = c.target ? Math.round(c.attendees.length / c.target * 100) : 0;
        html += '<tr><td><b>' + UI.esc(c.title) + '</b><div class="sub">' + UI.esc(c.category) + ' · ' + UI.esc(c.trainer || '—') + '</div></td>' +
          '<td>' + UI.date(c.date) + '</td>' +
          '<td class="num">' + UI.n(c.hours) + '</td>' +
          '<td class="num">' + UI.n(c.target) + '</td>' +
          '<td class="num">' + UI.n(c.attendees.length) + '</td>' +
          '<td><div style="display:flex;align-items:center;gap:7px"><div class="progress ' + (cov < 70 ? 'red' : cov < 100 ? 'amber' : '') + '" style="width:52px;height:6px"><span style="width:' + Math.min(100, cov) + '%"></span></div><span class="small num">' + cov + '%</span></div></td>' +
          '<td>' + UI.badge(c.status || 'منفذ', c.status === 'منفذ' ? 'b-green' : c.status === 'ملغى' ? 'b-red' : 'b-blue') + '</td>' +
          '<td><div class="row-actions"><button class="btn btn-ghost btn-xs" data-att="' + c.id + '">' + UI.icon('users') + ' المشاركون</button>' +
          (App.can('write') ? '<button class="btn btn-ghost btn-xs" data-edit="' + c.id + '">' + UI.icon('edit') + '</button>' : '') + '</div></td></tr>';
      });
      html += '</tbody></table></div></div>';

      html += '<div class="card card-pad mt-2"><div class="note-box small">' + UI.icon('info') +
        ' يُربط التدريب بنتائج الجودة: الموظفون المرتبطون بملاحظات أو شكاوى متكررة يُدرجون أولوية في البرامج القادمة، وتُقاس الفعالية بمقارنة مؤشرات الفرع قبل التدريب وبعده.</div></div>';

      return html;
    },
    mount: function (root) {
      var after = function () { App.refresh(); };
      var nb = root.querySelector('#trNew'); if (nb) nb.addEventListener('click', function () { courseModal(null, after); });
      var q = root.querySelector('#trQ');
      if (q) q.addEventListener('input', function () {
        V.q = this.value; App.refresh();
        requestAnimationFrame(function () { var el = document.getElementById('trQ'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
      });
      var cat = root.querySelector('#trCat'); if (cat) cat.addEventListener('change', function () { V.cat = this.value; App.refresh(); });
      root.querySelectorAll('[data-edit]').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = K.Store.data.courses.filter(function (x) { return x.id === b.getAttribute('data-edit'); })[0];
          if (c) courseModal(c, after);
        });
      });
      root.querySelectorAll('[data-att]').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = K.Store.data.courses.filter(function (x) { return x.id === b.getAttribute('data-att'); })[0];
          if (!c) return;
          UI.modal({
            title: 'المشاركون — ' + c.title,
            sub: UI.date(c.date) + ' · ' + c.attendees.length + ' مشارك من ' + c.target,
            body: c.attendees.length ? '<div class="table-wrap"><table class="tbl"><thead><tr><th>#</th><th>الموظف</th><th>الفرع</th><th>الوظيفة</th></tr></thead><tbody>' +
              c.attendees.map(function (id, i) {
                var e = K.Store.data.employees.filter(function (x) { return x.id === id; })[0] || {};
                return '<tr><td class="num">' + (i + 1) + '</td><td>' + UI.esc(e.name || id) + '</td><td class="sub">' + UI.esc(UI.branchName(e.branchId)) + '</td><td class="sub">' + UI.esc(e.jobTitle || '') + '</td></tr>';
              }).join('') + '</tbody></table></div>' : '<div class="note-box">لم يُسجل مشاركون بعد.</div>',
            onMount: function (wrap, close) { }
          });
        });
      });
    }
  };
})(window.KAK);
