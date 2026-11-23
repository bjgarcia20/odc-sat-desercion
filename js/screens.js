/* Pantallas del ODC – construidas a partir del storyboard aprobado (Zonas 1 y 3). */
var SCREEN_HTML = {}, SCREEN_INIT = {}, SCREEN_ENTER = {}, INFO = {};

/* ================= utilidades ================= */
function cite(t) { return '<span class="cite">(' + t + ')</span>'; }
function rnd(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function netSVG(seed, n, w, h) {
  var r = rnd(seed), pts = [], out = '<svg class="net" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><g stroke="rgba(255,255,255,.16)" stroke-width="1.2" fill="rgba(255,255,255,.35)">';
  for (var i = 0; i < n; i++) pts.push([r() * w, r() * h]);
  pts.forEach(function (a, i) { pts.forEach(function (b, j) { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 190) out += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; }); });
  pts.forEach(function (p) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" stroke="none"/>'; });
  return out + '</g></svg>';
}
function bars(items, lw) {
  return '<div class="bars" style="--lw:' + (lw || 170) + 'px">' + items.map(function (it) {
    return '<div class="bar-row"><span>' + it[0] + '</span><div class="bar-track"><div class="bar-fill ' + (it[3] || '') + '" data-w="' + (it[1] / (it[2] || 100) * 100) + '"></div></div><span class="bar-val">' + (it[4] || it[1] + '%') + '</span></div>';
  }).join('') + '</div>';
}
function animate(el) {
  el.querySelectorAll('.bar-fill').forEach(function (b) { b.style.transition = 'none'; b.style.width = '0'; });
  el.querySelectorAll('.vbar .v').forEach(function (b) { b.style.transition = 'none'; b.style.height = '0'; });
  setTimeout(function () {
    el.querySelectorAll('.bar-fill').forEach(function (b) { b.style.transition = ''; b.style.width = b.dataset.w + '%'; });
    el.querySelectorAll('.vbar .v').forEach(function (b) { b.style.transition = ''; b.style.height = b.dataset.h + '%'; });
  }, 80);
  el.querySelectorAll('[data-count]').forEach(function (c) {
    var to = parseFloat(c.dataset.count), dec = +(c.dataset.dec || 0), t0 = null, pre = c.dataset.pre || '', suf = c.dataset.suf || '';
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); c.textContent = pre + (to * (1 - Math.pow(1 - k, 3))).toFixed(dec) + suf; if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });
}
function words(t) { return (t.trim().match(/\S+/g) || []).length; }
/* arrastrar y soltar con alternativa de clic (accesible y táctil) */
function makeDnD(root, check, onChange) {
  var selected = null;
  function tryDrop(chip, drop) {
    if (!chip || chip.classList.contains('ok')) return;
    if (check(chip, drop)) {
      var slot = drop.querySelector('.slot-in') || drop;
      slot.appendChild(chip); chip.classList.add('ok'); chip.classList.remove('sel'); chip.draggable = false;
    } else { chip.classList.remove('bad'); void chip.offsetWidth; chip.classList.add('bad'); chip.classList.remove('sel'); }
    selected = null; if (onChange) onChange();
  }
  root.querySelectorAll('.chip').forEach(function (c) {
    c.draggable = true; c.tabIndex = 0;
    c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', c.dataset.id); selected = c; });
    c.addEventListener('click', function () { if (c.classList.contains('ok')) return; root.querySelectorAll('.chip.sel').forEach(function (x) { x.classList.remove('sel'); }); c.classList.add('sel'); selected = c; });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } });
  });
  root.querySelectorAll('.drop').forEach(function (d) {
    d.tabIndex = 0;
    d.addEventListener('dragover', function (e) { e.preventDefault(); d.classList.add('over'); });
    d.addEventListener('dragleave', function () { d.classList.remove('over'); });
    d.addEventListener('drop', function (e) { e.preventDefault(); d.classList.remove('over'); var id = e.dataTransfer.getData('text/plain'); tryDrop(root.querySelector('.chip[data-id="' + id + '"]'), d); });
    d.addEventListener('click', function () { if (selected) tryDrop(selected, d); });
    d.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && selected) { e.preventDefault(); tryDrop(selected, d); } });
  });
}
/* cuestionario genérico de selección múltiple */
function quiz(box, qs, opts) {
  var i = 0, score = 0, answers = [];
  function render() {
    var q = qs[i];
    box.innerHTML = '<div class="qdots">' + qs.map(function (_, k) { return '<i class="' + (k <= i ? 'on' : '') + '"></i>'; }).join('') + '<span style="margin-left:6px">Pregunta ' + (i + 1) + ' de ' + qs.length + '</span></div>' +
      '<div class="card mt6" style="padding:14px 16px"><p class="bold" style="font-size:' + (opts.fs || 16) + 'px;line-height:1.4">' + q.q + '</p></div>' +
      '<div class="opts mt10">' + q.o.map(function (o, k) { return '<button class="opt" data-k="' + k + '">' + String.fromCharCode(97 + k) + ') ' + o + '</button>'; }).join('') + '</div>' +
      '<div class="feedback"></div><div class="mt10" style="text-align:right"><button class="btn next-q hidden">' + (i < qs.length - 1 ? 'Siguiente pregunta →' : 'Ver resultado') + '</button></div>';
    box.querySelectorAll('.opt').forEach(function (b) {
      b.onclick = function () {
        var k = +b.dataset.k, ok = k === q.a;
        box.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; });
        b.classList.add(ok ? 'ok' : 'bad'); box.querySelectorAll('.opt')[q.a].classList.add('ok');
        if (ok) score++;
        answers.push({ q: q.q, ok: ok, el: q.e });
        var fb = box.querySelector('.feedback');
        fb.className = 'feedback show ' + (ok ? 'ok' : 'bad');
        fb.innerHTML = '<b>' + (ok ? '✔ ¡Correcto! ' : '✖ No es correcto. ') + '</b>' + q.e;
        if (opts.onAnswer) opts.onAnswer(ok, i);
        box.querySelector('.next-q').classList.remove('hidden');
      };
    });
    box.querySelector('.next-q').onclick = function () { i++; if (i < qs.length) render(); else opts.onEnd(score, answers); };
    if (opts.onRender) opts.onRender(i);
  }
  render();
}
function ring(pct, label) { return '<div class="score-ring" style="--p:' + pct + '%"><span>' + label + '</span></div>'; }

/* ================= P1 · PORTADA ================= */
SCREEN_HTML.p01 = function () {
  return '<div class="hero photo">' + netSVG(7, 46, 1280, 720) + '</div>' +
  '<div style="position:absolute;top:28px;left:36px;display:flex;align-items:center;gap:12px;color:#fff">' +
    '<img src="assets/logo_udec.png" alt="Logo Universidad de Cundinamarca" style="height:58px" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
    '<span class="logo-fallback" style="height:54px;font-size:18px">UdeC</span><span style="font-size:14px;line-height:1.25">Universidad de<br>Cundinamarca</span></div>' +
  '<div class="p01-title" style="position:absolute;left:60px;top:150px;width:780px;color:#fff">' +
    '<h1 style="font-size:40px;line-height:1.18;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.25)">' + META.titulo + '</h1>' +
    '<p style="margin-top:22px;font-size:17px;opacity:.95;color:#fff">Universidad de Cundinamarca · Especialización en Analítica y Ciencia de Datos · Ciencia, Tecnología e Innovación (CTI)</p>' +
    '<p style="margin-top:12px;font-size:16px;opacity:.9;color:#fff">Autor: ' + META.autor + ' · ' + META.anio + '</p></div>' +
  '<div style="position:absolute;left:0;right:0;bottom:46px;display:flex;justify-content:center;gap:14px;padding-right:340px">' +
    '<button class="btn yellow" style="font-size:22px;padding:16px 54px;box-shadow:0 6px 16px rgba(0,0,0,.25)" data-jump="p02">▶ Comenzar</button>' +
    '<button class="btn sec" style="font-size:16px;padding:12px 22px" onclick="document.getElementById(\'btn-help\').click()">? Ayuda</button></div>';
};
SCREEN_ENTER.p01 = function (el) { var t = el.querySelector('.p01-title'); t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'fadein 1.4s ease'; };

/* ================= P2 · INTRODUCCIÓN ================= */
var ROUTE = [
  ['p03', '🚪', 'M2', 'La deserción', 'Magnitud del problema, costos y marcos teóricos.'],
  ['p05', '🧠', 'M3', 'Fundamentos de ML', 'Qué es la EDM y los algoritmos más usados.'],
  ['p07', '📋', 'M4', 'Variables', 'Qué datos predicen mejor la deserción.'],
  ['p09', '📈', 'M5', 'Modelos', 'Rendimiento de modelos y modelos híbridos.'],
  ['p11', '🚦', 'M6', 'SAT', 'Cómo pasar de la predicción a la acción.'],
  ['p13', '🔍', 'M7', 'XAI', 'Cómo explicar por qué el modelo alerta.'],
  ['p15', '🌎', 'M8', 'Latinoamérica', 'Casos en México, Cuba y Colombia.']
];
SCREEN_HTML.p02 = function () {
  return '<h2 class="sc-title"><small>Módulo 1</small>Introducción y navegación</h2>' +
  '<div class="card green" style="max-width:860px"><h3>🎯 Resultado Esperado de Aprendizaje (REA)</h3><p>Al finalizar este ODC, el estudiante estará en toda la capacidad de analizar los fundamentos y aplicaciones de los sistemas de alerta temprana basados en machine learning para poder predecir la deserción estudiantil, evaluando críticamente los modelos predictivos, las variables clave y las técnicas de explicabilidad (XAI), en el contexto de la educación superior latinoamericana.</p></div>' +
  '<p class="mt6 small"><b>👥 Población objetivo:</b> estudiantes, docentes y analistas de educación superior interesados en usar machine learning para prevenir la deserción estudiantil.</p>' +
  '<h3 style="margin-top:14px">🗺️ Estructura del ODC <span class="small muted" style="font-weight:400">— pasa el mouse sobre una tarjeta y haz clic para ir al módulo</span></h3>' +
  '<div class="route" style="position:relative;display:flex;gap:10px;margin-top:8px;padding-top:6px">' +
    '<div style="position:absolute;left:30px;right:30px;top:52px;border-top:3px dashed #b9c7be;z-index:0"></div>' +
    ROUTE.map(function (r) {
      return '<button class="route-card" data-jump="' + r[0] + '" title="' + r[4] + '" style="position:relative;z-index:1;flex:1;background:#fff;border:2px solid var(--verde);border-radius:14px;padding:10px 6px;min-height:118px;display:flex;flex-direction:column;align-items:center;gap:4px;transition:transform .25s,box-shadow .25s">' +
      '<span style="font-size:30px">' + r[1] + '</span><span class="tag">' + r[2] + '</span><b style="font-size:13.5px;color:var(--tinta)">' + r[3] + '</b><span class="rc-desc small muted" style="display:none;line-height:1.3">' + r[4] + '</span></button>';
    }).join('') + '</div>' +
  '<div class="row" style="margin-top:16px;justify-content:flex-end;gap:18px;font-size:13px;color:var(--gris)">' +
    '<span>◀ ▶ Avanza y regresa</span><span>☰ Menú de módulos</span><span>▶ Escucha a BRAI</span><span>📄 Transcripción</span></div>' +
  '<style>.route-card:hover,.route-card:focus{transform:scale(1.08);box-shadow:0 8px 20px rgba(0,0,0,.12)}.route-card:hover .rc-desc,.route-card:focus .rc-desc{display:block!important}</style>';
};

/* ================= P3 · DESERCIÓN ================= */
SCREEN_HTML.p03 = function () {
  return '<h2 class="sc-title"><small>Módulo 2</small>La deserción estudiantil — contexto y magnitud</h2>' +
  '<div class="row">' +
    '<div class="stat"><div class="n" data-count="50" data-suf="%">50%</div><div class="l">deserción en América Latina ' + cite('Alvarado-Uribe et al., 2022') + '</div></div>' +
    '<div class="stat y"><div class="n" data-count="42.8" data-dec="1" data-suf="%">42.8%</div><div class="l">deserción en programas virtuales (España) ' + cite('Sáiz-Manzanares et al., 2020') + '</div></div>' +
    '<div class="stat d"><div class="n" data-count="16.5" data-dec="1" data-pre="USD " data-suf=" mil M">USD 16.5 mil M</div><div class="l">pérdidas anuales en EE. UU. ' + cite('Lopez-Muñoz et al., 2026') + '</div></div></div>' +
  '<div class="row mt10">' +
    '<div class="grow"><h3>La magnitud del problema</h3><p>La deserción en educación superior es un fenómeno persistente y multidimensional con consecuencias sociales, económicas y educativas; en regiones en desarrollo las tasas llegan hasta el 50% y en México alcanzan el 38% ' + cite('Lopez-Muñoz et al., 2026') + '. En América Latina, la mitad de los estudiantes abandona y solo el 50% de quienes permanecen se gradúa a tiempo ' + cite('Alvarado-Uribe et al., 2022') + '. En España, la deserción ronda el 18% en programas presenciales y el 42.8% en programas virtuales ' + cite('Sáiz-Manzanares et al., 2020') + '.</p></div>' +
    '<div class="card" style="width:430px"><h3 class="small" style="font-size:14px">📊 Tasas de deserción reportadas</h3>' +
      bars([['Regiones en desarrollo', 50], ['América Latina', 50], ['México', 38], ['España (presencial)', 18]], 150) +
      '<p class="small muted mt6">Fuente: Lopez-Muñoz et al. (2026); Alvarado-Uribe et al. (2022); Sáiz-Manzanares et al. (2020).</p></div></div>' +
  '<div class="tabs-wrap mt10"><div class="tabs" role="tablist">' +
    '<button class="tab on" data-tab="eco" role="tab">💰 Impacto económico</button><button class="tab" data-tab="spa" role="tab">🇨🇴 SPADIES en Colombia</button><button class="tab" data-tab="teo" role="tab">📚 Marcos teóricos</button></div>' +
    '<div class="tab-panel" style="min-height:112px">' +
      '<div data-panel="eco" class="on"><p>Una universidad estatal chilena estimó pérdidas de USD 23.4 millones en cuatro años ' + cite('Améstica-Rivas et al., 2021, como se citó en Lopez-Muñoz et al., 2026') + ', y en Estados Unidos se reportaron USD 16.5 mil millones anuales en ingresos perdidos en 1,669 instituciones ' + cite('Lopez-Muñoz et al., 2026') + '.</p></div>' +
      '<div data-panel="spa"><p>El Ministerio de Educación Nacional creó el SPADIES (Sistema para la Prevención de la Deserción en la Educación Superior), lo que muestra que la prevención pasó de ser un tema de investigación a una prioridad de gobernanza institucional ' + cite('Lopez-Muñoz et al., 2026') + '.</p></div>' +
      '<div data-panel="teo"><div class="row" style="align-items:center">' +
        '<div style="display:flex;align-items:center;gap:0;width:430px">' +
          [['1975', 'Tinto', 'Integración académica y social'], ['1980', 'Bean', 'Desgaste y factores externos'], ['', 'Cabrera et al.', 'Persistencia']].map(function (t, k) {
            return (k ? '<div style="flex:1;height:3px;background:var(--verde)"></div>' : '') + '<div style="text-align:center;width:118px"><div style="width:16px;height:16px;border-radius:50%;background:var(--verde);margin:0 auto 4px"></div><b class="small">' + t[1] + (t[0] ? ' (' + t[0] + ')' : '') + '</b><div class="small muted" style="line-height:1.2">' + t[2] + '</div></div>';
          }).join('') + '</div>' +
        '<p class="grow">Los modelos de integración de Tinto, de desgaste de Bean y de persistencia de Cabrera et al. siguen siendo la base teórica del campo. Carballo-Mendívil et al. (2026) los usaron para construir ocho constructos teóricos, validados con alfa de Cronbach, antes de entrenar sus modelos predictivos.</p></div></div>' +
    '</div></div>';
};
SCREEN_ENTER.p03 = animate;

/* ================= P4 · ACTIVIDAD DnD ================= */
var P4_CATS = [['aca', '📚', 'Académico', '#2f6fd6'], ['soc', '💰', 'Socioeconómico', '#00843d'], ['psi', '💭', 'Psicosocial', '#7a4fd0'], ['dem', '👤', 'Demográfico', '#e8892a'], ['dig', '💻', 'Digital / Comportamental', '#1ea7c9'], ['ins', '🏛️', 'Institucional', '#6b7a72']];
var P4_ITEMS = [['gpa', 'Promedio de notas (GPA)', 'aca'], ['ses', 'Nivel socioeconómico', 'soc'], ['asi', 'Asistencia a clases', 'aca'], ['aut', 'Autoeficacia', 'psi'], ['per', 'Sentido de pertenencia', 'psi'], ['pri', 'Ser primera generación universitaria', 'dem'], ['lms', 'Interacciones en LMS', 'dig'], ['bec', 'Becas o apoyo financiero', 'ins']];
SCREEN_HTML.p04 = function () {
  var items = [3, 0, 6, 1, 7, 4, 2, 5].map(function (k) { return P4_ITEMS[k]; });
  return '<h2 class="sc-title"><small>Módulo 2 · Actividad</small>Clasificación de factores de deserción</h2>' +
  '<div class="instr">✋ <b>Arrastrar y soltar:</b> clasifica los siguientes factores según su categoría (Académico, Socioeconómico, Psicosocial, Demográfico, Digital/Comportamental, Institucional). <span class="muted">También puedes hacer clic en un factor y luego en la categoría.</span></div>' +
  '<div class="row">' +
    '<div class="bank" style="width:250px;display:flex;flex-direction:column;gap:7px">' + items.map(function (it) { return '<div class="chip" data-id="' + it[0] + '">' + it[1] + '</div>'; }).join('') + '</div>' +
    '<div class="grow" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' + P4_CATS.map(function (c) {
      return '<div class="drop" data-cat="' + c[0] + '" style="border-color:' + c[3] + '66;min-height:128px"><h4 style="color:' + c[3] + '">' + c[1] + ' ' + c[2] + '</h4></div>';
    }).join('') + '</div></div>' +
  '<div class="row mt10" style="align-items:center;justify-content:flex-end"><span class="p4-count bold" style="margin-right:auto;color:var(--verde)">0/8 correctas</span><button class="btn sec p4-reset">↺ Reiniciar</button><button class="btn p4-check">✔ Verificar</button></div>' +
  '<div class="feedback p4-fb"></div>';
};
SCREEN_INIT.p04 = function (el) {
  var initial = el.querySelector('.bank').innerHTML;
  function count() { var n = el.querySelectorAll('.chip.ok').length; el.querySelector('.p4-count').textContent = n + '/8 correctas'; return n; }
  function setup() {
    makeDnD(el, function (chip, drop) { return P4_ITEMS.find(function (i) { return i[0] === chip.dataset.id; })[2] === drop.dataset.cat; }, function () { if (count() === 8) el.querySelector('.p4-check').click(); });
  }
  setup();
  el.querySelector('.p4-check').onclick = function () {
    var fb = el.querySelector('.p4-fb'), ok = count() === 8;
    fb.className = 'feedback p4-fb show ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = ok ? '<b>Retroalimentación correcta:</b> ¡Excelente! Los factores de deserción son multidimensionales. La investigación muestra que los indicadores de rendimiento académico son los más utilizados, pero los factores psicosociales están subrepresentados ' + cite('Lopez-Muñoz et al., 2026') + '.'
      : '<b>Retroalimentación incorrecta:</b> Revisa la clasificación. Los factores abarcan dimensiones académicas, socioeconómicas, psicosociales, demográficas e institucionales ' + cite('Lopez-Muñoz et al., 2026') + '. Te faltan ' + (8 - count()) + ' factores por ubicar correctamente.';
    App.brai(ok ? 'arriba' : 'barbilla', ok ? [] : ['pensar']);
  };
  el.querySelector('.p4-reset').onclick = function () {
    el.querySelectorAll('.drop .chip').forEach(function (c) { c.remove(); });
    el.querySelector('.bank').innerHTML = initial; el.querySelector('.p4-fb').className = 'feedback p4-fb'; setup(); count(); App.resetBrai();
  };
};

/* ================= P5 · FUNDAMENTOS ML ================= */
var ALGOS = [
  ['〽️', 'Regresión Logística', 'Curva en S', 'Estima la probabilidad de deserción como P(y=1|x) = σ(wᵀx + b). Sus coeficientes muestran directamente cómo cada variable afecta el riesgo ' + cite('Bettahi et al., 2025') + '. Presente en el 62.7% de los estudios con precisión promedio del 79.3% ' + cite('Lopez-Muñoz et al., 2026') + '.'],
  ['🌳', 'Random Forest', 'Bosque de árboles', 'Presente en el 81.3% de los estudios de predicción de deserción, con precisión promedio del 86.2%. Es el algoritmo más utilizado en el campo ' + cite('Lopez-Muñoz et al., 2026') + '.'],
  ['⚡', 'XGBoost', 'Árboles potenciados', 'Mejora el Gradient Boosting con optimización de segundo orden y regularización. Presente en el 45.3% de los estudios con precisión promedio del 87.4%, la más alta entre algoritmos individuales ' + cite('Lopez-Muñoz et al., 2026; Bettahi et al., 2025') + '.'],
  ['🧱', 'Stacking Ensemble', 'Modelos apilados', 'Combina múltiples modelos en una arquitectura por niveles. Alcanza precisión promedio del 88.1% en los estudios revisados ' + cite('Lopez-Muñoz et al., 2026') + '.']
];
SCREEN_HTML.p05 = function () {
  return '<h2 class="sc-title"><small>Módulo 3</small>Fundamentos de machine learning aplicados a educación</h2>' +
  '<div class="row" style="align-items:center">' +
    ['🗂️ Datos históricos de estudiantes', '⚙️ Algoritmo de ML', '🎯 Probabilidad de deserción (%)'].map(function (s, k) {
      return (k ? '<span style="font-size:22px;color:var(--verde)">➜</span>' : '') + '<div class="card green center bold" style="flex:1;padding:8px;font-size:14px">' + s + '</div>';
    }).join('') + '</div>' +
  '<p class="mt6"><b>¿Qué es Educational Data Mining (EDM)?</b> La minería de datos educativos (EDM) se ha utilizado ampliamente para analizar patrones académicos estudiantiles mediante la aplicación de técnicas de machine learning, como Regresión Logística, Árboles de Decisión, Random Forest y Máquinas de Vectores de Soporte ' + cite('Wijayanti et al., 2026') + '.</p>' +
  '<div class="row mt10">' +
    '<div class="grow"><h3>Algoritmos principales <span class="small muted" style="font-weight:400">— toca cada tarjeta</span></h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      ALGOS.map(function (a) { return '<div class="flip" tabindex="0" role="button" aria-label="' + a[1] + '"><div class="flip-in"><div class="f"><span class="ic">' + a[0] + '</span><strong>' + a[1] + '</strong><em>' + a[2] + ' · clic para ver</em></div><div class="b">' + a[3] + '</div></div></div>'; }).join('') + '</div></div>' +
    '<div class="card" style="width:400px"><h3 style="font-size:14px">📊 Precisión promedio por algoritmo</h3>' +
      '<div class="vbars" style="height:170px">' + [['79.3', 79.3], ['86.2', 86.2], ['87.4', 87.4], ['88.1', 88.1]].map(function (v, k) {
        return '<div class="vbar"><span class="num">' + v[0] + '%</span><div class="v ' + (k === 3 ? 'hl' : '') + '" data-h="' + ((v[1] - 60) / 30 * 100) + '"></div></div>'; }).join('') + '</div>' +
      '<div class="vlabels"><span>RL</span><span>RF</span><span>XGBoost</span><span style="color:var(--verde)">Stacking</span></div>' +
      '<p class="small muted mt6">Eje recortado desde 60%. Fuente: Lopez-Muñoz et al. (2026).</p></div></div>' +
  '<div class="row mt10" style="align-items:center">' +
    '<div class="acc-item grow" style="margin:0"><button aria-expanded="false">➕ Más allá de los clásicos <span>▾</span></button><div class="acc-body"><ul style="padding-left:18px;font-size:13.5px;line-height:1.5">' +
      '<li><b>Aprendizaje profundo:</b> combinando modelos de AutoKeras con votación por mayoría, la exactitud subió de 66.67% a 73% ' + cite('Cheng & Lin, 2026') + '.</li>' +
      '<li><b>Aprendizaje no supervisado:</b> al agrupar estudiantes según sus registros en Moodle con BIRCH, DBSCAN y GMM aparecieron dos clústeres de alto riesgo con las mayores tasas de deserción ' + cite('Pecuchova & Drlik, 2024') + '.</li></ul></div></div>' +
    '<div class="card gray" style="width:400px;padding:8px 12px"><div class="small bold">⏳ Evolución del campo ' + cite('Radulescu & Balas, 2026') + '</div><div class="small" style="margin-top:3px">Minería de datos → Ensambles → Deep Learning → XAI</div><button class="info-btn mt6" data-info="evolucion">+info</button></div></div>';
};
INFO.evolucion = '<h3>Evolución del campo</h3><p>El campo ha mostrado maduración algorítmica sustancial. Los trabajos iniciales empleaban regresión logística y árboles de decisión con precisiones del 74-83%. La investigación contemporánea ha migrado hacia métodos ensemble, con Random Forest presente en aproximadamente el 81% de los estudios ' + cite('Lopez-Muñoz et al., 2026') + '.</p><p>Un análisis bibliométrico muestra el paso de la clasificación y la minería de datos genérica hacia el aprendizaje profundo, el gradient boosting y la IA explicable ' + cite('Radulescu & Balas, 2026') + '.</p>';
SCREEN_INIT.p05 = function (el) { el.querySelectorAll('.flip').forEach(function (f) { f.onclick = function () { f.classList.toggle('on'); }; f.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.click(); } }; }); };
SCREEN_ENTER.p05 = animate;

/* ================= P6 · ACTIVIDAD MCQ ================= */
var P6_Q = [
  { q: '¿Cuál es el algoritmo de ML más utilizado en estudios de predicción de deserción según la revisión sistemática de Lopez-Muñoz et al. (2026)?', o: ['XGBoost', 'Random Forest', 'Redes Neuronales', 'Regresión Logística'], a: 1, e: 'Random Forest aparece en el 81.3% de los estudios revisados; XGBoost lo supera en precisión, pero se usa menos (45.3%) ' + cite('Lopez-Muñoz et al., 2026') + '.' },
  { q: '¿Qué técnica permite combinar SVM y XGBoost en una arquitectura por niveles para mejorar la predicción?', o: ['Bagging', 'Boosting', 'Stacking Ensemble', 'K-Nearest Neighbors'], a: 2, e: 'El stacking apila modelos: las predicciones de un nivel alimentan a un modelo superior. Bagging y boosting combinan modelos del mismo tipo, y KNN es un clasificador individual.' },
  { q: '¿Cuál es la precisión promedio más alta entre algoritmos individuales según la revisión sistemática?', o: ['Random Forest: 86.2%', 'XGBoost: 87.4%', 'Regresión Logística: 79.3%', 'Redes Neuronales: 82.8%'], a: 1, e: 'XGBoost logra 87.4% en promedio. El stacking llega a 88.1%, pero no es un algoritmo individual sino una combinación ' + cite('Lopez-Muñoz et al., 2026') + '.' }
];
SCREEN_HTML.p06 = function () {
  return '<h2 class="sc-title"><small>Módulo 3 · Actividad</small>Algoritmos de machine learning</h2>' +
  '<div class="row"><div class="grow p6-quiz"></div>' +
    '<div class="card gray" style="width:300px;opacity:.85;align-self:flex-start"><h3 style="font-size:13px;color:var(--gris)">Repaso: precisión promedio</h3>' +
      bars([['RL', 79.3, 100, 'gray'], ['RF', 86.2, 100, 'gray'], ['XGBoost', 87.4, 100, 'gray'], ['Stacking', 88.1, 100, 'gray']], 70) + '</div></div>';
};
SCREEN_INIT.p06 = function (el) {
  function start() {
    quiz(el.querySelector('.p6-quiz'), P6_Q, {
      onAnswer: function (ok) { App.brai(ok ? 'arriba' : 'barbilla', ok ? [] : ['pensar']); },
      onRender: function () { App.resetBrai(); },
      onEnd: function (s) {
        el.querySelector('.p6-quiz').innerHTML = '<div class="row" style="align-items:center;gap:22px">' + ring(Math.round(s / 3 * 100), s + '/3') +
          '<div class="grow"><h3>Resultado</h3><div class="feedback show ok"><b>Retroalimentación:</b> Random Forest es el más utilizado (81.3% de estudios), pero XGBoost logra una mayor precisión promedio (87.4%). Los ensambles stacking alcanzan 88.1% combinando fortalezas de múltiples modelos ' + cite('Lopez-Muñoz et al., 2026') + '.</div>' +
          '<button class="btn sec mt10 p6-retry">↺ Intentar de nuevo</button></div></div>';
        el.querySelector('.p6-retry').onclick = start;
        App.brai(s === 3 ? 'arriba' : 'pulgar', s === 3 ? [] : ['pulgar']);
      }
    });
  }
  start();
};
SCREEN_ENTER.p06 = animate;

/* ================= P7 · VARIABLES ================= */
SCREEN_HTML.p07 = function () {
  return '<h2 class="sc-title"><small>Módulo 4</small>Variables y factores predictivos</h2>' +
  '<div class="row">' +
    '<div class="card" style="width:500px"><h3 style="font-size:14.5px">📊 Factores más citados en los modelos <span class="small muted" style="font-weight:400">(revisión de 75 estudios)</span></h3>' +
      bars([['GPA del primer semestre', 97.3], ['Reprobación de materias', 96.0, 100, '', '96.0%'], ['Asistencia a clases', 88.0, 100, '', '88.0%'], ['Puntajes de admisión', 84.0, 100, '', '84.0%'], ['Restricciones financieras', 81.3], ['Estatus indígena / minoría', 8.0, 100, 'red', '8.0%'], ['Discapacidad', 5.3, 100, 'red']], 180) +
      '<p class="small muted mt6">Fuente: Lopez-Muñoz et al. (2026). En rojo, la brecha de equidad.</p>' +
      '<div class="row mt6" style="align-items:center"><p class="small grow"><b>Factores subrepresentados:</b> los psicosociales (autoeficacia, sentido de pertenencia, motivación y resiliencia) casi no se usan.</p><button class="info-btn" data-info="equidad">+info</button></div></div>' +
    '<div class="grow col"><h3>🔎 Lo que muestran estudios recientes <span class="small muted" style="font-weight:400">— clic para expandir</span></h3>' +
      [['🇸🇮 SI', 'Datos de matrícula', 'Usando solo datos de matrícula, los predictores más fuertes fueron el lugar de residencia y el programa cursado en secundaria; los estudiantes más jóvenes y los internacionales mostraron mayor riesgo ' + cite('Dermol & Skrbinjek, 2026') + '.'],
       ['🇲🇽 MX', 'Antes del primer día', 'Con información recogida antes del inicio de clases, pesaron más la edad, el promedio de bachillerato, la admisión condicionada y las responsabilidades familiares ' + cite('Carballo-Mendívil et al., 2025') + '.'],
       ['🔬 STEM', 'Carreras STEM', 'En carreras STEM destacaron los semestres retirados, la carga de créditos del segundo periodo, el historial de prueba académica y el desempeño en matemáticas y física ' + cite('Al Hashmi et al., 2025') + '.']].map(function (c) {
        return '<div class="acc-item" style="margin:0"><button aria-expanded="false"><span><span class="tag">' + c[0] + '</span> ' + c[1] + '</span><span>▾</span></button><div class="acc-body"><p style="font-size:13.5px">' + c[2] + '</p></div></div>';
      }).join('') +
      '<div class="card yellow row" style="align-items:center;gap:12px;padding:10px 12px">' +
        '<svg width="104" height="104" viewBox="0 0 42 42" aria-label="Gráfico de dona: 90% permanecen, 10% desertan"><circle cx="21" cy="21" r="15.9" fill="none" stroke="#9fd3b5" stroke-width="7"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="#d64545" stroke-width="7" stroke-dasharray="10 90" stroke-dashoffset="25"/><text x="21" y="20" text-anchor="middle" font-size="6" font-weight="800" fill="#16361f">1 de</text><text x="21" y="27" text-anchor="middle" font-size="6" font-weight="800" fill="#16361f">cada 10</text></svg>' +
        '<div class="grow"><b>Desbalance de clases</b><p style="font-size:13px">La proporción entre desertores y no desertores puede ser de 1:9.37 ' + cite('Wijayanti et al., 2026') + ' o incluso de 7:93 ' + cite('Hidayat et al., 2026') + ', lo que dificulta detectar al grupo minoritario. El 71% de los estudios aborda este desbalance con remuestreo, pesos de clase o sobremuestreo sintético como SMOTE ' + cite('Lopez-Muñoz et al., 2026') + '.</p></div></div>' +
    '</div></div>';
};
INFO.equidad = '<h3>Factores subrepresentados y equidad</h3><p>Los factores psicosociales (autoeficacia, sentido de pertenencia, motivación y resiliencia) casi no se usan; el estatus indígena o de minoría aparece solo en el 8.0% de los estudios y la discapacidad en el 5.3% ' + cite('Lopez-Muñoz et al., 2026') + '.</p><p>Los estudiantes de contextos subrepresentados suelen enfrentar condiciones desiguales para tener éxito ' + cite('Lopes et al., 2026') + '.</p>';
SCREEN_ENTER.p07 = animate;

/* ================= P8 · ORDENAR ================= */
var P8_ITEMS = [['gpa', 'GPA del primer semestre', '97.3%'], ['rep', 'Reprobación de materias', '96.0%'], ['asi', 'Asistencia a clases', '88.0%'], ['adm', 'Puntajes de admisión', '84.0%'], ['fin', 'Restricciones financieras', '81.3%']];
SCREEN_HTML.p08 = function () {
  return '<h2 class="sc-title"><small>Módulo 4 · Actividad</small>Identificación de variables predictivas</h2>' +
  '<div class="instr">↕️ <b>Ordenar por importancia:</b> ordena las siguientes variables de mayor a menor frecuencia de uso en modelos de predicción de deserción, según la evidencia de la revisión sistemática. <span class="muted">Arrastra las fichas o usa las flechas ▲▼.</span></div>' +
  '<div class="row">' +
    '<div style="width:70px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:var(--verde);padding:6px 0"><span>Más<br>usado</span><span style="flex:1;width:4px;background:linear-gradient(var(--verde),#cfe3d6);margin:6px 0;border-radius:2px;position:relative"></span><span style="color:var(--gris)">Menos<br>usado</span></div>' +
    '<ol class="p8-list" style="list-style:none;width:470px;display:flex;flex-direction:column;gap:9px"></ol>' +
    '<div class="grow"><div class="feedback p8-fb"></div></div></div>' +
  '<div class="row mt10" style="justify-content:flex-end;padding-right:6px"><button class="btn sec p8-reset">↺ Reiniciar</button><button class="btn p8-check">✔ Verificar orden</button></div>';
};
SCREEN_INIT.p08 = function (el) {
  var list = el.querySelector('.p8-list'), drag = null;
  function fill() {
    list.innerHTML = [2, 4, 0, 3, 1].map(function (k) { var it = P8_ITEMS[k];
      return '<li class="chip p8-item" draggable="true" data-id="' + it[0] + '" style="display:flex;align-items:center;gap:10px;font-size:15px;padding:11px 12px"><span style="color:var(--gris)">⋮⋮</span><span class="grow">' + it[1] + '</span><span class="pct hidden bold">' + it[2] + '</span><button class="pill ghost up" aria-label="Subir">▲</button><button class="pill ghost down" aria-label="Bajar">▼</button></li>'; }).join('');
    list.querySelectorAll('.p8-item').forEach(function (li) {
      li.addEventListener('dragstart', function () { drag = li; li.style.opacity = '.5'; });
      li.addEventListener('dragend', function () { li.style.opacity = ''; drag = null; });
      li.addEventListener('dragover', function (e) { e.preventDefault(); if (!drag || drag === li) return; var r = li.getBoundingClientRect(); list.insertBefore(drag, (e.clientY - r.top) > r.height / 2 ? li.nextSibling : li); });
      li.querySelector('.up').onclick = function () { if (li.previousElementSibling) list.insertBefore(li, li.previousElementSibling); };
      li.querySelector('.down').onclick = function () { if (li.nextElementSibling) list.insertBefore(li.nextElementSibling, li); };
    });
    el.querySelector('.p8-fb').className = 'feedback p8-fb';
  }
  fill();
  el.querySelector('.p8-reset').onclick = function () { fill(); App.resetBrai(); };
  el.querySelector('.p8-check').onclick = function () {
    var ok = 0;
    list.querySelectorAll('.p8-item').forEach(function (li, k) {
      var good = li.dataset.id === P8_ITEMS[k][0]; if (good) ok++;
      li.classList.toggle('ok', good); li.style.background = good ? '' : 'var(--naranja-claro)'; li.style.borderColor = good ? '' : 'var(--naranja)';
      li.querySelector('.pct').classList.remove('hidden');
    });
    var fb = el.querySelector('.p8-fb'), all = ok === 5;
    fb.className = 'feedback p8-fb show ' + (all ? 'ok' : 'bad');
    fb.innerHTML = all ? '<b>Retroalimentación correcta:</b> ¡Muy bien! Estos cinco factores forman el núcleo de la mayoría de modelos. Taqatqeh y Agoyi (2026) también encontraron que los promedios académicos (del programa, del semestre y acumulado) fueron las variables más predictivas. Sin embargo, la autoeficacia y otros factores psicosociales siguen subrepresentados ' + cite('Lopez-Muñoz et al., 2026') + '.'
      : '<b>Retroalimentación incorrecta (' + ok + '/5 en su lugar):</b> Revisa el orden. El GPA del primer semestre es el predictor más utilizado (97.3%), seguido por la reprobación de materias (96.0%) ' + cite('Lopez-Muñoz et al., 2026') + '. Las fichas en naranja están fuera de su posición.';
    App.brai(all ? 'arriba' : 'barbilla', all ? [] : ['pensar']);
  };
};

/* ================= P9 · MODELOS ================= */
var PIPE = [['📥', 'Ingesta y preprocesamiento', 'Limpieza e integración de los registros.'], ['🛠️', 'Ingeniería de características', 'Creación y selección de variables.'], ['✂️', 'Partición 80/20', 'Partición estratificada para entrenar y probar.'], ['⚖️', 'Benchmarking de 9 algoritmos', 'Comparación de modelos con las mismas métricas.'], ['🔍', 'Capa SHAP', 'Explicabilidad de cada predicción.'], ['📊', 'Reportes', 'Reportes y visualización para decidir.']];
var CAROUSEL = [
  ['SOD-FE', 'F1 98.09% / 98.33%', 'Detectar y tratar valores atípicos antes de entrenar permitió que Random Forest alcanzara un F1 de 98.09% y 98.33% en datos de Portugal y Eslovaquia.', 'Alzabidi et al., 2026'],
  ['MVNRA', 'AUC 0.9577', 'Añadir puntajes de riesgo neuronales por vistas (académica, contextual y digital) mejoró el AUC de seis clasificadores; Random Forest llegó a 0.9577 con 464,739 registros.', 'Yu et al., 2026'],
  ['cGAN', 'Exactitud 92.79%', 'Generar datos sintéticos con GAN condicionales elevó la exactitud a 92.79%, 15.46 puntos más que sin aumento de datos.', 'Silkhi et al., 2025'],
  ['Solo matrícula', 'AUC 0.961', 'Con datos de matrícula, Random Forest logró un AUC de 0.961.', 'Dermol & Skrbinjek, 2026'],
  ['Validación temporal', 'PR-AUC 0.8859', 'Validar con la validación cruzada aleatoria tradicional puede filtrar información del futuro e inflar los resultados. Al validar por cohortes, CatBoost obtuvo un PR-AUC de 0.8859.', 'Hidayat et al., 2026']
];
SCREEN_HTML.p09 = function () {
  return '<h2 class="sc-title" style="margin-bottom:6px"><small>Módulo 5</small>Modelos de predicción — arquitecturas y rendimiento</h2>' +
  '<div class="row" style="align-items:stretch;gap:6px">' + PIPE.map(function (p, k) {
    return (k ? '<span style="align-self:center;color:var(--verde);font-weight:800">›</span>' : '') + '<div class="card green center pipe" tabindex="0" title="' + p[2] + '" style="flex:1;padding:6px;font-size:12.5px;position:relative"><div style="font-size:20px">' + p[0] + '</div><b>' + (k + 1) + '. ' + p[1] + '</b><div class="pipe-tip small" style="display:none;position:absolute;left:0;right:0;top:100%;margin-top:4px;background:var(--tinta);color:#fff;border-radius:8px;padding:6px;z-index:5">' + p[2] + '</div></div>';
  }).join('') + '</div>' +
  '<p class="small mt6">Bettahi et al. (2025) proponen un pipeline de seis etapas: (1) ingesta y preprocesamiento, (2) ingeniería de características, (3) partición estratificada 80/20, (4) comparación de 9 algoritmos, (5) capa de explicabilidad SHAP y (6) reportes y visualización.</p>' +
  '<div class="row mt6">' +
    '<div class="card" style="width:520px;padding:10px 12px"><h3 style="font-size:14px">Comparativa de rendimiento ' + cite('Bettahi et al., 2025') + ' <span class="small muted" style="font-weight:400">— 17,883 registros y 91 características</span></h3>' +
      '<table style="width:100%;border-collapse:collapse;font-size:13.5px"><thead><tr style="background:var(--gris-claro)"><th style="text-align:left;padding:5px 8px">Modelo</th><th>AUC-ROC</th><th>F1</th><th>Recall</th></tr></thead><tbody>' +
      [['🥇 XGBoost (mejor modelo)', '0.993', '0.911', '0.944', 1], ['Random Forest', '0.989', '0.898', '0.877'], ['Gradient Boosting', '0.988', '0.881', '0.855'], ['MLP (red neuronal)', '0.979', '0.888', '0.884']].map(function (r) {
        return '<tr style="' + (r[4] ? 'background:var(--verde-claro);font-weight:700' : '') + ';border-bottom:1px solid var(--borde)"><td style="padding:5px 8px">' + r[0] + '</td><td class="center">' + r[1] + '</td><td class="center">' + r[2] + '</td><td class="center">' + r[3] + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
    '<div class="card grow" style="padding:10px 12px"><h3 style="font-size:14px">Antes y después: recall</h3>' +
      '<div class="row" style="align-items:flex-end;gap:16px;height:112px">' +
        '<div class="vbar" style="height:100%"><span class="num">0.64</span><div class="v" data-h="64" style="background:#b8c4bd;width:70px"></div></div>' +
        '<span style="font-size:26px;color:var(--verde);align-self:center">➜</span>' +
        '<div class="vbar" style="height:100%"><span class="num">0.958</span><div class="v hl" data-h="96" style="width:70px"></div></div>' +
        '<p class="small grow" style="align-self:center">Un modelo híbrido SVM + XGBoost con SMOTE, aplicado a 3,652 estudiantes, obtuvo una exactitud de 0.971 y elevó el recall de 0.64 (SVM solo) a 0.958 ' + cite('Wijayanti et al., 2026') + '.</p></div>' +
      '<div class="vlabels" style="justify-content:flex-start;gap:58px;padding-left:4px"><span style="flex:0">SVM&nbsp;solo</span><span style="flex:0;white-space:nowrap">Híbrido&nbsp;+&nbsp;SMOTE</span></div></div></div>' +
  '<div class="row mt10" style="align-items:center">' +
    '<button class="pill ghost car-prev" aria-label="Anterior">‹</button>' +
    '<div class="card yellow grow car" style="min-height:74px;padding:9px 14px"></div>' +
    '<button class="pill ghost car-next" aria-label="Siguiente">›</button>' +
    '<div class="card gray" style="width:300px;padding:9px 12px;font-size:13px">⚠️ <b>Los modelos apoyan la decisión, no la reemplazan.</b> Deben entenderse como apoyo a la decisión, no como soluciones independientes ' + cite('Lopez-Muñoz et al., 2026') + '.</div></div>' +
  '<style>.pipe:hover .pipe-tip,.pipe:focus .pipe-tip{display:block!important}</style>';
};
SCREEN_INIT.p09 = function (el) {
  var k = 0, box = el.querySelector('.car');
  function show() { var c = CAROUSEL[k]; box.innerHTML = '<div class="row" style="align-items:center"><div style="min-width:170px"><span class="tag">' + (k + 1) + '/' + CAROUSEL.length + ' · ' + c[0] + '</span><div style="font-size:21px;font-weight:800;color:var(--tinta);margin-top:2px">' + c[1] + '</div></div><p style="font-size:13px" class="grow">' + c[2] + ' ' + cite(c[3]) + '</p></div>'; }
  el.querySelector('.car-prev').onclick = function () { k = (k + CAROUSEL.length - 1) % CAROUSEL.length; show(); };
  el.querySelector('.car-next').onclick = function () { k = (k + 1) % CAROUSEL.length; show(); };
  show();
};
SCREEN_ENTER.p09 = animate;

/* ================= P10 · ACTIVIDAD CASO ================= */
var P10_Q = [
  { q: '¿Qué métrica de evaluación debería priorizar la universidad?', o: ['Accuracy', 'Precision', 'Recall', 'Especificidad'], a: 2, e: 'El recall mide qué proporción de los desertores reales detecta el modelo. Con 12% de desertores, un modelo puede tener alta accuracy y aun así dejar escapar a muchos estudiantes en riesgo.' },
  { q: 'Si el dataset tiene 12% de desertores, ¿qué técnica se recomienda?', o: ['Usar más datos', 'SMOTE para balancear clases', 'Reducir variables', 'Usar solo regresión logística'], a: 1, e: 'SMOTE genera ejemplos sintéticos del grupo minoritario (desertores) para que el modelo aprenda a reconocerlo ' + cite('Wijayanti et al., 2026') + '.' }
];
SCREEN_HTML.p10 = function () {
  return '<h2 class="sc-title"><small>Módulo 5 · Actividad</small>Evaluación de modelos predictivos</h2>' +
  '<div class="row">' +
    '<div class="card green" style="width:40%;align-self:flex-start"><h3>🏛️ El caso</h3><p>Una universidad colombiana tiene 5,000 estudiantes y una tasa de deserción del 12%. Necesita implementar un modelo que detecte la mayor cantidad de estudiantes en riesgo, aceptando algunos falsos positivos.</p>' +
      '<div class="row mt10" style="gap:8px">' + [['5,000', 'estudiantes'], ['12%', 'de deserción'], ['🎯', 'detectar al máximo']].map(function (g) { return '<div style="flex:1;background:#fff;border-radius:40px;padding:10px 6px;text-align:center;border:2px solid var(--verde)"><b style="font-size:18px;color:var(--verde)">' + g[0] + '</b><div class="small">' + g[1] + '</div></div>'; }).join('') + '</div>' +
      '<div class="p10-matrix hidden mt10"><h3 style="font-size:14px">Matriz de confusión</h3><table style="width:100%;border-collapse:separate;border-spacing:4px;font-size:13px;text-align:center"><tr><td></td><td class="bold small">Predice: deserta</td><td class="bold small">Predice: permanece</td></tr>' +
        '<tr><td class="bold small">Real: deserta</td><td style="background:#dff3e6;border-radius:8px;padding:8px">VP<br><span class="small">detectado</span></td><td style="background:var(--rojo);color:#fff;border-radius:8px;padding:8px;font-weight:700">FN<br><span class="small">no detectado</span></td></tr>' +
        '<tr><td class="bold small">Real: permanece</td><td style="background:var(--amarillo-claro);border-radius:8px;padding:8px">FP<br><span class="small">alerta de más</span></td><td style="background:#dff3e6;border-radius:8px;padding:8px">VN</td></tr></table>' +
        '<p class="small mt6" style="color:var(--rojo);font-weight:700">Este es el error más costoso: un estudiante en riesgo que no detectamos.</p></div></div>' +
    '<div class="grow p10-quiz"></div></div>';
};
SCREEN_INIT.p10 = function (el) {
  function start() {
    quiz(el.querySelector('.p10-quiz'), P10_Q, {
      onAnswer: function (ok) { el.querySelector('.p10-matrix').classList.remove('hidden'); App.brai(ok ? 'arriba' : 'barbilla', ok ? ['gafas'] : ['gafas', 'pensar']); },
      onRender: function () { App.resetBrai(); },
      onEnd: function (s) {
        el.querySelector('.p10-quiz').innerHTML = '<div class="row" style="align-items:center;gap:20px">' + ring(s * 50, s + '/2') + '<div class="grow"><div class="feedback show ok"><b>Retroalimentación:</b> En deserción, el recall es prioritario porque no detectar a un estudiante en riesgo cuesta más que intervenir de forma innecesaria. Por esa razón, Carballo-Mendívil et al. (2025) eligieron XGBoost sobre Random Forest y lograron una sensibilidad del 88%. SMOTE balancea las clases para que el modelo aprenda mejor del grupo minoritario ' + cite('Wijayanti et al., 2026') + ', y ajustar el umbral de decisión también mejora la sensibilidad ante casos poco frecuentes ' + cite('Kwon, 2026') + '.</div><button class="btn sec mt10 p10-retry">↺ Intentar de nuevo</button></div></div>';
        el.querySelector('.p10-retry').onclick = start;
      }
    });
  }
  start();
};

/* ================= P11 · SAT ================= */
var CYCLE = [
  ['🗂️', 'Recolección de datos', 'Recolección de datos académicos, demográficos, financieros y del LMS. El plugin eOrientation para Moodle, probado con 279 estudiantes, es un ejemplo ' + cite('Sáiz-Manzanares et al., 2020') + '.'],
  ['🤖', 'Modelo predictivo', 'Modelo predictivo entrenado con datos históricos.'],
  ['🚦', 'Alertas por nivel', 'Alertas por nivel de riesgo. Esin y Kustitskaya (2026) clasifican a los estudiantes en rojo, amarillo y verde para asignar mejor los recursos de tutoría, y encontraron que tener actividad digital al inicio del semestre era la señal más fuerte de éxito.'],
  ['🤝', 'Intervención', 'Intervención. Muchos tableros se quedan en etiquetar al estudiante "en riesgo" sin proponer acciones ' + cite('Silkhi et al., 2025') + '; por eso algunos sistemas incorporan módulos de recomendación que identifican la causa del riesgo ' + cite('Taqatqeh & Agoyi, 2026') + '.'],
  ['📈', 'Monitoreo', 'Monitoreo y evaluación. El tablero EduGuard RetainX obtuvo un 89% de usabilidad ' + cite('Dia et al., 2025') + '.']
];
SCREEN_HTML.p11 = function () {
  return '<h2 class="sc-title" style="margin-bottom:4px"><small>Módulo 6</small>Sistemas de Alerta Temprana (SAT)</h2>' +
  '<p class="small"><b>¿Qué es un SAT?</b> Es una herramienta institucional que combina datos estudiantiles y modelos predictivos para identificar a tiempo a quienes están en riesgo de desertar y activar intervenciones antes de que el abandono ocurra ' + cite('Cannistrà et al., 2022') + '.</p>' +
  '<div class="row mt6" style="align-items:center;gap:4px">' + CYCLE.map(function (c, k) {
    return (k ? '<span style="color:var(--verde);font-weight:800">➜</span>' : '') + '<button class="card center cyc" data-k="' + k + '" style="flex:1;padding:7px 4px;border:2px solid var(--verde);background:#fff;font-size:13px"><div style="font-size:22px">' + c[0] + '</div><b>' + (k + 1) + '. ' + c[1] + '</b></button>';
  }).join('') + '<span style="color:var(--verde);font-weight:800" title="El ciclo vuelve a empezar">↺</span></div>' +
  '<div class="card gray mt6 cyc-text small" style="min-height:52px;padding:8px 12px"><b>Componentes de un SAT basado en ML:</b> 👆 haz clic en cada paso del ciclo para ver su descripción.</div>' +
  '<div class="row mt10">' +
    '<div class="card" style="width:430px;padding:9px 12px"><h3 style="font-size:13.5px">🖥️ Ejemplo de tablero SAT <span class="small muted" style="font-weight:400">(ilustrativo)</span></h3><table style="width:100%;font-size:12.5px;border-collapse:collapse">' +
      [['Estudiante 014', 82, '#d64545'], ['Estudiante 102', 64, '#e8892a'], ['Estudiante 057', 51, '#f6c324'], ['Estudiante 233', 23, '#00843d'], ['Estudiante 089', 12, '#00843d']].map(function (s) {
        return '<tr style="border-bottom:1px solid var(--borde)"><td style="padding:4px 2px">' + s[0] + '</td><td style="width:55%"><div class="bar-track" style="height:12px"><div class="bar-fill" data-w="' + s[1] + '" style="background:' + s[2] + '"></div></div></td><td class="bold" style="text-align:right">' + s[1] + '%</td></tr>'; }).join('') + '</table></div>' +
    '<div class="card" style="width:250px;display:flex;gap:10px;padding:9px 12px"><div style="background:#2a2f2c;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:7px">' +
      ['#d64545', '#f6c324', '#00843d'].map(function (c) { return '<span style="width:26px;height:26px;border-radius:50%;background:' + c + ';display:block"></span>'; }).join('') + '</div>' +
      '<div class="small" style="display:flex;flex-direction:column;justify-content:space-around"><span><b>Alto:</b> tutoría inmediata</span><span><b>Medio:</b> seguimiento</span><span><b>Bajo:</b> monitoreo</span><span class="muted">' + cite('Esin & Kustitskaya, 2026') + '</span></div></div>' +
    '<div class="grow col" style="gap:8px">' +
      '<div class="card" style="background:var(--rojo-claro);border-color:var(--rojo);padding:7px 10px"><b style="color:var(--rojo);font-size:20px">71%</b> <span class="small">de los estudios no valida si las intervenciones funcionan</span></div>' +
      '<div class="card" style="background:var(--rojo-claro);border-color:var(--rojo);padding:7px 10px"><b style="color:var(--rojo);font-size:20px">42%</b> <span class="small">usa datos estáticos</span> <button class="info-btn" data-info="brecha">+info</button></div>' +
      '<div class="acc-item" style="margin:0"><button aria-expanded="false">🇨🇴 SPADIES <span>▾</span></button><div class="acc-body small">Colombia cuenta con el SPADIES, uno de los pocos ejemplos de monitoreo gubernamental sostenido en la región ' + cite('Lopez-Muñoz et al., 2026') + '.</div></div></div></div>';
};
INFO.brecha = '<h3>Brecha teoría–práctica</h3><p>El 71% de los estudios no valida empíricamente las intervenciones y el 42% ignora la dinámica temporal ' + cite('Lopez-Muñoz et al., 2026') + '.</p><p>En la Universidad Iscte de Lisboa, el apoyo solo llegó a una minoría de los estudiantes alertados y los modelos se transfirieron mal a la siguiente cohorte ' + cite('Lopes et al., 2026') + '.</p>';
SCREEN_INIT.p11 = function (el) {
  el.querySelectorAll('.cyc').forEach(function (b) {
    b.onclick = function () {
      el.querySelectorAll('.cyc').forEach(function (x) { x.style.background = '#fff'; });
      b.style.background = 'var(--verde-claro)';
      el.querySelector('.cyc-text').innerHTML = '<b>' + (+b.dataset.k + 1) + '. ' + CYCLE[b.dataset.k][1] + ':</b> ' + CYCLE[b.dataset.k][2];
    };
  });
};
SCREEN_ENTER.p11 = animate;

/* ================= P12 · ACTIVIDAD FLUJO SAT ================= */
var P12_SLOTS = [
  ['ini', 'Datos estudiantiles', null], ['fue', 'Fuentes de datos', ['aca', 'soc', 'lms']], ['pre', 'Preprocesamiento', null],
  ['mod', 'Modelo predictivo ML', ['ml']], ['cla', 'Clasificación de riesgo y alerta al tutor', ['dash']], ['int', 'Intervención personalizada', ['int']], ['seg', 'Seguimiento y evaluación', null]];
var P12_CHIPS = [['dash', '🚦 Dashboard de alertas por nivel de riesgo'], ['aca', '📚 Datos académicos (GPA, asistencia, aprobación)'], ['int', '🤝 Intervención: tutoría, apoyo financiero, consejería'], ['lms', '💻 Datos de LMS (interacciones, entregas)'], ['ml', '🤖 Modelo de ML entrenado (ej. XGBoost)'], ['soc', '💰 Datos socioeconómicos (becas, estrato)']];
SCREEN_HTML.p12 = function () {
  return '<h2 class="sc-title"><small>Módulo 6 · Actividad</small>Diseño de un SAT</h2>' +
  '<div class="instr">🧩 <b>Completar diagrama:</b> completa el flujo de un Sistema de Alerta Temprana arrastrando los componentes correctos en el orden adecuado. <span class="muted">Las casillas grises ya vienen como pistas.</span></div>' +
  '<div class="p12-flow row" style="gap:4px;align-items:stretch">' + P12_SLOTS.map(function (s, k) {
    var given = !s[2];
    return (k ? '<span class="arrow" style="align-self:center;color:var(--verde);font-size:20px;font-weight:800">➜</span>' : '') +
      '<div class="' + (given ? 'card gray' : 'drop') + '" data-slot="' + s[0] + '" style="flex:' + (s[0] === 'fue' ? 1.7 : 1) + ';min-height:150px;padding:7px;' + (given ? 'display:flex;align-items:center;justify-content:center;text-align:center' : '') + '">' +
      '<h4 class="small" style="color:' + (given ? 'var(--gris)' : 'var(--verde)') + ';justify-content:center;text-align:center">' + (given ? '✔ ' : '') + s[1] + '</h4>' + (given ? '' : '<div class="slot-in" style="display:flex;flex-direction:column;gap:5px"></div>') + '</div>';
  }).join('') + '</div>' +
  '<div class="bank row mt10" style="flex-wrap:wrap;gap:8px">' + P12_CHIPS.map(function (c) { return '<div class="chip" data-id="' + c[0] + '" style="font-size:12.5px">' + c[1] + '</div>'; }).join('') + '</div>' +
  '<div class="row mt10" style="justify-content:flex-end;align-items:center"><span class="p12-count bold" style="margin-right:auto;color:var(--verde)">0/6 componentes ubicados</span><button class="btn sec p12-reset">↺ Reiniciar</button><button class="btn p12-check">✔ Verificar</button></div>' +
  '<div class="feedback p12-fb"></div>' +
  '<style>.p12-flow .chip{font-size:11.5px;padding:5px 6px}.p12-flow.signal .arrow{animation:sig 1s ease}@keyframes sig{50%{color:var(--amarillo);transform:scale(1.6)}}</style>';
};
SCREEN_INIT.p12 = function (el) {
  var initial = el.querySelector('.bank').innerHTML;
  function count() { var n = el.querySelectorAll('.p12-flow .chip.ok').length; el.querySelector('.p12-count').textContent = n + '/6 componentes ubicados'; return n; }
  function setup() {
    makeDnD(el, function (chip, drop) { var s = P12_SLOTS.find(function (x) { return x[0] === drop.dataset.slot; }); return s && s[2] && s[2].indexOf(chip.dataset.id) >= 0; }, count);
  }
  setup();
  el.querySelector('.p12-check').onclick = function () {
    var ok = count() === 6, fb = el.querySelector('.p12-fb');
    fb.className = 'feedback p12-fb show ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = (ok ? '<b>¡Flujo completo!</b> ' : '<b>Aún faltan ' + (6 - count()) + ' componentes.</b> ') + 'Un SAT efectivo integra múltiples fuentes de datos, aplica modelos predictivos validados y traduce las predicciones en intervenciones concretas. La clave es cerrar el ciclo evaluando la efectividad de las intervenciones ' + cite('Lopez-Muñoz et al., 2026') + '.';
    if (ok) {
      var arrows = el.querySelectorAll('.p12-flow .arrow');
      arrows.forEach(function (a, k) { setTimeout(function () { a.style.animation = 'none'; void a.offsetWidth; a.style.animation = 'sig .6s ease'; }, k * 220); });
      App.brai('arriba', ['casco'], '¡Tu SAT está completo!');
    } else App.brai('barbilla', ['casco', 'pensar']);
  };
  el.querySelector('.p12-reset').onclick = function () {
    el.querySelectorAll('.p12-flow .chip').forEach(function (c) { c.remove(); });
    el.querySelector('.bank').innerHTML = initial; el.querySelector('.p12-fb').className = 'feedback p12-fb'; setup(); count(); App.resetBrai();
  };
};

/* ================= P13 · XAI ================= */
function waterfall() {
  var steps = [['Riesgo base', 30, 'base'], ['GPA bajo', 30], ['Inasistencia', 20], ['Situación financiera', 15], ['Tiene beca', -5], ['Actividad en LMS', -5], ['Estudiante A', 85, 'total']];
  var W = 430, x0 = 130, sc = (W - x0 - 20) / 100, y = 6, acc = 0, out = '<svg viewBox="0 0 ' + W + ' 200" style="width:100%" role="img" aria-label="Gráfica SHAP de cascada del Estudiante A">';
  for (var g = 0; g <= 100; g += 25) out += '<line x1="' + (x0 + g * sc) + '" y1="2" x2="' + (x0 + g * sc) + '" y2="180" stroke="#eef2ef"/><text x="' + (x0 + g * sc) + '" y="194" font-size="9" text-anchor="middle" fill="#6b7a72">' + g + '%</text>';
  steps.forEach(function (s) {
    var from, w, col, lbl;
    if (s[2] === 'base') { from = 0; w = s[1]; col = '#b8c4bd'; acc = s[1]; lbl = s[1] + '%'; }
    else if (s[2] === 'total') { from = 0; w = s[1]; col = '#16361f'; lbl = s[1] + '%'; }
    else { from = s[1] > 0 ? acc : acc + s[1]; w = Math.abs(s[1]); col = s[1] > 0 ? '#d64545' : '#2f6fd6'; acc += s[1]; lbl = (s[1] > 0 ? '+' : '') + s[1]; }
    out += '<text x="' + (x0 - 6) + '" y="' + (y + 15) + '" font-size="11" text-anchor="end" fill="#24312a" font-weight="' + (s[2] ? 700 : 400) + '">' + s[0] + '</text>' +
      '<rect x="' + (x0 + from * sc) + '" y="' + (y + 4) + '" width="' + (w * sc) + '" height="16" rx="3" fill="' + col + '"/>' +
      '<text x="' + (x0 + (from + w) * sc + 4) + '" y="' + (y + 16) + '" font-size="10.5" font-weight="700" fill="' + col + '">' + lbl + '</text>';
    y += 25;
  });
  return out + '</svg>';
}
SCREEN_HTML.p13 = function () {
  return '<h2 class="sc-title" style="margin-bottom:6px"><small>Módulo 7</small>Explicabilidad e interpretabilidad (XAI)</h2>' +
  '<div class="row" style="align-items:center">' +
    '<div class="card row" style="align-items:center;gap:10px;padding:8px 12px"><div style="width:58px;height:50px;background:#1b1f1d;border-radius:8px;color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center">?</div><span class="small bold">Modelo sin<br>explicación</span>' +
      '<span style="font-size:22px;color:var(--verde)">➜</span><div style="width:58px;height:50px;background:rgba(170,225,255,.45);border:2px solid #7fb6d6;border-radius:8px;font-size:24px;display:flex;align-items:center;justify-content:center">⚙️</div><span class="small bold">Modelo<br>con XAI</span></div>' +
    '<p class="grow small"><b>¿Por qué necesitamos XAI?</b> Modelos como CatBoost identifican bien a los estudiantes en riesgo usando solo datos previos al ingreso, pero no explican sus decisiones; la XAI permite explicarlas de forma global y local, lo que abre la puerta a intervenciones personalizadas como cursos remediales o tutorías ' + cite('Nagy & Molontay, 2024') + '.</p></div>' +
  '<div class="row mt10">' +
    '<div class="card" style="width:450px;padding:9px 12px"><h3 style="font-size:14px">Gráfica SHAP de cascada · Estudiante A (ficticio) — riesgo 85%</h3>' + waterfall() +
      '<p class="small"><span style="color:#d64545;font-weight:700">■ sube el riesgo</span> &nbsp; <span style="color:#2f6fd6;font-weight:700">■ baja el riesgo</span></p></div>' +
    '<div class="grow tabs-wrap"><div class="tabs"><button class="tab on" data-tab="shap">SHAP</button><button class="tab" data-tab="lime">LIME</button><button class="tab" data-tab="fi">Feature Importance</button></div>' +
      '<div class="tab-panel" style="min-height:190px">' +
        '<div data-panel="shap" class="on"><p>🎲 <b>SHAP:</b> basado en la teoría de juegos cooperativos, reparte la predicción individual entre las variables y cumple propiedades de precisión local, ausencia y consistencia ' + cite('Bettahi et al., 2025') + '.</p><p class="small muted mt6">Ejemplo: la cascada de la izquierda.</p></div>' +
        '<div data-panel="lime"><p>🔦 <b>LIME:</b> genera explicaciones locales aproximando el comportamiento del modelo alrededor de un estudiante específico ' + cite('Nagy & Molontay, 2024') + '.</p>' + bars([['GPA bajo', 70, 100, 'red', '+'], ['Inasistencia', 48, 100, 'red', '+'], ['Beca', 15, 100, 'gray', '−']], 95) + '</div>' +
        '<div data-panel="fi"><p>📊 <b>Importancia por permutación y gráficos de dependencia parcial:</b> muestran qué variables pesan más a nivel global ' + cite('Nagy & Molontay, 2024') + '.</p>' + bars([['GPA', 90, 100, '', ' '], ['Reprobadas', 72, 100, '', ' '], ['Asistencia', 55, 100, '', ' ']], 95) + '</div>' +
      '</div><div class="mt6"><button class="info-btn" data-info="xai2">+info: modelos interpretables y confiabilidad</button></div></div></div>' +
  '<div class="row mt10" style="align-items:center">' +
    '<div class="row" style="align-items:center;gap:10px">' + ring(24, '24%') + '<p class="small bold" style="width:170px">de los estudios recientes usa SHAP o LIME ' + cite('Lopez-Muñoz et al., 2026') + '</p></div>' +
    '<div class="card yellow grow" style="padding:9px 12px"><b class="small">El campo aún enfrenta cuatro brechas ' + cite('Radulescu & Balas, 2026') + ':</b><div class="row mt6" style="gap:6px;flex-wrap:wrap">' +
      ['🔎 Interpretabilidad', '🔁 Transferibilidad', '⚖️ Equidad', '🏗️ Implementación'].map(function (b) { return '<span class="tag" style="background:#fff;font-size:12.5px">' + b + '</span>'; }).join('') + '</div></div></div>';
};
INFO.xai2 = '<h3>Más allá de SHAP</h3><p><b>Modelos interpretables por diseño:</b> las Explainable Boosting Machines lograron un F1 de 97.81% y, combinadas con modelos ocultos de Markov, anticiparon la deserción 2.60 semestres antes ' + cite('Pacheco & Pedroso, 2026') + '.</p><h3>Confiabilidad de las explicaciones</h3><p>Calibrar las probabilidades y medir la incertidumbre hace que las predicciones sean más confiables para decidir ' + cite('Elmasry et al., 2026; Kwon, 2026') + '. Las explicaciones contrafactuales, del tipo "qué tendría que cambiar para bajar el riesgo", llevan el análisis de lo predictivo a lo prescriptivo ' + cite('Hidayat et al., 2026') + '. En Arabia Saudita, un modelo profundo con SHAP alcanzó 95.6% de exactitud ' + cite('Vo et al., 2026') + '.</p>';
SCREEN_ENTER.p13 = animate;

/* ================= P14 · ACTIVIDAD SHAP ================= */
function beeswarm() {
  var vars = [['GPA primer semestre', -1, .34], ['Materias reprobadas', 1, .26], ['Asistencia', -1, .18], ['Situación financiera', 1, .14], ['Interacciones LMS', -1, .10]];
  var W = 560, H = 290, x0 = 150, xc = x0 + (W - x0 - 20) / 2, sx = (W - x0 - 20) / 2 / .4, r = rnd(11), out = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%" role="img" aria-label="Gráfico SHAP de dispersión con 5 variables">';
  out += '<line x1="' + xc + '" y1="6" x2="' + xc + '" y2="' + (H - 34) + '" stroke="#9aa7a0" stroke-dasharray="4 3"/>';
  [-.4, -.2, 0, .2, .4].forEach(function (v) { out += '<text x="' + (xc + v * sx) + '" y="' + (H - 20) + '" font-size="10" text-anchor="middle" fill="#6b7a72">' + v.toFixed(1) + '</text>'; });
  out += '<text x="' + xc + '" y="' + (H - 4) + '" font-size="11" text-anchor="middle" fill="#24312a">Impacto en el riesgo de deserción (valor SHAP) → más riesgo</text>';
  vars.forEach(function (v, k) {
    var y = 22 + k * 50;
    out += '<g class="bee-row" data-k="' + k + '"><rect class="bee-hl" x="2" y="' + (y - 20) + '" width="' + (W - 4) + '" height="40" rx="8" fill="transparent"/><text x="' + (x0 - 8) + '" y="' + (y + 4) + '" font-size="12" text-anchor="end" fill="#24312a" font-weight="600">' + v[0] + '</text>';
    for (var i = 0; i < 44; i++) {
      var f = r(), sh = v[1] * (f - .5) * 2 * v[2] + (r() - .5) * .04, jitter = (r() - .5) * 22;
      var R = Math.round(47 + f * (214 - 47)), G = Math.round(111 + f * (69 - 111)), B = Math.round(214 + f * (69 - 214));
      out += '<circle cx="' + (xc + sh * sx) + '" cy="' + (y + jitter) + '" r="4" fill="rgb(' + R + ',' + G + ',' + B + ')" opacity=".85"/>';
    }
    out += '</g>';
  });
  out += '<defs><linearGradient id="lg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f6fd6"/><stop offset="1" stop-color="#d64545"/></linearGradient></defs>' +
    '<rect x="' + (W - 12) + '" y="10" width="8" height="200" fill="url(#lg)" rx="3"/><text x="' + (W - 16) + '" y="18" font-size="9" text-anchor="end" fill="#d64545">alto</text><text x="' + (W - 16) + '" y="210" font-size="9" text-anchor="end" fill="#2f6fd6">bajo</text>';
  return out + '</svg>';
}
var P14_Q = [{ q: '¿Qué factor protector es el más fuerte?', o: ['Asistencia a clases', 'GPA del primer semestre', 'Interacciones en LMS', 'Becas financieras'], a: 1, e: 'En SHAP, las variables con mayor valor absoluto tienen más impacto en la predicción. El GPA presenta la correlación negativa más fuerte con la deserción (r = −0.80), por lo que es el factor protector más poderoso ' + cite('Wijayanti et al., 2026') + '. En otros estudios, el GPA del semestre anterior y la actividad en el LMS también aparecen entre los indicadores SHAP más relevantes ' + cite('Esin & Kustitskaya, 2026') + '. "Becas" no aparece en el gráfico.' }];
SCREEN_HTML.p14 = function () {
  return '<h2 class="sc-title"><small>Módulo 7 · Actividad</small>Interpretación SHAP</h2>' +
  '<div class="row">' +
    '<div class="card p14-chart" style="width:60%;padding:8px 10px"><div class="row" style="justify-content:space-between;align-items:center"><h3 style="font-size:14px">Gráfico SHAP (beeswarm) de un modelo XGBoost</h3><button class="info-btn" data-info="leershap">💡 ¿Cómo leer este gráfico?</button></div>' + beeswarm() +
      '<p class="small muted">Gráfica ilustrativa creada para la actividad. Variables ordenadas por importancia SHAP: GPA primer semestre (mayor impacto negativo = protector), materias reprobadas (impacto positivo = riesgo), asistencia (protector), situación financiera (riesgo), interacciones LMS (protector).</p></div>' +
    '<div class="grow p14-side"><p class="small">Analiza el gráfico y responde:</p><div class="p14-quiz"></div></div></div>';
};
INFO.leershap = '<h3>¿Cómo leer un gráfico SHAP beeswarm?</h3><ol><li><b>Las variables de arriba pesan más:</b> están ordenadas de mayor a menor importancia.</li><li><b>A la derecha del 0, el riesgo aumenta;</b> a la izquierda, disminuye.</li><li><b>El color indica el valor de la variable:</b> rojo = valor alto, azul = valor bajo. Si los puntos rojos están a la izquierda, un valor alto de esa variable protege contra la deserción.</li></ol>';
SCREEN_INIT.p14 = function (el) {
  function start() {
    el.querySelectorAll('.bee-hl').forEach(function (r) { r.setAttribute('fill', 'transparent'); });
    quiz(el.querySelector('.p14-quiz'), P14_Q, {
      fs: 17,
      onAnswer: function (ok) {
        el.querySelector('.bee-row[data-k="0"] .bee-hl').setAttribute('fill', 'rgba(246,195,36,.28)');
        App.brai(ok ? 'arriba' : 'lupa', ok ? [] : ['lupa', 'pensar']);
      },
      onEnd: function (s) { el.querySelector('.p14-quiz').insertAdjacentHTML('beforeend', ''); var b = el.querySelector('.p14-quiz .next-q'); },
      onRender: function () { App.resetBrai(); }
    });
    var nb = el.querySelector('.p14-quiz .next-q'); if (nb) { nb.textContent = '↺ Intentar de nuevo'; nb.onclick = start; }
  }
  start();
};

/* ================= P15 · LATINOAMÉRICA ================= */
function latamMap() {
  function P(lon, lat) { return [((lon + 120) * 3.4).toFixed(1), ((33 - lat) * 3.9).toFixed(1)]; }
  var outline = [[-117, 32.5], [-114.7, 30], [-112, 26], [-110, 23], [-105.5, 20], [-103, 18], [-97, 15.8], [-92, 14.5], [-88, 13], [-85.7, 11], [-83.5, 8.5], [-80, 7.5], [-78.8, 1.5], [-80.5, -1], [-81.2, -5], [-76.5, -14], [-70.3, -18.5], [-70.5, -25], [-71.5, -32], [-73.5, -40], [-74.5, -48], [-75, -52], [-71, -54], [-68.5, -55], [-65.5, -55], [-67, -51], [-65.5, -45], [-62, -39], [-57.5, -37.5], [-58.5, -34.5], [-53, -33.5], [-48.5, -26], [-45, -23.5], [-40, -21], [-39, -15], [-37, -10], [-35, -6], [-35, -5], [-39, -3], [-44, -2.3], [-50, 0], [-51, 4], [-54, 6], [-57.5, 6], [-60, 8.5], [-62, 10.7], [-66, 10.6], [-71.5, 12.2], [-75, 10.8], [-77, 8.7], [-79.5, 9.4], [-82.5, 9.5], [-83.5, 11], [-83.4, 15], [-86, 16], [-88.3, 16], [-88.2, 18.5], [-87, 21.5], [-90.4, 21.2], [-91.5, 18.6], [-94.5, 18.2], [-96, 19.5], [-97.5, 22], [-97.2, 25.8], [-99.5, 27.5], [-101.4, 29.8], [-103, 29], [-104.5, 29.8], [-106.5, 31.8], [-108.2, 31.3], [-111, 31.3], [-114.8, 32.5]];
  var cuba = [[-84.9, 21.9], [-82, 23.1], [-79, 22.4], [-76, 21.2], [-74.2, 20.2], [-77.5, 19.9], [-80, 21.5], [-83, 22]];
  var path = function (pts) { return 'M' + pts.map(function (p) { return P(p[0], p[1]).join(' '); }).join(' L') + ' Z'; };
  var out = '<svg viewBox="0 0 300 350" style="width:100%;height:100%" role="img" aria-label="Mapa esquemático de América Latina con los casos de estudio">' +
    '<path d="' + path(outline) + '" fill="#cfe9d9" stroke="#00843d" stroke-width="1.2"/><path d="' + path(cuba) + '" fill="#cfe9d9" stroke="#00843d" stroke-width="1.2"/>';
  PINS.forEach(function (p, k) { var c = P(p[1], p[2]); out += '<g class="pin" data-k="' + k + '" tabindex="0" role="button" aria-label="' + p[0] + '" style="cursor:pointer"><circle cx="' + (+c[0] + p[3]) + '" cy="' + (+c[1] + p[4]) + '" r="8.5" fill="' + p[5] + '" stroke="#fff" stroke-width="2"/><text x="' + (+c[0] + p[3]) + '" y="' + (+c[1] + p[4] + 3.5) + '" font-size="9.5" font-weight="800" text-anchor="middle" fill="#fff">' + (k + 1) + '</text></g>'; });
  return out + '</svg>';
}
var PINS = [
  ['México · Tec de Monterrey', -100.3, 25.7, 0, 0, '#d64545', 'El Tecnológico de Monterrey publicó un conjunto de datos abierto con 143,326 registros y 50 variables de 121,584 estudiantes para impulsar la investigación ' + cite('Alvarado-Uribe et al., 2022') + '.'],
  ['México · Sonora (2025)', -109.9, 27.5, -8, -4, '#e8892a', 'En una universidad pública mexicana, un SAT con XGBoost entrenado con datos de matrícula de casi 40,000 estudiantes alcanzó un 88% de sensibilidad y marcó al 59% de los nuevos estudiantes como de alto riesgo ' + cite('Carballo-Mendívil et al., 2025') + '.'],
  ['México · Sonora (2026)', -109.9, 27.5, 9, 6, '#e8892a', 'Con más de 46,000 registros y constructos teóricos validados, un Random Forest calibrado obtuvo un recall de 0.743 ' + cite('Carballo-Mendívil et al., 2026') + '.'],
  ['Cuba · Ingeniería Informática', -82.4, 23.1, 0, 0, '#2f6fd6', 'En Ingeniería Informática en Cuba, la exactitud pasó de 68.86% con datos de matrícula a 93.85% tras el primer semestre ' + cite('Lázaro Alvarez et al., 2020') + '.'],
  ['Colombia · Medellín', -75.6, 6.25, -10, -6, '#00843d', 'En Medellín, al transformar 281,415 registros en representaciones visuales, una red neuronal convolucional alcanzó una exactitud de 0.87 y superó a los modelos tradicionales ' + cite('Briñez-De-León et al., 2025') + '.'],
  ['Colombia · Pereira', -75.7, 4.8, 9, -2, '#00843d', 'En la Universidad Tecnológica de Pereira, un SAT para estudiantes de primer semestre (6,617 estudiantes y 26 variables) detectó a los estudiantes en riesgo con una sensibilidad del 61.97% ' + cite('Hoyos Osorio & Daza Santacoloma, 2023') + '.'],
  ['Colombia · Popayán', -76.6, 2.45, -6, 8, '#0b5a2e', 'La revisión sistemática más completa del tema proviene de la Universidad del Cauca ' + cite('Lopez-Muñoz et al., 2026') + '.']
];
SCREEN_HTML.p15 = function () {
  return '<h2 class="sc-title" style="margin-bottom:6px"><small>Módulo 8</small>Casos de estudio en Latinoamérica</h2>' +
  '<div class="row" style="align-items:center">' +
    '<svg width="76" height="76" viewBox="0 0 42 42" aria-label="Dona: 67% de la investigación proviene de Américas y Europa"><circle cx="21" cy="21" r="15.9" fill="none" stroke="#e5ebe7" stroke-width="7"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="#00843d" stroke-width="7" stroke-dasharray="67 33" stroke-dashoffset="25"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="#d64545" stroke-width="7" stroke-dasharray="6.7 93.3" stroke-dashoffset="-42"/><text x="21" y="24" text-anchor="middle" font-size="8" font-weight="800" fill="#16361f">67%</text></svg>' +
    '<p class="grow small"><b>Contexto regional:</b> el 67% de la investigación sobre predicción de deserción proviene de las Américas y Europa <span style="color:var(--verde)">■</span>, y solo el 6.7% de Medio Oriente y África <span style="color:var(--rojo)">■</span>; las regiones con mayor deserción, entre ellas partes de América Latina, siguen subrepresentadas ' + cite('Lopez-Muñoz et al., 2026') + '. Además, el 68% de los estudios usa datos de una sola institución, lo que limita la generalización.</p></div>' +
  '<div class="row mt6">' +
    '<div class="card" style="width:330px;height:330px;padding:6px;position:relative">' + latamMap() + '<span class="small muted" style="position:absolute;bottom:6px;left:10px">Mapa esquemático · toca los pines</span></div>' +
    '<div class="grow col" style="gap:8px">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12.5px"><thead><tr style="background:var(--verde);color:#fff"><th style="padding:5px">#</th><th style="text-align:left">País</th><th style="text-align:left">Datos</th><th style="text-align:left">Modelo</th><th style="text-align:left">Resultado</th></tr></thead><tbody>' +
        [['1', 'México', '143,326 registros', 'Dataset abierto', '50 variables'], ['2', 'México', '~40,000 estudiantes', 'XGBoost', 'Sensibilidad 88%'], ['3', 'México', '+46,000 registros', 'RF calibrado', 'Recall 0.743'], ['4', 'Cuba', '456 estudiantes', 'Árboles y redes', '68.86% → 93.85%'], ['5', 'Colombia', '281,415 registros', 'CNN', 'Exactitud 0.87'], ['6', 'Colombia', '6,617 estudiantes', 'SAT 1er semestre', 'Sensibilidad 61.97%']].map(function (r) {
          return '<tr class="p15-row" data-k="' + (r[0] - 1) + '" style="border-bottom:1px solid var(--borde);cursor:pointer"><td class="center bold" style="padding:4px">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td class="bold">' + r[4] + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<div class="card gray p15-detail small" style="min-height:60px;padding:8px 12px">👆 Toca un pin del mapa o una fila de la tabla para ver el detalle del estudio.</div>' +
      '<div class="card" style="padding:8px 12px"><b class="small">⏱️ La predicción mejora con el tiempo (Cuba)</b><div class="row mt6" style="align-items:center;gap:6px">' +
        [['Matrícula', '68.86%'], ['Fin 1er semestre', '93.85%'], ['Fin 1er año (todas las variables)', '96.71%']].map(function (t, k) { return (k ? '<span style="color:var(--verde);font-weight:800">➜</span>' : '') + '<div class="center" style="flex:1"><b style="color:var(--verde);font-size:17px">' + t[1] + '</b><div class="small muted">' + t[0] + '</div></div>'; }).join('') + '</div>' +
        '<p class="small muted">Mientras más datos, mejor; pero desde el día uno ya se puede alertar ' + cite('Lázaro Alvarez et al., 2020') + '.</p></div>' +
      '<div class="card green" style="padding:8px 12px"><p class="small">🇨🇴 <b>Colombia y el SPADIES:</b> el SPADIES ofrece una base nacional para integrar estas técnicas, y la revisión sistemática más completa del tema proviene de la Universidad del Cauca ' + cite('Lopez-Muñoz et al., 2026') + '. <button class="info-btn" data-info="primeranio">+info: el primer año</button></p></div>' +
    '</div></div>';
};
INFO.primeranio = '<h3>El primer año como periodo crítico</h3><p>El primer año concentra la mayor parte del fracaso y la deserción, porque es cuando las exigencias académicas y sociales son más intensas ' + cite('Lopes et al., 2026') + '.</p>';
SCREEN_INIT.p15 = function (el) {
  function show(k) { var p = PINS[k]; el.querySelector('.p15-detail').innerHTML = '<b>' + (k + 1) + '. ' + p[0] + ':</b> ' + p[6];
    el.querySelectorAll('.p15-row').forEach(function (r) { r.style.background = +r.dataset.k === k ? 'var(--amarillo-claro)' : ''; });
    el.querySelectorAll('.pin circle').forEach(function (c, i) { c.setAttribute('r', i === k ? 11 : 8.5); }); }
  el.querySelectorAll('.pin').forEach(function (p) { p.addEventListener('click', function () { show(+p.dataset.k); }); p.addEventListener('keydown', function (e) { if (e.key === 'Enter') show(+p.dataset.k); }); });
  el.querySelectorAll('.p15-row').forEach(function (r) { r.onclick = function () { show(+r.dataset.k); }; });
};

/* ================= P16 · ACTIVIDAD INTEGRADORA ================= */
var P16_Q = [['Variables', '¿Qué variables recomendarías incluir en el modelo predictivo? Justifica tu selección con la evidencia del ODC.', 'p07'], ['Algoritmo', '¿Qué algoritmo(s) de ML propondrías y por qué?', 'p09'], ['XAI', '¿Qué técnica de XAI utilizarías para explicar las predicciones a los directivos?', 'p13'], ['Intervención', '¿Cómo diseñarías el protocolo de intervención para los estudiantes de alto riesgo?', 'p11']];
SCREEN_HTML.p16 = function () {
  return '<h2 class="sc-title" style="margin-bottom:6px"><small>Módulo 8 · Actividad integradora</small>Propuesta para una universidad colombiana</h2>' +
  '<div class="card green row" style="align-items:center;padding:9px 14px"><div class="grow"><p><b>🏛️ Caso:</b> La Universidad Regional del Caribe (institución ficticia) tiene una tasa de deserción del 45% en primer año. Cuenta con datos del sistema SPADIES, registros académicos en un LMS (Moodle) y datos socioeconómicos del proceso de matrícula.</p>' +
    '<div class="row mt6" style="gap:8px"><span class="tag">🇨🇴 SPADIES</span><span class="tag">💻 Moodle</span><span class="tag">📝 Matrícula</span></div></div>' +
    '<div style="background:var(--rojo);color:#fff;border-radius:14px;padding:8px 14px;text-align:center"><b style="font-size:26px">45%</b><div class="small">deserción en 1er año</div></div></div>' +
  '<div class="row mt10">' +
    '<div class="grow">' + P16_Q.map(function (q, k) {
      return '<div class="acc-item' + (k === 0 ? ' open' : '') + '"><button aria-expanded="' + (k === 0) + '">' + (k + 1) + '. ' + q[0] + ' <span class="p16-st" data-k="' + k + '">○</span></button><div class="acc-body"><p class="small mb6">' + q[1] + '</p><textarea data-k="' + k + '" aria-label="' + q[1] + '" placeholder="Escribe y justifica tu respuesta…"></textarea><div class="row" style="justify-content:space-between;align-items:center"><button class="info-btn" data-jump="' + q[2] + '">💡 Pista: repasar el módulo</button><span class="wc" data-k="' + k + '">0 palabras (mínimo 30)</span></div></div></div>';
    }).join('') + '</div>' +
    '<div class="card yellow" style="width:270px;align-self:flex-start"><h3 style="font-size:14px">✅ Criterios de evaluación</h3><ul style="list-style:none;font-size:13px;line-height:1.45;display:flex;flex-direction:column;gap:6px">' +
      ['Pertinencia de las variables seleccionadas (evidencia de la revisión)', 'Justificación del algoritmo elegido (métricas de rendimiento)', 'Aplicación de XAI para la toma de decisiones', 'Viabilidad del protocolo de intervención propuesto'].map(function (c, k) { return '<li><span class="p16-crit" data-k="' + k + '">☐</span> ' + c + '</li>'; }).join('') + '</ul>' +
      '<button class="btn mt10 p16-send" style="width:100%" disabled>Enviar propuesta</button><p class="small muted mt6">Al enviar verás una respuesta modelo para autoevaluarte.</p></div></div>';
};
var P16_MODEL = '<h3>Respuesta modelo para autoevaluación</h3><p class="small muted">No hay una única respuesta correcta; compara tu propuesta con estos elementos.</p>' +
  '<p><b>1. Variables:</b> GPA y materias reprobadas del primer semestre, asistencia y puntaje de admisión, que son los factores más citados ' + cite('Lopez-Muñoz et al., 2026') + '; actividad en Moodle al inicio del semestre ' + cite('Esin & Kustitskaya, 2026') + '; restricciones financieras y responsabilidades familiares de la matrícula ' + cite('Carballo-Mendívil et al., 2025') + '; y, si es posible, un factor psicosocial como el sentido de pertenencia.</p>' +
  '<p><b>2. Algoritmo:</b> XGBoost o Random Forest, que lideran en rendimiento ' + cite('Bettahi et al., 2025') + ', con SMOTE o ajuste del umbral para priorizar el recall ' + cite('Wijayanti et al., 2026; Kwon, 2026') + ', y validados por cohortes para no inflar resultados ' + cite('Hidayat et al., 2026') + '.</p>' +
  '<p><b>3. XAI:</b> SHAP para explicar a los directivos qué variables pesan a nivel global y, para cada estudiante, por qué fue alertado ' + cite('Nagy & Molontay, 2024') + '.</p>' +
  '<p><b>4. Intervención:</b> semáforo de riesgo (rojo, amarillo, verde) con acciones diferenciadas, como tutoría inmediata, seguimiento y monitoreo ' + cite('Esin & Kustitskaya, 2026') + ', priorizando el primer año ' + cite('Lopes et al., 2026') + ' y midiendo si la intervención realmente reduce la deserción ' + cite('Lopez-Muñoz et al., 2026') + '.</p>';
SCREEN_INIT.p16 = function (el) {
  function upd() {
    var all = true;
    el.querySelectorAll('textarea').forEach(function (t) {
      var k = t.dataset.k, n = words(t.value), ok = n >= 30;
      el.querySelector('.wc[data-k="' + k + '"]').textContent = n + ' palabras (mínimo 30)';
      el.querySelector('.p16-st[data-k="' + k + '"]').textContent = ok ? '✔' : '○';
      el.querySelector('.p16-crit[data-k="' + k + '"]').textContent = ok ? '☑' : '☐';
      if (!ok) all = false;
    });
    el.querySelector('.p16-send').disabled = !all;
  }
  el.querySelectorAll('textarea').forEach(function (t) { t.addEventListener('input', upd); });
  el.querySelector('.p16-send').onclick = function () { App.modal(P16_MODEL); App.brai('arriba', [], '¡Muy bien! Compara tu propuesta con la respuesta modelo.'); };
};

/* ================= P17 · EVALUACIÓN FINAL ================= */
var EVAL_Q = [
  { q: 'Según Alvarado-Uribe et al. (2022), ¿qué proporción de estudiantes abandona la educación superior en América Latina?', o: ['Cerca del 18%', 'Cerca del 30%', 'La mitad (50%)', 'Más del 70%'], a: 2, e: 'En América Latina la mitad de los estudiantes abandona y solo el 50% de quienes permanecen se gradúa a tiempo.' },
  { q: '¿Qué es el SPADIES?', o: ['Un algoritmo de machine learning', 'El sistema del Ministerio de Educación Nacional para prevenir la deserción en la educación superior', 'Una técnica de balanceo de clases', 'Un plugin de Moodle'], a: 1, e: 'El SPADIES es el Sistema para la Prevención de la Deserción en la Educación Superior de Colombia.' },
  { q: '¿Cuál es el algoritmo más utilizado en los estudios de predicción de deserción?', o: ['Random Forest', 'K-Nearest Neighbors', 'Naive Bayes', 'Regresión lineal'], a: 0, e: 'Random Forest aparece en el 81.3% de los estudios revisados (Lopez-Muñoz et al., 2026).' },
  { q: '¿Cuál es la variable más citada en los modelos de predicción de deserción?', o: ['Edad', 'GPA del primer semestre', 'Discapacidad', 'Lugar de nacimiento'], a: 1, e: 'El GPA del primer semestre aparece en el 97.3% de los estudios.' },
  { q: 'Si por cada desertor hay 9.37 estudiantes que permanecen, ¿qué problema enfrenta el modelo?', o: ['Sobreajuste por exceso de variables', 'Desbalance de clases', 'Falta de explicabilidad', 'Fuga de información temporal'], a: 1, e: 'Es un desbalance de clases: el grupo de desertores es minoritario y cuesta detectarlo. Se aborda, por ejemplo, con SMOTE.' },
  { q: 'En un SAT, ¿qué métrica se prioriza para no dejar escapar estudiantes en riesgo?', o: ['Accuracy', 'Especificidad', 'Recall (sensibilidad)', 'Tiempo de entrenamiento'], a: 2, e: 'El recall mide cuántos desertores reales detecta el modelo; un falso negativo es el error más costoso.' },
  { q: '¿Qué técnica de XAI se basa en la teoría de juegos cooperativos?', o: ['LIME', 'SHAP', 'SMOTE', 'Stacking'], a: 1, e: 'SHAP reparte la predicción individual entre las variables con base en la teoría de juegos (Bettahi et al., 2025).' },
  { q: '¿Qué porcentaje de los estudios no valida empíricamente si las intervenciones funcionan?', o: ['24%', '42%', '68%', '71%'], a: 3, e: 'El 71% de los estudios no valida empíricamente las intervenciones (Lopez-Muñoz et al., 2026).' },
  { q: '¿Para qué clasifican Esin y Kustitskaya (2026) a los estudiantes en rojo, amarillo y verde?', o: ['Para asignar mejor los recursos de tutoría', 'Para calcular el GPA', 'Para balancear las clases', 'Para elegir el algoritmo'], a: 0, e: 'El semáforo de riesgo permite asignar mejor los recursos de tutoría según el nivel de riesgo.' },
  { q: '¿Qué muestra el caso de Ingeniería Informática en Cuba (Lázaro Alvarez et al., 2020)?', o: ['Que los datos de matrícula no sirven para predecir', 'Que la exactitud mejora al incorporar datos del primer semestre (de 68.86% a 93.85%)', 'Que las redes neuronales siempre superan a los árboles', 'Que la deserción en Cuba es del 50%'], a: 1, e: 'La exactitud pasó de 68.86% con datos de matrícula a 93.85% tras el primer semestre.' }
];
var CASE_TXT = '<b>Caso aplicado:</b> La Universidad del Altiplano (institución ficticia) implementó un SAT con un Random Forest entrenado solo con datos de matrícula: promedio de bachillerato, puntaje de admisión, estrato y edad. Su deserción es del 10%. El modelo reporta 90% de accuracy, pero solo detecta al 40% de los desertores (recall 0.40). Los directivos no confían en él porque "no saben por qué marca a un estudiante".';
var CASE_Q = [
  { q: 'Identifica: ¿qué tipo de variables predictivas usa el modelo?', o: ['Variables del LMS y de comportamiento digital', 'Variables previas al ingreso (datos de matrícula)', 'Variables psicosociales', 'Variables de rendimiento del primer semestre'], a: 1, e: 'Promedio de bachillerato, puntaje de admisión, estrato y edad se conocen antes de empezar clases: son datos de matrícula.' },
  { q: 'Evalúa: ¿por qué el 90% de accuracy no demuestra que el modelo sea bueno?', o: ['Porque Random Forest no sirve para deserción', 'Porque con 10% de desertores, predecir "nadie deserta" ya da 90%; el recall de 0.40 muestra que deja escapar al 60% de los desertores', 'Porque la accuracy debería ser 100%', 'Porque faltan datos del SPADIES'], a: 1, e: 'Con clases desbalanceadas, la accuracy engaña. Lo que importa en un SAT es el recall.' },
  { q: 'Propón: ¿cuál mejora está mejor respaldada por la evidencia del ODC?', o: ['Eliminar variables para simplificar el modelo', 'Balancear las clases (SMOTE) o ajustar el umbral, y añadir datos del primer semestre y del LMS', 'Cambiar a regresión lineal', 'Entrenar solo con los estudiantes que se graduaron'], a: 1, e: 'SMOTE y el ajuste del umbral mejoran la sensibilidad (Wijayanti et al., 2026; Kwon, 2026), y los datos del primer semestre elevan la predicción (Lázaro Alvarez et al., 2020).' },
  { q: 'Sugiere: ¿qué técnica ayudaría a que los directivos confíen en el modelo?', o: ['SHAP, para explicar qué variables pesan en general y por qué se alerta a cada estudiante', 'Aumentar el número de árboles', 'Ocultar las probabilidades', 'Usar solo el promedio de bachillerato'], a: 0, e: 'SHAP explica las predicciones de forma global y local, lo que facilita decisiones y genera confianza (Nagy & Molontay, 2024).' }
];
SCREEN_HTML.p17 = function () {
  return '<h2 class="sc-title"><small>Evaluación sumativa</small>Evaluación final</h2><div class="p17-body"></div>';
};
SCREEN_INIT.p17 = function (el) {
  var body = el.querySelector('.p17-body'), q1 = null, q2 = null, rev = [];
  function home() {
    body.innerHTML = '<p>La evaluación final integra los conocimientos de todos los módulos. Se evaluará la capacidad de síntesis, la argumentación basada en evidencia y la aplicación de los conceptos al contexto latinoamericano.</p>' +
      '<div class="card mt10" style="padding:9px 14px"><div class="row" style="justify-content:space-between" ><b class="small">Puntaje mínimo para aprobar: 75%</b><span class="small muted">Nota = 40% cuestionario + 60% caso</span></div><div style="position:relative;height:14px;background:var(--gris-claro);border-radius:8px;margin-top:6px"><div style="position:absolute;left:75%;top:-4px;bottom:-4px;width:3px;background:var(--rojo)"></div><div style="width:' + (q1 == null ? 0 : (q1 * 0.4 + (q2 || 0) * 0.6)) + '%;height:100%;background:var(--verde);border-radius:8px"></div></div></div>' +
      '<div class="row mt10">' +
        '<div class="card green grow" style="text-align:center;padding:18px"><div style="font-size:36px">📝</div><h3>Parte 1 · Cuestionario · 40%</h3><p class="small">10 preguntas de selección múltiple sobre los conceptos clave del ODC (deserción, ML, variables, modelos, SAT y XAI).</p>' + (q1 != null ? '<p class="bold mt6" style="color:var(--verde)">Resultado: ' + q1 + '%</p>' : '') + '<button class="btn mt10 b1">' + (q1 != null ? '↺ Repetir' : 'Iniciar cuestionario') + '</button></div>' +
        '<div class="card ' + (q1 == null ? 'gray' : 'yellow') + ' grow" style="text-align:center;padding:18px"><div style="font-size:36px">' + (q1 == null ? '🔒' : '🔎') + '</div><h3>Parte 2 · Caso aplicado · 60%</h3><p class="small">Análisis de un caso de implementación de un SAT en una universidad latinoamericana: identificar las variables, evaluar el algoritmo, proponer mejoras y sugerir técnicas de XAI.</p>' + (q2 != null ? '<p class="bold mt6" style="color:var(--verde)">Resultado: ' + q2 + '%</p>' : '') + '<button class="btn mt10 b2" ' + (q1 == null ? 'disabled' : '') + '>' + (q1 == null ? 'Se desbloquea al terminar la Parte 1' : q2 != null ? '↺ Repetir' : 'Iniciar caso') + '</button></div></div>';
    body.querySelector('.b1').onclick = part1;
    body.querySelector('.b2').onclick = part2;
  }
  function part1() {
    body.innerHTML = '<div class="row" style="justify-content:space-between"><b>Parte 1 · Cuestionario (40%)</b><span class="small muted">Las respuestas se califican al instante</span></div><div class="ev mt6"></div>';
    quiz(body.querySelector('.ev'), EVAL_Q, { fs: 15, onAnswer: function (ok) { App.brai(ok ? 'pulgar' : 'barbilla', ok ? ['pulgar'] : ['pensar']); },
      onEnd: function (s, ans) { q1 = s * 10; rev[0] = ans; App.resetBrai(); home(); } });
  }
  function part2() {
    body.innerHTML = '<b>Parte 2 · Caso aplicado (60%)</b><div class="card yellow mt6 small" style="padding:8px 12px;line-height:1.45">' + CASE_TXT + '</div><div class="ev mt6"></div>';
    quiz(body.querySelector('.ev'), CASE_Q, { fs: 14.5, onAnswer: function (ok) { App.brai(ok ? 'pulgar' : 'barbilla', ok ? ['pulgar'] : ['pensar']); },
      onEnd: function (s, ans) { q2 = s * 25; rev[1] = ans; result(); } });
  }
  function result() {
    var nota = Math.round(q1 * 0.4 + q2 * 0.6), pass = nota >= 75;
    App.setEval(nota, pass);
    App.brai(pass ? 'arriba' : 'pulgar', pass ? [] : ['pulgar'], pass ? '¡Aprobaste! Excelente trabajo.' : 'Repasa los temas sugeridos e inténtalo de nuevo.');
    var weak = rev.flat().filter(function (a) { return !a.ok; });
    body.innerHTML = '<div class="row" style="align-items:center;gap:24px">' +
      '<div class="score-ring" style="--p:' + nota + '%;width:150px;height:150px;font-size:36px;background:conic-gradient(' + (pass ? 'var(--verde)' : 'var(--naranja)') + ' ' + nota + '%,var(--gris-claro) 0)"><span style="width:114px;height:114px">' + nota + '%</span></div>' +
      '<div class="grow"><h3 style="font-size:20px;color:' + (pass ? 'var(--verde)' : 'var(--naranja)') + '">' + (pass ? '✔ ¡Aprobaste la evaluación!' : '✖ Aún no alcanzas el 75%') + '</h3>' +
      '<p>Cuestionario: <b>' + q1 + '%</b> (peso 40%) · Caso aplicado: <b>' + q2 + '%</b> (peso 60%)</p>' +
      (pass ? '<p class="mt6">Demostraste que puedes analizar un SAT basado en machine learning con evidencia. Continúa al cierre del ODC.</p>' : '<p class="mt6"><b>Sugerencias de repaso:</b> revisa los módulos de las preguntas que fallaste y vuelve a intentarlo.</p>') +
      '<div class="row mt10"><button class="btn sec rv">📋 Revisar respuestas</button><button class="btn sec again">↺ Repetir evaluación</button>' + (pass ? '<button class="btn" data-jump="p18">Ir al cierre ▶</button>' : '') + '</div></div></div>';
    body.querySelector('.again').onclick = function () { q1 = q2 = null; rev = []; App.resetBrai(); home(); };
    body.querySelector('.rv').onclick = function () {
      App.modal('<h3>Revisión de respuestas</h3>' + rev.flat().map(function (a, k) { return '<p><b>' + (a.ok ? '✔' : '✖') + ' ' + (k + 1) + '.</b> ' + a.q + '<br><span class="small muted">' + a.el + '</span></p>'; }).join(''));
    };
  }
  home();
};

/* ================= P18 · CIERRE ================= */
var LEARN = [['👥', 'La deserción es un problema multidimensional con consecuencias sociales y económicas profundas; en América Latina afecta a la mitad de los estudiantes.'],
  ['🧠', 'Los algoritmos de ML, especialmente los ensambles como Random Forest, XGBoost y stacking, alcanzan precisiones promedio del 86% al 88%.'],
  ['📋', 'Las variables académicas dominan los modelos, pero los factores psicosociales y de equidad requieren mayor atención.'],
  ['🚦', 'Un SAT debe conectar la predicción con intervenciones reales y evaluar su efecto.'],
  ['🔍', 'La XAI es clave para la transparencia y la confianza institucional.'],
  ['🌎', 'Latinoamérica, y Colombia con el SPADIES, tiene oportunidades únicas para implementar SAT.']];
SCREEN_HTML.p18 = function () {
  var conf = '', r = rnd(5), cols = ['#f6c324', '#ffffff', '#5fe08f', '#e8892a'];
  for (var i = 0; i < 40; i++) conf += '<i style="left:' + (r() * 100) + '%;background:' + cols[i % 4] + ';animation-duration:' + (3 + r() * 4) + 's;animation-delay:' + (r() * 4) + 's"></i>';
  return '<div class="hero">' + netSVG(21, 40, 1280, 600) + '<div class="confetti">' + conf + '</div></div>' +
  '<div style="position:relative;color:#fff;padding-top:4px"><h2 class="sc-title" style="color:#fff"><small style="color:var(--amarillo)">Cierre</small>Cierre y conclusiones</h2>' +
  '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' + LEARN.map(function (l, k) {
    return '<div class="learn" style="background:rgba(255,255,255,.95);color:var(--texto);border-radius:14px;padding:10px 12px;opacity:0"><div style="font-size:26px">' + l[0] + '</div><p style="font-size:13.5px">' + l[1] + '</p></div>'; }).join('') + '</div>' +
  '<div style="background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.4);border-radius:14px;padding:10px 14px;margin-top:10px"><b>🚀 Hacia el futuro:</b> <span class="small">El campo avanza hacia modelos más equitativos, transparentes, transferibles entre instituciones y centrados en intervenciones validadas (Radulescu & Balas, 2026; Lopez-Muñoz et al., 2026).</span>' +
    '<div class="row mt6" style="gap:6px">' + ['⚖️ Equidad', '✅ Validar intervenciones', '🔍 Transparencia (XAI)'].map(function (t) { return '<span class="tag" style="background:var(--amarillo);color:var(--tinta)">' + t + '</span>'; }).join('') + '</div></div>' +
  '<p style="margin-top:10px;font-size:18px;font-weight:800;color:#fff">¡Gracias por tu participación!</p>' +
  '<div class="row mt10" style="gap:10px"><button class="btn yellow p18-pdf">📄 Descargar resumen (PDF)</button><button class="btn sec" data-jump="p01">🔄 Volver al inicio</button><button class="btn sec" data-jump="p20">📚 Ver referencias</button></div></div>';
};
SCREEN_ENTER.p18 = function (el) {
  el.querySelectorAll('.learn').forEach(function (c, k) { c.style.animation = 'none'; c.style.opacity = 0; setTimeout(function () { c.style.animation = 'fadein .5s ease forwards'; c.style.opacity = 1; }, 250 + k * 280); });
};
SCREEN_INIT.p18 = function (el) {
  el.querySelector('.p18-pdf').onclick = function () {
    var pa = document.getElementById('print-area');
    if (!pa) { pa = document.createElement('div'); pa.id = 'print-area'; document.body.appendChild(pa); }
    var pr = App.progress(), nom = SCORM.studentName(), hoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    var res = pr.score == null ? '<p>La evaluación final aún no se ha presentado.</p>' :
      '<p><b>Nota de la evaluación final:</b> ' + Math.round(pr.score) + ' / 100 · <b>Estado:</b> ' + (pr.score >= 75 ? '✔ Aprobado' : '✖ No aprobado (se requiere 75)') + '</p>';
    var mods = SCREENS.filter(function (s) { return s.mod >= 2 && !s.activity && s.id !== 'p17' && s.id !== 'p18' && s.mod <= 8; });
    pa.innerHTML = '<div class="pr-cover"><h1>' + META.titulo + '</h1><p class="pr-sub">Resumen del Objeto Digital de Conocimiento</p>' +
      '<p>' + META.autor + ' · Universidad de Cundinamarca · ' + META.anio + '</p></div>' +
      '<h2>Resultado del estudiante</h2>' + (nom ? '<p><b>Estudiante:</b> ' + nom + '</p>' : '') + '<p><b>Fecha:</b> ' + hoy + '</p>' + res +
      '<p><b>Pantallas visitadas:</b> ' + pr.visited + ' de ' + pr.total + '</p>' +
      '<h2>Resumen por módulo</h2>' + mods.map(function (s) { return '<h3>' + s.title + '</h3>' + s.guion.map(function (g) { return '<p>' + g + '</p>'; }).join(''); }).join('') +
      '<h2>Aprendizajes clave</h2><ul>' + LEARN.map(function (l) { return '<li>' + l[1] + '</li>'; }).join('') + '</ul>' +
      '<h2>Hacia el futuro</h2><p>El campo avanza hacia modelos más equitativos, transparentes, transferibles entre instituciones y centrados en intervenciones validadas (Radulescu & Balas, 2026; Lopez-Muñoz et al., 2026).</p>';
    window.print();
  };
};

/* ================= P19 · CRÉDITOS ================= */
SCREEN_HTML.p19 = function () {
  return '<h2 class="sc-title"><small>Metadatos</small>Créditos y licencia</h2><div class="row">' +
  '<div class="card grow"><table style="width:100%;font-size:14px;border-collapse:collapse">' +
    [['Área de conocimiento', 'Ingeniería, Tecnología e Innovación — Analítica y Ciencia de Datos'], ['Nombre del material', META.titulo], ['Autor', META.autor], ['Diseño y desarrollo', META.autor], ['Imágenes', 'Avatar, ilustraciones y gráficas: ' + META.autor + '. Logotipo y fotografía del campus: Universidad de Cundinamarca (ver fuentes en Recursos)'], ['Sonidos y voces', META.autor], ['Fecha de creación', '21/10/2026'], ['Nivel educativo', 'Intermedio'], ['Programa', 'Especialización en Analítica y Ciencia de Datos · CTI · Universidad de Cundinamarca']].map(function (r) {
      return '<tr style="border-bottom:1px solid var(--borde)"><td class="bold" style="padding:7px 8px;width:190px;color:var(--verde-osc)">' + r[0] + '</td><td style="padding:7px 8px">' + r[1] + '</td></tr>'; }).join('') + '</table></div>' +
  '<div class="col" style="width:330px">' +
    '<div class="card center"><img src="assets/cc-by-nc-sa.png" alt="Licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0" style="width:180px"><p class="small mt6">Este ODC se distribuye bajo licencia <b>Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)</b>.</p></div>' +
    '<div class="card gray small" style="line-height:1.4;font-size:12px;overflow-wrap:anywhere"><b>Recursos (TASL)</b><br>• Avatar BRAI, ilustraciones, gráficas y diagramas: creación propia del autor, CC BY-NC-SA 4.0.<br>' +
    '• Logotipo institucional: Universidad de Cundinamarca (s. f.). https://www.ucundinamarca.edu.co/wp-content/uploads/extended-logo-3.png<br>' +
    '• Fotografía de portada, sede Chía: Universidad de Cundinamarca (s. f.). https://www.ucundinamarca.edu.co/wp-content/uploads/chia-un-referente-educativo-en-constante-crecimiento-2.jpg<br>' +
    '• Insignia de licencia: Creative Commons. https://creativecommons.org/licenses/by-nc-sa/4.0/<br>• Íconos: emojis Unicode del sistema.<br>• Desarrollo: HTML5, CSS y JavaScript (código abierto), empaquetado SCORM 1.2.<br>• Datos de las gráficas: tomados de las referencias citadas (APA 7).</div></div></div>';
};

/* ================= P20 · REFERENCIAS ================= */
SCREEN_HTML.p20 = function () {
  return '<h2 class="sc-title"><small>APA 7</small>Referencias</h2>' +
  '<div class="card scroll" style="height:500px;padding:12px 18px">' + REFERENCIAS.map(function (r) {
    return '<p style="padding-left:28px;text-indent:-28px;margin-bottom:8px;font-size:13.5px">' + r.replace(/(https:\/\/doi\.org\/\S+)/, '<a href="$1" target="_blank" rel="noopener" style="color:var(--verde);word-break:break-all">$1</a>') + '</p>'; }).join('') + '</div>';
};
