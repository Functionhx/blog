// 鼠标动效：光标尾迹 ✨/❤️ · 磁吸+悬停 · 卡片 3D 倾斜 · 光标聚光灯
// 全部仅在「不影响无障碍与性能」时启用：需要 (hover:hover) 且用户未开启「减少动效」。
(function () {
  var ok = window.matchMedia('(hover: hover)').matches &&
           window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!ok) return;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // 1) 光标尾迹：mousemove 节流生成粒子，CSS 淡出+上飘+旋转，animationend 自清理
  function trail() {
    var CHARS = ['✨', '❤️'];
    var last = 0;
    window.addEventListener('pointermove', function (e) {
      var now = (window.performance && performance.now) ? performance.now() : Date.now();
      if (now - last < 35) return; // ~28 次/秒
      last = now;
      var s = document.createElement('span');
      s.className = 'cursor-trail';
      s.textContent = CHARS[(Math.random() * CHARS.length) | 0];
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      document.body.appendChild(s);
      s.addEventListener('animationend', function () { s.remove(); });
    }, { passive: true });
  }

  // 2) 磁吸：导航/按钮靠近时朝鼠标轻移几 px
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

  // 3) 卡片 3D 倾斜：随鼠标位置 rotateX/Y，离开复位
  function tilt() {
    var MAX = 6; // 最大度数
    document.querySelectorAll('.crit-card, .post-entry, .first-entry').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1
        var py = (e.clientY - r.top) / r.height;
        var ry = (px - 0.5) * MAX * 2;
        var rx = -(py - 0.5) * MAX * 2;
        card.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // 4) 光标聚光灯：rAF 更新 --mx/--my，CSS 径向渐变跟随
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

  ready(function () {
    [trail, magnetic, tilt, spotlight].forEach(function (fn) {
      try { fn(); } catch (e) { /* 单个失败不影响其他 */ }
    });
  });
})();
