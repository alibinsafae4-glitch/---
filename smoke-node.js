/* اختبارات آلية بدون متصفح: تحميل الوحدات في بيئة DOM مبسطة وتشغيل كل الصفحات */
'use strict';

/* ---------- DOM مبسط ---------- */
function makeEl(tag) {
  var el = {
    tagName: tag || 'div', style: {}, dataset: {}, innerHTML: '', textContent: '', value: '', checked: false,
    children: [], files: [],
    classList: { add: function () { }, remove: function () { }, toggle: function () { }, contains: function () { return false; } },
    appendChild: function (c) { this.children.push(c); return c; },
    removeChild: function () { }, remove: function () { },
    addEventListener: function () { }, removeEventListener: function () { },
    setAttribute: function () { }, getAttribute: function () { return null; }, removeAttribute: function () { },
    querySelector: function () { return makeEl('div'); },
    querySelectorAll: function () { return []; },
    focus: function () { }, click: function () { }, setSelectionRange: function () { },
    insertAdjacentHTML: function () { }
  };
  return el;
}
var cache = {};
global.window = global;
global.document = {
  getElementById: function (id) { if (!cache[id]) cache[id] = makeEl('div'); return cache[id]; },
  createElement: function (t) { return makeEl(t); },
  querySelector: function () { return makeEl('div'); },
  querySelectorAll: function () { return []; },
  body: makeEl('body'),
  documentElement: makeEl('html'),
  addEventListener: function () { }
};
global.localStorage = {
  store: {},
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; },
  setItem: function (k, v) { this.store[k] = String(v); },
  removeItem: function (k) { delete this.store[k]; }
};
global.location = { hash: '#/dashboard', search: '', reload: function () { } };
global.requestAnimationFrame = function (fn) { fn(); };
global.window.print = function () { };
global.Blob = function () { };
global.URL = { createObjectURL: function () { return 'x'; }, revokeObjectURL: function () { } };
global.FileReader = function () { };

/* ---------- تحميل الوحدات ---------- */
var path = require('path');
var base = path.join(__dirname, '..', 'assets', 'js');
require(path.join(base, 'data.js'));
require(path.join(base, 'ui.js'));
require(path.join(base, 'app.js'));
['dashboard', 'evaluations', 'complaints', 'inspections', 'findings', 'kpis', 'satisfaction', 'training', 'committee', 'reports', 'settings']
  .forEach(function (v) { require(path.join(base, 'views', v + '.js')); });

var K = global.KAK;
var fails = 0, passes = 0;
function ok(cond, msg) {
  if (cond) { passes++; }
  else { fails++; console.log('  ✗ FAIL: ' + msg); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

function badText(html) {
  var issues = [];
  if (/undefined/.test(html)) issues.push('undefined');
  if (/NaN/.test(html)) issues.push('NaN');
  if (/\[object Object\]/.test(html)) issues.push('[object Object]');
  return issues;
}

/* ---------- 1. البيانات ---------- */
section('1. سلامة البيانات التجريبية');
K.Store.load();
var db = K.Store.data;
ok(db.branches.length === 11, 'عدد الفروع 11 (وجد ' + db.branches.length + ')');
ok(db.users.length === 5, 'عدد المستخدمين 5');
ok(db.complaints.length > 50, 'عدد الشكاوى > 50 (وجد ' + db.complaints.length + ')');
ok(db.findings.length > 30, 'عدد الملاحظات > 30 (وجد ' + db.findings.length + ')');
ok(db.inspections.length > 15, 'عدد التفتيش > 15');
ok(db.evaluations.length > 15, 'عدد البطاقات > 15');
ok(db.surveys.length > 200, 'عدد الاستبيانات > 200');
ok(db.kpiValues.length > 100, 'قيم المؤشرات > 100');

var branchIds = db.branches.map(function (b) { return b.id; });
var empIds = db.employees.map(function (e) { return e.id; });
var validBranches = db.complaints.every(function (c) { return branchIds.indexOf(c.branchId) > -1; });
ok(validBranches, 'كل الشكاوى مرتبطة بفرع صحيح');
ok(db.complaints.every(function (c) { return /^CMP-\d{4}-\d{4}$/.test(c.refNo); }), 'أرقام الشكاوى المرجعية بالصيغة الصحيحة');
ok(db.complaints.every(function (c) { return c.dueDate >= c.receivedDate; }), 'تاريخ الاستحقاق بعد الاستلام');
var closedOk = db.complaints.filter(function (c) { return c.status === 'closed'; }).every(function (c) { return !!c.closedDate && !!c.action; });
ok(closedOk, 'كل الشكاوى المغلقة لها تاريخ إغلاق وإجراء متخذ');
var uniq = {}; var dup = 0;
db.complaints.forEach(function (c) { if (uniq[c.refNo]) dup++; uniq[c.refNo] = 1; });
ok(dup === 0, 'لا تكرار في الأرقام المرجعية');
ok(db.evaluations.every(function (e) {
  var s = Object.keys(e.items).reduce(function (a, k) { return a + e.items[k]; }, 0);
  return s === e.total && s <= 100;
}), 'مجموع عناصر البطاقة = الإجمالي ولا يتجاوز 100');
ok(db.inspections.every(function (i) { return i.items.length === 12; }), 'كل التفتيش 12 عنصرًا');
ok(db.courses.every(function (c) { return c.attendees.every(function (id) { return empIds.indexOf(id) > -1; }); }), 'مشاركو التدريب موظفون صالحون');
ok(db.complaints.every(function (c) { return c.status === 'closed' || !c.closedDate; }), 'لا يوجد تاريخ إغلاق لشكوى غير مغلقة');

/* ---------- 2. المؤشرات ---------- */
section('2. صحة الحسابات والمؤشرات');
var r365 = K.M.periodRange('365');
var sat = K.M.satisfaction('', r365.from, r365.to);
ok(sat && sat.value >= 0 && sat.value <= 100, 'نسبة الرضا بين 0 و100');
var cs = K.M.complaintStats('', r365.from, r365.to);
ok(cs.total === db.complaints.length, 'إحصاء الشكاوى يغطي كل السجلات');
ok(cs.closed + cs.open === cs.total, 'مجموع المفتوح والمغلق = الإجمالي');
ok(cs.resolutionRate >= 0 && cs.resolutionRate <= 100, 'نسبة الحل بين 0 و100');
var fs = K.M.findingStats('', r365.from, r365.to);
ok(fs.closed + fs.open === fs.total, 'مجموع الملاحظات المفتوحة والمغلقة = الإجمالي');
ok(fs.closureRate >= 0 && fs.closureRate <= 100, 'نسبة إغلاق الملاحظات بين 0 و100');
var rank = K.M.ranking(r365.from, r365.to);
ok(rank.length === 10, 'ترتيب 10 فروع (وجد ' + rank.length + ')');
ok(rank.every(function (x) { return x.score >= 0 && x.score <= 100; }), 'الدرجة المركبة بين 0 و100');
ok(rank[0].score >= rank[rank.length - 1].score, 'الترتيب تنازلي');
var kpiCount = 0;
K.C.KPIS.forEach(function (d) {
  var v = K.M.kpiValue(d.id, '', r365.from, r365.to);
  if (v !== null && !isNaN(v)) kpiCount++;
  else console.log('  ⚠ مؤشر بلا بيانات: ' + d.name);
});
ok(kpiCount >= 8, '8 مؤشرات على الأقل لها قيم (' + kpiCount + ')');
ok(K.M.alerts('').length >= 0, 'دالة التنبيهات تعمل');
ok(K.M.periodRange('all').from === '2000-01-01', 'فترة "كل الفترات" تعمل');

/* ---------- 3. كل الصفحات وكل الأدوار ---------- */
section('3. عرض الصفحات (render + mount) لجميع الأدوار');
var views = Object.keys(K.views);
ok(views.length === 11, 'عدد الصفحات 11 (وجد ' + views.length + ')');
var reportTypes = ['daily', 'weekly', 'monthly', 'quarterly'];
['admin', 'quality', 'committee', 'branch', 'viewer'].forEach(function (role) {
  var user = db.users.filter(function (u) { return u.role === role; })[0];
  K.App.state.user = user;
  views.forEach(function (v) {
    try {
      var inst = K.views[v];
      var html = inst.render();
      ok(html && html.length > 300, v + ' [' + role + '] تُنتج HTML كافيًا (' + (html ? html.length : 0) + ')');
      var bad = badText(html);
      ok(bad.length === 0, v + ' [' + role + '] بلا قيم تالفة (' + bad.join(',') + ')');
      var root = makeEl('div');
      if (inst.mount) inst.mount(root);
      passes++;
    } catch (e) {
      fails++;
      console.log('  ✗ CRASH ' + v + ' [' + role + ']: ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]);
    }
  });
});

/* ---------- 4. الفروع والفترات ---------- */
section('4. الفلترة حسب الفرع والفترة');
K.App.state.user = db.users[0];
K.App.state.branchId = 'b3';
['7', '30', '90', '365', 'ytd', 'all'].forEach(function (p) {
  K.App.state.period = p;
  views.forEach(function (v) {
    try {
      var html = K.views[v].render();
      ok(html.length > 200, v + ' مع فترة ' + p);
    } catch (e) { fails++; console.log('  ✗ CRASH ' + v + ' [' + p + ']: ' + e.message); }
  });
});
K.App.state.branchId = '';
/* التقارير الأربعة */
['daily', 'weekly', 'monthly', 'quarterly'].forEach(function (t) {
  var root = makeEl('div');
  K.App.state.period = '365';
  var html = K.views.reports.render();
  ok(html.length > 1000, 'قالب التقرير الافتراضي يعمل');
  return;
});

/* ---------- 5. النماذج (modals) ---------- */
section('5. فتح نماذج الإدخال');
function tryOpen(label, fn) {
  try { fn(); passes++; } catch (e) { fails++; console.log('  ✗ MODAL ' + label + ': ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]); }
}
K.App.state.user = db.users[0];
K.App.state.branchId = '';
tryOpen('شكوى جديدة', function () { K.views.complaints.openNew(); });
tryOpen('تفاصيل شكوى', function () { K.views.complaints.openDetail(db.complaints[0].id); });
tryOpen('ملاحظة جديدة', function () { K.views.findings.openNew({ branchId: 'b2' }); });
tryOpen('تفاصيل ملاحظة', function () { K.views.findings.openDetail(db.findings[0].id); });

/* ---------- 6. التوجيه ---------- */
section('6. التوجيه والصلاحيات');
['dashboard', 'evaluations', 'complaints', 'inspections', 'findings', 'kpis', 'satisfaction', 'training', 'committee', 'reports', 'settings', 'nope'].forEach(function (v) {
  try {
    global.location.hash = '#/' + v;
    K.App.refresh();
    var html = document.getElementById('viewRoot').innerHTML;
    ok(typeof html === 'string' && html.length > 0, 'توجيه #/' + v);
  } catch (e) { fails++; console.log('  ✗ ROUTE ' + v + ': ' + e.message); }
});
ok(K.App.can('write') === true, 'مدير النظام يملك صلاحية التعديل');
K.App.state.user = db.users.filter(function (u) { return u.role === 'viewer'; })[0];
ok(K.App.can('write') === false, 'الاطلاع لا يملك صلاحية التعديل');
ok(K.App.can('complaints.write') === false, 'الاطلاع لا يسجل شكاوى');
K.App.state.user = db.users.filter(function (u) { return u.role === 'branch'; })[0];
ok(K.App.can('complaints.write') === true, 'مدير الفرع يسجل شكاوى');
K.App.state.user = db.users[0];

/* ---------- النتيجة ---------- */
console.log('\n======================================');
console.log('نجح: ' + passes + ' | فشل: ' + fails);
if (fails > 0) process.exitCode = 1;
