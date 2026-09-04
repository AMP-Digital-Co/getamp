/* ============================================================
   AMP INVADERS — easter egg game (self-contained)
   Loaded on demand by the #game-egg button in the footer.
   TO REMOVE THE GAME ENTIRELY:
     1. Delete this file
     2. Delete the #game-egg <button> in index.html's footer
     3. Delete the "EASTER EGG: AMP Invaders" block in main.js
     4. Delete the ".footer-game" block in style.css
   Nothing else references it.
   ============================================================ */
(function () {
  "use strict";

  var GRAD_A = "#ff5c2b", GRAD_B = "#ff1470";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var running = false, paused = false, raf = 0;
  var canvas, ctx, hud, hudPct, hint, card, styleEl;
  var targets = [], total = 0, killed = 0;
  var texts = [];                             /* floating score text + streak labels */
  var shots = 0, hits = 0, t0 = 0;            /* end-card stats */
  var combo = 0, comboT = 0;                  /* chain-timing for streak labels */
  /* ship.x is viewport/document x (no horizontal scroll); ship.y is DOCUMENT y —
     the camera (window scroll) follows the ship so flying up/down scrolls the page */
  var ship = { x: 0, y: 0, vx: 0, vy: 0 };
  var lasers = [], parts = [];
  var keys = {}, mouse = { x: 0, y: 0, down: false };
  var lastShot = 0, shake = 0;
  var listeners = [];

  function docH() { return document.documentElement.scrollHeight; }

  /* ---------- targets ---------- */
  var SEL = "h1,h2,h3,h4,p,li,a,button,img,input,textarea,label," +
    ".eyebrow,.service-card,.work-card,.work-row,.process-step,.value-row," +
    ".team-card,.social,.marquee,.amp-toy,.amp-toy__hint,.form,.spark," +
    ".process-line,.footer-cta__kicker,.work-index__label," +
    ".hero__title .ltr,.footer-cta .ltr,.footer__copy";

  function isVisible(el) {
    if (el.checkVisibility) return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    var cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05;
  }
  function isFixed(el) {
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).position === "fixed") return true;
    }
    return false;
  }
  function collectTargets() {
    targets = []; killed = 0;
    var seen = new Set();
    document.querySelectorAll(SEL).forEach(function (el) {
      if (seen.has(el) || el.closest("[data-game-ui]")) return;
      seen.add(el);
      if (!isVisible(el)) return;
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 2) return;
      var f = isFixed(el);
      targets.push({
        el: el, fixed: f, dead: false,
        x: r.left,
        y: r.top + (f ? 0 : scrollY),
        w: r.width, h: r.height, area: r.width * r.height
      });
    });
    targets.sort(function (a, b) { return a.area - b.area; });
    total = targets.length;
  }

  /* ---------- UI ---------- */
  var CSS =
    "body.amp-game, body.amp-game * { cursor: none !important; }" +
    /* the page is scenery now: no hovers, no clicks, no text selection */
    "body.amp-game * { pointer-events: none !important; user-select: none !important; }" +
    /* the end card must out-rank the two rules above (higher specificity) */
    "body.amp-game .amp-game-card, body.amp-game .amp-game-card * {" +
    "  pointer-events: auto !important; cursor: default !important; }" +
    "body.amp-game .amp-game-card button { cursor: pointer !important; }" +
    /* force pending scroll-reveals visible so every element is targetable */
    "body.amp-game .reveal, body.amp-game .reveal-stagger > *," +
    "body.amp-game .footer-cta .ltr, body.amp-game .hero__title .ltr," +
    "body.amp-game .hero .eyebrow, body.amp-game .hero__foot {" +
    "  opacity: 1 !important; transform: none !important; transition: none !important; }" +
    ".amp-game-hud, .amp-game-hint { position: fixed; z-index: 99998;" +
    "  font: 700 11px/1 Inter, sans-serif; letter-spacing: .1em; text-transform: uppercase;" +
    "  color: #fff; background: rgba(10,10,15,.82); border: 1px solid rgba(255,255,255,.16);" +
    "  border-radius: 999px; padding: 11px 18px; backdrop-filter: blur(8px); pointer-events: none; }" +
    ".amp-game-hud { top: 76px; right: 22px; }" +
    ".amp-game-hud b { background: linear-gradient(90deg," + GRAD_A + "," + GRAD_B + ");" +
    "  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }" +
    ".amp-game-hint { bottom: 20px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,.75); white-space: nowrap; }" +
    ".amp-game-hint b { color: #fff; }" +
    ".amp-game-card { position: fixed; inset: 0; z-index: 99999; display: grid; place-items: center;" +
    "  background: rgba(6,6,10,.72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }" +
    ".amp-game-card > div { background: #f5f4f6; color: #101018; border-radius: 24px;" +
    "  border: 1px solid rgba(16,16,24,.08); padding: 56px 60px; text-align: center; max-width: 540px;" +
    "  margin: 20px; font-family: Inter, sans-serif; }" +
    ".amp-game-card .g-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: .22em;" +
    "  text-transform: uppercase; margin-bottom: 16px;" +
    "  background: linear-gradient(90deg," + GRAD_A + "," + GRAD_B + ");" +
    "  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }" +
    ".amp-game-card h2 { font-size: clamp(30px, 4.5vw, 42px); font-weight: 900; letter-spacing: -.04em;" +
    "  line-height: 1.04; margin: 0 0 14px; }" +
    ".amp-game-card h2 span { background: linear-gradient(90deg," + GRAD_A + "," + GRAD_B + ");" +
    "  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }" +
    ".amp-game-card .g-stats { font-size: 11px; font-weight: 800; letter-spacing: .16em;" +
    "  text-transform: uppercase; color: #8a8a94; margin: 2px 0 18px; }" +
    ".amp-game-card p { color: #55555f; font-size: 15.5px; line-height: 1.6; margin: 0 0 30px; }" +
    ".amp-game-card button { font: 700 15px Inter, sans-serif; border-radius: 999px;" +
    "  padding: 15px 28px; margin: 0 6px 8px; cursor: pointer !important;" +
    "  transition: box-shadow .3s, transform .3s; }" +
    ".amp-game-card .g-rebuild { color: #fff; border: 0;" +
    "  background: linear-gradient(90deg," + GRAD_A + "," + GRAD_B + ");" +
    "  box-shadow: 0 8px 32px rgba(255,40,90,.35); }" +
    ".amp-game-card .g-rebuild:hover { box-shadow: 0 14px 48px rgba(255,40,90,.55); transform: translateY(-2px); }" +
    ".amp-game-card .g-resume { background: transparent; border: 1px solid rgba(16,16,24,.22); color: #101018; }" +
    ".amp-game-card .g-resume:hover { border-color: rgba(16,16,24,.5); transform: translateY(-2px); }";

  function buildUI() {
    styleEl = document.createElement("style");
    styleEl.setAttribute("data-game-ui", "");
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    canvas = document.createElement("canvas");
    canvas.setAttribute("data-game-ui", "");
    canvas.style.cssText = "position:fixed;inset:0;z-index:99997;pointer-events:none;";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    sizeCanvas();

    hud = document.createElement("div");
    hud.className = "amp-game-hud";
    hud.setAttribute("data-game-ui", "");
    hud.innerHTML = 'SITE DESTROYED: <b>0%</b> &nbsp;&middot;&nbsp; ESC to stop';
    hudPct = hud.querySelector("b");
    document.body.appendChild(hud);

    hint = document.createElement("div");
    hint.className = "amp-game-hint";
    hint.setAttribute("data-game-ui", "");
    hint.innerHTML = "<b>WASD / arrows</b> fly &nbsp;&middot;&nbsp; <b>click / space</b> shoot &nbsp;&middot;&nbsp; <b>esc</b> stop";
    document.body.appendChild(hint);

    document.body.classList.add("amp-game");
  }
  function sizeCanvas() {
    var dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function updateHUD() {
    hudPct.textContent = Math.round((killed / total) * 100) + "%";
  }

  function statsLine() {
    var s = Math.round((performance.now() - t0) / 1000);
    var time = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
    var acc = shots ? Math.round(hits / shots * 100) : 0;
    return "Time " + time + " &nbsp;&middot;&nbsp; Shots " + shots + " &nbsp;&middot;&nbsp; Accuracy " + acc + "%";
  }
  function showCard(win) {
    paused = true;
    card = document.createElement("div");
    card.className = "amp-game-card";
    card.setAttribute("data-game-ui", "");
    var pct = Math.round((killed / total) * 100);
    card.innerHTML = "<div>" +
      "<div class='g-eyebrow'>Game over &mdash; " + pct + "% destroyed</div>" +
      "<h2>" + (win ? "You <span>destroyed</span> our website." : "Nice <span>shooting.</span>") + "</h2>" +
      "<div class='g-stats'>" + statsLine() + "</div>" +
      "<p>Breaking things is easy. Building them is what we do.</p>" +
      "<button class='g-rebuild'>Rebuild the site &rarr;</button>" +
      (win ? "" : "<button class='g-resume'>Keep destroying</button>") +
      "</div>";
    document.body.appendChild(card);
    card.querySelector(".g-rebuild").addEventListener("click", function () { restore(); stop(); });
    var res = card.querySelector(".g-resume");
    if (res) res.addEventListener("click", hideCard);
  }
  function hideCard() {
    if (card) { card.remove(); card = null; }
    paused = false;
  }

  /* ---------- destruction ---------- */
  function kill(t) {
    t.dead = true; killed++;
    t.el.style.visibility = "hidden";
    for (var i = 0; i < targets.length; i++) {
      var o = targets[i];
      if (!o.dead && t.el.contains(o.el)) { o.dead = true; killed++; }
    }
    var cx = t.x + t.w / 2;
    var cy = t.y + (t.fixed ? scrollY : 0) + t.h / 2; // doc coords
    /* floating points — bigger elements are worth more */
    var pts = t.area > 60000 ? 50 : t.area > 8000 ? 25 : 10;
    texts.push({ str: "+" + pts, x: cx, y: cy, vy: -1.3, life: 1, size: 16, grad: false });

    /* streak labels for quick chains */
    var nowK = performance.now();
    combo = (nowK - comboT < 1600) ? combo + 1 : 1;
    comboT = nowK;
    var label = combo === 4 ? "COMBO ×4" : combo === 7 ? "ON FIRE" :
                combo === 11 ? "UNSTOPPABLE" : combo === 16 ? "AMPLIFIED" : null;
    if (label) texts.push({ str: label, x: cx, y: cy - 34, vy: -0.9, life: 1.3, size: 30, grad: true });

    var n = Math.max(8, Math.min(36, Math.round(Math.sqrt(t.area) / 4)));
    if (reduced) n = Math.min(n, 10);
    for (var j = 0; j < n; j++) {
      var a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
      parts.push({
        x: cx + (Math.random() - 0.5) * t.w * 0.6,
        y: cy + (Math.random() - 0.5) * t.h * 0.6,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5,
        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.3,
        size: 3 + Math.random() * 7, life: 1, decay: 0.022, grav: 0.22,
        c: Math.random() < 0.18 ? "#ffffff" : lerpColor(Math.random())
      });
    }
    if (!reduced) shake = 7;
    updateHUD();
    if (killed >= total) { setTimeout(function () { if (running) showCard(true); }, 500); }
  }
  function restore() {
    targets.forEach(function (t) { t.el.style.visibility = ""; });
  }
  function lerpColor(t) {
    var a = [255, 92, 43], b = [255, 20, 112];
    return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")";
  }

  /* ---------- game loop ---------- */
  function thrusting() {
    return keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight ||
           keys.w || keys.a || keys.s || keys.d;
  }
  function aimAngle() {
    return Math.atan2((mouse.y + scrollY) - ship.y, mouse.x - ship.x);
  }

  function update() {
    var acc = 0.85, fr = 0.88;
    if (keys.ArrowLeft || keys.a) ship.vx -= acc;
    if (keys.ArrowRight || keys.d) ship.vx += acc;
    if (keys.ArrowUp || keys.w) ship.vy -= acc;
    if (keys.ArrowDown || keys.s) ship.vy += acc;
    ship.vx *= fr; ship.vy *= fr;
    ship.x = Math.max(24, Math.min(innerWidth - 24, ship.x + ship.vx));
    ship.y = Math.max(40, Math.min(docH() - 40, ship.y + ship.vy));

    /* camera follows the ship: keep it inside a vertical dead zone */
    var pad = 190, vy = ship.y - scrollY;
    if (vy < pad) window.scrollTo({ top: Math.max(0, ship.y - pad), behavior: "instant" });
    else if (vy > innerHeight - pad) window.scrollTo({ top: ship.y - (innerHeight - pad), behavior: "instant" });

    /* engine trail */
    if (thrusting() && !reduced && Math.random() < 0.9) {
      var ta = aimAngle();
      parts.push({
        x: ship.x - Math.cos(ta) * 16 + (Math.random() - 0.5) * 6,
        y: ship.y - Math.sin(ta) * 16 + (Math.random() - 0.5) * 6,
        vx: -Math.cos(ta) * 1.5 - ship.vx * 0.1, vy: -Math.sin(ta) * 1.5 - ship.vy * 0.1,
        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.4,
        size: 1.5 + Math.random() * 2.5, life: 0.7, decay: 0.06, grav: 0,
        c: Math.random() < 0.5 ? GRAD_A : GRAD_B
      });
    }

    var now = performance.now();
    if ((mouse.down || keys[" "]) && now - lastShot > 130) {
      lastShot = now;
      var ang = aimAngle();
      shots++;
      lasers.push({
        x: ship.x + Math.cos(ang) * 20,
        y: ship.y + Math.sin(ang) * 20,
        vx: Math.cos(ang) * 22, vy: Math.sin(ang) * 22, life: 70
      });
    }

    for (var i = lasers.length - 1; i >= 0; i--) {
      var L = lasers[i], hit = false;
      for (var s = 1; s <= 3 && !hit; s++) {
        var px = L.x + L.vx * s / 3, py = L.y + L.vy * s / 3;
        for (var k = 0; k < targets.length; k++) {
          var t = targets[k];
          if (t.dead) continue;
          var ty = py - (t.fixed ? scrollY : 0);
          if (px >= t.x && px <= t.x + t.w && ty >= t.y && ty <= t.y + t.h) {
            kill(t); hits++; hit = true; break;
          }
        }
      }
      L.x += L.vx; L.y += L.vy; L.life--;
      if (hit || L.life <= 0) lasers.splice(i, 1);
    }

    for (var j = parts.length - 1; j >= 0; j--) {
      var P = parts[j];
      P.x += P.vx; P.y += P.vy; P.vy += P.grav; P.rot += P.vr; P.life -= P.decay;
      if (P.life <= 0) parts.splice(j, 1);
    }
    for (var q = texts.length - 1; q >= 0; q--) {
      var T = texts[q];
      T.y += T.vy; T.vy *= 0.97; T.life -= 0.022;
      if (T.life <= 0) texts.splice(q, 1);
    }
    if (shake > 0) shake *= 0.82;
  }

  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.save();
    if (shake > 0.5) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    // lasers
    lasers.forEach(function (L) {
      var x = L.x, y = L.y - scrollY;
      var g = ctx.createLinearGradient(x - L.vx * 1.4, y - L.vy * 1.4, x, y);
      g.addColorStop(0, GRAD_A); g.addColorStop(1, GRAD_B);
      ctx.strokeStyle = g; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.shadowColor = GRAD_B; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.moveTo(x - L.vx * 1.4, y - L.vy * 1.4); ctx.lineTo(x, y); ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // particles (debris + engine trail)
    parts.forEach(function (P) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, P.life);
      ctx.translate(P.x, P.y - scrollY); ctx.rotate(P.rot);
      ctx.fillStyle = P.c;
      ctx.beginPath();
      ctx.moveTo(0, -P.size); ctx.lineTo(P.size * 0.9, P.size * 0.7); ctx.lineTo(-P.size * 0.9, P.size * 0.7);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // ---- ship: the AMP "A" — notched gradient delta with rim light + glow ----
    var sx = ship.x, sy = ship.y - scrollY;
    var ang = aimAngle();
    var bank = Math.max(-0.35, Math.min(0.35, ship.vx * 0.03)); // subtle banking
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang + Math.PI / 2 + bank);

    // flame: three wobbling layers — big gradient tongue, pink mid, white-hot core
    if (thrusting() && Math.random() > 0.15) {
      var fl = 32 + Math.random() * 16;
      var wob = (Math.random() - 0.5) * 7;
      var fg = ctx.createLinearGradient(0, 14, 0, fl);
      fg.addColorStop(0, GRAD_A); fg.addColorStop(0.6, GRAD_B); fg.addColorStop(1, "rgba(255,20,112,0)");
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(-8, 14); ctx.quadraticCurveTo(wob * 0.5, fl * 0.6, wob, fl); ctx.quadraticCurveTo(wob * 0.5, fl * 0.6, 8, 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,20,112,.85)";
      ctx.beginPath(); ctx.moveTo(-4.5, 14); ctx.lineTo(wob * 0.6, 14 + (fl - 14) * 0.62); ctx.lineTo(4.5, 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.beginPath(); ctx.moveTo(-2.2, 14); ctx.lineTo(wob * 0.3, 14 + (fl - 14) * 0.34); ctx.lineTo(2.2, 14); ctx.closePath(); ctx.fill();
    }

    // body: clean AMP triangle, gradient fill + white rim
    ctx.shadowColor = "rgba(255,20,112,.45)";
    ctx.shadowBlur = 12;
    var sg = ctx.createLinearGradient(-15, 0, 15, 0);
    sg.addColorStop(0, GRAD_A); sg.addColorStop(1, GRAD_B);
    ctx.fillStyle = sg;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, -19); ctx.lineTo(15, 14); ctx.lineTo(-15, 14); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // floating score text + streak labels
    texts.forEach(function (T) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, T.life));
      ctx.font = "900 " + T.size + "px Inter, sans-serif";
      ctx.textAlign = "center";
      var ty = T.y - scrollY;
      if (T.grad) {
        var w2 = ctx.measureText(T.str).width / 2;
        var tg = ctx.createLinearGradient(T.x - w2, ty, T.x + w2, ty);
        tg.addColorStop(0, GRAD_A); tg.addColorStop(1, GRAD_B);
        ctx.fillStyle = tg;
        ctx.shadowColor = "rgba(255,20,112,.5)"; ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = "rgba(255,255,255,.95)";
      }
      ctx.fillText(T.str, T.x, ty);
      ctx.restore();
    });

    // crosshair
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = GRAD_B;
    ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 2.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  function loop() {
    if (!running) return;
    if (!paused) update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  /* ---------- events ---------- */
  function on(tgt, ev, fn, opts) { tgt.addEventListener(ev, fn, opts); listeners.push([tgt, ev, fn, opts]); }
  function bind() {
    on(window, "keydown", function (e) {
      if (e.key === "Escape") { if (card) { hideCard(); } else { showCard(false); } return; }
      keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true;
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) > -1) e.preventDefault();
    });
    on(window, "keyup", function (e) { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
    on(window, "mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    on(window, "mousedown", function (e) { if (!e.target.closest("[data-game-ui]")) mouse.down = true; });
    on(window, "mouseup", function () { mouse.down = false; });
    on(window, "click", function (e) {
      if (!e.target.closest("[data-game-ui]")) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    on(window, "resize", sizeCanvas);
  }

  /* ---------- lifecycle ---------- */
  function start() {
    if (running) return;
    running = true; paused = false;
    lasers = []; parts = []; texts = []; keys = {}; mouse.down = false;
    shots = 0; hits = 0; combo = 0; t0 = performance.now();
    buildUI();          /* inject CSS first so pending reveals are forced visible… */
    collectTargets();   /* …then scan, so nothing is skipped as "invisible" */
    bind();
    ship.x = innerWidth / 2; ship.y = scrollY + innerHeight * 0.6; ship.vx = ship.vy = 0;
    mouse.x = innerWidth / 2; mouse.y = innerHeight * 0.3;
    loop();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    listeners = [];
    if (card) card.remove(); card = null;
    canvas.remove(); hud.remove(); hint.remove(); styleEl.remove();
    document.body.classList.remove("amp-game");
  }

  window.AMPInvaders = { start: start };
})();
