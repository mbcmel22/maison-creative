/* =====================================================================
   Maison Créative - logique de la vitrine
   - interactions (menu, carrousel, retour en haut, reveal)
   - chargement dynamique depuis Supabase (offres, equipe, galerie, reglages)
   Si Supabase n'est pas configure, le contenu statique du HTML est conserve.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Année ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header + retour en haut ---------- */
  var header = document.getElementById('header');
  var totop = document.getElementById('totop');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('shrink', y > 30);
    if (totop) totop.classList.toggle('show', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open'); burger.classList.remove('open');
        burger.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ---------- Carrousel (réinitialisable après injection) ---------- */
  var carIndex = 0, carAuto = null;
  function initCarousel() {
    var track = document.getElementById('track');
    var dotsWrap = document.getElementById('dots');
    var carousel = document.getElementById('carousel');
    if (!track || !dotsWrap) return;
    var slides = track.children;
    carIndex = 0;
    dotsWrap.innerHTML = '';
    function go(i) {
      carIndex = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-carIndex * 100) + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (dot, n) {
        dot.classList.toggle('active', n === carIndex);
      });
    }
    for (var i = 0; i < slides.length; i++) {
      var d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Aller à l\'image ' + (i + 1));
      (function (n) { d.addEventListener('click', function () { go(n); }); })(i);
      dotsWrap.appendChild(d);
    }
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    if (prev) prev.onclick = function () { go(carIndex - 1); };
    if (next) next.onclick = function () { go(carIndex + 1); };
    var startX = 0;
    track.ontouchstart = function (e) { startX = e.touches[0].clientX; };
    track.ontouchend = function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? carIndex + 1 : carIndex - 1);
    };
    if (carAuto) clearInterval(carAuto);
    if (slides.length > 1) {
      carAuto = setInterval(function () { go(carIndex + 1); }, 6000);
      if (carousel) carousel.addEventListener('mouseenter', function () { clearInterval(carAuto); });
    }
  }

  /* ---------- Pré-sélection de la prestation depuis les cartes ---------- */
  function bindOfferButtons() {
    document.querySelectorAll('[data-offer]').forEach(function (btn) {
      btn.onclick = function () {
        var sel = document.getElementById('b-offer');
        if (!sel) return;
        Array.prototype.forEach.call(sel.options, function (o) {
          if (o.value === btn.getAttribute('data-offer')) sel.value = o.value;
        });
      };
    });
  }

  /* ---------- Formulaire de réservation ----------
     La soumission vers Supabase (fonction book_slot) sera branchée à
     l'étape réservation, une fois les créneaux disponibles en back office. */
  function bindBooking() {
    var submit = document.getElementById('b-submit');
    var msg = document.getElementById('b-msg');
    if (!submit || !msg) return;
    submit.addEventListener('click', function () {
      var name = (document.getElementById('b-name').value || '').trim();
      var phone = (document.getElementById('b-phone').value || '').trim();
      var consent = document.getElementById('b-consent').checked;
      function warn(t) { msg.className = 'form-msg show'; msg.style.background = 'rgba(182,90,46,.12)'; msg.style.color = '#9c4a23'; msg.textContent = t; }
      if (!name || !phone) return warn('Merci de renseigner au moins votre nom et votre téléphone.');
      if (!consent) return warn('Merci de cocher la case de consentement pour continuer.');
      msg.className = 'form-msg show'; msg.style.background = ''; msg.style.color = '';
      msg.textContent = 'La réservation en ligne sera active très prochainement. Pour réserver dès maintenant, appelez le 07 44 41 41 29.';
    });
  }

  /* ---------- Helpers ---------- */
  function esc(s) { var d = document.createElement('div'); d.textContent = (s == null ? '' : String(s)); return d.innerHTML; }
  function euro(n) { return 'dès ' + Math.round(Number(n)) + ' €'; }
  function dureeLabel(min) { var h = Math.floor(min / 60), m = min % 60; if (h && m) return h + ' h ' + m; if (h) return h + ' h'; return m + ' min'; }

  /* ---------- Rendus dynamiques ---------- */
  function renderServices(rows) {
    var offers = document.getElementById('offers');
    if (offers) {
      offers.innerHTML = rows.map(function (s) {
        return '<div class="offer reveal">'
          + '<h3>' + esc(s.name) + '</h3>'
          + '<p>' + esc(s.description) + '</p>'
          + '<div class="offer__meta"><span class="offer__price">' + euro(s.price_eur) + '</span><span class="offer__dur">' + esc(dureeLabel(s.duration_minutes)) + '</span></div>'
          + '<a href="#reservation" class="btn btn--book" data-offer="' + esc(s.name) + '">Réserver</a>'
          + '</div>';
      }).join('');
    }
    var prices = document.getElementById('booking-prices');
    if (prices) {
      prices.innerHTML = rows.map(function (s) {
        return '<li><span>' + esc(s.name) + '</span><span>' + euro(s.price_eur) + '</span></li>';
      }).join('');
    }
    var sel = document.getElementById('b-offer');
    if (sel) {
      sel.innerHTML = rows.map(function (s) {
        return '<option value="' + esc(s.name) + '" data-id="' + s.id + '">' + esc(s.name) + '</option>';
      }).join('');
    }
  }

  function renderTeam(rows) {
    var list = document.getElementById('team-list');
    if (list) {
      list.innerHTML = rows.map(function (m) {
        var photo = m.photo_url
          ? '<div class="member__photo"><img src="' + esc(m.photo_url) + '" alt="' + esc(m.full_name) + '"></div>'
          : '<div class="member__photo">MC</div>';
        return '<div class="member reveal">' + photo
          + '<h3>' + esc(m.full_name) + '</h3>'
          + '<div class="member__role">' + esc(m.role_title) + '</div>'
          + '<p>' + esc(m.description) + '</p></div>';
      }).join('');
    }
    var eng = document.getElementById('b-eng');
    if (eng) {
      var bookable = rows.filter(function (m) { return m.is_bookable; });
      eng.innerHTML = '<option value="">Sans préférence</option>' + bookable.map(function (m) {
        return '<option value="' + m.id + '">' + esc(m.full_name) + '</option>';
      }).join('');
    }
  }

  function renderGallery(rows) {
    var track = document.getElementById('track');
    if (!track) return;
    track.style.transform = 'translateX(0)';
    track.innerHTML = rows.map(function (g, i) {
      if (g.image_url) {
        return '<div class="slide"><img src="' + esc(g.image_url) + '" alt="' + esc(g.caption || 'Studio Maison Créative') + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>';
      }
      var cls = 'slide--' + ((i % 3) + 1);
      return '<div class="slide ' + cls + '"><div class="slide__ph"><div class="meter gold"><span></span><span></span><span></span><span></span><span></span><span></span></div><span class="slide__cap">' + esc(g.caption || 'Visuel du studio') + '</span></div></div>';
    }).join('');
  }

  function applySettings(rows) {
    var map = {};
    (rows || []).forEach(function (r) { map[r.key] = r.value; });
    if (map.hero) {
      if (map.hero.title) { var t = document.getElementById('hero-title'); if (t) t.textContent = map.hero.title; }
      if (map.hero.subtitle) { var s = document.getElementById('hero-sub'); if (s) s.textContent = map.hero.subtitle; }
    }
    if (map.horaires) {
      var h = document.getElementById('hours');
      if (h) {
        var l = map.horaires;
        h.innerHTML =
          '<li><span>Lundi au vendredi</span><span>' + esc(l.lundi || '') + '</span></li>'
          + '<li><span>Samedi</span><span>' + esc(l.samedi || '') + '</span></li>'
          + '<li><span>Dimanche</span><span>' + esc(l.dimanche || '') + '</span></li>';
      }
    }
    if (map.branding && map.branding.logo_url) {
      document.querySelectorAll('.brand img, .footer__brand img').forEach(function (img) { img.src = map.branding.logo_url; });
    }
  }

  /* ---------- Reveal au scroll ---------- */
  function reveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Démarrage ---------- */
  function finish() { initCarousel(); bindOfferButtons(); reveal(); }

  function boot() {
    bindBooking();
    var db = (typeof mcGetClient === 'function') ? mcGetClient() : null;
    if (!db) { finish(); return; }

    Promise.all([
      db.from('site_settings').select('key,value'),
      db.from('services').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      db.from('team_members').select('*').eq('is_visible', true).order('display_order', { ascending: true }),
      db.from('gallery_photos').select('*').eq('is_visible', true).order('display_order', { ascending: true })
    ]).then(function (res) {
      try { if (res[0] && res[0].data) applySettings(res[0].data); } catch (e) {}
      try { if (res[1] && res[1].data && res[1].data.length) renderServices(res[1].data); } catch (e) {}
      try { if (res[2] && res[2].data && res[2].data.length) renderTeam(res[2].data); } catch (e) {}
      try { if (res[3] && res[3].data && res[3].data.length) renderGallery(res[3].data); } catch (e) {}
    }).catch(function (e) {
      console.warn('Maison Créative : contenu dynamique indisponible, version statique conservée.', e);
    }).then(finish);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
