/* Motor del ODC: navegación, menú, progreso, audio de BRAI, SCORM. */
var App = (function () {
  var stage = document.getElementById('stage');
  var current = 0, visited = {}, muted = false, audio = null, speaking = false, evalScore = null;

  /* ---------- escala 1280x720 ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'scale(' + s + ')';
  }

  /* ---------- construcción ---------- */
  function build() {
    var cont = document.getElementById('screens');
    SCREENS.forEach(function (sc, i) {
      var d = document.createElement('section');
      d.className = 'screen'; d.id = sc.id; d.setAttribute('aria-label', 'Pantalla ' + sc.n + ': ' + sc.title);
      d.innerHTML = (SCREEN_HTML[sc.id] ? SCREEN_HTML[sc.id]() : '');
      cont.appendChild(d);
    });
    BRAI.mount(document.getElementById('brai-wrap'));
    // progreso
    var pr = document.getElementById('progress'), h = '';
    for (var m = 1; m <= 8; m++) { h += (m > 1 ? '<span class="line" data-l="' + m + '"></span>' : '') + '<span class="dot" data-m="' + m + '" title="Módulo ' + m + ': ' + MODULES[m - 1] + '">' + m + '</span>'; }
    pr.innerHTML = h;
    // menú
    var ml = document.getElementById('menu-list'), mh = '', lastMod = 0;
    SCREENS.forEach(function (sc, i) {
      if (sc.mod !== lastMod && sc.mod <= 8) { mh += '<li class="grp">Módulo ' + sc.mod + ' · ' + MODULES[sc.mod - 1] + '</li>'; lastMod = sc.mod; }
      if (sc.mod === 9 && lastMod !== 9) { mh += '<li class="grp">Cierre</li>'; lastMod = 9; }
      mh += '<li><button data-go="' + i + '"><span class="chk"></span>' + sc.n + '. ' + sc.menu + '</button></li>';
    });
    ml.innerHTML = mh;
  }

  /* ---------- navegación ---------- */
  function go(i, fromRestore) {
    if (i < 0 || i >= SCREENS.length) return;
    stopAudio();
    closeMenu(); closeTranscript();
    var prev = document.querySelector('.screen.active'); if (prev) prev.classList.remove('active');
    current = i; visited[i] = true;
    var sc = SCREENS[i], el = document.getElementById(sc.id);
    el.classList.add('active');
    stage.classList.remove('big', 'full', 'enter-right');
    if (sc.layout) stage.classList.add(sc.layout);
    if (sc.enter) { void stage.offsetWidth; stage.classList.add('enter-right'); }
    document.getElementById('module-title').textContent = sc.title;
    document.getElementById('screen-counter').textContent = sc.n <= 18 ? 'Pantalla ' + sc.n + ' de 18' : sc.menu;
    document.getElementById('topbar').style.display = sc.id === 'p01' ? 'none' : '';
    document.getElementById('bottombar').style.display = sc.id === 'p01' ? 'none' : '';
    document.getElementById('screens').style.top = sc.id === 'p01' ? '0' : '';
    document.getElementById('screens').style.bottom = sc.id === 'p01' ? '0' : '';
    document.getElementById('brai-zone').style.top = sc.id === 'p01' ? '0' : '';
    document.getElementById('brai-zone').style.bottom = sc.id === 'p01' ? '0' : '';
    // BRAI
    BRAI.setPose(sc.pose, sc.flags);
    document.getElementById('brai-bubble').textContent = sc.bubble;
    document.getElementById('btn-audio').style.display = sc.noAudio ? 'none' : '';
    document.getElementById('btn-mute').style.display = sc.noAudio ? 'none' : '';
    document.getElementById('btn-transcript').style.display = sc.noAudio ? 'none' : '';
    // progreso
    document.querySelectorAll('#progress .dot').forEach(function (d) {
      var m = +d.dataset.m; d.classList.toggle('current', m === sc.mod); d.classList.toggle('done', m < sc.mod);
    });
    document.querySelectorAll('#progress .line').forEach(function (l) { l.classList.toggle('done', +l.dataset.l <= sc.mod); });
    document.getElementById('btn-prev').disabled = i === 0;
    document.getElementById('btn-next').disabled = i === SCREENS.length - 1;
    // menú marcado
    document.querySelectorAll('#menu-list button').forEach(function (b) {
      var k = +b.dataset.go; b.classList.toggle('current', k === i); b.querySelector('.chk').textContent = visited[k] ? '✔' : '';
    });
    // inicializar interacción de la pantalla (una sola vez) y animaciones (cada vez)
    if (SCREEN_INIT[sc.id] && !el.dataset.ready) { SCREEN_INIT[sc.id](el); el.dataset.ready = '1'; }
    if (SCREEN_ENTER[sc.id]) SCREEN_ENTER[sc.id](el);
    save();
    if (sc.id === 'p18') SCORM.complete();
  }

  function save() {
    SCORM.setLocation(current);
    SCORM.setSuspend(JSON.stringify({ v: Object.keys(visited), s: evalScore }));
  }
  function restore() {
    try {
      var d = JSON.parse(SCORM.getSuspend() || '{}');
      (d.v || []).forEach(function (k) { visited[k] = true; });
      if (d.s != null) evalScore = d.s;
    } catch (e) {}
    var loc = parseInt(SCORM.getLocation(), 10);
    return isNaN(loc) ? 0 : loc;
  }

  /* ---------- menú ---------- */
  var menu = document.getElementById('menu');
  function openMenu() { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); document.getElementById('btn-menu').setAttribute('aria-expanded', 'true'); }
  function closeMenu() { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); document.getElementById('btn-menu').setAttribute('aria-expanded', 'false'); }

  /* ---------- modal ---------- */
  var modal = document.getElementById('modal');
  function openModal(html) { modal.querySelector('.modal-body').innerHTML = html; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); modal.querySelector('.modal-close').focus(); }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }

  /* ---------- transcripción ---------- */
  var tr = document.getElementById('transcript');
  function openTranscript() {
    var sc = SCREENS[current];
    tr.querySelector('.tr-body').innerHTML = sc.guion.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    tr.classList.add('open'); tr.setAttribute('aria-hidden', 'false');
  }
  function closeTranscript() { tr.classList.remove('open'); tr.setAttribute('aria-hidden', 'true'); }

  /* ---------- audio de BRAI ----------
     Busca audio/pNN.mp3 (grabación del autor). Si no existe, usa la voz del navegador
     leyendo el guion, para que el ODC funcione mientras se agregan las grabaciones. */
  function setPlaying(on) {
    speaking = on; BRAI.talking(on);
    var b = document.getElementById('btn-audio');
    b.textContent = on ? '❚❚ Pausar' : '▶ Escuchar'; b.classList.toggle('playing', on);
  }
  function playAudio() {
    if (speaking) { stopAudio(); return; }
    var sc = SCREENS[current];
    audio = new Audio('audio/' + sc.id + '.mp3');
    audio.muted = muted;
    audio.onended = function () { setPlaying(false); };
    audio.onerror = function () { audio = null; speak(sc.guion.join(' ')); };
    var pr = audio.play();
    if (pr && pr.then) pr.then(function () { setPlaying(true); }).catch(function () { if (audio) { audio = null; speak(sc.guion.join(' ')); } });
    else setPlaying(true);
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) { openTranscript(); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-CO'; u.rate = 1; u.volume = muted ? 0 : 1;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^es/i.test(v.lang); });
    if (vs.length) u.voice = vs.find(function (v) { return /CO|MX|US|419/.test(v.lang); }) || vs[0];
    u.onend = function () { setPlaying(false); };
    speechSynthesis.cancel(); speechSynthesis.speak(u); setPlaying(true);
  }
  function stopAudio() {
    if (audio) { audio.pause(); audio = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setPlaying(false);
  }

  /* ---------- eventos ---------- */
  function bind() {
    document.getElementById('btn-next').onclick = function () { go(current + 1); };
    document.getElementById('btn-prev').onclick = function () { go(current - 1); };
    document.getElementById('btn-home').onclick = function () { go(0); };
    document.getElementById('btn-menu').onclick = function () { menu.classList.contains('open') ? closeMenu() : openMenu(); };
    document.getElementById('btn-menu-close').onclick = closeMenu;
    document.getElementById('menu-list').onclick = function (e) { var b = e.target.closest('button'); if (b) go(+b.dataset.go); };
    document.getElementById('btn-audio').onclick = playAudio;
    document.getElementById('btn-mute').onclick = function () {
      muted = !muted; this.textContent = muted ? '🔇' : '🔊';
      if (audio) audio.muted = muted; if (muted && speaking && !audio) stopAudio();
    };
    document.getElementById('btn-transcript').onclick = function () { tr.classList.contains('open') ? closeTranscript() : openTranscript(); };
    document.getElementById('btn-tr-close').onclick = closeTranscript;
    document.getElementById('btn-help').onclick = function () { openModal(HELP_HTML); };
    modal.querySelector('.modal-close').onclick = closeModal;
    modal.onclick = function (e) { if (e.target === modal) closeModal(); };
    document.addEventListener('keydown', function (e) {
      if (e.target.matches('textarea,input')) return;
      if (e.key === 'Escape') { closeModal(); closeMenu(); closeTranscript(); }
      if (modal.classList.contains('open')) return;
      if (e.key === 'ArrowRight') go(current + 1);
      if (e.key === 'ArrowLeft') go(current - 1);
    });
    // ayudas genéricas: pestañas, acordeones, +info, saltos
    stage.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tab]');
      if (t) {
        var g = t.closest('.tabs-wrap');
        g.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
        g.querySelectorAll('.tab-panel>div').forEach(function (p) { p.classList.toggle('on', p.dataset.panel === t.dataset.tab); });
        return;
      }
      var a = e.target.closest('.acc-item>button');
      if (a) { a.parentNode.classList.toggle('open'); a.setAttribute('aria-expanded', a.parentNode.classList.contains('open'));
        if (a.parentNode.classList.contains('open')) a.parentNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return; }
      var inf = e.target.closest('[data-info]');
      if (inf && INFO[inf.dataset.info]) { openModal(INFO[inf.dataset.info]); return; }
      var j = e.target.closest('[data-jump]');
      if (j) { go(SCREENS.findIndex(function (s) { return s.id === j.dataset.jump; })); }
    });
    window.addEventListener('resize', fit);
    stage.addEventListener('scroll', function () { stage.scrollTop = 0; stage.scrollLeft = 0; });
    document.getElementById('viewport').addEventListener('scroll', function () { this.scrollTop = 0; this.scrollLeft = 0; });
  }

  var HELP_HTML = '<h3>¿Cómo navegar este ODC?</h3><ul>' +
    '<li><b>◀ Anterior / Siguiente ▶</b> (abajo): avanzan o regresan una pantalla. También puedes usar las flechas del teclado.</li>' +
    '<li><b>☰ Menú</b> (arriba a la derecha): abre la lista de todos los módulos, la evaluación, las referencias y los créditos. Puedes ir a cualquier sección sin seguir un orden fijo.</li>' +
    '<li><b>🏠 Inicio</b>: vuelve a la portada.</li>' +
    '<li><b>▶ Escuchar</b> (debajo de BRAI): reproduce la explicación del avatar. <b>🔊</b> silencia el audio y <b>📄</b> muestra la transcripción.</li>' +
    '<li>Los botones <b>+info</b> y las pestañas abren contenido adicional sin saturar la pantalla.</li>' +
    '<li>La barra de círculos (abajo, al centro) muestra en qué módulo vas.</li></ul>';

  return {
    start: function () {
      fit(); build(); bind();
      SCORM.init();
      go(restore(), true);
    },
    go: go, modal: openModal, closeModal: closeModal,
    goId: function (id) { go(SCREENS.findIndex(function (s) { return s.id === id; })); },
    progress: function () { return { score: evalScore, visited: Object.keys(visited).length, total: SCREENS.length }; },
    setEval: function (score, passed) { evalScore = score; SCORM.setScore(score, passed); save(); },
    brai: function (pose, flags, bubble) { BRAI.setPose(pose, flags); if (bubble) document.getElementById('brai-bubble').textContent = bubble; },
    resetBrai: function () { var sc = SCREENS[current]; BRAI.setPose(sc.pose, sc.flags); document.getElementById('brai-bubble').textContent = sc.bubble; }
  };
})();
document.addEventListener('DOMContentLoaded', App.start);
