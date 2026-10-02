/* 刘一帆 · 一帆风顺
   想改内容 → 打开 data.js
   这个文件负责：夜海动画、计时、清单打勾、星愿、滚动出现。 */

(function () {
  'use strict';

  var CFG = window.YIFAN || {};
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, val) {
    try {
      if (arguments.length === 1) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ==========================================================
     一、把 data.js 里的文字填进页面
     ========================================================== */

  function fillText() {
    document.title = (CFG.name || '刘一帆') + ' · 一帆风顺';

    var heroName = $('heroName');
    if (heroName) heroName.textContent = CFG.name || '刘一帆';
    var mirror = $('heroMirror');
    if (mirror) mirror.textContent = CFG.name || '刘一帆';
    var heroLine = $('heroLine');
    if (heroLine) heroLine.textContent = CFG.heroLine || '';

    var nameIntro = $('nameIntro');
    if (nameIntro) nameIntro.textContent = CFG.nameIntro || '';
    var nameOutro = $('nameOutro');
    if (nameOutro) nameOutro.textContent = CFG.nameOutro || '';

    var grid = $('glyphGrid');
    if (grid) {
      grid.innerHTML = '';
      (CFG.nameStory || []).forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'glyph-card reveal';
        var g = document.createElement('span');
        g.className = 'glyph';
        g.textContent = item.glyph;
        var p = document.createElement('p');
        p.textContent = item.text;
        card.appendChild(g);
        card.appendChild(p);
        grid.appendChild(card);
      });
    }

    var listTitle = $('listTitle');
    if (listTitle) listTitle.textContent = CFG.listTitle || '想和你一起做的事';

    var hint = $('skyHint');
    if (hint) hint.textContent = CFG.wishHint || '在夜空里点一下，就是一颗星';

    var lt = $('letterTitle');
    if (lt) lt.textContent = CFG.letterTitle || '写给你的信';

    var body = $('letterBody');
    if (body) {
      body.innerHTML = '';
      (CFG.letter || []).forEach(function (para) {
        var p = document.createElement('p');
        p.textContent = para;
        body.appendChild(p);
      });
    }
    var sign = $('letterSign');
    if (sign) sign.textContent = CFG.letterSign || '';

    var fl = $('footLeft');
    if (fl) fl.textContent = CFG.footerLeft || '';
    var fr = $('footRight');
    if (fr) fr.textContent = CFG.footerRight || '';
  }

  /* ==========================================================
     二、首屏时钟
     ========================================================== */

  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function renderHeroClock() {
    var d = new Date();
    var c = $('heroClock');
    var dt = $('heroDate');
    if (c) c.textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    if (dt) dt.textContent = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 星期' + WEEK[d.getDay()];
  }

  /* ==========================================================
     三、计时
     ========================================================== */

  var counterMode = '';

  function ensureUnits(labels) {
    var row = $('counterRow');
    if (!row) return;
    var key = labels.join('/');
    if (row.getAttribute('data-mode') === key) return;
    row.setAttribute('data-mode', key);
    row.innerHTML = '';
    labels.forEach(function (l) {
      var wrap = document.createElement('div');
      wrap.className = 'unit';
      var b = document.createElement('b');
      b.textContent = '0';
      var s = document.createElement('span');
      s.textContent = l;
      wrap.appendChild(b);
      wrap.appendChild(s);
      row.appendChild(wrap);
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

  function renderCounter() {
    var label = $('counterLabel');
    var note = $('counterNote');
    if (!label) return;

    var t = CFG.beginDate ? new Date(CFG.beginDate) : null;
    var valid = t && !isNaN(t.getTime());

    if (!valid) {
      // 还没有设定起点 —— 安静地显示「此刻」
      counterMode = 'now';
      label.textContent = '此刻';
      ensureUnits(['年', '月', '日']);
      var d = new Date();
      setUnitValues([
        String(d.getFullYear()),
        String(d.getMonth() + 1),
        pad2(d.getDate())
      ]);
      if (note) {
        note.textContent = '星期' + WEEK[d.getDay()] + ' · ' +
          pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
      }
      return;
    }

    var diff = Date.now() - t.getTime();
    var future = diff < 0;
    var ms = Math.abs(diff);

    counterMode = future ? 'countdown' : 'count';
    label.textContent = future ? '距离那一天' : (CFG.beginLabel || '在一起');
    ensureUnits(['天', '时', '分', '秒']);

    var sec = Math.floor(ms / 1000);
    var days = Math.floor(sec / 86400);
    var hours = Math.floor((sec % 86400) / 3600);
    var mins = Math.floor((sec % 3600) / 60);
    var secs = sec % 60;

    setUnitValues([String(days), pad2(hours), pad2(mins), pad2(secs)]);

    if (note) {
      var from = t.getFullYear() + ' 年 ' + (t.getMonth() + 1) + ' 月 ' + t.getDate() + ' 日 ' +
                 pad2(t.getHours()) + ':' + pad2(t.getMinutes());
      note.textContent = (future ? '到 ' : '从 ') + from + (future ? '' : ' 起') +
        (CFG.beginNote ? ' · ' + CFG.beginNote : '');
    }
  }

  /* ==========================================================
     四、清单
     ========================================================== */

  var LIST_KEY = 'liuyifan-list-v1';
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
    if (!ul) return;
    ul.innerHTML = '';
    (CFG.list || []).forEach(function (text, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'todo reveal';
      btn.setAttribute('data-i', i);
      btn.setAttribute('aria-pressed', 'false');

      var box = document.createElement('span');
      box.className = 'box';
      var span = document.createElement('span');
      span.textContent = text;

      btn.appendChild(box);
      btn.appendChild(span);
      li.appendChild(btn);
      ul.appendChild(li);
    });
    paintList();
  }

  function paintList() {
    var items = document.querySelectorAll('.todo');
    var total = items.length;
    var done = 0;
    for (var i = 0; i < items.length; i++) {
      var idx = Number(items[i].getAttribute('data-i'));
      var on = !!doneSet[idx];
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
     五、夜海（首屏背景）
     ========================================================== */

  function initSea() {
    var cvs = $('sea');
    if (!cvs) return;
    var ctx = cvs.getContext('2d');
    var W = 0, H = 0, DPR = 1, hy = 0;
    var stars = [], glints = [], lanterns = [], shoot = null, nextShoot = 6;
    var moonX = 0, moonY = 0, moonR = 26;
    var t0 = performance.now();

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
      var count = Math.max(90, Math.min(230, Math.round(W * H / 9000)));
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
      DPR = Math.min(window.devicePixelRatio || 1, 1.75);
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

      // 银河
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
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f6efe0';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

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
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
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
      var len = 0.13;
      var x2 = shoot.x - shoot.vx * len;
      var y2 = shoot.y - shoot.vy * len;
      var g = ctx.createLinearGradient(shoot.x, shoot.y, x2, y2);
      g.addColorStop(0, 'rgba(255,246,225,' + (0.85 * k).toFixed(3) + ')');
      g.addColorStop(0.35, 'rgba(200,222,246,' + (0.35 * k).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(200,222,246,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
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

      // 月亮在水面的一层底光
      var span = (H - hy) * 0.72;
      ctx.save();
      ctx.translate(moonX, hy + span * 0.28);
      ctx.scale(1, span / 96);
      var rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 96);
      rg.addColorStop(0, 'rgba(236,208,152,0.15)');
      rg.addColorStop(0.42, 'rgba(236,208,152,0.055)');
      rg.addColorStop(1, 'rgba(236,208,152,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(0, 0, 96, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.restore();
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
      var bx = W * 0.235 + Math.sin(t * 0.055) * W * 0.028;
      var by = waveY(bx, LAYERS[1], t) + Math.sin(t * 1.25) * 1.6;
      var S = scale;

      ctx.save();
      ctx.translate(bx, by);

      // 船身
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

      // 桅杆
      ctx.beginPath();
      ctx.moveTo(-5 * S, 0);
      ctx.lineTo(-5 * S, -86 * S);
      ctx.strokeStyle = 'rgba(12,22,36,0.92)';
      ctx.lineWidth = 2 * S;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 主帆
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

      // 前帆
      ctx.beginPath();
      ctx.moveTo(-8 * S, -74 * S);
      ctx.quadraticCurveTo(-26 * S, -40 * S, -34 * S, -7 * S);
      ctx.lineTo(-8 * S, -7 * S);
      ctx.closePath();
      ctx.fillStyle = 'rgba(246,232,203,0.62)';
      ctx.fill();

      // 船尾灯
      var lg = ctx.createRadialGradient(-30 * S, -6 * S, 0, -30 * S, -6 * S, 26 * S);
      lg.addColorStop(0, 'rgba(255,198,116,0.55)');
      lg.addColorStop(1, 'rgba(255,180,96,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(-30 * S, -6 * S, 26 * S, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,216,158,0.95)';
      ctx.beginPath();
      ctx.arc(-30 * S, -6 * S, 1.9 * S, 0, Math.PI * 2);
      ctx.fill();

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
        ctx.beginPath();
        ctx.arc(lx, ly, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,220,164,0.92)';
        ctx.beginPath();
        ctx.arc(lx, ly, 2.1 * L.s, 0, Math.PI * 2);
        ctx.fill();
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
        frame(now || performance.now());
        requestAnimationFrame(loop);
      })();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        if (reduced) frame(performance.now());
      }, 180);
    });

    window.addEventListener('scroll', function () {
      var p = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
      cvs.style.opacity = String(1 - p * 0.42);
    }, { passive: true });
  }

  /* ==========================================================
     六、星愿
     ========================================================== */

  var WISH_KEY = 'liuyifan-wishes-v1';

  function initSky() {
    var wrap = document.querySelector('.sky-wrap');
    var cvs = $('sky');
    if (!wrap || !cvs) return;
    var ctx = cvs.getContext('2d');
    var W = 0, H = 0, DPR = 1;
    var ambient = [];
    var wishes = [];
    var pending = null;
    var tipTimer = null;
    var hoverI = -1;
    var t0 = performance.now();

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

    function saveWishes() {
      store(WISH_KEY, JSON.stringify(wishes));
    }

    function renderA11y() {
      if (!a11y) return;
      a11y.innerHTML = '';
      wishes.forEach(function (w) {
        var li = document.createElement('li');
        li.textContent = w.text;
        a11y.appendChild(li);
      });
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      cvs.width = Math.max(1, Math.floor(W * DPR));
      cvs.height = Math.max(1, Math.floor(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ambient = [];
      var n = Math.max(70, Math.min(200, Math.round(W * H / 8000)));
      for (var i = 0; i < n; i++) {
        ambient.push({
          x: Math.random() * W,
          y: Math.random() * H,
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
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var j = 0; j < wishes.length; j++) {
        var w = wishes[j];
        var x = w.x * W;
        var y = w.y * H;
        var pulse = 0.62 + 0.38 * Math.sin(t * 1.5 + j * 1.7);
        var isHover = j === hoverI;

        var halo = ctx.createRadialGradient(x, y, 0, x, y, 34 * (isHover ? 1.35 : 1));
        halo.addColorStop(0, 'rgba(255,226,168,' + (0.42 * pulse).toFixed(3) + ')');
        halo.addColorStop(0.45, 'rgba(255,206,132,0.10)');
        halo.addColorStop(1, 'rgba(255,196,110,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, 34 * (isHover ? 1.35 : 1), 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,226,168,' + (0.30 * pulse).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y);
        ctx.moveTo(x, y - 11); ctx.lineTo(x, y + 11);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,244,214,0.98)';
        ctx.beginPath();
        ctx.arc(x, y, isHover ? 3.1 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      draw((now - t0) / 1000);
      if (!reduced) requestAnimationFrame(loop);
    }

    function place(node, x, y) {
      node.style.left = Math.max(150, Math.min(W - 150, x)) + 'px';
      node.style.top = Math.max(34, Math.min(H - 34, y)) + 'px';
    }

    function openForm(x, y) {
      pending = { x: x / W, y: y / H, px: x, py: y };
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

    function hideTip() {
      if (tip) tip.hidden = true;
      tipTimer = null;
    }

    function showTip(i) {
      var w = wishes[i];
      if (!w || !tip) return;
      tip.textContent = w.text;
      place(tip, w.x * W, w.y * H - 14);
      tip.hidden = false;
      clearTimeout(tipTimer);
      tipTimer = setTimeout(hideTip, 3600);
    }

    function hit(x, y) {
      var best = -1, bestD = 20;
      for (var i = 0; i < wishes.length; i++) {
        var dx = wishes[i].x * W - x;
        var dy = wishes[i].y * H - y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    function addWish(text, x, y) {
      wishes.push({ text: text, x: x, y: y });
      saveWishes();
      renderA11y();
      if (hint) hint.classList.add('gone');
    }

    wrap.addEventListener('click', function (e) {
      if (form.contains(e.target)) return;
      var rect = wrap.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var i = hit(x, y);
      if (i >= 0) {
        hideTip();
        showTip(i);
        return;
      }
      hideTip();
      openForm(x, y);
    });

    wrap.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var i = hit(x, y);
      if (i !== hoverI) {
        hoverI = i;
        wrap.style.cursor = i >= 0 ? 'pointer' : 'crosshair';
      }
    });

    wrap.addEventListener('mouseleave', function () { hoverI = -1; });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = (input.value || '').trim();
        if (!text || !pending) { closeForm(); return; }
        addWish(text.slice(0, 40), pending.x, pending.y);
        closeForm();
      });
    }
    var cancel = $('wishCancel');
    if (cancel) cancel.addEventListener('click', function (e) { e.stopPropagation(); closeForm(); });

    var addBtn = $('skyAdd');
    if (addBtn) {
      addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!form.hidden) { closeForm(); return; }
        openForm(W / 2, H / 2);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && form && !form.hidden) closeForm();
    });

    wishes = loadWishes();
    resize();
    renderA11y();
    if (wishes.length && hint) hint.classList.add('gone');
    draw(0);
    if (!reduced) requestAnimationFrame(loop);

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); draw((performance.now() - t0) / 1000); }, 180);
    });
  }

  /* ==========================================================
     七、滚动出现
     ========================================================== */

  function initReveal() {
    var nodes = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduced) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);

    // 兜底：万一观察器没触发，2.5 秒后全部显示
    setTimeout(function () {
      var all = document.querySelectorAll('.reveal');
      for (var k = 0; k < all.length; k++) all[k].classList.add('in');
    }, 2500);
  }

  /* ==========================================================
     八、启动
     ========================================================== */

  function init() {
    fillText();
    buildList();
    bindList();
    renderCounter();
    renderHeroClock();
    initSea();
    initSky();
    initReveal();

    setInterval(function () {
      renderCounter();
      renderHeroClock();
    }, 1000);
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (err) {
    // 出错也不能让页面空着
    var all = document.querySelectorAll('.reveal');
    for (var i = 0; i < all.length; i++) all[i].classList.add('in');
  }
})();
