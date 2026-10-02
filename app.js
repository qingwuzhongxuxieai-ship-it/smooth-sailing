/* 刘一帆 · 故事集
   想改内容 → 打开 data.js
   这个文件负责：排版渲染、目录、阅读进度、照片灯箱、清单、星愿、夜海动画。 */

(function () {
  'use strict';

  var CFG = window.YIFAN || {};
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function store(key, val) {
    try {
      if (arguments.length === 1) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function readMinutes(text) {
    var n = (text || '').length;
    return Math.max(1, Math.round(n / 400));
  }

  var CHAPTERS = [];   // { id, label, title }

  /* ==========================================================
     一、封面 / 序 / 目录
     ========================================================== */

  function fillCoverAndForeword() {
    document.title = (CFG.name || '刘一帆') + ' · ' + (CFG.bookTitle || '故事集');

    var n = $('coverName'); if (n) n.textContent = CFG.name || '刘一帆';
    var m = $('coverMirror'); if (m) m.textContent = CFG.name || '刘一帆';
    var b = $('coverBook'); if (b) b.textContent = CFG.bookTitle || '故事集';
    var l = $('coverLine'); if (l) l.textContent = CFG.coverLine || '';

    var ft = $('forewordTitle'); if (ft) ft.textContent = CFG.forewordTitle || '写在前面';
    var fb = $('forewordBody');
    if (fb) {
      fb.innerHTML = '';
      (CFG.foreword || []).forEach(function (p) { fb.appendChild(el('p', null, p)); });
    }
  }

  function buildTOC() {
    var list = $('tocList');
    var title = $('tocTitle');
    var stories = CFG.stories || [];
    if (title) title.textContent = '六个故事·共 ' + stories.length + ' 篇';

    if (list) list.innerHTML = '';
    if (!list) return;

    stories.forEach(function (s, i) {
      var li = el('li', 'toc-item');
      var a = el('a');
      a.href = '#story-' + (i + 1);

      a.appendChild(el('span', 'toc-num', pad2(i + 1)));
      a.appendChild(el('span', 'toc-t', s.title));
      a.appendChild(el('span', 'toc-lead'));
      a.appendChild(el('span', 'toc-p', '约 ' + readMinutes((s.body || []).join('')) + ' 分钟'));

      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ==========================================================
     二、故事
     ========================================================== */

  function buildStories() {
    var box = $('stories');
    if (!box) return;
    var stories = CFG.stories || [];
    box.innerHTML = '';
    CHAPTERS = [{ id: 'foreword', label: '序', title: '写在前面' }];

    stories.forEach(function (s, i) {
      var id = 'story-' + (i + 1);
      CHAPTERS.push({ id: id, label: pad2(i + 1), title: s.title });

      var art = el('article', 'story');
      art.id = id;
      art.setAttribute('aria-labelledby', id + '-title');

      var head = el('header', 'story-head');
      head.appendChild(el('span', 'story-num', '第 ' + pad2(i + 1) + ' 篇'));

      var h2 = el('h2', 'story-title', s.title);
      h2.id = id + '-title';
      head.appendChild(h2);

      if (s.subtitle) head.appendChild(el('p', 'story-sub', s.subtitle));

      var chars = (s.body || []).join('').length;
      head.appendChild(el('p', 'story-meta',
        chars + ' 字 · 约 ' + readMinutes((s.body || []).join('')) + ' 分钟'));
      art.appendChild(head);

      var body = el('div', 'prose story-body');
      (s.body || []).forEach(function (p) { body.appendChild(el('p', null, p)); });
      art.appendChild(body);

      var nav = el('nav', 'story-nav');
      nav.setAttribute('aria-label', '篇章导航');
      if (i > 0) {
        var prev = el('a', null, '← ' + stories[i - 1].title);
        prev.href = '#story-' + i;
        nav.appendChild(prev);
      } else {
        nav.appendChild(el('span', 'spacer'));
      }
      var mid = el('a', 'mid', '目录');
      mid.href = '#toc';
      nav.appendChild(mid);
      if (i < stories.length - 1) {
        var next = el('a', null, stories[i + 1].title + ' →');
        next.href = '#story-' + (i + 2);
        nav.appendChild(next);
      } else {
        nav.appendChild(el('span', 'spacer'));
      }
      art.appendChild(nav);

      box.appendChild(art);
    });
  }

  /* ==========================================================
     三、照片
     ========================================================== */

  var photoList = [];
  var photoIndex = 0;

  function buildPhotos() {
    var photos = CFG.photos || [];
    var videos = CFG.videos || [];
    var sec = $('photos');
    var flow = $('photoFlow');
    if (!sec || !flow) return;

    if (!photos.length && !videos.length) { sec.hidden = true; return; }

    sec.hidden = false;
    var t = $('photosTitle');
    if (t) t.textContent = photos.length ? (CFG.photosTitle || '照片') : (CFG.videosTitle || '影像');
    var nt = $('photosNote');
    if (nt) nt.textContent = photos.length ? (CFG.photosNote || '') : '';

    // 占用目录/侧栏的一个位置
    CHAPTERS.push({ id: 'photos', label: '照片', title: CFG.photosTitle || '照片' });

    flow.innerHTML = '';
    photoList = [];
    if (!photos.length) flow.style.display = 'none';

    photos.forEach(function (p, i) {
      var fig = el('figure', 'photo');
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('aria-label', '看大图：' + (p.caption || '照片 ' + (i + 1)));

      var img = document.createElement('img');
      img.src = p.src;
      img.alt = p.alt || p.caption || ('照片 ' + (i + 1));
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.appendChild(img);

      if (p.caption) fig.appendChild(el('figcaption', null, p.caption));

      (function (idx) {
        fig.addEventListener('click', function () { openLightbox(idx); });
        fig.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
        });
      })(photoList.length);

      photoList.push(p);
      flow.appendChild(fig);
    });

    buildVideos(videos);
  }

  function buildVideos(videos) {
    var block = $('videoBlock');
    var grid = $('videoGrid');
    if (!block || !grid) return;

    if (!videos.length) { block.hidden = true; return; }
    block.hidden = false;

    var vt = $('videosTitle'); if (vt) vt.textContent = CFG.videosTitle || '影像';
    var vn = $('videosNote'); if (vn) vn.textContent = CFG.videosNote || '';

    grid.innerHTML = '';
    videos.forEach(function (v, i) {
      var fig = el('figure', 'vcard');

      var vid = document.createElement('video');
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = 'none';              // 点开才加载，省流量
      vid.setAttribute('controlsList', 'nodownload');
      if (v.poster) vid.poster = v.poster;
      vid.src = v.src;
      vid.setAttribute('aria-label', v.caption || ('视频 ' + (i + 1)));
      fig.appendChild(vid);

      if (v.caption) fig.appendChild(el('figcaption', null, v.caption));
      grid.appendChild(fig);
    });
  }

  function openLightbox(i) {
    if (!photoList.length) return;
    photoIndex = (i + photoList.length) % photoList.length;
    var p = photoList[photoIndex];
    var lb = $('lightbox');
    var img = $('lbImg');
    var cap = $('lbCap');
    if (!lb || !img) return;

    img.src = p.src;
    img.alt = p.alt || p.caption || '';
    if (cap) cap.textContent = p.caption || '';

    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    $('lbClose').focus();
  }

  function closeLightbox() {
    var lb = $('lightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    setTimeout(function () {
      if (!lb.classList.contains('is-open')) lb.hidden = true;
    }, 240);
  }

  function bindLightbox() {
    var lb = $('lightbox');
    if (!lb) return;
    $('lbClose').addEventListener('click', closeLightbox);
    $('lbPrev').addEventListener('click', function () { openLightbox(photoIndex - 1); });
    $('lbNext').addEventListener('click', function () { openLightbox(photoIndex + 1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') openLightbox(photoIndex - 1);
      else if (e.key === 'ArrowRight') openLightbox(photoIndex + 1);
    });
  }

  /* ==========================================================
     四、章节导航（侧栏）+ 阅读进度
     ========================================================== */

  function buildRail() {
    var rail = $('rail');
    if (!rail) return;
    var extra = [
      { id: 'sec-list', label: '未完', title: CFG.listTitle || '想一起做的事' },
      { id: 'sec-wish', label: '留白', title: CFG.wishesTitle || '留一颗星' },
      { id: 'sec-letter', label: '后记', title: CFG.letterTitle || '后记' }
    ];
    var all = CHAPTERS.concat(extra);
    rail.innerHTML = '';
    all.forEach(function (c) {
      var a = el('a', null, c.label);
      a.href = '#' + c.id;
      a.setAttribute('title', c.title);
      rail.appendChild(a);
    });
    rail.hidden = false;
  }

  function initReadingProgress() {
    var bar = $('readbar');
    var railLinks = document.querySelectorAll('.rail a');
    var ticking = false;

    function update() {
      ticking = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';

      var reading = window.scrollY > window.innerHeight * 0.92;
      document.body.classList.toggle('reading', reading);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    // 当前章节高亮
    var sections = [];
    for (var i = 0; i < railLinks.length; i++) {
      var id = (railLinks[i].getAttribute('href') || '').replace('#', '');
      var node = document.getElementById(id);
      if (node) sections.push({ node: node, link: railLinks[i] });
    }
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        for (var k = 0; k < sections.length; k++) {
          sections[k].link.classList.toggle('on', sections[k].node === en.target);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { io.observe(s.node); });
  }

  /* ==========================================================
     五、封面时钟 + 版权页
     ========================================================== */

  function renderCoverClock() {
    var d = new Date();
    var c = $('coverClock');
    var dt = $('coverDate');
    if (c) c.textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    if (dt) dt.textContent = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 星期' + WEEK[d.getDay()];
  }

  function ensureUnits(labels) {
    var row = $('counterRow');
    if (!row) return;
    var key = labels.join('/');
    if (row.getAttribute('data-mode') === key) return;
    row.setAttribute('data-mode', key);
    row.innerHTML = '';
    labels.forEach(function (l) {
      var w = el('div', 'unit');
      w.appendChild(el('b', null, '0'));
      w.appendChild(el('span', null, l));
      row.appendChild(w);
    });
  }

  function setUnitValues(vals) {
    var row = $('counterRow');
    if (!row) return;
    for (var i = 0; i < vals.length && i < row.children.length; i++) {
      var b = row.children[i].firstChild;
      if (b && b.textContent !== vals[i]) b.textContent = vals[i];
    }
  }

  function renderColophon() {
    var label = $('colophonLabel');
    var note = $('counterNote');
    if (!label) return;

    var t = CFG.beginDate ? new Date(CFG.beginDate) : null;
    var valid = t && !isNaN(t.getTime());

    if (!valid) {
      label.textContent = '写于';
      ensureUnits(['年', '月', '日']);
      var d = new Date();
      setUnitValues([String(d.getFullYear()), String(d.getMonth() + 1), pad2(d.getDate())]);
      if (note) {
        note.textContent = '星期' + WEEK[d.getDay()] + ' · ' +
          pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
      }
      return;
    }

    var diff = Date.now() - t.getTime();
    var future = diff < 0;
    var ms = Math.abs(diff);

    label.textContent = future ? '距离那一天' : (CFG.beginLabel || '和你在一起');
    ensureUnits(['天', '时', '分', '秒']);

    var sec = Math.floor(ms / 1000);
    setUnitValues([
      String(Math.floor(sec / 86400)),
      pad2(Math.floor((sec % 86400) / 3600)),
      pad2(Math.floor((sec % 3600) / 60)),
      pad2(sec % 60)
    ]);

    if (note) {
      note.textContent = (future ? '到 ' : '从 ') +
        t.getFullYear() + ' 年 ' + (t.getMonth() + 1) + ' 月 ' + t.getDate() + ' 日 ' +
        pad2(t.getHours()) + ':' + pad2(t.getMinutes()) + (future ? '' : ' 起');
    }
  }

  /* ==========================================================
     六、清单
     ========================================================== */

  var LIST_KEY = 'liuyifan-list-v2';
  var doneSet = {};

  function loadList() {
    var raw = store(LIST_KEY);
    if (!raw) return;
    try {
      var arr = JSON.parse(raw);
      if (Object.prototype.toString.call(arr) === '[object Array]') {
        arr.forEach(function (i) { doneSet[i] = true; });
      }
    } catch (e) {}
  }

  function saveList() {
    var arr = [];
    for (var k in doneSet) if (doneSet[k]) arr.push(Number(k));
    store(LIST_KEY, JSON.stringify(arr));
  }

  function buildList() {
    var ul = $('todoList');
    var title = $('listTitle');
    if (title) title.textContent = CFG.listTitle || '想一起做的事';
    if (!ul) return;
    ul.innerHTML = '';
    (CFG.list || []).forEach(function (text, i) {
      var li = el('li');
      var btn = el('button', 'todo');
      btn.type = 'button';
      btn.setAttribute('data-i', i);
      btn.setAttribute('aria-pressed', 'false');
      btn.appendChild(el('span', 'box'));
      btn.appendChild(el('span', null, text));
      li.appendChild(btn);
      ul.appendChild(li);
    });
    paintList();
  }

  function paintList() {
    var items = document.querySelectorAll('.todo');
    var total = items.length, done = 0;
    for (var i = 0; i < items.length; i++) {
      var on = !!doneSet[items[i].getAttribute('data-i')];
      items[i].classList.toggle('done', on);
      items[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) done++;
    }
    var bar = $('listBar');
    if (bar) bar.style.width = (total ? (done / total * 100) : 0) + '%';
    var txt = $('listCount');
    if (txt) txt.textContent = done + ' / ' + total;
  }

  function bindList() {
    var ul = $('todoList');
    if (!ul) return;
    ul.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.todo') : null;
      if (!btn) return;
      var idx = btn.getAttribute('data-i');
      if (doneSet[idx]) delete doneSet[idx]; else doneSet[idx] = true;
      paintList();
      saveList();
    });
  }

  /* ==========================================================
     七、夜海（封面背景，带省电优化）
     ========================================================== */

  function initSea() {
    var cvs = $('sea');
    if (!cvs) return;
    var ctx = cvs.getContext('2d');
    var W = 0, H = 0, DPR = 1, hy = 0;
    var stars = [], glints = [], lanterns = [], shoot = null, nextShoot = 6;
    var moonX = 0, moonY = 0, moonR = 26;
    var t0 = performance.now();
    var asleep = false;

    var LAYERS = [
      { base: 12, amp: 3.2, sp: 0.9, ph: 0.4 },
      { base: 46, amp: 9, sp: 1.15, ph: 2.1 },
      { base: 112, amp: 15, sp: 1.4, ph: 4.3 }
    ];

    function waveY(x, layer, t) {
      return hy + layer.base
        + Math.sin(x * 0.0105 + t * 0.55 * layer.sp + layer.ph) * layer.amp
        + Math.sin(x * 0.0263 - t * 0.78 * layer.sp + layer.ph * 1.7) * layer.amp * 0.46
        + Math.sin(x * 0.0592 + t * 1.18 * layer.sp + layer.ph * 2.3) * layer.amp * 0.18;
    }

    function buildScene() {
      var count = Math.max(80, Math.min(220, Math.round(W * H / 9000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        var big = Math.random() < 0.022;
        stars.push({
          x: Math.random() * W,
          y: Math.pow(Math.random(), 1.3) * hy * 0.97,
          r: big ? 1.5 + Math.random() * 0.8 : 0.35 + Math.random() * 1.1,
          a: 0.22 + Math.random() * 0.62,
          ph: Math.random() * Math.PI * 2,
          sp: 0.5 + Math.random() * 1.7,
          flare: big
        });
      }
      glints = [];
      for (var j = 0; j < 150; j++) {
        glints.push({
          t: Math.pow(Math.random(), 0.72),
          w: 3 + Math.pow(Math.random(), 1.9) * 56,
          ox: (Math.random() - 0.5) * 34,
          a: 0.08 + Math.random() * 0.26,
          ph: Math.random() * Math.PI * 2,
          sp: 0.7 + Math.random() * 1.5
        });
      }
      lanterns = [
        { u: 0.078, ph: 0.0, s: 0.80 },
        { u: 0.152, ph: 1.9, s: 0.95 },
        { u: 0.905, ph: 3.4, s: 0.86 }
      ];
      moonX = W * 0.765;
      moonY = Math.max(58, hy * 0.30);
      moonR = Math.max(17, Math.min(30, W * 0.020));
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      cvs.width = Math.floor(W * DPR);
      cvs.height = Math.floor(H * DPR);
      cvs.style.width = W + 'px';
      cvs.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      hy = Math.round(H * 0.60);
      buildScene();
    }

    function sky(t) {
      var g = ctx.createLinearGradient(0, 0, 0, hy);
      g.addColorStop(0, '#03060c');
      g.addColorStop(0.45, '#071120');
      g.addColorStop(1, '#0e2036');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, hy + 2);

      ctx.save();
      ctx.translate(W * 0.30, hy * 0.44);
      ctx.rotate(-0.52);
      ctx.scale(1, 0.40);
      var mg = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(W, hy) * 0.62);
      mg.addColorStop(0, 'rgba(158,196,238,0.075)');
      mg.addColorStop(0.5, 'rgba(126,166,214,0.035)');
      mg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(W, hy) * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawMoon() {
      var halo = ctx.createRadialGradient(moonX, moonY, moonR * 0.6, moonX, moonY, moonR * 9);
      halo.addColorStop(0, 'rgba(255,238,205,0.16)');
      halo.addColorStop(0.42, 'rgba(226,205,170,0.055)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 9, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f6efe0';
      ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = 'rgba(206,192,166,0.30)';
      ctx.beginPath(); ctx.arc(moonX - moonR * 0.30, moonY - moonR * 0.22, moonR * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX + moonR * 0.28, moonY + moonR * 0.30, moonR * 0.17, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX + moonR * 0.10, moonY - moonR * 0.52, moonR * 0.10, 0, Math.PI * 2); ctx.fill();
    }

    function drawStars(t) {
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = s.a * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
        if (a <= 0.02) continue;
        ctx.fillStyle = 'rgba(226,238,252,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.flare) {
          ctx.strokeStyle = 'rgba(226,238,252,' + (a * 0.5).toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 4, s.y); ctx.lineTo(s.x + s.r * 4, s.y);
          ctx.moveTo(s.x, s.y - s.r * 4); ctx.lineTo(s.x, s.y + s.r * 4);
          ctx.stroke();
        }
      }
    }

    function drawShoot(dt) {
      if (!shoot) {
        nextShoot -= dt;
        if (nextShoot <= 0) {
          nextShoot = 7 + Math.random() * 14;
          var fromLeft = Math.random() < 0.5;
          shoot = {
            x: fromLeft ? -40 : W + 40,
            y: hy * (0.08 + Math.random() * 0.36),
            vx: (fromLeft ? 1 : -1) * (620 + Math.random() * 420),
            vy: 190 + Math.random() * 150,
            life: 1.25
          };
        }
        return;
      }
      shoot.x += shoot.vx * dt;
      shoot.y += shoot.vy * dt;
      shoot.life -= dt;
      var k = Math.max(0, shoot.life / 1.25);
      var x2 = shoot.x - shoot.vx * 0.13;
      var y2 = shoot.y - shoot.vy * 0.13;
      var g = ctx.createLinearGradient(shoot.x, shoot.y, x2, y2);
      g.addColorStop(0, 'rgba(255,246,225,' + (0.85 * k).toFixed(3) + ')');
      g.addColorStop(0.35, 'rgba(200,222,246,' + (0.35 * k).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(200,222,246,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(x2, y2); ctx.stroke();
      if (shoot.life <= 0 || shoot.x < -200 || shoot.x > W + 200 || shoot.y > hy) shoot = null;
    }

    function seaBase() {
      var g = ctx.createLinearGradient(0, hy, 0, H);
      g.addColorStop(0, '#102439');
      g.addColorStop(0.45, '#0a1727');
      g.addColorStop(1, '#04080f');
      ctx.fillStyle = g;
      ctx.fillRect(0, hy, W, H - hy);
    }

    function moonTrail(t) {
      ctx.save();
      var span = (H - hy) * 0.72;
      ctx.translate(moonX, hy + span * 0.28);
      ctx.scale(1, span / 96);
      var rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 96);
      rg.addColorStop(0, 'rgba(236,208,152,0.15)');
      rg.addColorStop(0.42, 'rgba(236,208,152,0.055)');
      rg.addColorStop(1, 'rgba(236,208,152,0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, 96, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      for (var i = 0; i < glints.length; i++) {
        var gl = glints[i];
        var y = hy + 4 + gl.t * (H - hy - 8);
        var wob = Math.sin(t * gl.sp + gl.ph);
        var fade = Math.pow(1 - gl.t, 1.5);
        var a = gl.a * fade * (0.45 + 0.55 * wob);
        if (a <= 0.004) continue;
        var w = gl.w * (0.5 + gl.t * 1.25) * (0.7 + 0.3 * wob);
        var spread = 5 + gl.t * 56;
        ctx.fillStyle = 'rgba(236,208,152,' + a.toFixed(3) + ')';
        ctx.fillRect(moonX + gl.ox - w / 2 + wob * spread * 0.45, y, w, 1.2);
      }
    }

    function wave(layer, t, top, bottom) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, waveY(0, layer, t));
      for (var x = 6; x <= W; x += 6) ctx.lineTo(x, waveY(x, layer, t));
      ctx.lineTo(W, H);
      ctx.closePath();
      var g = ctx.createLinearGradient(0, hy + layer.base - layer.amp * 2, 0, H);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, waveY(0, layer, t));
      for (var x2 = 6; x2 <= W; x2 += 6) ctx.lineTo(x2, waveY(x2, layer, t));
      ctx.strokeStyle = 'rgba(158,204,240,0.11)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawBoat(t) {
      var scale = Math.max(0.62, Math.min(1.35, W / 1500));
      // 窄屏上把船压到更前面一排浪，免得挡住封面题记
      var layer = W < 760 ? LAYERS[2] : LAYERS[1];
      var bx = W * 0.235 + Math.sin(t * 0.055) * W * 0.028;
      var by = waveY(bx, layer, t) + (W < 760 ? 58 : 0) + Math.sin(t * 1.25) * 1.6;
      var S = scale;

      ctx.save();
      ctx.translate(bx, by);

      ctx.beginPath();
      ctx.moveTo(-46 * S, 0);
      ctx.quadraticCurveTo(-30 * S, 21 * S, 0, 21 * S);
      ctx.quadraticCurveTo(30 * S, 21 * S, 46 * S, 0);
      ctx.quadraticCurveTo(0, 7 * S, -46 * S, 0);
      ctx.closePath();
      ctx.fillStyle = '#0a1421';
      ctx.fill();
      ctx.strokeStyle = 'rgba(233,192,122,0.22)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-5 * S, 0);
      ctx.lineTo(-5 * S, -86 * S);
      ctx.strokeStyle = 'rgba(12,22,36,0.92)';
      ctx.lineWidth = 2 * S;
      ctx.lineCap = 'round';
      ctx.stroke();

      var sg = ctx.createLinearGradient(-5 * S, -86 * S, 44 * S, 0);
      sg.addColorStop(0, 'rgba(255,250,238,0.95)');
      sg.addColorStop(0.55, 'rgba(244,226,190,0.80)');
      sg.addColorStop(1, 'rgba(214,180,120,0.58)');
      ctx.beginPath();
      ctx.moveTo(-3 * S, -84 * S);
      ctx.quadraticCurveTo(24 * S, -52 * S, 40 * S, -7 * S);
      ctx.lineTo(-3 * S, -7 * S);
      ctx.closePath();
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,246,222,0.55)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-8 * S, -74 * S);
      ctx.quadraticCurveTo(-26 * S, -40 * S, -34 * S, -7 * S);
      ctx.lineTo(-8 * S, -7 * S);
      ctx.closePath();
      ctx.fillStyle = 'rgba(246,232,203,0.62)';
      ctx.fill();

      var lg = ctx.createRadialGradient(-30 * S, -6 * S, 0, -30 * S, -6 * S, 26 * S);
      lg.addColorStop(0, 'rgba(255,198,116,0.55)');
      lg.addColorStop(1, 'rgba(255,180,96,0)');
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(-30 * S, -6 * S, 26 * S, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,216,158,0.95)';
      ctx.beginPath(); ctx.arc(-30 * S, -6 * S, 1.9 * S, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    }

    function drawLanterns(t) {
      for (var i = 0; i < lanterns.length; i++) {
        var L = lanterns[i];
        var lx = W * L.u;
        var ly = waveY(lx, LAYERS[1], t) + 2 + Math.sin(t * 1.05 + L.ph) * 2;
        var R = 30 * L.s;
        var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R);
        g.addColorStop(0, 'rgba(255,206,132,0.60)');
        g.addColorStop(0.35, 'rgba(255,190,104,0.20)');
        g.addColorStop(1, 'rgba(255,180,96,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(lx, ly, R, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,164,0.92)';
        ctx.beginPath(); ctx.arc(lx, ly, 2.1 * L.s, 0, Math.PI * 2); ctx.fill();
      }
    }

    function frame(now) {
      var t = (now - t0) / 1000;
      var dt = 1 / 60;
      ctx.clearRect(0, 0, W, H);
      sky(t);
      drawMoon();
      drawStars(t);
      drawShoot(dt);
      seaBase();
      wave(LAYERS[0], t, 'rgba(22,48,74,0.72)', 'rgba(9,20,34,0.86)');
      wave(LAYERS[1], t, 'rgba(15,35,56,0.80)', 'rgba(6,14,25,0.92)');
      wave(LAYERS[2], t, 'rgba(8,19,32,0.88)', 'rgba(3,7,13,0.97)');
      moonTrail(t);
      drawLanterns(t);
      drawBoat(t);
    }

    resize();

    if (reduced) {
      frame(performance.now());
    } else {
      (function loop(now) {
        requestAnimationFrame(loop);
        // 省电：页面不可见、或已经翻过封面时不再重绘
        var far = window.scrollY > window.innerHeight * 1.35;
        if (document.hidden || far) { asleep = true; return; }
        asleep = false;
        frame(now || performance.now());
      })();
    }

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        resize();
        if (reduced || asleep) frame(performance.now());
      }, 180);
    });
  }

  /* ==========================================================
     八、星愿
     ========================================================== */

  var WISH_KEY = 'liuyifan-wishes-v2';

  function initSky() {
    var wrap = document.querySelector('.sky-wrap');
    var cvs = $('sky');
    if (!wrap || !cvs) return;
    var ctx = cvs.getContext('2d');
    var W = 0, H = 0, DPR = 1;
    var ambient = [], wishes = [];
    var pending = null, tipTimer = null, hoverI = -1;
    var t0 = performance.now();
    var visible = false;

    var form = $('wishForm');
    var input = $('wishInput');
    var tip = $('wishTip');
    var a11y = $('wishA11y');
    var hint = $('skyHint');

    function loadWishes() {
      var raw = store(WISH_KEY);
      if (raw) {
        try {
          var arr = JSON.parse(raw);
          if (Object.prototype.toString.call(arr) === '[object Array]') return arr;
        } catch (e) {}
      }
      return (CFG.wishes || []).map(function (w) {
        return { text: w.text, x: w.x, y: w.y };
      });
    }

    function saveWishes() { store(WISH_KEY, JSON.stringify(wishes)); }

    function renderA11y() {
      if (!a11y) return;
      a11y.innerHTML = '';
      wishes.forEach(function (w) { a11y.appendChild(el('li', null, w.text)); });
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      cvs.width = Math.max(1, Math.floor(W * DPR));
      cvs.height = Math.max(1, Math.floor(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ambient = [];
      var n = Math.max(60, Math.min(170, Math.round(W * H / 8000)));
      for (var i = 0; i < n; i++) {
        ambient.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.35 + Math.random() * 1.0,
          a: 0.12 + Math.random() * 0.38,
          ph: Math.random() * Math.PI * 2,
          sp: 0.5 + Math.random() * 1.6
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ambient.length; i++) {
        var s = ambient[i];
        var a = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        if (a <= 0.02) continue;
        ctx.fillStyle = 'rgba(214,230,248,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      for (var j = 0; j < wishes.length; j++) {
        var w = wishes[j];
        var x = w.x * W, y = w.y * H;
        var pulse = 0.62 + 0.38 * Math.sin(t * 1.5 + j * 1.7);
        var isHover = j === hoverI;
        var R = 34 * (isHover ? 1.35 : 1);
        var halo = ctx.createRadialGradient(x, y, 0, x, y, R);
        halo.addColorStop(0, 'rgba(255,226,168,' + (0.42 * pulse).toFixed(3) + ')');
        halo.addColorStop(0.45, 'rgba(255,206,132,0.10)');
        halo.addColorStop(1, 'rgba(255,196,110,0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = 'rgba(255,226,168,' + (0.30 * pulse).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y);
        ctx.moveTo(x, y - 11); ctx.lineTo(x, y + 11);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,244,214,0.98)';
        ctx.beginPath(); ctx.arc(x, y, isHover ? 3.1 : 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop(now) {
      if (visible && !document.hidden) draw((now - t0) / 1000);
      requestAnimationFrame(loop);
    }

    function place(node, x, y) {
      node.style.left = Math.max(150, Math.min(W - 150, x)) + 'px';
      node.style.top = Math.max(34, Math.min(H - 34, y)) + 'px';
    }

    function openForm(x, y) {
      pending = { x: x / W, y: y / H };
      place(form, x, y);
      form.hidden = false;
      if (hint) hint.classList.add('gone');
      setTimeout(function () { if (input) input.focus(); }, 20);
    }

    function closeForm() {
      form.hidden = true;
      pending = null;
      if (input) input.value = '';
      if (hint && !wishes.length) hint.classList.remove('gone');
    }

    function showTip(i) {
      var w = wishes[i];
      if (!w || !tip) return;
      tip.textContent = w.text;
      place(tip, w.x * W, w.y * H - 14);
      tip.hidden = false;
      clearTimeout(tipTimer);
      tipTimer = setTimeout(function () { tip.hidden = true; }, 3600);
    }

    function hit(x, y) {
      var best = -1, bestD = 20;
      for (var i = 0; i < wishes.length; i++) {
        var dx = wishes[i].x * W - x, dy = wishes[i].y * H - y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    wrap.addEventListener('click', function (e) {
      if (form.contains(e.target)) return;
      var rect = wrap.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var i = hit(x, y);
      if (i >= 0) { tip.hidden = true; showTip(i); return; }
      tip.hidden = true;
      openForm(x, y);
    });

    wrap.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      var i = hit(e.clientX - rect.left, e.clientY - rect.top);
      if (i !== hoverI) {
        hoverI = i;
        wrap.style.cursor = i >= 0 ? 'pointer' : 'crosshair';
      }
    });
    wrap.addEventListener('mouseleave', function () { hoverI = -1; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text || !pending) { closeForm(); return; }
      wishes.push({ text: text.slice(0, 40), x: pending.x, y: pending.y });
      saveWishes();
      renderA11y();
      if (hint) hint.classList.add('gone');
      closeForm();
    });

    $('wishCancel').addEventListener('click', function (e) { e.stopPropagation(); closeForm(); });
    $('skyAdd').addEventListener('click', function (e) {
      e.stopPropagation();
      if (!form.hidden) { closeForm(); return; }
      openForm(W / 2, H / 2);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !form.hidden) closeForm();
    });

    wishes = loadWishes();
    resize();
    renderA11y();
    if (wishes.length && hint) hint.classList.add('gone');
    draw(0);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ens) {
        visible = ens[0].isIntersecting;
      }, { rootMargin: '120px' }).observe(wrap);
    } else {
      visible = true;
    }
    if (!reduced) requestAnimationFrame(loop);

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); draw((performance.now() - t0) / 1000); }, 180);
    });
  }

  /* ==========================================================
     九、后记 / 页脚
     ========================================================== */

  function fillLetter() {
    var t = $('letterTitle'); if (t) t.textContent = CFG.letterTitle || '后记';
    var b = $('letterBody');
    if (b) {
      b.innerHTML = '';
      (CFG.letter || []).forEach(function (p) { b.appendChild(el('p', null, p)); });
    }
    var s = $('letterSign'); if (s) s.textContent = CFG.letterSign || '';

    var wt = $('wishesTitle'); if (wt) wt.textContent = CFG.wishesTitle || '留一颗星';
    var wi = $('wishIntro'); if (wi) wi.textContent = CFG.wishIntro || '';
    var sh = $('skyHint'); if (sh) sh.textContent = CFG.wishHint || '在夜空里点一下，就是一颗星';

    var fl = $('footLeft'); if (fl) fl.textContent = CFG.footerLeft || '';
    var fr = $('footRight'); if (fr) fr.textContent = CFG.footerRight || '';
  }

  /* ==========================================================
     十、启动
     ========================================================== */

  function init() {
    fillCoverAndForeword();
    buildStories();
    buildPhotos();
    buildTOC();
    buildRail();
    buildList();
    bindList();
    fillLetter();
    bindLightbox();
    renderCoverClock();
    renderColophon();
    initSea();
    initSky();
    initReadingProgress();

    var coverVisible = true;
    if ('IntersectionObserver' in window) {
      var cover = document.querySelector('.cover');
      if (cover) {
        new IntersectionObserver(function (ens) {
          coverVisible = ens[0].isIntersecting;
        }).observe(cover);
      }
    }

    // 只有封面在视野里时才刷新时钟
    setInterval(function () {
      if (!document.hidden && coverVisible) renderCoverClock();
    }, 1000);
    setInterval(function () {
      if (!document.hidden) renderColophon();
    }, 1000);
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (err) {
    // 出错也不留白屏
    var box = $('stories');
    if (box) box.textContent = '';
  }
})();
