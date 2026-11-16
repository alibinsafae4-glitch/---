/* رضا العملاء */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { score: '', q: '' };

  K.views.satisfaction = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range(); var b = App.state.branchId; var f = V;
      var all = M.surveysOf(b, r.from, r.to);
      var s = M.satisfaction(b, r.from, r.to);
      var prev = M.prevRange(r); var sp = M.satisfaction(b, prev.from, prev.to);
      var months = U.lastMonths(6);
      var series = months.map(function (mk) { var bb = U.monthBounds(mk); var x = M.satisfaction(b, bb.from, bb.to); return x ? x.value : null; });
      var counts = [5, 4, 3, 2, 1].map(function (sc) { return { label: sc + ' نجوم', value: all.filter(function (x) { return x.score === sc; }).length, color: ['#1f286d', '#4655b8', '#e0a52f', '#b54708', '#b42318'][5 - sc] }; });
      var byBranch = K.Store.data.branches.filter(function (x) { return x.type === 'فرع'; }).map(function (x) {
        var v = M.satisfaction(x.id, r.from, r.to);
        return { label: x.name.replace('فرع ', ''), value: v ? v.value : 0, display: v ? UI.pct(v.value) : '—', tone: v && v.value < 80 ? 'bad' : v && v.value < 85 ? 'warn' : '' };
      }).sort(function (a, c) { return c.value - a.value; });
      var byChannel = C.CHANNELS.map(function (ch, i) {
        var rows = all.filter(function (x) { return x.channel === ch; });
        return { label: ch, value: rows.length ? Math.round(rows.filter(function (x) { return x.score >= 4; }).length / rows.length * 100) : 0, n: rows.length };
      }).filter(function (x) { return x.n; });

      var list = all.slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; });
      if (f.score) list = list.filter(function (x) { return String(x.score) === f.score; });
      if (f.q) list = list.filter(function (x) { return (x.comment + ' ' + x.service).indexOf(f.q) > -1; });
      var avgStars = all.length ? U.avg(all, function (x) { return x.score; }) : 0;
      var promoters = all.filter(function (x) { return x.score === 5; }).length;
      var detractors = all.filter(function (x) { return x.score <= 3; }).length;
      var nps = all.length ? Math.round((promoters - detractors) / all.length * 100) : 0;

      var html = '';
      html += '<div class="page-head"><div><h1>رضا العملاء</h1>' +
        '<div class="desc">قياس منتظم عبر قنوات متعددة، وتحليل النتائج حسب الفرع والقناة والخدمة، مع ربط الشكاوى والملاحظات بالتحسين.</div></div>' +
        '<div class="actions"><button class="btn btn-outline" id="svExport">' + UI.icon('download') + ' تصدير</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="svNew">' + UI.icon('plus') + ' تسجيل استبيان</button>' : '') + '</div></div>';

      html += '<div class="stats">' +
        UI.kpiCard({ label: 'نسبة رضا العملاء', icon: 'star', value: s ? UI.n(s.value, 1) : '—', unit: '%', foot: '<span>' + (s ? s.satisfied : 0) + ' راضٍ من ' + (s ? s.count : 0) + '</span>', progress: s ? s.value : 0, bad: s && s.value < 80, warn: s && s.value < 85 }) +
        UI.kpiCard({ label: 'متوسط التقييم', icon: 'award', value: all.length ? UI.n(avgStars, 2) : '—', unit: 'من 5', foot: '<span>مقارنة سابقة: ' + (sp ? UI.n(sp.value, 1) + '%' : '—') + '</span>', progress: avgStars / 5 * 100 }) +
        UI.kpiCard({ label: 'عدد المشاركين', icon: 'users', value: UI.n(all.length), unit: 'استبيان', foot: '<span>' + UI.esc(r.label) + '</span>', progress: 100 }) +
        UI.kpiCard({ label: 'صافي المؤيدين (NPS)', icon: 'up', value: UI.n(nps), unit: 'نقطة', foot: '<span>' + promoters + ' مؤيد · ' + detractors + ' غير راضٍ</span>', progress: Math.abs(nps) }) +
        '</div>';

      html += '<div class="grid grid-main mb-2">';
      html += '<div class="card"><div class="card-head"><h3>اتجاه رضا العملاء <span class="sub">— آخر 6 أشهر</span></h3><div class="tools"><span class="badge b-gold">الهدف 85%</span></div></div>' +
        '<div class="card-body">' + UI.charts.line({ labels: months.map(function (mk) { return U.monthName(mk).split(' ')[0]; }), series: [{ name: 'رضا العملاء', data: series, color: '#4655b8' }], min: 50, max: 100, target: 85 }) + '</div></div>';
      html += '<div class="card"><div class="card-head"><h3>توزيع التقييمات</h3></div><div class="card-body">' +
        UI.charts.donut(counts, { centerValue: all.length ? UI.n(avgStars, 1) : '—', centerLabel: 'متوسط من 5', size: 132 }) + '</div></div>';
      html += '</div>';

      html += '<div class="grid grid-2 mb-2">';
      html += '<div class="card"><div class="card-head"><h3>الرضا حسب الفرع</h3><div class="tools"><span class="sub">الهدف 85%</span></div></div><div class="card-body">' +
        (byBranch.length ? UI.charts.hbars(byBranch, { max: 100 }) : UI.empty('لا توجد بيانات')) + '</div></div>';
      html += '<div class="card"><div class="card-head"><h3>الرضا حسب قناة الاستبيان</h3></div><div class="card-body">' +
        (byChannel.length ? UI.charts.hbars(byChannel.map(function (x) { return { label: x.label, value: x.value, display: x.value + '%', tone: x.value < 80 ? 'warn' : '' }; }), { max: 100 }) : UI.empty('لا توجد بيانات')) + '</div></div>';
      html += '</div>';

      /* سجل الاستبيانات */
      html += '<div class="card"><div class="card-head"><h3>سجل الاستبيانات <span class="sub">(' + UI.n(list.length) + ')</span></h3>' +
        '<div class="tools"><div style="position:relative"><span style="position:absolute;inset-inline-start:9px;top:50%;transform:translateY(-50%);color:#90a49b">' + UI.icon('search') + '</span>' +
        '<input type="text" id="svQ" value="' + UI.esc(f.q) + '" placeholder="بحث في الملاحظات" style="width:180px;padding-inline-start:32px;padding-block:6px;font-size:12.5px"></div>' +
        '<select id="svScore" style="width:auto;min-width:120px;padding-block:6px;font-size:12.5px"><option value="">كل التقييمات</option>' +
        [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '"' + (f.score === String(n) ? ' selected' : '') + '>' + n + ' نجوم</option>'; }).join('') + '</select></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr>' +
        '<th>التاريخ</th><th>الفرع</th><th>التقييم</th><th>الخدمة</th><th>القناة</th><th>ملاحظة العميل</th></tr></thead><tbody>';
      if (!list.length) html += UI.tableEmptyRow(6, 'لا توجد استبيانات مطابقة');
      list.slice(0, 120).forEach(function (x) {
        html += '<tr><td>' + UI.date(x.date) + '</td><td>' + UI.esc(UI.branchName(x.branchId).replace('فرع ', '')) + '</td>' +
          '<td>' + stars(x.score) + '</td><td class="sub">' + UI.esc(x.service) + '</td><td class="sub">' + UI.esc(x.channel) + '</td>' +
          '<td class="wrap sub">' + UI.esc(x.comment || '—') + '</td></tr>';
      });
      html += '</tbody></table></div></div>';

      return html;
    },
    mount: function (root) {
      var after = function () { App.refresh(); };
      var nb = root.querySelector('#svNew'); if (nb) nb.addEventListener('click', function () { newSurvey(after); });
      var ex = root.querySelector('#svExport'); if (ex) ex.addEventListener('click', function () {
        var r = App.range();
        UI.csv('رضا-العملاء-' + U.todayISO(), ['التاريخ', 'الفرع', 'التقييم (1-5)', 'الخدمة', 'القناة', 'الملاحظة'],
          M.surveysOf(App.state.branchId, r.from, r.to).map(function (x) {
            return [x.date, UI.branchName(x.branchId), x.score, x.service, x.channel, x.comment || ''];
          }));
      });
      var q = root.querySelector('#svQ');
      if (q) q.addEventListener('input', function () {
        V.q = this.value; App.refresh();
        requestAnimationFrame(function () { var el = document.getElementById('svQ'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
      });
      var sc = root.querySelector('#svScore'); if (sc) sc.addEventListener('change', function () { V.score = this.value; App.refresh(); });
    }
  };

  function stars(n) {
    var out = '<span style="color:#e0a52f;letter-spacing:1px">';
    for (var i = 1; i <= 5; i++) out += i <= n ? '★' : '<span style="color:#d9e3de">★</span>';
    return out + '</span>';
  }

  function newSurvey(after) {
    UI.modal({
      title: 'تسجيل استبيان رضا عميل',
      sub: 'استبيان قصير يُسجل مباشرة بعد الخدمة',
      body: '<form id="svForm">' +
        '<div class="form-grid">' +
        UI.field('الفرع', UI.select('branchId', UI.branchOptions(false, false), App.state.branchId || 'b2', { req: true }), { req: true }) +
        UI.field('التاريخ', UI.input('date', U.todayISO(), { type: 'date', req: true }), { req: true }) +
        UI.field('الخدمة', UI.select('service', ['حسابات', 'تحويلات', 'صرف وقبض', 'قروض', 'اعتمادات'], 'حسابات')) +
        UI.field('القناة', UI.select('channel', C.CHANNELS, 'مكتب خدمة العملاء')) +
        '</div>' +
        '<div class="field mt-2"><label>تقييم العميل <span class="req">*</span></label>' +
        '<div style="display:flex;gap:8px" id="starPick">' +
        [1, 2, 3, 4, 5].map(function (n) {
          return '<button type="button" data-star="' + n + '" style="flex:1;padding:12px 0;border:1px solid #d8dcec;border-radius:11px;background:#fff;cursor:pointer;font-size:17px;color:#e0a52f">' + n + ' ★</button>';
        }).join('') + '</div><div class="hint">1 = غير راضٍ تمامًا · 5 = راضٍ جدًا</div></div>' +
        UI.field('ملاحظة العميل', UI.textarea('comment', '', { rows: 2, placeholder: 'اقتباس من ملاحظة العميل (اختياري)' })) +
        '</form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="svSave">حفظ الاستبيان</button>',
      onMount: function (wrap, close) {
        var score = 0;
        var form = wrap.querySelector('#svForm');
        wrap.querySelectorAll('[data-star]').forEach(function (b) {
          b.addEventListener('click', function () {
            score = +b.getAttribute('data-star');
            wrap.querySelectorAll('[data-star]').forEach(function (x) {
              var on = +x.getAttribute('data-star') <= score;
              x.style.background = on ? '#ecfdf3' : '#fff';
              x.style.borderColor = on ? '#1f286d' : '#d8dcec';
            });
          });
        });
        wrap.querySelector('#svSave').addEventListener('click', function () {
          var f = UI.formValues(form);
          if (!score) { UI.toast('يرجى اختيار تقييم من 1 إلى 5', 'err'); return; }
          K.Store.data.surveys.push({ id: U.uid('sv'), branchId: f.branchId, date: f.date, score: score, channel: f.channel, service: f.service, comment: f.comment });
          K.Store.save(); close(); UI.toast('تم تسجيل الاستبيان'); after();
        });
      }
    });
  }
})(window.KAK);
