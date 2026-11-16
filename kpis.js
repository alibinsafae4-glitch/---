/* مؤشرات الأداء */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { kpi: 'satisfaction', month: '', branch: '' };

  function targetOf(def) {
    var t = K.Store.data.settings.targets || {};
    if (t[def.id] !== undefined) return t[def.id];
    if (def.id === 'repeat') return 10;
    if (def.id === 'errors') return 1;
    return def.target;
  }

  K.views.kpis = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var r = App.range(); var b = App.state.branchId;
      var months = U.lastMonths(6);
      var prev = M.prevRange(r);
      var html = '';
      html += '<div class="page-head"><div><h1>مؤشرات الأداء</h1>' +
        '<div class="desc">عشرة مؤشرات معتمدة لقياس الجودة، بمستهدفات واضحة: رضا العملاء، زمن الانتظار، الأخطاء، الالتزام بالوقت، حل الشكاوى، زمن الحل، تكرار الملاحظات، التدريب، درجة التفتيش، توافر الأنظمة.</div></div>' +
        '<div class="actions"><button class="btn btn-outline" id="kpiExport">' + UI.icon('download') + ' تصدير</button>' +
        (App.can('write') ? '<button class="btn btn-primary" id="btnManual">' + UI.icon('edit') + ' إدخال المؤشرات التشغيلية</button>' : '') + '</div></div>';

      html += '<div class="grid grid-5" style="margin-bottom:18px">';
      C.KPIS.forEach(function (def) {
        var val = M.kpiValue(def.id, b, r.from, r.to);
        var pv = M.kpiValue(def.id, b, prev.from, prev.to);
        var st = M.kpiStatus(def, val);
        var target = targetOf(def);
        var spark = months.map(function (mk) { var bb = U.monthBounds(mk); return M.kpiValue(def.id, b, bb.from, bb.to); });
        var pct = val === null ? 0 : (def.dir === 'up' ? Math.min(100, val) : Math.max(0, Math.min(100, 100 - (val - target) * 8)));
        var diff = (val !== null && pv !== null) ? val - pv : null;
        html += '<div class="card card-pad" style="display:flex;flex-direction:column;gap:6px">' +
          '<div style="display:flex;align-items:center;gap:8px"><span class="small strong" style="flex:1">' + UI.esc(def.name) + '</span>' + UI.badge(st.label, st.tone, true) + '</div>' +
          '<div style="display:flex;align-items:baseline;gap:5px"><span style="font-size:26px;font-weight:800;letter-spacing:-.5px">' +
          (val === null ? '—' : UI.n(val, def.unit === '%' ? 1 : (def.unit === 'دقيقة' ? 1 : 1))) + '</span>' +
          '<small class="muted" style="font-weight:600">' + UI.esc(def.unit) + '</small>' +
          (diff !== null && Math.abs(diff) >= 0.05 ? '<span class="delta ' + ((def.dir === 'up' ? diff > 0 : diff < 0) ? 'up' : 'down') + '" style="margin-inline-start:auto">' +
            (diff > 0 ? '▲' : '▼') + ' ' + UI.n(Math.abs(diff), 1) + '</span>' : '') + '</div>' +
          '<div class="progress ' + (st.tone === 'b-red' ? 'red' : st.tone === 'b-amber' ? 'amber' : '') + '" style="height:6px"><span style="width:' + UI.clamp(pct, 0, 100) + '%"></span></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted)"><span>الهدف: ' + (def.unit === '%' ? UI.pct(target, 0) : UI.n(target) + ' ' + UI.esc(def.unit)) + '</span><span>' + UI.esc(def.source) + '</span></div>' +
          UI.charts.spark(spark, st.tone === 'b-red' ? '#b42318' : '#4655b8') +
          '</div>';
      });
      html += '</div>';

      /* اتجاه مؤشر */
      var cur = C.KPIS.filter(function (d) { return d.id === V.kpi; })[0] || C.KPIS[0];
      var series = months.map(function (mk) { var bb = U.monthBounds(mk); return M.kpiValue(cur.id, b, bb.from, bb.to); });
      html += '<div class="grid grid-main mb-2">';
      html += '<div class="card"><div class="card-head"><h3>اتجاه المؤشر <span class="sub">— آخر 6 أشهر</span></h3>' +
        '<div class="tools"><select id="kpiSel" style="width:auto;min-width:170px;padding-block:5px;font-size:12.5px">' +
        C.KPIS.map(function (d) { return '<option value="' + d.id + '"' + (V.kpi === d.id ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') +
        '</select></div></div><div class="card-body">' +
        UI.charts.line({
          labels: months.map(function (mk) { return U.monthName(mk).split(' ')[0]; }),
          series: [{ name: cur.name, data: series, color: '#1f286d' }],
          target: targetOf(cur)
        }) +
        '<div class="note-box small mt-1">' + UI.esc(cur.calc) + ' — الهدف: ' + (cur.dir === 'up' ? 'أعلى من أو يساوي ' : 'أقل من أو يساوي ') + UI.n(targetOf(cur)) + ' ' + cur.unit + '.</div>' +
        '</div></div>';

      /* بطاقة مرجعية */
      html += '<div class="card"><div class="card-head"><h3>بطاقة المؤشرات المعتمدة</h3></div><div class="card-body" style="padding-top:12px">' +
        '<div class="legend-list">' +
        C.KPIS.map(function (d) {
          var v = M.kpiValue(d.id, b, r.from, r.to);
          var st = M.kpiStatus(d, v);
          return '<div class="legend-row" style="border-bottom:1px solid var(--line-2);padding-bottom:7px">' +
            '<span class="small" style="flex:1">' + UI.esc(d.name) + '<br><span class="tiny muted">' + UI.esc(d.calc) + '</span></span>' +
            '<span class="v small">' + (v === null ? '—' : (d.unit === '%' ? UI.pct(v, 1) : UI.n(v, 1) + ' ' + d.unit)) + '</span></div>';
        }).join('') + '</div></div></div>';
      html += '</div>';

      /* جدول تفصيلي */
      html += '<div class="card"><div class="card-head"><h3>لوحة المؤشرات التفصيلية</h3><div class="tools"><span class="small muted">' + UI.esc(r.label) + '</span></div></div>' +
        '<div class="table-wrap" style="border:0;border-radius:0"><table class="tbl"><thead><tr>' +
        '<th>المؤشر</th><th>طريقة الحساب</th><th>القيمة الحالية</th><th>الفترة السابقة</th><th>الهدف</th><th>الفارق</th><th>الحالة</th><th>المصدر</th>' +
        '</tr></thead><tbody>';
      C.KPIS.forEach(function (d) {
        var v = M.kpiValue(d.id, b, r.from, r.to);
        var pv = M.kpiValue(d.id, b, prev.from, prev.to);
        var st = M.kpiStatus(d, v);
        var tg = targetOf(d);
        var diff = (v !== null && pv !== null) ? v - pv : null;
        html += '<tr><td><b>' + UI.esc(d.name) + '</b></td>' +
          '<td class="sub wrap" style="min-width:220px">' + UI.esc(d.calc) + '</td>' +
          '<td><b class="num" style="font-size:14px">' + (v === null ? '—' : UI.n(v, 1)) + '</b> <span class="sub">' + d.unit + '</span></td>' +
          '<td class="sub num">' + (pv === null ? '—' : UI.n(pv, 1)) + '</td>' +
          '<td class="num">' + UI.ltr((d.dir === 'up' ? '≥ ' : '≤ ') + (d.unit === '%' ? UI.n(tg) + '%' : UI.n(tg))) + '</td>' +
          '<td>' + (diff === null ? '<span class="sub">—</span>' : '<span class="delta ' + (diff === 0 ? 'flat' : ((d.dir === 'up' ? diff > 0 : diff < 0) ? 'up' : 'down')) + '">' + (diff > 0 ? '+' : '') + UI.n(diff, 1) + '</span>') + '</td>' +
          '<td>' + UI.badge(st.label, st.tone, true) + '</td>' +
          '<td class="sub">' + UI.esc(d.source) + '</td></tr>';
      });
      html += '</tbody></table></div></div>';

      html += '<div class="note-box gold mt-2 small">' + UI.icon('info') + ' المؤشرات المحسوبة آليًا تُستمد من سجلات الشكاوى والتفتيش والملاحظات والاستبيانات والتدريب. المؤشرات التشغيلية (زمن الانتظار، الأخطاء، الالتزام بالوقت، توافر الأنظمة) تُدخل شهريًا لكل فرع من زر «إدخال المؤشرات التشغيلية».</div>';

      return html;
    },
    mount: function (root) {
      var sel = root.querySelector('#kpiSel');
      if (sel) sel.addEventListener('change', function () { V.kpi = this.value; App.refresh(); });
      var ex = root.querySelector('#kpiExport');
      if (ex) ex.addEventListener('click', function () {
        var r = App.range(), b = App.state.branchId;
        UI.csv('مؤشرات-الأداء-' + U.todayISO(), ['المؤشر', 'طريقة الحساب', 'القيمة', 'الهدف', 'الوحدة', 'الحالة'],
          C.KPIS.map(function (d) {
            var v = M.kpiValue(d.id, b, r.from, r.to);
            return [d.name, d.calc, v === null ? '' : v, targetOf(d), d.unit, M.kpiStatus(d, v).label];
          }));
      });
      var bm = root.querySelector('#btnManual');
      if (bm) bm.addEventListener('click', manualModal);
    }
  };

  function manualModal() {
    var months = U.lastMonths(12);
    var defaultMonth = months[months.length - 1];
    var defaultBranch = App.state.branchId || 'b1';
    var defs = C.KPIS.filter(function (d) { return C.MANUAL_KPIS.indexOf(d.id) > -1; });

    function fieldsFor(branchId, mk) {
      return defs.map(function (d) {
        var row = K.Store.data.kpiValues.filter(function (v) { return v.kpi === d.id && v.branchId === branchId && v.month === mk; })[0];
        return UI.field(d.name + ' (' + d.unit + ')', UI.input('m_' + d.id, row ? row.value : '', { type: 'number', step: '0.01', min: 0, placeholder: 'القيمة' }), { hint: d.calc });
      }).join('');
    }

    UI.modal({
      title: 'إدخال المؤشرات التشغيلية',
      sub: 'قيمة شهرية لكل فرع — تُستخدم في حساب المؤشرات ومقارنة الفروع',
      body: '<div class="form-grid mb-2">' +
        UI.field('الشهر', UI.select('mMonth', months.map(function (mk) { return { value: mk, label: U.monthName(mk) }; }), defaultMonth)) +
        UI.field('الفرع', UI.select('mBranch', UI.branchOptions(false, false), defaultBranch)) +
        '</div><form id="manualForm"><div class="form-grid" id="manualFields">' + fieldsFor(defaultBranch, defaultMonth) + '</div></form>',
      footer: '<button class="btn btn-outline" data-close>إلغاء</button><button class="btn btn-primary" id="mSave">حفظ القيم</button>',
      onMount: function (wrap, close) {
        var mSel = wrap.querySelector('[name=mMonth]');
        var bSel = wrap.querySelector('[name=mBranch]');
        var holder = wrap.querySelector('#manualFields');
        function refresh() { holder.innerHTML = fieldsFor(bSel.value, mSel.value); }
        mSel.addEventListener('change', refresh);
        bSel.addEventListener('change', refresh);
        wrap.querySelector('#mSave').addEventListener('click', function () {
          var vals = UI.formValues(wrap.querySelector('#manualForm'));
          var n = 0;
          defs.forEach(function (d) {
            var raw = vals['m_' + d.id];
            if (raw === '' || raw === undefined) return;
            var num = Number(raw);
            if (isNaN(num)) return;
            var row = K.Store.data.kpiValues.filter(function (v) { return v.kpi === d.id && v.branchId === bSel.value && v.month === mSel.value; })[0];
            if (row) { row.value = num; }
            else K.Store.data.kpiValues.push({ id: U.uid('kv'), kpi: d.id, branchId: bSel.value, month: mSel.value, value: num });
            n++;
          });
          K.Store.save(); close();
          UI.toast(n ? 'تم حفظ ' + n + ' قيمة مؤشر' : 'لم يتم تغيير أي قيمة');
          App.refresh();
        });
      }
    });
  }
})(window.KAK);
