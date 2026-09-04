/* ============================================================
   AMP Digital — main.js
   Nav, mobile menu, reveals, magnetic buttons, spotlights,
   scroll progress, footer letters, contact form
   ============================================================ */
(function () {
  "use strict";

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero entrance trigger ---------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("loaded");
    });
  });

  /* ---------- Sticky nav ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScrollNav = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
  }

  /* ---------- Scroll progress bar ---------- */
  var progress = document.createElement("div");
  progress.className = "progress";
  document.body.appendChild(progress);
  var onScrollProg = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + "%";
    progress.style.opacity = pct > 0.4 ? "1" : "0";
  };
  window.addEventListener("scroll", onScrollProg, { passive: true });
  onScrollProg();

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".nav__burger");
  var menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    var closeMenu = function () {
      menu.classList.remove("is-open");
      burger.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    var menuClose = menu.querySelector(".mobile-menu__close");
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
    });

    /* Easter egg: tap the triangle — it spins and pops mini triangles */
    var mark = menu.querySelector(".mobile-menu__mark");
    if (mark) {
      var markSpan = mark.querySelector("span");
      var spins = 0;
      mark.addEventListener("click", function () {
        spins += 1;
        markSpan.style.transform = "rotate(" + spins * 360 + "deg)";
        for (var i = 0; i < 6; i++) {
          var tri = document.createElement("span");
          tri.className = "tri-pop";
          tri.textContent = "▲";
          tri.style.setProperty("--dx", (Math.random() * 160 - 80).toFixed(0) + "px");
          tri.style.setProperty("--dy", (-40 - Math.random() * 110).toFixed(0) + "px");
          tri.style.setProperty("--dr", (Math.random() * 360 - 180).toFixed(0) + "deg");
          tri.style.animationDelay = (Math.random() * 0.12).toFixed(2) + "s";
          mark.appendChild(tri);
          setTimeout(function (el) { el.remove(); }.bind(null, tri), 1100);
        }
      });
    }
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger, .process, .footer-cta");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
            // Once the entrance finishes, strip the stagger machinery so its
            // transition-delays can't pollute hover animations on children.
            if (e.target.classList.contains("reveal-stagger")) {
              (function (el) {
                setTimeout(function () {
                  el.classList.remove("reveal-stagger", "in");
                }, 1600);
              })(e.target);
            }
            // Same for the footer letters: drop the wave-in delays once
            // the wave lands so per-letter hovers respond instantly.
            if (e.target.classList.contains("footer-cta")) {
              (function (el) {
                setTimeout(function () {
                  el.classList.add("done");
                }, 1400);
              })(e.target);
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduced) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.22;
        var dy = (e.clientY - r.top - r.height / 2) * 0.38;
        btn.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Spotlight cards (mouse-tracking highlight) ---------- */
  if (fine) {
    document.querySelectorAll("[data-spot]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Marquee: drifts on its own, hustles when you scroll ---------- */
  var track = document.querySelector(".marquee__track");
  if (track && !reduced) {
    track.style.animation = "none";
    var mPos = 0, mBoost = 0, mHalf = 0, mLastY = window.scrollY, mHover = false;
    var mMeasure = function () {
      /* measure the true loop period at sub-pixel precision (scrollWidth
         rounds to integers, and that rounding error shows as a wrap jump) */
      var items = track.querySelectorAll(".marquee__item");
      mHalf = items.length > 1
        ? items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left
        : track.scrollWidth / 2;
    };
    mMeasure();
    window.addEventListener("resize", mMeasure);
    window.addEventListener("load", mMeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mMeasure);
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      mBoost = Math.min(mBoost + Math.abs(y - mLastY) * 0.05, 18);
      mLastY = y;
    }, { passive: true });
    /* stadium wave: split every phrase into characters, then a smooth
       sine swell ripples outward from the click point in both directions */
    track.querySelectorAll(".mq").forEach(function (mq) {
      var txt = mq.textContent;
      mq.textContent = "";
      for (var ci = 0; ci < txt.length; ci++) {
        if (txt.charAt(ci) === " ") { mq.appendChild(document.createTextNode(" ")); continue; }
        var ch = document.createElement("span");
        ch.className = "mchar";
        ch.textContent = txt.charAt(ci);
        mq.appendChild(ch);
      }
    });
    /* paint one word-spanning gradient across each phrase's characters:
       every char gets the full gradient, sized to the word and offset to
       its own position, so hover reveals a continuous sweep */
    var mPaintChars = function () {
      track.querySelectorAll(".mq").forEach(function (mq) {
        var w = mq.offsetWidth;
        var base = mq.offsetLeft; /* chars share mq's offsetParent — make offsets word-relative */
        mq.querySelectorAll(".mchar").forEach(function (ch) {
          ch.style.background = "var(--grad)";
          ch.style.backgroundSize = w + "px 100%";
          ch.style.backgroundPosition = (base - ch.offsetLeft) + "px 0";
          ch.style.webkitBackgroundClip = "text";
          ch.style.backgroundClip = "text";
        });
      });
    };
    mPaintChars();
    window.addEventListener("resize", mPaintChars);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mPaintChars);
    /* JS-driven spark spin: velocity eases toward its target, so hovering a
       neighboring word spools the spark up (and back down) with no snap.
       The click-wave lifts sparks via composite:add, riding on this spin. */
    var mEls = [].slice.call(track.querySelectorAll(".mq, .spark"));
    var mSparks = [];
    mEls.forEach(function (el, i) {
      if (!el.classList.contains("spark")) return;
      el.style.animation = "none";
      mSparks.push({ el: el, ang: Math.random() * 360, vel: 1, prev: mEls[i - 1] || null, next: mEls[i + 1] || null });
    });
    var mHot = null;
    track.parentNode.addEventListener("mouseover", function (e) {
      mHot = e.target.closest ? e.target.closest(".mq") : null;
    });
    track.parentNode.addEventListener("mouseleave", function () { mHot = null; });
    track.parentNode.addEventListener("click", function (e) {
      track.querySelectorAll(".mchar, .spark").forEach(function (sp) {
        var r = sp.getBoundingClientRect();
        if (!r.width) return;
        var d = Math.abs(r.left + r.width / 2 - e.clientX);
        var amp = Math.max(5, 17 - d * 0.009);   /* the swell attenuates as it travels */
        sp.animate(
          [
            { transform: "translateY(0)", easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
            { transform: "translateY(" + (-amp).toFixed(1) + "px)", offset: 0.5, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
            { transform: "translateY(0)" }
          ],
          { duration: 640, delay: d * 0.9, composite: "add" }
        );
      });
    });
    track.parentNode.addEventListener("mouseenter", function () { mHover = true; });
    track.parentNode.addEventListener("mouseleave", function () { mHover = false; });
    var mVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { mVisible = es[0].isIntersecting; })
        .observe(track.parentNode);
    }
    (function mStep() {
      if (!mVisible) { requestAnimationFrame(mStep); return; }
      var base = 1.15; // constant px/frame — track length never changes the pace
      var mult = document.body.classList.contains("surge") ? 6 : 1;
      var speed = ((mHover ? base * 0.15 : base) + mBoost * 0.06) * mult;
      mBoost *= 0.92; // ease back to cruising speed
      mPos += speed;
      if (mHalf > 0 && mPos >= mHalf) mPos -= mHalf;
      track.style.transform = "translate3d(" + -mPos + "px,0,0)";
      for (var si = 0; si < mSparks.length; si++) {
        var S = mSparks[si];
        var tgt = mult > 1 ? 14 : (mHot && (S.prev === mHot || S.next === mHot)) ? 11 : 1;
        S.vel += (tgt - S.vel) * 0.09;
        S.ang = (S.ang + S.vel) % 360;
        S.el.style.transform = "rotate(" + S.ang.toFixed(2) + "deg)";
      }
      requestAnimationFrame(mStep);
    })();
  }

  /* ---------- Service cards: click for a full spin (pattern on the back) ---------- */
  if (!reduced) {
    document.querySelectorAll(".service-card").forEach(function (card) {
      var inner = card.querySelector(".service-card__inner");
      if (!inner) return;
      card.addEventListener("click", function () {
        if (card.classList.contains("service-card--spinning")) return;
        card.classList.add("service-card--spinning");
      });
      inner.addEventListener("animationend", function (e) {
        if (e.animationName === "card-spin") {
          card.classList.remove("service-card--spinning");
        }
      });
    });
  }

  /* ---------- Service icon draw animation (normalize path lengths) ---------- */
  document.querySelectorAll(".service-card__icon svg *").forEach(function (el) {
    el.setAttribute("pathLength", "100");
  });

  /* ---------- Letter waves (assign stagger indices per container) ---------- */
  [".footer-cta", ".hero__title"].forEach(function (sel) {
    document.querySelectorAll(sel + " .ltr").forEach(function (ltr, i) {
      ltr.style.setProperty("--i", i);
    });
  });
  /* strip the hero wave-in delays once it lands so hovers are crisp */
  if (document.querySelector(".hero__title .ltr")) {
    setTimeout(function () {
      document.body.classList.add("hero-settled");
    }, 1700);
  }

  /* ---------- Team bio modal ---------- */
  var modal = document.querySelector(".bio-modal");
  if (modal) {
    var mMedia = modal.querySelector(".bio-modal__media");
    var mName = modal.querySelector(".bio-modal__name");
    var mRole = modal.querySelector(".bio-modal__role");
    var mBio = modal.querySelector(".bio-modal__bio");
    var mClose = modal.querySelector(".bio-modal__close");
    var lastFocus = null;

    var allCards = Array.prototype.slice.call(document.querySelectorAll(".team-card[data-bio]"));
    var currentIdx = 0;
    var openModal = function (card) {
      currentIdx = allCards.indexOf(card);
      lastFocus = card;
      mName.textContent = card.querySelector(".team-card__name").textContent;
      var roleMain = card.querySelector(".team-card__role .role-main");
      mRole.textContent = roleMain
        ? roleMain.textContent
        : card.querySelector(".team-card__role").textContent;
      mBio.textContent = card.getAttribute("data-bio") || "[Bio to come.]";
      mMedia.innerHTML = "";
      var avatar = card.querySelector(".team-card__avatar");
      if (avatar) mMedia.appendChild(avatar.cloneNode(true));
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      mClose.focus();
    };
    var closeModal = function () {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll(".team-card[data-bio]").forEach(function (card) {
      card.addEventListener("click", function () { openModal(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });
    mClose.addEventListener("click", closeModal);
    modal.querySelector(".bio-modal__backdrop").addEventListener("click", closeModal);

    /* flip through teammates without closing */
    var stepModal = function (dir) {
      var n = allCards.length;
      openModal(allCards[(currentIdx + dir + n) % n]);
    };
    var mPrev = modal.querySelector(".bio-modal__prev");
    var mNext = modal.querySelector(".bio-modal__next");
    if (mPrev) mPrev.addEventListener("click", function () { stepModal(-1); });
    if (mNext) mNext.addEventListener("click", function () { stepModal(1); });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") stepModal(-1);
      if (e.key === "ArrowRight") stepModal(1);
    });
  }

  /* ---------- Contact form (Netlify Forms, AJAX) ---------- */
  var form = document.querySelector(".form");
  if (form) {
    var status = form.querySelector(".form__status");
    var btn = form.querySelector('button[type="submit"]');
    var say = function (msg) {
      if (!status) return;
      status.textContent = msg;
      status.classList.add("is-visible");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (btn) { btn.disabled = true; }
      say("Sending\u2026");
      fetch(form.getAttribute("action") || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          say("Thanks \u2014 we got it. We\u2019ll be in touch soon.");
        })
        .catch(function () {
          say("Something went wrong. Email us at hello@getampdigital.com instead.");
        })
        .then(function () { if (btn) { btn.disabled = false; } });
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Power surge: type "amp" → full rainbow takeover ---------- */
  var surging = false;
  var surge = function () {
    if (surging || reduced) return;
    surging = true;
    document.body.classList.add("surge");
    setTimeout(function () {
      document.body.classList.remove("surge");
      surging = false;
    }, 4000);
  };

  /* type a-m-p anywhere (outside form fields) */
  var typed = "";
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (!/^[a-z]$/i.test(e.key)) { typed = ""; return; }
    typed = (typed + e.key.toLowerCase()).slice(-3);
    if (typed === "amp") { typed = ""; surge(); }
  });

  /* ---------- Case study ambient videos: silent loops that play while
     on screen and pause off screen (reduced-motion gets controls instead) ---------- */
  var ambientVids = document.querySelectorAll("video.cs-ambient");
  if (ambientVids.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      ambientVids.forEach(function (v) { v.setAttribute("controls", ""); });
    } else {
      var vObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.play().catch(function () { en.target.setAttribute("controls", ""); });
          } else {
            en.target.pause();
          }
        });
      }, { threshold: 0.25 });
      ambientVids.forEach(function (v) { vObs.observe(v); });
    }
  }

  /* ---------- Case study chips: strip the wake-up stagger once it lands
     so individual chip hovers respond instantly ---------- */
  document.querySelectorAll(".cs-hero__meta").forEach(function (meta) {
    var settleT;
    meta.addEventListener("mouseenter", function () {
      settleT = setTimeout(function () { meta.classList.add("settled"); }, 500);
    });
    meta.addEventListener("mouseleave", function () {
      clearTimeout(settleT);
      meta.classList.remove("settled");
    });
  });

  /* ---------- The pets card: auto-rotating headshots; click = pet them
     (little gradient hearts) and advance to the next pet ---------- */
  var petCard = document.querySelector(".team-card--pets");
  if (petCard) {
    var shots = [].slice.call(petCard.querySelectorAll(".pet-shot"));
    var petIdx = 0, petTimer;
    var showPet = function (n) {
      var next = (n + shots.length) % shots.length;
      if (next === petIdx) return;
      var cur = shots[petIdx];
      cur.classList.remove("is-active");
      cur.classList.add("is-leaving");
      setTimeout(function () {
        /* snap the departed shot back to the right, invisibly */
        cur.style.transition = "none";
        cur.classList.remove("is-leaving");
        void cur.offsetWidth;
        cur.style.transition = "";
      }, 600);
      shots[next].classList.add("is-active");
      petIdx = next;
    };
    var petRotate = function () { showPet(petIdx + 1); };
    if (!reduced) petTimer = setInterval(function () {
      if (!document.hidden) petRotate();
    }, 5500);
    petCard.addEventListener("click", function (e) {
      /* advance on click and reset the clock so it doesn't double-swap */
      if (petTimer) { clearInterval(petTimer); petTimer = setInterval(function () { if (!document.hidden) petRotate(); }, 5500); }
      petRotate();
      if (reduced) return;
      var r = petCard.getBoundingClientRect();
      for (var i = 0; i < 4; i++) {
        var h = document.createElement("span");
        h.className = "pet-heart";
        h.setAttribute("aria-hidden", "true");
        h.textContent = "\u2764";
        h.style.left = (e.clientX - r.left + (Math.random() * 24 - 12)) + "px";
        h.style.top = (e.clientY - r.top + (Math.random() * 12 - 6)) + "px";
        h.style.setProperty("--dx", (Math.random() * 70 - 35).toFixed(0) + "px");
        h.style.setProperty("--dy", (-50 - Math.random() * 60).toFixed(0) + "px");
        h.style.setProperty("--dr", (Math.random() * 50 - 25).toFixed(0) + "deg");
        h.style.animationDelay = (Math.random() * 0.12).toFixed(2) + "s";
        petCard.appendChild(h);
        setTimeout(function (el) { el.remove(); }.bind(null, h), 1100);
      }
    });
  }

  /* ---------- Hero letters: click for a quick off-kilter spin;
     the A-M-P letters pop a little gradient triangle burst ---------- */
  if (!reduced && "animate" in document.body) {
    document.querySelectorAll(".hero__title .ltr").forEach(function (ltr) {
      ltr.addEventListener("click", function () {
        if (ltr.dataset.spinning) return;
        ltr.dataset.spinning = "1";
        var isAmp = ltr.classList.contains("ltr--amp");
        /* launches at full speed the instant you click, then glides to rest.
           Plain letters flip horizontally; A-M-P flip vertically. Same physics. */
        var spin = ltr.animate(
          isAmp
            ? [
                { transform: "perspective(600px) rotateX(0deg)" },
                { transform: "perspective(600px) rotateX(360deg)" }
              ]
            : [
                { transform: "perspective(600px) rotateY(0deg)" },
                { transform: "perspective(600px) rotateY(360deg)" }
              ],
          { duration: 640, easing: "cubic-bezier(0.18, 0.7, 0.25, 1)", composite: "add" }
        );
        spin.onfinish = function () { delete ltr.dataset.spinning; };
      });
    });
  }

  /* ---------- How We Work: click a step and it tumbles out the bottom of
     the section, then drops back in straight out of the gradient line.
     Animations use composite:"add" so they stack on top of the live hover
     transforms — no snap when you're still hovering after the landing. ---------- */
  var pSteps = [].slice.call(document.querySelectorAll(".process-step"));
  var pGrid = document.querySelector(".process-grid");
  var pLine = document.querySelector(".process-line");
  var pSec = document.querySelector("#process");
  if (pSteps.length && pGrid && pLine && pSec && !reduced && "animate" in document.body) {
    var dropsActive = 0;
    pSteps.forEach(function (step) {
      step.addEventListener("click", function () {
        if (step.dataset.dropping) return;
        step.dataset.dropping = "1";
        dropsActive++;
        pGrid.classList.add("process-grid--dropping");
        var parts = [step.querySelector(".process-step__num"), step.querySelector("h3"), step.querySelector("p")]
          .filter(Boolean);
        var secRect = pSec.getBoundingClientRect();
        var lineRect = pLine.getBoundingClientRect();
        var done = 0;
        parts.forEach(function (el, i) {
          var r = el.getBoundingClientRect();
          var fallDist = secRect.bottom - r.top + 30;    /* fully past the section's bottom edge */
          var riseDist = r.bottom - lineRect.bottom;     /* re-entry begins right inside the line */
          var tilt = (7 + Math.random() * 9) * (Math.random() < 0.5 ? -1 : 1);
          var drift = (Math.random() * 36 - 18);
          var skew = (Math.random() * 10 - 5).toFixed(1);
          setTimeout(function () {
            /* fall: breaks loose with a little tip, then plummets, tumbling */
            var fall = el.animate(
              [
                { transform: "translate(0, 0) rotate(0deg)", easing: "cubic-bezier(0.6, -0.15, 0.8, 0.5)" },
                { transform: "translate(" + (drift * 0.3).toFixed(1) + "px, 16px) rotate(" + (tilt * 0.45).toFixed(1) + "deg)", offset: 0.24, easing: "cubic-bezier(0.5, 0, 1, 0.4)" },
                { transform: "translate(" + drift.toFixed(1) + "px, " + fallDist.toFixed(0) + "px) rotate(" + (tilt * 1.4).toFixed(1) + "deg) skewX(" + skew + "deg)" }
              ],
              { duration: 640, fill: "forwards", composite: "add" }
            );
            fall.onfinish = function () {
              setTimeout(function () {
                fall.cancel();
                /* land: drops out of the line askew, overshoots, corrects, settles */
                var land = el.animate(
                  [
                    { transform: "translate(" + (-drift * 0.6).toFixed(1) + "px, " + (-riseDist).toFixed(0) + "px) rotate(" + (-tilt * 0.8).toFixed(1) + "deg)", easing: "cubic-bezier(0.45, 0, 0.7, 0.4)" },
                    { transform: "translate(2px, 5px) rotate(" + (tilt * 0.22).toFixed(1) + "deg)", offset: 0.68, easing: "cubic-bezier(0.25, 1, 0.4, 1)" },
                    { transform: "translate(-1px, -2px) rotate(" + (-tilt * 0.08).toFixed(1) + "deg)", offset: 0.86, easing: "ease-out" },
                    { transform: "translate(0, 0) rotate(0deg)" }
                  ],
                  { duration: 760, composite: "add" }
                );
                land.onfinish = function () {
                  done++;
                  if (done === parts.length) {
                    delete step.dataset.dropping;
                    dropsActive--;
                    if (dropsActive === 0) pGrid.classList.remove("process-grid--dropping");
                  }
                };
              }, 170);
            };
          }, i * 150);
        });
      });
    });
  }

  /* ---------- VALUE STAMP: click a value row to stamp it — the fifth
     stamp sends the whole flock flying and resets the row. (remove this
     block + the "VALUE STAMP" CSS block to undo) ---------- */
  document.querySelectorAll(".value-row").forEach(function (row) {
    row.addEventListener("click", function () {
      var h = row.querySelector("h3");
      if (!h || row.dataset.flying) return;
      var s = document.createElement("span");
      s.className = "value-stamp";
      s.setAttribute("aria-hidden", "true");
      s.textContent = "\u25B2";
      s.style.setProperty("--r", (Math.random() * 24 - 12).toFixed(1) + "deg");
      h.appendChild(s);
      var stamps = h.querySelectorAll(".value-stamp");
      if (stamps.length >= 5) {
        row.dataset.flying = "1";
        row.classList.add("value-cheer");
        stamps.forEach(function (st, i) {
          st.style.setProperty("--dx", (Math.random() * 140 - 70).toFixed(0) + "px");
          st.style.setProperty("--dy", (-70 - Math.random() * 90).toFixed(0) + "px");
          st.style.setProperty("--dr", (Math.random() * 320 - 160).toFixed(0) + "deg");
          setTimeout(function () { st.classList.add("value-stamp--fly"); }, i * 45);
        });
        setTimeout(function () {
          stamps.forEach(function (st) { st.remove(); });
          row.classList.remove("value-cheer");
          delete row.dataset.flying;
        }, 950);
      }
    });
  });

  /* ---------- One-time shine sweep on gradient headlines ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    var shineObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("shine");
          shineObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.7 });
    document.querySelectorAll(".grad-text").forEach(function (g) { shineObs.observe(g); });
  }

  /* ---------- Cursor press-state (triangle shrinks while mouse is down) ---------- */
  if (fine) {
    /* preload the pressed frame so the first press never flickers */
    var cssLink = document.querySelector('link[href$="style.css"]');
    var imgBase = cssLink ? cssLink.href.replace(/css\/style\.css$/, "img/") : "assets/img/";
    var pre = new Image();
    pre.src = imgBase + "cursor-press.svg";
    window.addEventListener("mousedown", function () { document.body.classList.add("pressing"); });
    window.addEventListener("mouseup", function () { document.body.classList.remove("pressing"); });
    window.addEventListener("blur", function () { document.body.classList.remove("pressing"); });
  }

  /* ---------- EASTER EGG: AMP Invaders ----------
     Loads assets/js/amp-invaders.js on demand.
     To remove the game: delete this block, the #game-egg button
     in index.html, the .footer-game CSS block, and that file. */
  var egg = document.getElementById("game-egg");
  if (egg) {
    egg.addEventListener("click", function () {
      if (window.AMPInvaders) { window.AMPInvaders.start(); return; }
      var s = document.createElement("script");
      s.src = "assets/js/amp-invaders.js";
      s.onload = function () { window.AMPInvaders.start(); };
      document.body.appendChild(s);
    });
  }
})();
