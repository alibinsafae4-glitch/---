/* التقارير: يومي، أسبوعي، شهري، ربع سنوي */
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C, M = K.M, App = K.App;
  var V = { type: 'monthly', asOf: U.todayISO() };

  var TYPES = {
    daily: { label: 'تقرير يومي', code: 'RQ-D' },
    weekly: { label: 'تقرير أسبوعي', code: 'RQ-W' },
    monthly: { label: 'تقرير شهري', code: 'RQ-M' },
    quarterly: { label: 'تقرير ربع سنوي', code: 'RQ-Q' }
  };

  function scope(type, asOf) {
    if (type === 'daily') return { from: asOf, to: asOf, label: 'يوم ' + U.fmtDate(asOf) };
    if (type === 'weekly') return { from: U.addDays(asOf, -6), to: asOf, label: 'الأسبوع المنتهي في ' + U.fmtDate(asOf) };
    if (type === 'monthly') {
      var b = U.monthBounds(U.monthKey(asOf));
      return { from: b.from, to: b.to > asOf ? asOf : b.to, label: 'شهر ' + U.monthName(U.monthKey(asOf)) };
    }
    return { from: U.addDays(asOf, -89), to: asOf, label: 'الربع المنتهي في ' + U.fmtDate(asOf) };
  }

  function build() {
    var type = V.type, asOf = V.asOf, b = App.state.branchId;
    var s = scope(type, asOf);
    var prev = M.prevRange(s);
    var sat = M.satisfaction(b, s.from, s.to);
    var insp = M.inspectionScore(b, s.from, s.to);
    var ev = M.evalScore(b, s.from, s.to);
    var cs = M.complaintStats(b, s.from, s.to);
    var fs = M.findingStats(b, s.from, s.to);
    var tr = M.trainingRate(s.from, s.to);
    var csPrev = M.complaintStats(b, prev.from, prev.to);
    var fsPrev = M.findingStats(b, prev.from, prev.to);
    var kpis = C.KPIS.map(function (d) {
      var v = M.kpiValue(d.id, b, s.from, s.to);
      var tg = (K.Store.data.settings.targets || {})[d.id];
      if (tg === undefined) tg = d.id === 'errors' ? 1 : d.id === 'repeat' ? 10 : d.target;
      return { def: d, value: v, target: tg, status: M.kpiStatus(d, v) };
    });
    return {
      type: type, asOf: asOf, s: s, b: b, sat: sat, insp: insp, ev: ev, cs: cs, fs: fs, tr: tr,
      csPrev: csPrev, fsPrev: fsPrev, kpis: kpis, ranking: M.ranking(s.from, s.to),
      months: U.lastMonths(6), branchLabel: b ? UI.branchName(b) : 'جميع الفروع والإدارات'
    };
  }

  function recommendations(d) {
    var rec = [];
    var t = K.Store.data.settings.targets || {};
    if (d.sat && d.sat.value < 85) rec.push('رضا العملاء ' + UI.pct(d.sat.value) + ' أقل من المستهدف 85% — مراجعة أسباب عدم الرضا في الفروع الأقل تقييمًا وتحسين إجراءات الاستقبال والانتظار.');
    if (d.insp !== null && d.insp < 85) rec.push('متوسط درجة التفتيش ' + UI.n(d.insp, 1) + '% دون المستهدف 85% — إلزام الفروع الأدنى بخطة تصحيح خلال 15 يومًا وإعادة تفتيش تحققي.');
    if (d.cs.overdue > 0) rec.push('يوجد ' + d.cs.overdue + ' شكوى تجاوزت المهلة المحددة — تصعيد فوري إلى مدير الفرع ولجنة الجودة وتحديد سبب التأخير.');
    if (d.cs.total && d.cs.resolutionRate < 90) rec.push('نسبة حل الشكاوى ' + UI.pct(d.cs.resolutionRate) + ' أقل من 90% — تقليص زمن التحقيق وتفعيل الإسناد المبكر للمسؤول.');
    if (d.fs.overdue > 0) rec.push(d.fs.overdue + ' ملاحظة متأخرة عن تاريخ الإنجاز — إعادة تقييم الموارد المخصصة للمعالجة ومتابعة أسبوعية للملاحظات الحرجة.');
    if (d.fs.total && d.fs.closureRate < 90) rec.push('نسبة إغلاق الملاحظات ' + UI.pct(d.fs.closureRate) + ' أقل من المستهدف — التأكيد على توثيق التحقق قبل الإغلاق وإعادة فتح الملاحظات المتكررة.');
    if (d.fs.repeatRate > 10) rec.push('نسبة تكرار الملاحظات ' + UI.pct(d.fs.repeatRate) + ' مرتفعة — تحليل السبب الجذري للملاحظات المتكررة وتحديث الإجراءات والتدريب المرتبط بها.');
    if (d.tr.value < 100) rec.push('نسبة تغطية التدريب ' + UI.pct(d.tr.value) + ' — استكمال البرامج التدريبية للفئات غير المستهدفة وإدراج مواضيع الشكاوى وأمن المعلومات.');
    var worst = d.ranking.slice(-2).filter(function (x) { return x.score < 80; });
    if (worst.length) rec.push('فروع تحتاج تدخلًا: ' + worst.map(function (x) { return x.branch.name + ' (' + UI.n(x.score, 1) + ')'; }).join('، ') + ' — خطة تحسين موثقة ومتابعة نصف شهرية.');
    if (!rec.length) rec.push('جميع المؤشرات الرئيسية ضمن المستهدفات — الحفاظ على مستوى الأداء وتوثيق الممارسات الجيدة لتعميمها على الفروع.');
    return rec;
  }

  /* ---------- أقسام التقرير ---------- */
  function head(d) {
    var t = TYPES[d.type];
    return '<div class="report-head"><img class="report-logo" src="' + UI.asset('img/cac-logo.png') + '" alt="كاك بنك">' +
      '<div class="rh-main"><h2>' + t.label + ' — مراقبة الجودة</h2>' +
      '<div class="rh-sub">' + UI.esc(K.Store.data.settings.bankName) + ' · ' + UI.esc(K.Store.data.settings.unit) + ' · ' + UI.esc(K.Store.data.settings.dept) + '</div></div>' +
      '<div style="text-align:end"><div class="tiny muted">رقم التقرير</div><div class="small strong">' + t.code + '-' + d.asOf.replace(/-/g, '') + '</div></div></div>' +
      '<div class="report-meta"><div><span>الفترة</span>' + UI.esc(d.s.label) + '</div>' +
      '<div><span>النطاق</span>' + UI.esc(d.branchLabel) + '</div>' +
      '<div><span>تاريخ الإصدار</span>' + U.fmtDate(U.todayISO()) + '</div>' +
      '<div><span>أُعد بواسطة</span>' + UI.esc(App.state.user.name) + '</div></div>';
  }

  function summary(d) {
    var parts = [];
    parts.push('يشمل هذا التقرير ' + d.cs.total + ' شكوى و' + d.fs.total + ' ملاحظة و' + M.inspectionsOf(d.b, d.s.from, d.s.to).length + ' زيارة تفتيش');
    if (d.sat) parts.push('، وبلغت نسبة رضا العملاء ' + UI.pct(d.sat.value) + ' بناءً على ' + d.sat.count + ' استبيانًا');
    if (d.insp !== null) parts.push('، ومتوسط درجة التفتيش ' + UI.n(d.insp, 1) + '%');
    parts.push('. تم إغلاق ' + d.cs.closed + ' شكوى (' + UI.pct(d.cs.resolutionRate) + ') و' + d.fs.closed + ' ملاحظة (' + UI.pct(d.fs.closureRate) + ')');
    if (d.cs.overdue || d.fs.overdue) parts.push('، مع وجود ' + (d.cs.overdue + d.fs.overdue) + ' حالة تجاوزت المهلة');
    parts.push('.');
    return '<div class="note-box small" style="margin-bottom:16px"><b>الملخص التنفيذي: </b>' + parts.join('') + '</div>';
  }

  function tbl(headers, rows, widths) {
    return '<table><thead><tr>' + headers.map(function (h, i) { return '<th' + (widths && widths[i] ? ' style="width:' + widths[i] + '"' : '') + '>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + headers.length + '" style="text-align:center;color:#6b8078">لا توجد بيانات في هذه الفترة</td></tr>') +
      '</tbody></table>';
  }

  function secDaily(d) {
    var t = U.todayISO();
    var list = d.cs.list;
    var html = '<h3>ملخص اليوم</h3>' + tbl(['البند', 'العدد / القيمة'], [
      ['الشكاوى المستلمة', UI.n(list.length)],
      ['الشكاوى المغلقة', UI.n(list.filter(function (c) { return c.status === 'closed'; }).length)],
      ['الشكاوى المتأخرة عن المهلة', UI.n(list.filter(function (c) { return c.status !== 'closed' && c.dueDate < t; }).length)],
      ['الملاحظات المسجلة', UI.n(d.fs.total)],
      ['الملاحظات الحرجة المفتوحة', UI.n(d.fs.list.filter(function (f) { return f.severity === 'critical' && f.status !== 'closed'; }).length)],
      ['زيارات التفتيش الميداني', UI.n(M.inspectionsOf(d.b, d.s.from, d.s.to).length)],
      ['بطاقات تقييم الجودة', UI.n(M.evalOf(d.b, d.s.from, d.s.to).length)],
      ['استبيانات رضا العملاء', UI.n(M.surveysOf(d.b, d.s.from, d.s.to).length)],
      ['نسبة رضا العملاء', d.sat ? UI.pct(d.sat.value) : '—']
    ]);
    html += '<h3>الشكاوى المسجلة</h3>' + tbl(['الرقم', 'الفرع', 'الموضوع', 'النوع', 'الحالة', 'الاستحقاق'], list.map(function (c) {
      return [UI.esc(c.refNo), UI.esc(UI.branchName(c.branchId)), UI.esc(c.subject), UI.esc(c.type), UI.esc(C.COMPLAINT_STATUS[c.status].label), UI.date(c.dueDate)];
    }));
    var crit = d.fs.list.filter(function (f) { return f.status !== 'closed' && (f.severity === 'critical' || f.severity === 'high'); });
    html += '<h3>الملاحظات العاجلة</h3>' + tbl(['الملاحظة', 'الفرع', 'الخطورة', 'الاستحقاق'], crit.map(function (f) {
      return [UI.esc(f.desc), UI.esc(UI.branchName(f.branchId)), UI.esc((C.SEVERITY.filter(function (x) { return x.key === f.severity; })[0] || {}).label), UI.date(f.dueDate)];
    }));
    var avail = M.kpiValue('availability', d.b, d.s.from, d.s.to);
    html += '<h3>الأعطال والتأخيرات</h3>' + tbl(['المؤشر', 'القيمة', 'الهدف', 'الحالة'], [
      ['توافر الأنظمة', avail === null ? '—' : UI.pct(avail), UI.ltr('≥ 99%'), avail === null ? '—' : (avail >= 99 ? 'مطابق' : 'يحتاج معالجة')],
      ['الالتزام بوقت إنجاز المعاملات', (function () { var v = M.kpiValue('ontime', d.b, d.s.from, d.s.to); return v === null ? '—' : UI.pct(v); })(), UI.ltr('≥ 95%'), '—'],
      ['ملاحظات مرتبطة بتقنية المعلومات', UI.n(d.fs.list.filter(function (f) { return f.departmentId === 'العمليات وتقنية المعلومات'; }).length), '—', '—']
    ]);
    html += '<p class="tiny muted">حقول عدد العملاء وعدد المعاملات تُستمد آليًا عند ربط المنصة بأنظمة الفروع (Core Banking)؛ وتُسجل حاليًا يدويًا في تقرير الفرع اليومي.</p>';
    return html;
  }

  function secWeekly(d) {
    var ins = M.inspectionsOf(d.b, d.s.from, d.s.to).sort(function (a, b) { return b.score - a.score; });
    var html = '<h3>نتائج التفتيش</h3>' + tbl(['الفرع', 'التاريخ', 'النوع', 'المفتش', 'الدرجة'], ins.map(function (x) {
      return [UI.esc(UI.branchName(x.branchId)), UI.date(x.date), UI.esc(x.type), UI.esc(x.inspector), UI.n(x.score) + '%'];
    }));
    var newC = d.cs.list.filter(function (c) { return c.status !== 'closed'; });
    html += '<h3>الشكاوى الجديدة والمغلقة</h3>' + tbl(['الحالة', 'العدد'], [
      ['جديدة / قيد المعالجة', UI.n(newC.length)],
      ['مغلقة خلال الأسبوع', UI.n(d.cs.closed)],
      ['متأخرة عن المهلة', UI.n(d.cs.overdue)],
      ['نسبة الحل', d.cs.total ? UI.pct(d.cs.resolutionRate) : '—']
    ]);
    html += '<h3>الملاحظات المفتوحة</h3>' + tbl(['الملاحظة', 'الفرع', 'الخطورة', 'الاستحقاق', 'المسؤول'], d.fs.openList.slice(0, 12).map(function (f) {
      return [UI.esc(f.desc), UI.esc(UI.branchName(f.branchId)), UI.esc((C.SEVERITY.filter(function (x) { return x.key === f.severity; })[0] || {}).label), UI.date(f.dueDate), UI.esc(f.responsible)];
    }));
    var ontime = M.kpiValue('ontime', d.b, d.s.from, d.s.to);
    var err = M.kpiValue('errors', d.b, d.s.from, d.s.to);
    html += '<h3>تأخر المعاملات</h3>' + tbl(['المؤشر', 'القيمة', 'الهدف'], [
      ['الالتزام بالوقت', ontime === null ? '—' : UI.pct(ontime), UI.ltr('≥ 95%')],
      ['نسبة الأخطاء', err === null ? '—' : UI.pct(err), UI.ltr('&lt; 1%')],
      ['متوسط زمن حل الشكوى', d.cs.closed ? UI.n(d.cs.avgDays, 1) + ' يوم' : '—', '< 5 أيام']
    ]);
    html += '<h3>أداء الفروع</h3>' + tbl(['الفرع', 'المؤشر المركب', 'رضا', 'تفتيش', 'حل الشكاوى'], d.ranking.map(function (x) {
      return [UI.esc(x.branch.name), UI.n(x.score, 1), x.satisfaction ? UI.pct(x.satisfaction.value) : '—', x.inspection === null ? '—' : UI.n(x.inspection, 1) + '%', x.complaints.total ? UI.pct(x.complaints.resolutionRate) : '—'];
    }));
    return html;
  }

  function secMonthly(d) {
    var html = '<h3>مؤشرات الأداء</h3>' + tbl(['المؤشر', 'القيمة', 'الهدف', 'الحالة'], d.kpis.map(function (k) {
      var vTxt = k.value === null ? '—' : (k.def.unit === '%' ? UI.pct(k.value, 1) : UI.n(k.value, 1) + ' ' + k.def.unit); var tTxt = UI.ltr((k.def.dir === 'up' ? '≥ ' : '≤ ') + (k.def.unit === '%' ? UI.n(k.target) + '%' : UI.n(k.target) + ' ' + k.def.unit)); return [UI.esc(k.def.name), vTxt, tTxt, k.status.label];
    }));
    var byBranch = K.Store.data.branches.filter(function (x) { return x.type === 'فرع'; }).map(function (x) {
      var v = M.satisfaction(x.id, d.s.from, d.s.to);
      return [UI.esc(x.name), v ? UI.n(v.count) : '0', v ? UI.pct(v.value) : '—', v && v.value >= 85 ? 'مطابق' : 'يحتاج تحسينًا'];
    });
    html += '<h3>رضا العملاء</h3>' + tbl(['الفرع', 'عدد المشاركين', 'نسبة الرضا', 'الحالة'], byBranch);
    var errK = d.kpis.filter(function (k) { return k.def.id === 'errors'; })[0];
    var waitK = d.kpis.filter(function (k) { return k.def.id === 'wait'; })[0];
    html += '<h3>نسبة الأخطاء وزمن الانتظار</h3>' + tbl(['المؤشر', 'القيمة', 'الهدف'], [
      ['نسبة الأخطاء', errK && errK.value !== null ? UI.pct(errK.value) : '—', UI.ltr('&lt; 1%')],
      ['متوسط زمن الانتظار', waitK && waitK.value !== null ? UI.n(waitK.value, 1) + ' دقيقة' : '—', '< 10 دقائق'],
      ['متوسط زمن حل الشكوى', d.cs.closed ? UI.n(d.cs.avgDays, 1) + ' يوم' : '—', '< 5 أيام']
    ]);
    var ins = M.inspectionsOf(d.b, d.s.from, d.s.to);
    html += '<h3>نتائج التفتيش</h3>' + tbl(['الفرع', 'التاريخ', 'الدرجة', 'أضعف عنصر'], ins.sort(function (a, b) { return a.score - b.score; }).slice(0, 8).map(function (x) {
      var weak = x.items.slice().sort(function (a, b) { return a.score - b.score; })[0];
      return [UI.esc(UI.branchName(x.branchId)), UI.date(x.date), UI.n(x.score) + '%', UI.esc(weak ? weak.name + ' (' + weak.score + '/5)' : '—')];
    }));
    html += '<h3>الشكاوى حسب النوع</h3>' + tbl(['النوع', 'العدد', 'مغلقة', 'متأخرة', 'متوسط أيام الحل'], C.COMPLAINT_TYPES.map(function (t2) {
      var rows = d.cs.list.filter(function (c) { return c.typeKey === t2.key; });
      var cl = rows.filter(function (c) { return c.status === 'closed'; });
      var days = cl.filter(function (c) { return c.closedDate; }).map(function (c) { return Math.max(0, U.diffDays(c.receivedDate, c.closedDate)); });
      return [t2.label, UI.n(rows.length), UI.n(cl.length), UI.n(rows.filter(function (c) { return c.status !== 'closed' && c.dueDate < U.todayISO(); }).length), days.length ? UI.n(U.avg(days), 1) : '—'];
    }));
    html += '<h3>الإجراءات التصحيحية</h3>' + tbl(['الحالة', 'العدد'], [
      ['مفتوحة', UI.n(d.fs.open)],
      ['مغلقة', UI.n(d.fs.closed)],
      ['متأخرة', UI.n(d.fs.overdue)],
      ['حرجة', UI.n(d.fs.critical)],
      ['نسبة الإغلاق', d.fs.total ? UI.pct(d.fs.closureRate) : '—'],
      ['نسبة التكرار', d.fs.total ? UI.pct(d.fs.repeatRate) : '—']
    ]);
    html += '<h3>التوصيات</h3><ol style="font-size:12px;padding-inline-start:20px">' + recommendations(d).map(function (x) { return '<li style="margin-bottom:5px">' + UI.esc(x) + '</li>'; }).join('') + '</ol>';
    return html;
  }

  function secQuarterly(d) {
    var html = '<h3>مقارنة الأداء بين الفروع</h3>' + tbl(['#', 'الفرع', 'المركب', 'بطاقة التقييم', 'رضا العملاء', 'التفتيش', 'حل الشكاوى', 'إغلاق الملاحظات', 'التصنيف'], d.ranking.map(function (x, i) {
      var cls = x.score >= 90 ? 'ممتاز' : x.score >= 80 ? 'جيد' : x.score >= 70 ? 'يحتاج تحسينًا' : 'ضعيف';
      return [String(i + 1), UI.esc(x.branch.name), UI.n(x.score, 1), x.evaluation === null ? '—' : UI.n(x.evaluation, 1),
        x.satisfaction ? UI.pct(x.satisfaction.value) : '—', x.inspection === null ? '—' : UI.n(x.inspection, 1) + '%',
        x.complaints.total ? UI.pct(x.complaints.resolutionRate) : '—', x.findings.total ? UI.pct(x.findings.closureRate) : '—', cls];
    }));

    var trend = d.months.map(function (mk) {
      var bb = U.monthBounds(mk);
      var s2 = M.satisfaction(d.b, bb.from, bb.to);
      var i2 = M.inspectionScore(d.b, bb.from, bb.to);
      var c2 = M.complaintsOf(d.b, bb.from, bb.to).length;
      return [U.monthName(mk), s2 ? UI.pct(s2.value) : '—', i2 === null ? '—' : UI.n(i2, 1) + '%', UI.n(c2)];
    });
    html += '<h3>تحليل الاتجاهات (6 أشهر)</h3>' + tbl(['الشهر', 'رضا العملاء', 'درجة التفتيش', 'الشكاوى'], trend);

    var closedAll = K.Store.data.findings.filter(function (f) { return f.closedDate; });
    var mttr = closedAll.length ? U.avg(closedAll, function (f) { return Math.max(0, U.diffDays(f.foundDate, f.closedDate)); }) : 0;
    html += '<h3>فعالية الإجراءات التصحيحية</h3>' + tbl(['المؤشر', 'القيمة'], [
      ['نسبة الإغلاق', d.fs.total ? UI.pct(d.fs.closureRate) : '—'],
      ['متوسط زمن الإغلاق', UI.n(mttr, 1) + ' يوم'],
      ['نسبة التكرار', d.fs.total ? UI.pct(d.fs.repeatRate) : '—'],
      ['ملاحظات حرجة', UI.n(d.fs.critical)],
      ['ملاحظات متأخرة', UI.n(d.fs.overdue)]
    ]);

    html += '<h3>تحديث معايير الجودة</h3><ul style="font-size:12px;padding-inline-start:20px">' +
      ['مراجعة أوزان بطاقة التقييم وفق نتائج الربع.',
        'تحديث مستهدفات المؤشرات بناءً على الأداء الفعلي والقدرة التشغيلية.',
        'تعميم الدروس المستفادة من الشكاوى المتكررة على جميع الفروع.',
        'تحديث قوائم التفتيش لتشمل ضوابط أمن المعلومات والامتثال الجديدة.'
      ].map(function (x) { return '<li style="margin-bottom:4px">' + x + '</li>'; }).join('') + '</ul>';

    html += '<h3>خطة التحسين للربع القادم</h3>' + tbl(['الإجراء', 'المسؤول', 'المهلة'], [
      ['خطة تصحيح للفروع الأقل من 80% مع إعادة تفتيش تحققي', 'مدراء الفروع وإدارة توكيد الجودة', '15 يومًا'],
      ['برنامج تدريبي مركّز على إدارة الشكاوى وخدمة العملاء', 'إدارة التدريب والتطوير', 'شهر'],
      ['مراجعة ضوابط أمن المعلومات وحفظ المستندات', 'إدارة المخاطر والالتزام', 'شهر'],
      ['تقليص زمن حل الشكاوى إلى أقل من 5 أيام', 'إدارة الشكاوى وخدمة العملاء', 'مستمر'],
      ['تحديث معايير الجودة وبطاقة التقييم', 'لجنة الجودة', 'قبل نهاية الربع']
    ]);
    html += '<h3>توصيات اللجنة</h3><ol style="font-size:12px;padding-inline-start:20px">' + recommendations(d).map(function (x) { return '<li style="margin-bottom:5px">' + UI.esc(x) + '</li>'; }).join('') + '</ol>';
    return html;
  }

  K.views.reports = {
    roles: ['admin', 'quality', 'committee', 'branch', 'viewer'],
    render: function () {
      var d = build();
      var body = '';
      if (d.type === 'daily') body = secDaily(d);
      else if (d.type === 'weekly') body = secWeekly(d);
      else if (d.type === 'monthly') body = secMonthly(d);
      else body = secQuarterly(d);

      var html = '';
      html += '<div class="page-head no-print"><div><h1>التقارير</h1>' +
        '<div class="desc">تقارير جاهزة للطباعة والاعتماد: يومي، أسبوعي، شهري، وربع سنوي — تُحتسب آليًا من سجلات المنصة.</div></div></div>';

      html += '<div class="card card-pad no-print mb-2">' +
        '<div class="toolbar" style="margin:0">' +
        '<div class="chips" id="repTypes">' +
        Object.keys(TYPES).map(function (k2) {
          return '<button class="chip ' + (V.type === k2 ? 'active' : '') + '" data-type="' + k2 + '">' + TYPES[k2].label + '</button>';
        }).join('') + '</div>' +
        '<div class="spacer"></div>' +
        '<div class="field" style="margin:0;width:170px"><input type="date" id="repDate" value="' + V.asOf + '"></div>' +
        '<button class="btn btn-outline" id="repRefresh">' + UI.icon('refresh') + ' تحديث</button>' +
        '<button class="btn btn-primary" id="repPrint">' + UI.icon('printer') + ' طباعة / PDF</button>' +
        '</div>' +
        '<div class="small muted mt-1">حسب فلتر الفرع والفترة في الشريط العلوي — النطاق الحالي: <b>' + UI.esc(d.branchLabel) + '</b></div>' +
        '</div>';

      html += '<div class="report-sheet" id="reportSheet">' + head(d) + summary(d) + body +
        '<div class="sign"><div>أعدّه: ' + UI.esc(App.state.user.name) + '</div><div>راجعه: مدير إدارة توكيد الجودة</div><div>اعتمده: الإدارة العامة</div></div>' +
        '<div class="tiny muted center" style="margin-top:14px">' + UI.esc(K.Store.data.settings.slogan) + ' · ' + UI.esc(K.Store.data.settings.bankName) + ' — ' + UI.esc(K.Store.data.settings.unit) + '</div>' +
        '</div>';

      return html;
    },
    mount: function (root) {
      root.querySelectorAll('[data-type]').forEach(function (b) {
        b.addEventListener('click', function () { V.type = b.getAttribute('data-type'); App.refresh(); });
      });
      var dEl = root.querySelector('#repDate');
      dEl.addEventListener('change', function () { V.asOf = this.value || U.todayISO(); App.refresh(); });
      root.querySelector('#repRefresh').addEventListener('click', function () { App.refresh(); });
      root.querySelector('#repPrint').addEventListener('click', function () { window.print(); });
    }
  };
})(window.KAK);
