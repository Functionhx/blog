// 鼠标/视觉动效（7 个）。每个效果可由 localStorage 的 fx:<name> 覆盖（'on'/'off'），默认值见 DEFAULTS。
// 仅在 (hover:hover) 且 prefers-reduced-motion:no-preference 时启用；触屏/减少动效全关。
// 特效开关：右下角常驻齿轮 ⚙️，点开弹面板（/fx/ 是带 demo 的实验室页）。
(function () {
  var DEFAULTS = {
    magnetic: true, tilt: true, spotlight: true,   // 原有：默认开
    ripple: false, shimmer: false, cursor: false, reveal: false // 新增：默认关
  };
  function fxOn(name) {
    var v = localStorage.getItem('fx:' + name);
    if (v === 'on') return true;
    if (v === 'off') return false;
    return !!DEFAULTS[name];
  }

  var ok = window.matchMedia('(hover: hover)').matches &&
           window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!ok) return;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // 1) 磁吸
  function magnetic() {
    var K = 0.3;
    document.querySelectorAll('.menu a, .header-actions button').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * K).toFixed(1) + 'px,' + (y * K).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  // 2) 卡片 3D 倾斜
  function tilt() {
    var MAX = 6;
    document.querySelectorAll('.crit-card, .post-entry, .first-entry, .fx-demo-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var ry = (px - 0.5) * MAX * 2;
        var rx = -(py - 0.5) * MAX * 2;
        card.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // 3) 光标聚光灯
  function spotlight() {
    var o = document.createElement('div');
    o.className = 'cursor-spotlight';
    document.body.appendChild(o);
    var raf = null, mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        o.style.setProperty('--mx', mx + 'px');
        o.style.setProperty('--my', my + 'px');
        raf = null;
      });
    }, { passive: true });
  }

  // 4) 点击涟漪
  function ripple() {
    document.addEventListener('click', function (e) {
      var r = document.createElement('span');
      r.className = 'fx-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
    });
  }

  // 5) 悬停扫光（加 body 类，CSS 在 :hover 时扫光）
  function shimmer() { document.body.classList.add('fx-shimmer-on'); }

  // 6) 自定义光标（圆点 + 慢半拍圆环）
  function cursor() {
    document.body.classList.add('fx-cursor-on');
    var dot = document.createElement('div'); dot.className = 'fx-cursor-dot';
    var ring = document.createElement('div'); ring.className = 'fx-cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    var rx = 0, ry = 0, mx = 0, my = 0, raf = null;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      if (!raf) raf = requestAnimationFrame(function () {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
        raf = null;
      });
    }, { passive: true });
  }

  // 7) 滚动入场
  function reveal() {
    var targets = document.querySelectorAll('.post-entry, .first-entry, .crit-card, .fx-demo-card');
    targets.forEach(function (el) { el.classList.add('fx-reveal'); });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('fx-revealed'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // === 特效开关面板（齿轮弹窗 + /fx/ 共用渲染） ===
  var FX_EFFECTS = [
    ['magnetic', '磁吸'], ['tilt', '卡片 3D 倾斜'], ['spotlight', '光标聚光灯'],
    ['ripple', '点击涟漪'], ['shimmer', '悬停扫光'], ['cursor', '自定义光标'], ['reveal', '滚动入场']
  ];
  function renderFxToggles(container) {
    container.innerHTML = '';
    FX_EFFECTS.forEach(function (e) {
      var name = e[0], label = e[1];
      var row = document.createElement('label'); row.className = 'fx-row';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = fxOn(name);
      cb.addEventListener('change', function () {
        localStorage.setItem('fx:' + name, cb.checked ? 'on' : 'off');
        location.reload();
      });
      row.appendChild(cb); row.appendChild(document.createTextNode(' ' + label));
      container.appendChild(row);
    });
  }
  window.FX_RENDER_TOGGLES = renderFxToggles; // 给 /fx/ 页用

  // 齿轮按钮：右下角常驻，点开弹特效开关面板（全站桌面端都有）
  function initGear() {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'fx-gear'; btn.title = '特效开关'; btn.textContent = '⚙️';
    var pop = document.createElement('div'); pop.className = 'fx-pop';
    pop.innerHTML = '<div class="fx-pop-inner"><p class="fx-note">勾选 = 开，改完自动刷新；全站生效。</p><div class="fx-toggles"></div></div>';
    document.body.appendChild(btn); document.body.appendChild(pop);
    renderFxToggles(pop.querySelector('.fx-toggles'));
    btn.addEventListener('click', function (e) { e.stopPropagation(); pop.classList.toggle('open'); });
    document.addEventListener('click', function (e) {
      if (pop.classList.contains('open') && !pop.contains(e.target) && e.target !== btn) pop.classList.remove('open');
    });
  }

  ready(function () {
    var fns = { magnetic: magnetic, tilt: tilt, spotlight: spotlight, ripple: ripple, shimmer: shimmer, cursor: cursor, reveal: reveal };
    Object.keys(fns).forEach(function (name) {
      if (fxOn(name)) { try { fns[name](); } catch (e) { /* 单个失败不影响其他 */ } }
    });
    try { initGear(); } catch (e) {}
  });
})();
