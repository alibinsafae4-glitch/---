/* ============================================================
   كاك بنك – منصة مراقبة الجودة
   طبقة البيانات: الثوابت، التخزين، البيانات التجريبية، المؤشرات
   ============================================================ */
window.KAK = window.KAK || {};
(function (K) {
  'use strict';

  /* ---------- أدوات التاريخ ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); }
  function todayISO() { return toISO(new Date()); }
  function addDays(iso, n) { var d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
  function addMonths(iso, n) { var d = parseISO(iso); d.setMonth(d.getMonth() + n); return toISO(d); }
  function diffDays(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
  function monthKey(iso) { return String(iso).slice(0, 7); }
  function monthBounds(mk) {
    var p = mk.split('-'); var y = +p[0], m = +p[1];
    var last = new Date(y, m, 0).getDate();
    return { from: mk + '-01', to: mk + '-' + pad(last) };
  }
  function monthName(mk) {
    var names = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    var p = mk.split('-');
    return names[+p[1] - 1] + ' ' + p[0];
  }
  function lastMonths(n) {
    var out = [], d = new Date();
    d.setDate(1);
    for (var i = n - 1; i >= 0; i--) {
      var x = new Date(d.getFullYear(), d.getMonth() - i, 1);
      out.push(x.getFullYear() + '-' + pad(x.getMonth() + 1));
    }
    return out;
  }
  function fmtDate(iso, withYear) {
    if (!iso) return '—';
    var months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    var d = parseISO(iso);
    return d.getDate() + ' ' + months[d.getMonth()] + (withYear === false ? '' : ' ' + d.getFullYear());
  }

  K.U = {
    pad: pad, toISO: toISO, parseISO: parseISO, todayISO: todayISO, addDays: addDays, addMonths: addMonths,
    diffDays: diffDays, monthKey: monthKey, monthBounds: monthBounds, monthName: monthName, lastMonths: lastMonths,
    fmtDate: fmtDate,
    uid: function (p) { return (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    round: function (v, n) { var f = Math.pow(10, n || 0); return Math.round(v * f) / f; },
    sum: function (arr, f) { return arr.reduce(function (s, x) { return s + (f ? f(x) : x); }, 0); },
    avg: function (arr, f) { return arr.length ? K.U.sum(arr, f) / arr.length : 0; }
  };

  /* ============================================================
     الثوابت المرجعية (مستخلصة من وثيقة المشروع)
     ============================================================ */
  var C = {};

  C.BANK = {
    name: 'بنك التسليف التعاوني والزراعي',
    short: 'كاك بنك',
    unit: 'الإدارة العامة – عدن',
    dept: 'إدارة توكيد الجودة',
    slogan: 'شاركنا الريادة'
  };

  C.ROLES = {
    admin: 'مدير النظام',
    quality: 'مسؤول الجودة',
    committee: 'عضو لجنة الجودة',
    branch: 'مدير فرع',
    viewer: 'اطلاع فقط'
  };

  C.BRANCHES = [
    { id: 'b1', code: '000', name: 'الإدارة العامة – عدن', city: 'عدن', manager: 'أ. عبدالله السقاف', type: 'إدارة عامة' },
    { id: 'b2', code: '101', name: 'فرع كريتر', city: 'عدن', manager: 'أ. محمد باشراحيل', type: 'فرع' },
    { id: 'b3', code: '102', name: 'فرع المنصورة', city: 'عدن', manager: 'أ. عمار الجابري', type: 'فرع' },
    { id: 'b4', code: '103', name: 'فرع الشيخ عثمان', city: 'عدن', manager: 'أ. سامي الحكيمي', type: 'فرع' },
    { id: 'b5', code: '104', name: 'فرع خورمكسر', city: 'عدن', manager: 'أ. نبيل العولقي', type: 'فرع' },
    { id: 'b6', code: '105', name: 'فرع البريقة', city: 'عدن', manager: 'أ. فارس الشامي', type: 'فرع' },
    { id: 'b7', code: '201', name: 'فرع لحج', city: 'لحج', manager: 'أ. أنور الصبيحي', type: 'فرع' },
    { id: 'b8', code: '202', name: 'فرع زنجبار – أبين', city: 'أبين', manager: 'أ. خالد اليافعي', type: 'فرع' },
    { id: 'b9', code: '203', name: 'فرع عتق – شبوة', city: 'شبوة', manager: 'أ. صالح بن دهيم', type: 'فرع' },
    { id: 'b10', code: '204', name: 'فرع سيئون – حضرموت', city: 'حضرموت', manager: 'أ. عمر بامطرف', type: 'فرع' },
    { id: 'b11', code: '205', name: 'فرع المكلا – حضرموت', city: 'حضرموت', manager: 'أ. ياسر باحويرث', type: 'فرع' }
  ];

  C.DEPARTMENTS = [
    'خدمة العملاء', 'الحسابات والتحويلات', 'الاعتمادات المستندية والحوالات التجارية',
    'القروض والتسهيلات', 'الصرف والقبض', 'الشكاوى وخدمة العملاء',
    'الموارد البشرية', 'العمليات وتقنية المعلومات', 'المخاطر والالتزام',
    'التدريب والتطوير', 'إدارة توكيد الجودة', 'المراجعة الداخلية'
  ];

  /* بطاقة تقييم الجودة: 100 درجة */
  C.EVAL_ITEMS = [
    { key: 'workHours', name: 'الالتزام بساعات العمل', weight: 10 },
    { key: 'cleanliness', name: 'النظافة والترتيب', weight: 5 },
    { key: 'speed', name: 'سرعة خدمة العميل', weight: 15 },
    { key: 'accuracy', name: 'دقة المعاملات والمستندات', weight: 20 },
    { key: 'compliance', name: 'الالتزام بالإجراءات والصلاحيات', weight: 20 },
    { key: 'confidentiality', name: 'سرية بيانات العملاء', weight: 10 },
    { key: 'complaints', name: 'معالجة الشكاوى', weight: 10 },
    { key: 'communication', name: 'جودة التعامل والاتصال', weight: 10 }
  ];

  C.CLASSIFICATION = [
    { min: 90, max: 100, label: 'ممتاز', tone: 'b-green', action: 'شكر وتحفيز' },
    { min: 80, max: 89, label: 'جيد', tone: 'b-teal', action: 'تحسينات بسيطة' },
    { min: 70, max: 79, label: 'يحتاج تحسينًا', tone: 'b-amber', action: 'خطة تصحيح خلال 15 يومًا' },
    { min: 0, max: 69, label: 'ضعيف', tone: 'b-red', action: 'خطة عاجلة ومتابعة أسبوعية' }
  ];

  /* أنواع الشكاوى والمهل (أيام عمل) */
  C.COMPLAINT_TYPES = [
    { key: 'simple', label: 'شكوى بسيطة', sla: 1 },
    { key: 'medium', label: 'شكوى متوسطة', sla: 3 },
    { key: 'financial', label: 'شكوى مالية أو إجرائية', sla: 5 },
    { key: 'complex', label: 'شكوى معقدة', sla: 10 }
  ];

  C.CHANNELS = ['صندوق الشكاوى في الفرع', 'مكتب خدمة العملاء', 'الهاتف', 'البريد الإلكتروني الرسمي', 'استمارة ورقية', 'استمارة إلكترونية', 'مقابلة مباشرة مع مدير الفرع'];

  C.COMPLAINT_STATUS = {
    new: { label: 'مفتوحة', tone: 'b-blue' },
    progress: { label: 'قيد المعالجة', tone: 'b-amber' },
    closed: { label: 'مغلقة', tone: 'b-green' }
  };

  C.COMPLAINT_STAGES = ['استلام الشكوى', 'تسجيلها برقم مرجعي', 'تصنيف نوع الشكوى', 'تحديد المسؤول عن المعالجة', 'التحقيق في الشكوى', 'اتخاذ الإجراء التصحيحي', 'إبلاغ العميل بالنتيجة', 'إغلاق الشكوى', 'تحليل السبب الجذري', 'منع تكرار المشكلة'];

  /* درجات الخطورة */
  C.SEVERITY = [
    { key: 'critical', label: 'حرجة', desc: 'خطر مالي أو أمني أو امتثالي مباشر', sla: '24 ساعة', hours: 24, tone: 'b-red' },
    { key: 'high', label: 'عالية', desc: 'خطأ متكرر أو تأثير على العميل', sla: '3 أيام', days: 3, tone: 'b-amber' },
    { key: 'medium', label: 'متوسطة', desc: 'خلل إجرائي أو تأخير', sla: '7 أيام', days: 7, tone: 'b-blue' },
    { key: 'low', label: 'منخفضة', desc: 'ملاحظة تحسينية', sla: '15 يومًا', days: 15, tone: 'b-gray' }
  ];

  C.FINDING_STATUS = {
    open: { label: 'مفتوحة', tone: 'b-red' },
    progress: { label: 'قيد المعالجة', tone: 'b-amber' },
    closed: { label: 'مغلقة', tone: 'b-green' }
  };

  C.FINDING_CATEGORIES = ['التزام الموظفين', 'جاهزية المكاتب', 'اللوحات الإرشادية', 'سرعة الخدمة', 'دقة المعاملات', 'حفظ المستندات', 'الصلاحيات', 'التعامل مع العملاء', 'معالجة الشكاوى', 'أمن المعلومات', 'النظافة والترتيب', 'إجراءات العمل'];

  C.INSPECTION_ITEMS = ['انتظام الموظفين', 'جاهزية مكاتب الخدمة', 'وضوح اللوحات الإرشادية', 'سرعة الخدمة', 'دقة المعاملات', 'حفظ المستندات', 'الالتزام بالصلاحيات', 'التعامل مع العملاء', 'معالجة الشكاوى', 'أمن المعلومات', 'نظافة المكان', 'الالتزام بإجراءات العمل'];

  C.INSPECTION_TYPES = ['مفاجئ', 'دوري', 'ربع سنوي', 'بناءً على شكوى أو ملاحظة', 'بناءً على مؤشر أداء منخفض'];

  C.TRAINING_TOPICS = [
    'خدمة العملاء المتميزة', 'الاتصال الفعال', 'إدارة الشكاوى', 'التعامل مع العملاء الغاضبين',
    'إجراءات العمل المصرفي', 'مكافحة غسل الأموال', 'أمن المعلومات', 'أخلاقيات العمل',
    'إدارة الوقت', 'الجودة والتحسين المستمر'
  ];

  /* مؤشرات الأداء */
  C.KPIS = [
    { id: 'satisfaction', name: 'رضا العملاء', calc: 'عدد العملاء الراضين ÷ إجمالي المشاركين', target: 85, unit: '%', dir: 'up', auto: true, source: 'استبيانات الرضا' },
    { id: 'wait', name: 'زمن الانتظار', calc: 'متوسط دقائق الانتظار', target: 10, unit: 'دقيقة', dir: 'down', auto: false, source: 'إدخال يدوي' },
    { id: 'errors', name: 'نسبة الأخطاء', calc: 'المعاملات الخاطئة ÷ إجمالي المعاملات', target: 1, unit: '%', dir: 'down', auto: false, source: 'إدخال يدوي' },
    { id: 'ontime', name: 'الالتزام بالوقت', calc: 'المعاملات المنجزة في الوقت ÷ الإجمالي', target: 95, unit: '%', dir: 'up', auto: false, source: 'إدخال يدوي' },
    { id: 'resolution', name: 'حل الشكاوى', calc: 'الشكاوى المحلولة ÷ إجمالي الشكاوى', target: 90, unit: '%', dir: 'up', auto: true, source: 'سجل الشكاوى' },
    { id: 'resolutionTime', name: 'زمن حل الشكوى', calc: 'إجمالي أيام الحل ÷ عدد الشكاوى', target: 5, unit: 'يوم', dir: 'down', auto: true, source: 'سجل الشكاوى' },
    { id: 'repeat', name: 'تكرار الملاحظات', calc: 'الملاحظات المتكررة ÷ إجمالي الملاحظات', target: 10, unit: '%', dir: 'down', auto: true, source: 'سجل الملاحظات' },
    { id: 'training', name: 'نسبة التدريب', calc: 'الموظفون المدربون ÷ المستهدفون', target: 100, unit: '%', dir: 'up', auto: true, source: 'سجل التدريب' },
    { id: 'inspection', name: 'درجة التفتيش', calc: 'متوسط نتائج بطاقة التقييم', target: 85, unit: '%', dir: 'up', auto: true, source: 'التفتيش الميداني' },
    { id: 'availability', name: 'توافر الأنظمة', calc: 'ساعات عمل النظام ÷ ساعات التشغيل', target: 99, unit: '%', dir: 'up', auto: false, source: 'إدخال يدوي' }
  ];

  C.MANUAL_KPIS = ['wait', 'errors', 'ontime', 'availability'];

  C.COMMITTEE = [
    { role: 'رئيس اللجنة', member: 'ممثل الإدارة العليا' },
    { role: 'عضو', member: 'مدير إدارة الجودة وتطوير الأعمال' },
    { role: 'عضو', member: 'ممثل إدارة المخاطر والالتزام' },
    { role: 'عضو', member: 'ممثل إدارة العمليات وتقنية المعلومات' },
    { role: 'عضو', member: 'ممثل خدمة العملاء' },
    { role: 'عضو', member: 'ممثل الموارد البشرية' },
    { role: 'عضو', member: 'ممثل الفروع' },
    { role: 'مقرر اللجنة', member: 'مسؤول متابعة الملاحظات والتقارير' }
  ];

  C.GOVERNANCE = [
    { entity: 'مجلس الإدارة', duty: 'اعتماد سياسة الجودة والموارد والقرارات الاستراتيجية' },
    { entity: 'الإدارة العليا', duty: 'دعم النظام واعتماد الأهداف والمؤشرات وخطط التحسين' },
    { entity: 'لجنة الجودة', duty: 'متابعة الأداء واتخاذ القرارات التصحيحية' },
    { entity: 'إدارة الجودة وتطوير الأعمال', duty: 'تنفيذ النظام وجمع البيانات وإعداد التقارير' },
    { entity: 'إدارة المخاطر والالتزام', duty: 'مراقبة المخاطر والامتثال والضوابط' },
    { entity: 'إدارة العمليات وتقنية المعلومات', duty: 'قياس دقة العمليات وتوافر الأنظمة' },
    { entity: 'إدارة الموارد البشرية', duty: 'التدريب وتقييم الأداء والتحفيز' },
    { entity: 'مدراء الفروع', duty: 'تنفيذ معايير الجودة ومعالجة الملاحظات' },
    { entity: 'موظفو الخدمة', duty: 'الالتزام بالإجراءات وجودة التعامل مع العملاء' },
    { entity: 'المراجعة الداخلية', duty: 'التحقق المستقل من فعالية النظام والضوابط' }
  ];

  C.SUCCESS = [
    'انخفاض الشكاوى المتكررة', 'انخفاض نسبة الأخطاء', 'سرعة إنجاز المعاملات', 'ارتفاع رضا العملاء',
    'إغلاق الملاحظات في المهل المحددة', 'تحسن نتائج التفتيش الميداني', 'ارتفاع التزام الموظفين بالإجراءات',
    'تحسن تنسيق الفروع مع الإدارة العامة', 'استقرار الأنظمة وتقليل الأعطال', 'وجود ثقافة تحسين مستمر داخل البنك'
  ];

  C.PLAN = [
    { phase: 'المرحلة الأولى', duration: 'أسبوعان', task: 'اعتماد السياسة وتشكيل اللجنة وتحديد المسؤوليات' },
    { phase: 'المرحلة الثانية', duration: '3 أسابيع', task: 'إعداد النماذج والمعايير وبطاقات التقييم' },
    { phase: 'المرحلة الثالثة', duration: 'شهر', task: 'التطبيق التجريبي في فروع أو إدارات مختارة' },
    { phase: 'المرحلة الرابعة', duration: 'شهران', task: 'التوسع في جميع الفروع والإدارات' },
    { phase: 'المرحلة الخامسة', duration: 'مستمر', task: 'القياس والتحليل والتحسين وإعداد التقارير' }
  ];

  C.DEFAULT_POLICY = 'تلتزم إدارة كاك بنك – الإدارة العامة بعدن بتقديم خدمات مصرفية عالية الجودة، تتميز بالدقة والسرعة والشفافية والالتزام، وفق أفضل الممارسات المصرفية، مع ضمان حماية بيانات العملاء، وتحسين مستمر لتجربة العميل وأداء الموظفين، من خلال قياس الأداء، ومعالجة الشكاوى، وتصحيح الانحرافات، وتطوير القدرات المؤسسية.';

  C.SLA_STAGE_NOTE = 'المهل الزمنية محسوبة من تاريخ استلام الشكوى وفق نوعها، وتُعد الشكوى متأخرة عند تجاوزها دون إغلاق.';

  K.C = C;

  /* ============================================================
     تخزين البيانات
     ============================================================ */
  var KEY = 'kak_qc_db_v2';
  var Store = {
    data: null,
    persistent: true,
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var d = JSON.parse(raw);
          if (d && d.v === 2) { this.data = d; return d; }
        }
      } catch (e) { this.persistent = false; }
      this.data = seed();
      this.save();
      return this.data;
    },
    save: function () {
      if (!this.data) return;
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); }
      catch (e) { this.persistent = false; }
    },
    reset: function () { this.data = seed(); this.save(); return this.data; },
    replace: function (obj) { this.data = obj; this.data.v = 2; this.save(); return this.data; },
    db: function () { return this.data; }
  };
  K.Store = Store;
  K.DB = function () { return Store.data; };

  /* ============================================================
     البيانات التجريبية
     ============================================================ */
  function rngFactory(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seed() {
    var rnd = rngFactory(20261112);
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
    function chance(p) { return rnd() < p; }
    function sample(arr, n) {
      var c = arr.slice(), out = [];
      while (out.length < n && c.length) out.push(c.splice(Math.floor(rnd() * c.length), 1)[0]);
      return out;
    }

    var today = new Date(); today.setHours(12, 0, 0, 0);
    var T = toISO(today);
    var branches = C.BRANCHES.map(function (b) { return Object.assign({}, b); });

    /* مؤشر جودة داخلي لكل فرع (لا يُعرض للمستخدم) */
    var q = { b1: .93, b2: .87, b3: .78, b4: .84, b5: .89, b6: .72, b7: .80, b8: .67, b9: .75, b10: .83, b11: .90 };

    var firstNames = ['محمد', 'أحمد', 'عبدالله', 'سالم', 'خالد', 'عمار', 'ياسر', 'نبيل', 'صالح', 'فارس', 'أنور', 'عمر', 'هيثم', 'وليد', 'زياد', 'مازن', 'سامي', 'علوي', 'ناصر', 'عادل'];
    var lastNames = ['السقاف', 'باشراحيل', 'الجابري', 'الحكيمي', 'العولقي', 'الشامي', 'الصبيحي', 'اليافعي', 'بن دهيم', 'بامطرف', 'باحويرث', 'المقطري', 'الحداد', 'الزبيري', 'الشرعبي', 'العطيري', 'الريمي', 'القباطي'];
    var femaleNames = ['أمل', 'فاطمة', 'نجاة', 'سماح', 'ريم', 'هدى', 'لينا', 'شيماء', 'أروى', 'غيداء'];
    function personName() {
      return (chance(.3) ? 'أ. ' + pick(femaleNames) : 'أ. ' + pick(firstNames)) + ' ' + pick(lastNames);
    }

    /* الموظفون */
    var employees = [];
    for (var ei = 0; ei < 68; ei++) {
      var br = branches[ri(1, branches.length - 1)];
      employees.push({
        id: 'e' + (ei + 1),
        name: personName(),
        branchId: br.id,
        department: pick(C.DEPARTMENTS),
        jobTitle: pick(['موظف خدمة عملاء', 'أمين صندوق', 'محاسب', 'مسؤول تحويلات', 'مسؤول اعتمادات', 'منسق جودة', 'مشرف عمليات'])
      });
    }

    /* المستخدمون */
    var users = [
      { id: 'u1', name: 'أ. عبدالرحمن العطيري', username: 'admin', password: 'admin123', role: 'admin', branchId: 'b1', title: 'مدير النظام' },
      { id: 'u2', name: 'أ. أمل الزبيري', username: 'quality', password: 'quality123', role: 'quality', branchId: 'b1', title: 'مديرة إدارة توكيد الجودة' },
      { id: 'u3', name: 'أ. عمار الجابري', username: 'branch', password: 'branch123', role: 'branch', branchId: 'b3', title: 'مدير فرع المنصورة' },
      { id: 'u4', name: 'أ. خالد اليافعي', username: 'committee', password: 'committee123', role: 'committee', branchId: 'b1', title: 'عضو لجنة الجودة' },
      { id: 'u5', name: 'أ. نجاة الشرعبي', username: 'viewer', password: 'viewer123', role: 'viewer', branchId: 'b1', title: 'المراجعة الداخلية' }
    ];

    /* ---------- بطاقات تقييم الجودة ---------- */
    var evaluations = [];
    var evaluators = ['أ. أمل الزبيري', 'أ. نجاة الشرعبي', 'أ. عبدالرحمن العطيري', 'أ. هيثم القباطي'];
    for (var m = 11; m >= 0; m--) {
      var base = new Date(today.getFullYear(), today.getMonth() - m, 1);
      var count = m === 0 ? 3 : ri(2, 3);
      var chosen = sample(branches, count);
      chosen.forEach(function (br, idx) {
        var day = ri(3, 25);
        var date = toISO(new Date(base.getFullYear(), base.getMonth(), Math.min(day, 28)));
        if (date > T) date = T;
        var items = {}, total = 0;
        C.EVAL_ITEMS.forEach(function (it) {
          var ratio = K.U.clamp(q[br.id] + (rnd() - .5) * .16, .4, 1);
          var v = Math.round(it.weight * ratio);
          items[it.key] = v; total += v;
        });
        evaluations.push({
          id: 'ev' + (evaluations.length + 1),
          branchId: br.id,
          date: date,
          evaluator: pick(evaluators),
          items: items,
          total: total,
          notes: total < 80 ? pick(['ملاحظات على دقة إدخال البيانات وحفظ المستندات.', 'الحاجة إلى تكثيف متابعة الالتزام بالصلاحيات.', 'تحسين جاهزية مكاتب الخدمة واللوحات الإرشادية.']) : '',
          status: 'معتمدة'
        });
      });
    }
    evaluations.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    /* ---------- التفتيش الميداني ---------- */
    var inspections = [];
    var inspectors = ['أ. أمل الزبيري', 'أ. نجاة الشرعبي', 'أ. سامي الحكيمي', 'أ. هيثم القباطي', 'أ. عادل المقطري'];
    for (var mi = 11; mi >= 0; mi--) {
      var b2 = new Date(today.getFullYear(), today.getMonth() - mi, 1);
      var n = ri(2, 3);
      var brs = sample(branches.slice(1), n);
      brs.forEach(function (br) {
        var day = ri(2, 26);
        var date = toISO(new Date(b2.getFullYear(), b2.getMonth(), Math.min(day, 28)));
        if (date > T) date = T;
        var items = C.INSPECTION_ITEMS.map(function (name) {
          var v = K.U.clamp(Math.round(1 + q[br.id] * 4 + (rnd() - .5) * 1.5), 1, 5);
          return { name: name, score: v, note: v <= 2 ? pick(['لوحظ قصور يحتاج معالجة.', 'يحتاج متابعة من مدير الفرع.', 'تم التنبيه ميدانيًا.']) : '' };
        });
        var pct = Math.round(K.U.sum(items, function (x) { return x.score; }) / (items.length * 5) * 100);
        inspections.push({
          id: 'in' + (inspections.length + 1),
          branchId: br.id,
          date: date,
          type: pick(C.INSPECTION_TYPES),
          inspector: pick(inspectors),
          items: items,
          score: pct,
          status: 'مكتمل',
          notes: pct < 80 ? 'تم تسجيل ملاحظات وإحالتها لخطة تصحيحية.' : 'الأداء مطابق للمعايير مع ملاحظات تحسينية بسيطة.'
        });
      });
    }
    inspections.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    /* ---------- الشكاوى ---------- */
    var complaintSubjects = {
      simple: ['تأخر في تنفيذ معاملة', 'طول فترة الانتظار في الفرع', 'نقص معلومات عن الخدمة', 'عدم توفر نموذج الطلب', 'عدم وضوح اللوحات الإرشادية', 'تعامل غير ودي من موظف الخدمة'],
      medium: ['خطأ في كشف الحساب', 'تأخر تنفيذ تحويل داخلي', 'ازدواج خصم رسوم', 'عدم تحديث بيانات العميل', 'تأخر صرف مرتب', 'خطأ في اسم صاحب الحساب'],
      financial: ['خصم غير مبرر من الحساب', 'رفض تنفيذ تحويل دون توضيح', 'اختلاف الرصيد بعد الإيداع', 'مخالفة إجراءات فتح حساب', 'تأخر اعتماد شيك', 'خطأ في سعر الصرف المطبق'],
      complex: ['نزاع على مبلغ محوَّل', 'شكوى تتعلق بسرية بيانات العميل', 'اشتباه عملية احتيال على الحساب', 'شكوى متكررة لم تُحل سابقًا', 'تجميد حساب دون إشعار مسبق']
    };
    var rootCauses = ['خطأ بشري في إدخال البيانات', 'عدم الالتزام بالإجراء المعتمد', 'ضعف التواصل بين الأقسام', 'عطل تقني في النظام', 'نقص التدريب على الإجراء', 'تأخر الاعتماد من الصلاحية الأعلى', 'ضعف إجراءات المتابعة والمراجعة', 'ازدحام الخدمة في أوقات الذروة'];
    var correctiveActions = ['إعادة تنفيذ المعاملة وتصحيح القيد', 'تدريب الموظف المعني على الإجراء', 'تعديل صلاحية الاعتماد وتسريع الدورة', 'إصلاح العطل بالتنسيق مع تقنية المعلومات', 'تعميم تنبيه على جميع الفروع', 'إضافة ضابط مراجعة مزدوج قبل الاعتماد', 'متابعة العميل وتوثيق النتيجة في الملف'];
    var complaintCounts = [13, 12, 11, 10, 10, 9, 8, 8, 7, 6, 5, 4];
    var complaints = [];
    for (var cm = 11; cm >= 0; cm--) {
      var b3 = new Date(today.getFullYear(), today.getMonth() - cm, 1);
      var nC = complaintCounts[11 - cm];
      for (var ci = 0; ci < nC; ci++) {
        var br2 = pick(branches.slice(1));
        var tKey = chance(.3) ? 'simple' : chance(.55) ? 'medium' : chance(.75) ? 'financial' : 'complex';
        var tDef = C.COMPLAINT_TYPES.filter(function (x) { return x.key === tKey; })[0];
        var recv = toISO(new Date(b3.getFullYear(), b3.getMonth(), ri(1, 27)));
        if (recv > T) recv = T;
        var age = diffDays(recv, T);
        var slaDays = tDef.sla;
        var dur = Math.max(1, Math.round(slaDays * (0.6 + rnd() * 1.1)));
        var closed = false, status = 'new';
        if (age > 40) { closed = chance(.94); }
        else if (age > 15) { closed = chance(.8); }
        else if (age > 5) { closed = chance(.55); }
        else { closed = chance(.35); }
        if (closed) status = 'closed';
        else status = age > slaDays ? 'progress' : (chance(.5) ? 'new' : 'progress');
        var closedDate = closed ? addDays(recv, dur) : null;
        if (closedDate && closedDate > T) { closedDate = T; }
        var respDate = closed ? addDays(recv, Math.max(1, dur - 1)) : (status === 'progress' ? addDays(recv, Math.min(dur, age)) : null);
        var satisfied = closed ? chance(.82) ? 'راضٍ' : 'غير راضٍ' : null;
        complaints.push({
          id: 'cp' + (complaints.length + 1),
          refNo: '',
          receivedDate: recv,
          customerName: personName().replace('أ. ', ''),
          accountNo: '****' + ri(1000, 9999),
          branchId: br2.id,
          type: tDef.label,
          typeKey: tKey,
          subject: pick(complaintSubjects[tKey]),
          description: 'تقدّم العميل بشكوى بخصوص ' + pick(complaintSubjects[tKey]) + ' في ' + br2.name + '، وتم استلامها عبر ' + pick(C.CHANNELS) + '.',
          channel: pick(C.CHANNELS),
          assignee: pick(['مسؤول خدمة العملاء', 'مدير الفرع', 'مسؤول العمليات', 'مسؤول الشكاوى', 'مسؤول الالتزام']),
          dueDate: addDays(recv, slaDays),
          responseDate: respDate,
          closedDate: closedDate,
          action: closed || status === 'progress' ? pick(correctiveActions) : '',
          rootCause: closed ? pick(rootCauses) : '',
          preventiveAction: closed ? pick(['تعميم إجراء موحد على الفروع', 'إضافة نقطة تحقق في النظام', 'إدراج الموضوع في خطة التدريب القادمة', 'مراجعة دورية أسبوعية للملفات']) : '',
          status: status,
          satisfaction: satisfied,
          customerNotified: closed
        });
      }
    }
    complaints.sort(function (a, b) { return a.receivedDate < b.receivedDate ? -1 : 1; });
    var yearSeq = {};
    complaints.forEach(function (cp) {
      var y = cp.receivedDate.slice(0, 4);
      yearSeq[y] = (yearSeq[y] || 0) + 1;
      cp.refNo = 'CMP-' + y + '-' + String(yearSeq[y]).padStart(4, '0');
    });

    /* ---------- الملاحظات والإجراءات التصحيحية ---------- */
    var findings = [];
    var sevTone = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };
    var findingTexts = {
      'التزام الموظفين': ['تأخر في بداية الدوام ونهاية الاستراحة', 'عدم الالتزام بالزي الرسمي', 'ترك موقع العمل دون إشعار'],
      'جاهزية المكاتب': ['نقص في النماذج والمطبوعات على مكتب الخدمة', 'عدم جاهزية جهاز الطباعة في بداية اليوم', 'نقص مقاعد الانتظار'],
      'اللوحات الإرشادية': ['لوحة إرشادية غير محدثة لمسار الخدمة', 'عدم وضوح لائحة الرسوم للعملاء', 'نقص لافتة لخدمة كبار العملاء'],
      'سرعة الخدمة': ['زمن انتظار مرتفع في ساعات الذروة', 'ازدحام على نافذة واحدة مع تعطيل الأخريات', 'تأخر تنفيذ معاملة عن الزمن المعياري'],
      'دقة المعاملات': ['اختلاف في بيانات نموذج التحويل', 'خطأ في ترميز عملية الإيداع', 'نقص توقيع على مستند المعاملة'],
      'حفظ المستندات': ['مستندات غير مصنفة في ملف العميل', 'نقص نسخة من الهوية في الملف', 'ملفات غير مؤرشفة حسب التسلسل'],
      'الصلاحيات': ['تنفيذ معاملة تتجاوز صلاحية الموظف', 'استخدام حساب زميل لإتمام عملية', 'عدم توثيق الاعتماد المزدوج'],
      'التعامل مع العملاء': ['نبرة تعامل غير مناسبة مع عميل', 'عدم شرح متطلبات الخدمة بوضوح', 'عدم تقديم بديل عند تعذر الخدمة'],
      'معالجة الشكاوى': ['تأخر الرد على شكوى عن المدة المحددة', 'عدم إبلاغ العميل بنتيجة الشكوى', 'عدم توثيق السبب الجذري للشكوى'],
      'أمن المعلومات': ['شاشة غير مقفلة عند مغادرة المكتب', 'كلمة مرور مكتوبة في مكان ظاهر', 'مشاركة بيانات دخول بين الموظفين'],
      'النظافة والترتيب': ['ترتيب غير مناسب لمكتب الاستقبال', 'نقص نظافة في منطقة الانتظار', 'صناديق ملفات مكدسة في الممر'],
      'إجراءات العمل': ['عدم تطبيق التحقق من هوية العميل', 'تجاوز خطوة مراجعة قبل الاعتماد', 'عدم استخدام النموذج المعتمد']
    };
    function addFinding(date, branchId, category, severityKey, extra) {
      var sev = C.SEVERITY.filter(function (s) { return s.key === severityKey; })[0];
      var due = sev.hours ? addDays(date, 1) : addDays(date, sev.days);
      var ageDue = diffDays(due, T);
      var stat;
      if (ageDue > 3) stat = chance(.8) ? 'closed' : (chance(.5) ? 'progress' : 'open');
      else if (ageDue > 0) stat = chance(.5) ? 'progress' : (chance(.6) ? 'closed' : 'open');
      else stat = chance(.55) ? 'closed' : (chance(.5) ? 'progress' : 'open');
      var closedDate = stat === 'closed' ? addDays(date, ri(1, Math.max(2, diffDays(date, due) + 4))) : null;
      if (closedDate && closedDate > T) closedDate = T;
      var f = {
        id: 'fn' + (findings.length + 1),
        desc: pick(findingTexts[category] || ['ملاحظة تشغيلية تحتاج معالجة']),
        branchId: branchId,
        departmentId: pick(C.DEPARTMENTS),
        foundDate: date,
        severity: sev.key,
        category: category,
        rootCause: pick(rootCauses),
        action: pick(correctiveActions),
        responsible: pick(['مدير الفرع', 'مسؤول خدمة العملاء', 'مسؤول العمليات', 'مسؤول الالتزام', 'مسؤول تقنية المعلومات']),
        dueDate: due,
        verifyMethod: pick(['إعادة تفتيش ميداني', 'مراجعة مستندات', 'اختبار عينة معاملات', 'تقرير من مدير الفرع', 'متابعة عبر النظام']),
        status: stat,
        closedDate: closedDate,
        source: (extra && extra.source) || 'تفتيش ميداني',
        refInspection: (extra && extra.inspection) || null,
        refComplaint: (extra && extra.complaint) || null
      };
      findings.push(f);
      return f;
    }
    var closedOverride = {};

    inspections.forEach(function (ins) {
      if (ins.score < 88) {
        var num = ins.score < 75 ? 3 : (ins.score < 82 ? 2 : 1);
        for (var k = 0; k < num; k++) {
          var sev = ins.score < 72 ? (k === 0 ? 'critical' : 'high') : (ins.score < 80 ? 'high' : 'medium');
          addFinding(ins.date, ins.branchId, pick(C.FINDING_CATEGORIES), sev, { source: 'تفتيش ميداني', inspection: ins.id });
        }
      }
    });
    /* ملاحظات من الشكاوى المغلقة المعقدة */
    complaints.filter(function (c) { return c.status === 'closed' && c.typeKey === 'complex'; }).slice(0, 14).forEach(function (c) {
      addFinding(c.closedDate || c.receivedDate, c.branchId, 'معالجة الشكاوى', 'high', { source: 'شكوى عميل', complaint: c.id });
    });
    /* ملاحظات رقابية مستقلة */
    for (var fm = 0; fm < 12; fm++) {
      var d0 = addDays(T, -ri(5, 330));
      addFinding(d0, pick(branches).id, pick(C.FINDING_CATEGORIES), pick(['low', 'medium', 'high', 'critical']), { source: pick(['مراجعة داخلية', 'متابعة لجنة الجودة', 'بلاغ موظف', 'مراقبة مؤشرات']) });
    }
    findings.sort(function (a, b) { return a.foundDate < b.foundDate ? -1 : 1; });

    /* ---------- استبيانات رضا العملاء ---------- */
    var comments = ['خدمة سريعة وتعامل راقٍ', 'الانتظار طويل نسبيًا', 'الموظف شرح الإجراء بوضوح', 'يحتاج تحسين تجهيز المكاتب', 'تمت المعاملة بدقة', 'أتمنى زيادة عدد النوافذ', 'شكرًا على المتابعة', 'لم يتم الرد على استفساري بسرعة'];
    var surveys = [];
    for (var si = 0; si < 460; si++) {
      var sbr = pick(branches);
      var sd = addDays(T, -ri(0, 350));
      var good = q[sbr.id];
      var score;
      if (rnd() < good) score = chance(.45) ? 5 : 4;
      else score = chance(.55) ? 3 : (chance(.6) ? 2 : 1);
      surveys.push({
        id: 'sv' + (si + 1),
        branchId: sbr.id,
        date: sd,
        score: score,
        channel: pick(['استمارة إلكترونية', 'مكتب خدمة العملاء', 'الهاتف', 'صندوق الشكاوى']),
        comment: chance(.35) ? pick(comments) : '',
        service: pick(['حسابات', 'تحويلات', 'صرف وقبض', 'قروض', 'اعتمادات'])
      });
    }
    surveys.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    /* ---------- التدريب ---------- */
    var courses = [];
    var trainers = ['أ. أمل الزبيري', 'أ. سامي الحكيمي', 'مدرب خارجي – معهد التدريب المصرفي', 'أ. نجاة الشرعبي'];
    C.TRAINING_TOPICS.forEach(function (topic, i) {
      var cdate = addDays(T, -(i * 30 + ri(2, 14)));
      var target = ri(22, 40);
      var att = sample(employees, Math.min(target, ri(Math.round(target * .55), target)));
      courses.push({
        id: 'tr' + (i + 1),
        title: topic,
        category: i < 4 ? 'خدمة العملاء' : (i < 7 ? 'الامتثال وأمن المعلومات' : 'مهارات إدارية'),
        date: cdate,
        trainer: pick(trainers),
        branchId: 'b1',
        target: target,
        attendees: att.map(function (e) { return e.id; }),
        hours: pick([4, 6, 8, 12]),
        mode: pick(['حضوري', 'حضوري', 'افتراضي']),
        status: cdate < T ? 'منفذ' : 'مخطط',
        notes: ''
      });
    });
    courses.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    /* ---------- اجتماعات لجنة الجودة ---------- */
    var meetings = [];
    var mtypes = ['أسبوعي', 'شهري', 'شهري', 'ربع سنوي', 'أسبوعي', 'شهري', 'أسبوعي', 'شهري', 'ربع سنوي'];
    var agendas = [
      'متابعة الملاحظات العاجلة والشكاوى المفتوحة',
      'مراجعة مؤشرات الأداء الشهرية والشكاوى',
      'مراجعة فعالية النظام وتحديث الخطط',
      'متابعة خطة التحسين والتدريب',
      'مراجعة نتائج التفتيش الميداني للفروع'
    ];
    for (var mt = 0; mt < 9; mt++) {
      var mdate = addDays(T, -ri(3, 120));
      meetings.push({
        id: 'mt' + (mt + 1),
        date: mdate,
        type: mtypes[mt],
        title: 'اجتماع لجنة الجودة – ' + mtypes[mt],
        attendees: ri(5, 8),
        agenda: agendas[mt % agendas.length],
        decisions: [
          'إلزام الفروع ذات الدرجات الأقل من 80% بخطة تصحيح خلال 15 يومًا.',
          'تكثيف التفتيش المفاجئ على فروع ' + pick(branches.slice(1)).name + '.',
          'إدراج موضوع ' + pick(C.TRAINING_TOPICS) + ' في خطة التدريب القادمة.',
          'رفع تقرير أسبوعي للإدارة العليا عن الشكاوى المتأخرة.'
        ].slice(0, ri(2, 4)),
        openActions: ri(0, 3),
        status: mdate < addDays(T, -7) ? 'مغلق' : 'قائم'
      });
    }
    meetings.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    /* ---------- قيم المؤشرات اليدوية ---------- */
    var kpiValues = [];
    var months = [];
    for (var k = 11; k >= 0; k--) {
      var dd = new Date(today.getFullYear(), today.getMonth() - k, 1);
      months.push(dd.getFullYear() + '-' + pad(dd.getMonth() + 1));
    }
    months.forEach(function (mk, idx) {
      branches.forEach(function (br) {
        var qq = q[br.id];
        kpiValues.push({ id: K.U.uid('kv'), kpi: 'wait', branchId: br.id, month: mk, value: K.U.round(16 - qq * 8 + (rnd() - .5) * 3, 1) });
        kpiValues.push({ id: K.U.uid('kv'), kpi: 'errors', branchId: br.id, month: mk, value: K.U.round(2.4 - qq * 1.8 + (rnd() - .5) * .6, 2) });
        kpiValues.push({ id: K.U.uid('kv'), kpi: 'ontime', branchId: br.id, month: mk, value: K.U.round(88 + qq * 9 + (rnd() - .5) * 4, 1) });
        kpiValues.push({ id: K.U.uid('kv'), kpi: 'availability', branchId: br.id, month: mk, value: K.U.round(97.6 + qq * 1.6 + (rnd() - .5) * .5, 2) });
      });
    });

    return {
      v: 2,
      createdAt: new Date().toISOString(),
      settings: {
        bankName: C.BANK.name,
        shortName: C.BANK.short,
        unit: C.BANK.unit,
        dept: C.BANK.dept,
        slogan: C.BANK.slogan,
        policy: C.DEFAULT_POLICY,
        targets: {
          satisfaction: 85, inspection: 85, resolution: 90, resolutionTime: 5,
          errors: 1, closure: 90, training: 100, wait: 10, availability: 99, ontime: 95
        },
        lastReview: addDays(T, -95),
        nextReview: addDays(T, 85)
      },
      branches: branches,
      departments: C.DEPARTMENTS.slice(),
      employees: employees,
      users: users,
      evaluations: evaluations,
      inspections: inspections,
      complaints: complaints,
      findings: findings,
      surveys: surveys,
      courses: courses,
      meetings: meetings,
      kpiValues: kpiValues
    };
  }

  /* ============================================================
     المؤشرات والحسابات
     ============================================================ */
  var M = {};

  M.within = function (date, from, to) {
    if (!date) return false;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  };

  M.periodRange = function (key) {
    var t = todayISO();
    if (!key || key === '30') return { from: addDays(t, -29), to: t, label: 'آخر 30 يومًا' };
    if (key === '7') return { from: addDays(t, -6), to: t, label: 'آخر 7 أيام' };
    if (key === '90') return { from: addDays(t, -89), to: t, label: 'آخر 90 يومًا' };
    if (key === '365') return { from: addDays(t, -364), to: t, label: 'آخر 12 شهرًا' };
    if (key === 'ytd') return { from: t.slice(0, 4) + '-01-01', to: t, label: 'العام الحالي' };
    if (key === 'all') return { from: '2000-01-01', to: t, label: 'كل الفترات' };
    if (key === 'month') { var b = monthBounds(monthKey(t)); b.label = 'الشهر الحالي'; return b; }
    return { from: addDays(t, -29), to: t, label: 'آخر 30 يومًا' };
  };

  M.prevRange = function (range) {
    var days = Math.max(1, diffDays(range.from, range.to) + 1);
    return { from: addDays(range.from, -days), to: addDays(range.from, -1) };
  };

  M.evalOf = function (branchId, from, to) {
    var db = Store.data;
    return db.evaluations.filter(function (e) {
      return (!branchId || e.branchId === branchId) && M.within(e.date, from, to);
    });
  };

  M.evalScore = function (branchId, from, to) {
    var list = M.evalOf(branchId, from, to);
    if (!list.length) return null;
    return K.U.avg(list, function (e) { return e.total; });
  };

  M.inspectionsOf = function (branchId, from, to) {
    var db = Store.data;
    return db.inspections.filter(function (i) {
      return (!branchId || i.branchId === branchId) && M.within(i.date, from, to);
    });
  };

  M.inspectionScore = function (branchId, from, to) {
    var list = M.inspectionsOf(branchId, from, to);
    if (!list.length) return null;
    return K.U.avg(list, function (i) { return i.score; });
  };

  M.complaintsOf = function (branchId, from, to) {
    var db = Store.data;
    return db.complaints.filter(function (c) {
      return (!branchId || c.branchId === branchId) && M.within(c.receivedDate, from, to);
    });
  };

  M.complaintStats = function (branchId, from, to) {
    var list = M.complaintsOf(branchId, from, to);
    var closed = list.filter(function (c) { return c.status === 'closed'; });
    var open = list.filter(function (c) { return c.status !== 'closed'; });
    var t = todayISO();
    var overdue = open.filter(function (c) { return c.dueDate < t; });
    var resDays = closed.filter(function (c) { return c.closedDate; }).map(function (c) { return Math.max(0, diffDays(c.receivedDate, c.closedDate)); });
    var satisfied = closed.filter(function (c) { return c.satisfaction === 'راضٍ'; });
    return {
      total: list.length,
      closed: closed.length,
      open: open.length,
      overdue: overdue.length,
      resolutionRate: list.length ? Math.round(closed.length / list.length * 1000) / 10 : 0,
      avgDays: resDays.length ? Math.round(K.U.avg(resDays) * 10) / 10 : 0,
      satisfactionRate: closed.length ? Math.round(satisfied.length / closed.length * 1000) / 10 : 0,
      list: list, closedList: closed, openList: open, overdueList: overdue
    };
  };

  M.findingsOf = function (branchId, from, to) {
    var db = Store.data;
    return db.findings.filter(function (f) {
      return (!branchId || f.branchId === branchId) && M.within(f.foundDate, from, to);
    });
  };

  /* تكرار الملاحظة: نفس التصنيف في نفس الفرع سبق رصده */
  M.isRecurring = function (f) {
    var db = Store.data;
    return db.findings.some(function (x) {
      return x.id !== f.id && x.branchId === f.branchId && x.category === f.category && x.foundDate < f.foundDate;
    });
  };

  M.findingStats = function (branchId, from, to) {
    var all = M.findingsOf(branchId, from, to);
    var t = todayISO();
    var closed = all.filter(function (f) { return f.status === 'closed'; });
    var open = all.filter(function (f) { return f.status !== 'closed'; });
    var overdue = open.filter(function (f) { return f.dueDate < t; });
    var recurring = all.filter(M.isRecurring);
    return {
      total: all.length,
      closed: closed.length,
      open: open.length,
      overdue: overdue.length,
      closureRate: all.length ? Math.round(closed.length / all.length * 1000) / 10 : 0,
      repeatRate: all.length ? Math.round(recurring.length / all.length * 1000) / 10 : 0,
      list: all, closedList: closed, openList: open, overdueList: overdue,
      critical: all.filter(function (f) { return f.severity === 'critical'; }).length
    };
  };

  M.surveysOf = function (branchId, from, to) {
    var db = Store.data;
    return db.surveys.filter(function (s) {
      return (!branchId || s.branchId === branchId) && M.within(s.date, from, to);
    });
  };

  M.satisfaction = function (branchId, from, to) {
    var list = M.surveysOf(branchId, from, to);
    if (!list.length) return null;
    var sat = list.filter(function (s) { return s.score >= 4; }).length;
    return {
      value: Math.round(sat / list.length * 1000) / 10,
      count: list.length, satisfied: sat,
      avg: Math.round(K.U.avg(list, function (s) { return s.score; }) * 100) / 100
    };
  };

  M.coursesOf = function (branchId, from, to) {
    var db = Store.data;
    return db.courses.filter(function (c) {
      return M.within(c.date, from, to);
    });
  };

  M.trainingRate = function (from, to) {
    var list = M.coursesOf(null, from, to);
    var target = K.U.sum(list, function (c) { return c.target; });
    var att = K.U.sum(list, function (c) { return c.attendees.length; });
    return { value: target ? Math.round(att / target * 1000) / 10 : 0, attended: att, target: target, courses: list.length };
  };

  M.manualKpi = function (kpiId, branchId, from, to) {
    var db = Store.data;
    var rows = db.kpiValues.filter(function (v) {
      if (v.kpi !== kpiId) return false;
      if (branchId && v.branchId !== branchId) return false;
      var b = monthBounds(v.month);
      return b.to >= from && b.from <= to;
    });
    if (!rows.length) return null;
    return Math.round(K.U.avg(rows, function (r) { return r.value; }) * 100) / 100;
  };

  M.kpiValue = function (kpiId, branchId, from, to) {
    switch (kpiId) {
      case 'satisfaction': { var s = M.satisfaction(branchId, from, to); return s ? s.value : null; }
      case 'inspection': { var i = M.inspectionScore(branchId, from, to); return i === null ? null : Math.round(i * 10) / 10; }
      case 'resolution': { var c = M.complaintStats(branchId, from, to); return c.total ? c.resolutionRate : null; }
      case 'resolutionTime': { var c2 = M.complaintStats(branchId, from, to); return c2.closed ? c2.avgDays : null; }
      case 'repeat': { var f = M.findingStats(branchId, from, to); return f.total ? f.repeatRate : null; }
      case 'training': { var t = M.trainingRate(from, to); return t.target ? t.value : null; }
      default: return M.manualKpi(kpiId, branchId, from, to);
    }
  };

  M.monthlySeries = function (branchId, months, fn) {
    return months.map(function (mk) {
      var b = monthBounds(mk);
      return { month: mk, value: fn(branchId, b.from, b.to) };
    });
  };

  M.complaintsByType = function (branchId, from, to) {
    var list = M.complaintsOf(branchId, from, to);
    return C.COMPLAINT_TYPES.map(function (t) {
      return { label: t.label.replace('شكوى ', ''), value: list.filter(function (c) { return c.typeKey === t.key; }).length };
    });
  };

  M.findingsBySeverity = function (branchId, from, to) {
    var list = M.findingsOf(branchId, from, to);
    return C.SEVERITY.map(function (s) {
      return { label: s.label, value: list.filter(function (f) { return f.severity === s.key; }).length, tone: s.tone };
    });
  };

  M.complaintsByChannel = function (branchId, from, to) {
    var list = M.complaintsOf(branchId, from, to);
    return C.CHANNELS.map(function (ch) {
      return { label: ch, value: list.filter(function (c) { return c.channel === ch; }).length };
    }).filter(function (x) { return x.value; });
  };

  M.branchScore = function (branchId, from, to) {
    var ev = M.evalScore(branchId, from, to);
    var sat = M.satisfaction(branchId, from, to);
    var ins = M.inspectionScore(branchId, from, to);
    var cs = M.complaintStats(branchId, from, to);
    var fs = M.findingStats(branchId, from, to);
    var parts = [];
    if (ev !== null) parts.push({ w: .32, v: ev });
    if (sat) parts.push({ w: .24, v: sat.value });
    if (ins !== null) parts.push({ w: .2, v: ins });
    parts.push({ w: .14, v: cs.total ? cs.resolutionRate : 0 });
    parts.push({ w: .1, v: fs.total ? fs.closureRate : 0 });
    var tw = K.U.sum(parts, function (p) { return p.w; });
    if (!tw) return 0;
    return Math.round(K.U.sum(parts, function (p) { return p.w * p.v; }) / tw * 10) / 10;
  };

  M.ranking = function (from, to) {
    var db = Store.data;
    return db.branches.filter(function (b) { return b.type === 'فرع'; }).map(function (b) {
      return {
        branch: b,
        score: M.branchScore(b.id, from, to),
        evaluation: M.evalScore(b.id, from, to),
        satisfaction: M.satisfaction(b.id, from, to),
        inspection: M.inspectionScore(b.id, from, to),
        complaints: M.complaintStats(b.id, from, to),
        findings: M.findingStats(b.id, from, to)
      };
    }).sort(function (a, b) { return b.score - a.score; });
  };

  M.alerts = function (branchId) {
    var t = todayISO();
    var db = Store.data;
    var out = [];
    db.complaints.forEach(function (c) {
      if (c.status === 'closed') return;
      if (branchId && c.branchId !== branchId) return;
      if (c.dueDate < t) {
        out.push({ kind: 'complaint', level: 'red', id: c.id, title: 'شكوى متأخرة: ' + c.refNo, sub: 'تجاوزت المدة المحددة ' + diffDays(c.dueDate, t) + ' يومًا – ' + c.subject, link: '#/complaints?open=' + c.id });
      }
    });
    db.findings.forEach(function (f) {
      if (f.status === 'closed') return;
      if (branchId && f.branchId !== branchId) return;
      if (f.dueDate < t) {
        out.push({ kind: 'finding', level: 'red', id: f.id, title: 'ملاحظة متأخرة: ' + f.desc, sub: ' المهلة انتهت قبل ' + diffDays(f.dueDate, t) + ' يومًا – ' + (C.SEVERITY.filter(function (s) { return s.key === f.severity; })[0] || {}).label, link: '#/findings?open=' + f.id });
      } else if (diffDays(t, f.dueDate) <= 3 && f.severity !== 'low') {
        out.push({ kind: 'finding', level: 'amber', id: f.id, title: 'ملاحظة تقترب من المهلة: ' + f.desc, sub: 'متبقٍ ' + diffDays(t, f.dueDate) + ' أيام على تاريخ الاستحقاق', link: '#/findings?open=' + f.id });
      }
    });
    return out.sort(function (a, b) { return a.level === b.level ? 0 : (a.level === 'red' ? -1 : 1); }).slice(0, 6);
  };

  M.rating = function (total) {
    for (var i = 0; i < C.CLASSIFICATION.length; i++) {
      var c = C.CLASSIFICATION[i];
      if (total >= c.min && total <= c.max) return c;
    }
    return C.CLASSIFICATION[3];
  };

  M.kpiStatus = function (def, value) {
    if (value === null || value === undefined) return { label: 'لا توجد بيانات', tone: 'b-gray', cls: 'flat' };
    var ok = def.dir === 'up' ? value >= def.target : value <= def.target;
    var near = def.dir === 'up' ? value >= def.target * .95 : value <= def.target * 1.1;
    if (ok) return { label: 'محقق', tone: 'b-green', cls: 'up' };
    if (near) return { label: 'قريب من الهدف', tone: 'b-amber', cls: 'flat' };
    return { label: 'غير محقق', tone: 'b-red', cls: 'down' };
  };

  K.M = M;
})(window.KAK);
