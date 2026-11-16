/* ============================================================
   التطبيق: الدخول، الهيكل، التنقل، الصلاحيات، الفلاتر العامة
   ============================================================ */
window.KAK = window.KAK || {};
(function (K) {
  'use strict';
  var U = K.U, UI = K.UI, C = K.C;
  K.views = K.views || {};

  var App = {
    state: { user: null, branchId: '', period: '90', view: 'dashboard', params: {} },
    sessionKey: 'kak_qc_session'
  };
  K.App = App;

  /* ---------------- الصلاحيات ---------------- */
  var CAN = {
    admin: ['write', 'complaints.write', 'meetings', 'settings', 'export'],
    quality: ['write', 'complaints.write', 'meetings', 'settings', 'export'],
    committee: ['meetings', 'export'],
    branch: ['complaints.write', 'export'],
    viewer: ['export']
  };
  App.can = function (action) {
    var u = App.state.user;
    if (!u) return false;
    return (CAN[u.role] || []).indexOf(action) > -1;
  };
  App.isBranchLocked = function () {
    return App.state.user && App.state.user.role === 'branch';
  };

  /* ---------------- الجلسة ---------------- */
  App.currentUser = function () {
    try {
      var raw = localStorage.getItem(App.sessionKey);
      if (!raw) return null;
      var s = JSON.parse(raw);
      var user = K.Store.data.users.filter(function (u) { return u.id === s.userId; })[0];
      return user || null;
    } catch (e) { return null; }
  };
  App.login = function (username, password) {
    var user = K.Store.data.users.filter(function (u) {
      return u.username.toLowerCase() === String(username).toLowerCase() && u.password === password;
    })[0];
    if (!user) return false;
    try { localStorage.setItem(App.sessionKey, JSON.stringify({ userId: user.id, at: Date.now() })); } catch (e) { }
    App.state.user = user;
    return true;
  };
  App.logout = function () {
    try { localStorage.removeItem(App.sessionKey); } catch (e) { }
    App.state.user = null;
    location.hash = '';
    location.reload();
  };

  /* ---------------- الفلاتر ---------------- */
  App.range = function () { return K.M.periodRange(App.state.period); };

  App.setBranch = function (id) { App.state.branchId = id || ''; };

  /* ---------------- شريط التنقل ---------------- */
  var NAV = [
    { group: 'الرئيسية', items: [{ id: 'dashboard', label: 'لوحة المعلومات', icon: 'grid' }] },
    {
      group: 'الجودة التشغيلية', items: [
        { id: 'evaluations', label: 'بطاقة تقييم الجودة', icon: 'clipboard' },
        { id: 'inspections', label: 'التفتيش الميداني', icon: 'search' },
        { id: 'findings', label: 'الملاحظات والإجراءات', icon: 'alert', count: 'findings' }
      ]
    },
    {
      group: 'العملاء', items: [
        { id: 'complaints', label: 'سجل الشكاوى', icon: 'message', count: 'complaints' },
        { id: 'satisfaction', label: 'رضا العملاء', icon: 'star' }
      ]
    },
    {
      group: 'القياس والتقارير', items: [
        { id: 'kpis', label: 'مؤشرات الأداء', icon: 'target' },
        { id: 'reports', label: 'التقارير', icon: 'file' }
      ]
    },
    {
      group: 'الحوكمة', items: [
        { id: 'committee', label: 'لجنة الجودة', icon: 'users' },
        { id: 'training', label: 'التدريب والتطوير', icon: 'book' }
      ]
    },
    { group: 'النظام', items: [{ id: 'settings', label: 'الإعدادات والمرجعية', icon: 'sliders' }] }
  ];
  App.NAV = NAV;

  function navCount(kind) {
    var today = U.todayISO();
    var db = K.Store.data;
    if (kind === 'complaints') {
      return db.complaints.filter(function (c) {
        return c.status !== 'closed' && (!App.state.branchId || c.branchId === App.state.branchId);
      }).length;
    }
    if (kind === 'findings') {
      return db.findings.filter(function (f) {
        return f.status !== 'closed' && f.dueDate < today && (!App.state.branchId || f.branchId === App.state.branchId);
      }).length;
    }
    return 0;
  }

  function renderSidebar() {
    var u = App.state.user;
    var html = '<div class="sidebar-head">' +
      '<div class="brand-plaque"><img src="' + UI.asset('img/cac-logo.png') + '" alt="كاك بنك"></div>' +
      '<div class="org-sub">منصة مراقبة الجودة · ' + UI.esc(K.Store.data.settings.unit) + '</div></div>';
    html += '<nav class="nav">';
    NAV.forEach(function (g) {
      html += '<div class="nav-label">' + UI.esc(g.group) + '</div>';
      g.items.forEach(function (it) {
        var n = it.count ? navCount(it.count) : 0;
        html += '<a href="#/' + it.id + '" data-nav="' + it.id + '" class="' + (App.state.view === it.id ? 'active' : '') + '">' +
          UI.icon(it.icon) + '<span>' + UI.esc(it.label) + '</span>' +
          (n ? '<span class="count">' + (n > 99 ? '99+' : n) + '</span>' : '') + '</a>';
      });
    });
    html += '</nav>';
    html += '<div class="sidebar-foot"><div class="user-chip">' +
      '<div class="avatar">' + UI.esc((u.name || '').replace('أ. ', '').slice(0, 2)) + '</div>' +
      '<div style="min-width:0"><div class="u-name">' + UI.esc(u.name) + '</div><div class="u-role">' + UI.esc(C.ROLES[u.role]) + '</div></div>' +
      '<button class="icon-btn logout" id="btnLogout" title="تسجيل الخروج" aria-label="تسجيل الخروج">' + UI.icon('logout') + '</button>' +
      '</div></div>';
    document.getElementById('sidebar').innerHTML = html;
    document.getElementById('btnLogout').addEventListener('click', function () {
      UI.confirm({ title: 'تسجيل الخروج', message: 'هل تريد إنهاء الجلسة الحالية؟', ok: 'خروج', onOk: App.logout });
    });
  }

  var TITLES = {
    dashboard: ['لوحة المعلومات', 'نظرة شاملة على أداء الجودة في الإدارة العامة والفروع'],
    evaluations: ['بطاقة تقييم الجودة', 'أداة القياس المعتمدة بـ 100 درجة لكل فرع أو إدارة'],
    inspections: ['التفتيش الميداني', 'زيارات مفاجئة ودورية وأربع سنوية موثقة بالملاحظات'],
    findings: ['الملاحظات والإجراءات التصحيحية', 'متابعة الملاحظات حتى الإغلاق والتحقق من الفعالية'],
    complaints: ['سجل الشكاوى', 'استلام وتصنيف ومعالجة الشكاوى ضمن مهل محددة لكل نوع'],
    satisfaction: ['رضا العملاء', 'قياس رضا العملاء وتحليل الملاحظات والاتجاهات'],
    kpis: ['مؤشرات الأداء', 'قياس المؤشرات العشرة ومقارنتها بالمستهدفات'],
    reports: ['التقارير', 'تقارير يومية وأسبوعية وشهرية وربع سنوية قابلة للطباعة'],
    committee: ['لجنة الجودة', 'اجتماعات اللجنة وقراراتها ومتابعة الإجراءات'],
    training: ['التدريب والتطوير', 'خطط وبرامج التدريب ونسب التغطية'],
    settings: ['الإعدادات والمرجعية', 'بيانات البنك، سياسة الجودة، الفروع، المستخدمون، النسخ الاحتياطي']
  };

  function renderTopbar() {
    var t = TITLES[App.state.view] || ['', ''];
    var html = '<button class="icon-btn menu-toggle" id="btnMenu" aria-label="القائمة">' + UI.icon('menu') + '</button>' +
      '<div><div class="page-title">' + UI.esc(t[0]) + '</div>' +
      '<div class="crumb">' + UI.esc(K.Store.data.settings.shortName) + ' · ' + UI.esc(K.Store.data.settings.dept) + '</div></div>' +
      '<div class="spacer"></div>';

    if (!App.isBranchLocked()) {
      html += '<select id="topBranch" style="width:auto;min-width:150px;padding-block:6px;font-size:12.5px">' +
        '<option value="">كل الفروع والإدارات</option>' +
        K.Store.data.branches.map(function (b) {
          return '<option value="' + b.id + '"' + (App.state.branchId === b.id ? ' selected' : '') + '>' + UI.esc(b.name) + '</option>';
        }).join('') + '</select>';
    } else {
      var b = K.Store.data.branches.filter(function (x) { return x.id === App.state.user.branchId; })[0];
      html += '<span class="badge b-gold">' + UI.icon('building') + ' ' + UI.esc(b ? b.name : '') + '</span>';
    }
    var periods = [['7', 'آخر 7 أيام'], ['30', 'آخر 30 يومًا'], ['90', 'آخر 90 يومًا'], ['365', 'آخر 12 شهرًا'], ['ytd', 'العام الحالي'], ['all', 'كل الفترات']];
    html += '<select id="topPeriod" style="width:auto;min-width:130px;padding-block:6px;font-size:12.5px">' +
      periods.map(function (p) { return '<option value="' + p[0] + '"' + (App.state.period === p[0] ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select>';

    var alerts = K.M.alerts(App.state.branchId);
    html += '<button class="icon-btn" id="btnAlerts" title="التنبيهات" aria-label="التنبيهات" style="position:relative;background:#fff;border:1px solid var(--line)">' + UI.icon('bell') +
      (alerts.length ? '<span style="position:absolute;top:2px;inset-inline-end:2px;background:var(--red);color:#fff;font-size:9px;font-weight:700;border-radius:99px;padding:0 4px;min-width:14px;text-align:center">' + alerts.length + '</span>' : '') +
      '</button>';
    html += '<div class="date-chip">' + UI.icon('calendar') + '<span>' + U.fmtDate(U.todayISO()) + '</span></div>';
    document.getElementById('topbar').innerHTML = html;

    var mb = document.getElementById('btnMenu');
    if (mb) mb.addEventListener('click', function () { document.getElementById('sidebar').classList.toggle('open'); });

    var sb = document.getElementById('topBranch');
    if (sb) sb.addEventListener('change', function () {
      App.state.branchId = this.value;
      App.refresh(true);
    });
    var sp = document.getElementById('topPeriod');
    if (sp) sp.addEventListener('change', function () {
      App.state.period = this.value;
      App.refresh(true);
    });
    document.getElementById('btnAlerts').addEventListener('click', showAlerts);
  }

  function showAlerts() {
    var alerts = K.M.alerts(App.state.branchId);
    var body = alerts.length ? alerts.map(function (a) {
      return '<div class="alert-row ' + (a.level === 'red' ? 'red' : '') + '">' +
        '<div class="a-ico">' + UI.icon(a.kind === 'complaint' ? 'message' : 'alert') + '</div>' +
        '<div class="a-main"><b>' + UI.esc(a.title) + '</b><span>' + UI.esc(a.sub) + '</span></div>' +
        '<span class="a-link" data-goto="' + UI.esc(a.link) + '">فتح</span></div>';
    }).join('') : '<div class="note-box">لا توجد تنبيهات حالية — جميع الشكاوى والملاحظات ضمن المهل المحددة.</div>';
    UI.modal({
      title: 'التنبيهات والمهل', sub: 'الشكاوى والملاحظات المتأخرة أو القريبة من الاستحقاق', size: 'narrow',
      body: body,
      onMount: function (wrap, close) {
        wrap.querySelectorAll('[data-goto]').forEach(function (el) {
          el.addEventListener('click', function () { close(); location.hash = el.getAttribute('data-goto'); });
        });
      }
    });
  }

  /* ---------------- التوجيه ---------------- */
  function parseHash() {
    var h = (location.hash || '#/dashboard').replace(/^#\/?/, '');
    var q = '';
    var qi = h.indexOf('?');
    if (qi > -1) { q = h.slice(qi + 1); h = h.slice(0, qi); }
    var params = {};
    q.split('&').forEach(function (p) {
      if (!p) return;
      var kv = p.split('=');
      params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return { view: h || 'dashboard', params: params };
  }

  App.refresh = function (scrollTop) {
    var parsed = parseHash();
    App.state.view = parsed.view;
    App.state.params = parsed.params;
    var root = document.getElementById('viewRoot');
    var view = K.views[parsed.view];
    renderSidebar();
    renderTopbar();
    document.getElementById('sidebar').classList.remove('open');
    if (!view) {
      root.innerHTML = '<div class="card card-pad">' + UI.empty('الصفحة غير موجودة', 'اختر صفحة من القائمة الجانبية.') + '</div>';
      return;
    }
    if (view.roles && view.roles.indexOf(App.state.user.role) === -1) {
      root.innerHTML = '<div class="card card-pad">' + UI.empty('لا تملك صلاحية الوصول', 'تواصل مع مدير النظام لمنحك الصلاحية المطلوبة.') + '</div>';
      return;
    }
    root.innerHTML = view.render();
    if (view.mount) view.mount(root);
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  App.go = function (hash) { location.hash = hash; };

  /* ---------------- التشغيل ---------------- */
  App.start = function () {
    K.Store.load();
    var user = App.currentUser();
    if (!user) {
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('appShell').classList.add('hidden');
      bindLogin();
      return;
    }
    App.state.user = user;
    if (user.role === 'branch' && user.branchId) App.state.branchId = user.branchId;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
    App.refresh();
    window.addEventListener('hashchange', function () { App.refresh(true); });
    if (!K.Store.persistent) {
      setTimeout(function () { UI.toast('تنبيه: تعذّر حفظ البيانات في المتصفح. استخدم نسخة احتياطية JSON من الإعدادات.', 'err'); }, 900);
    }
  };

  function bindLogin() {
    var form = document.getElementById('loginForm');
    var err = document.getElementById('loginError');
    document.querySelectorAll('[data-cred]').forEach(function (b) {
      b.addEventListener('click', function () {
        form.username.value = b.getAttribute('data-user');
        form.password.value = b.getAttribute('data-pass');
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = App.login(form.username.value.trim(), form.password.value);
      if (!ok) {
        err.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة. تحقق من بيانات الدخول التجريبية أدناه.';
        err.classList.add('show');
        return;
      }
      err.classList.remove('show');
      App.start();
      UI.toast('مرحبًا ' + App.state.user.name + ' — تم تسجيل الدخول');
    });
  }
})(window.KAK);
