/* BRAI: avatar SVG propio (sin licencias externas). Poses y accesorios se activan con clases CSS. */
var BRAI = (function () {
  var svg = '' +
  '<svg class="brai-svg" viewBox="0 0 260 400" role="img" aria-label="BRAI, robot guía del ODC">' +
  // sombra
  '<ellipse cx="130" cy="388" rx="70" ry="9" fill="rgba(0,0,0,.12)"/>' +
  // antena
  '<g class="antenna"><line x1="130" y1="22" x2="130" y2="58" stroke="#f6c324" stroke-width="6"/><circle cx="130" cy="17" r="11" fill="#f6c324"/></g>' +
  // sombreros (accesorios)
  '<g class="acc acc-casco"><path d="M58 70 Q130 -5 202 70 Z" fill="#f6c324" stroke="#c99a0a" stroke-width="3"/><rect x="44" y="64" width="172" height="14" rx="7" fill="#e3ad12"/><rect x="122" y="22" width="16" height="44" rx="6" fill="#e3ad12"/></g>' +
  '<g class="acc acc-explorador"><ellipse cx="130" cy="66" rx="98" ry="14" fill="#9c6b3c"/><path d="M72 66 Q78 18 130 16 Q182 18 188 66 Z" fill="#b98250"/><rect x="74" y="50" width="112" height="10" fill="#6d4524"/></g>' +
  // cabeza
  '<rect x="55" y="58" width="150" height="120" rx="34" fill="#ffffff" stroke="#dfe7e2" stroke-width="2"/>' +
  '<rect x="72" y="75" width="116" height="86" rx="24" fill="#16361f"/>' +
  // cejas (preocupado / pensativo)
  '<g class="acc acc-cejas"><path d="M90 96 L114 102" stroke="#5fe08f" stroke-width="5" stroke-linecap="round"/><path d="M170 96 L146 102" stroke="#5fe08f" stroke-width="5" stroke-linecap="round"/></g>' +
  // ojos
  '<g class="eyes"><ellipse cx="106" cy="116" rx="12" ry="16" fill="#5fe08f"/><ellipse cx="154" cy="116" rx="12" ry="16" fill="#5fe08f"/></g>' +
  // gafas
  '<g class="acc acc-gafas"><rect x="86" y="100" width="40" height="32" rx="8" fill="none" stroke="#f6c324" stroke-width="5"/><rect x="134" y="100" width="40" height="32" rx="8" fill="none" stroke="#f6c324" stroke-width="5"/><line x1="126" y1="114" x2="134" y2="114" stroke="#f6c324" stroke-width="5"/></g>' +
  // boca
  '<path class="mouth-smile" d="M110 142 Q130 156 150 142" stroke="#5fe08f" stroke-width="5" fill="none" stroke-linecap="round"/>' +
  '<path class="mouth-sad" d="M112 150 Q130 138 148 150" stroke="#5fe08f" stroke-width="5" fill="none" stroke-linecap="round"/>' +
  '<ellipse class="mouth-talk" cx="130" cy="146" rx="12" ry="7" fill="#5fe08f"/>' +
  // cuello y cuerpo
  '<rect x="115" y="178" width="30" height="16" fill="#e8ece9"/>' +
  '<rect x="60" y="192" width="140" height="150" rx="40" fill="#ffffff" stroke="#dfe7e2" stroke-width="2"/>' +
  '<rect x="98" y="226" width="64" height="58" rx="10" fill="#e9f6ee"/>' +
  '<rect x="108" y="258" width="10" height="16" fill="#00843d"/><rect x="125" y="246" width="10" height="28" fill="#00843d"/><rect x="142" y="236" width="10" height="38" fill="#f6c324"/>' +
  // brazo izquierdo (fijo)
  '<g class="arm-left"><rect x="22" y="212" width="44" height="22" rx="11" fill="#fff" stroke="#dfe7e2" stroke-width="2" transform="rotate(25 44 223)"/></g>' +
  // brazo derecho (cambia por pose)
  '<g class="arm-right"><rect x="194" y="205" width="22" height="70" rx="11" fill="#fff" stroke="#dfe7e2" stroke-width="2"/><circle class="hand" cx="205" cy="282" r="16" fill="#fff" stroke="#dfe7e2" stroke-width="2"/>' +
    // accesorios en la mano
    '<g class="acc acc-lupa"><circle cx="205" cy="312" r="20" fill="rgba(170,225,255,.45)" stroke="#16361f" stroke-width="6"/><line x1="205" y1="292" x2="205" y2="284" stroke="#16361f" stroke-width="7"/></g>' +
    '<g class="acc acc-puntero"><line x1="205" y1="282" x2="205" y2="345" stroke="#9c6b3c" stroke-width="6" stroke-linecap="round"/></g>' +
    '<g class="acc acc-pulgar"><rect x="198" y="255" width="13" height="26" rx="6" fill="#fff" stroke="#dfe7e2" stroke-width="2"/></g>' +
  '</g>' +
  // piernas
  '<rect x="82" y="337" width="30" height="45" rx="12" fill="#ffffff" stroke="#dfe7e2" stroke-width="2"/><rect x="148" y="337" width="30" height="45" rx="12" fill="#ffffff" stroke="#dfe7e2" stroke-width="2"/>' +
  // campana y pensamiento
  '<g class="acc acc-campana"><path d="M18 120 Q18 92 38 88 Q58 92 58 120 L62 128 L14 128 Z" fill="#f6c324" stroke="#c99a0a" stroke-width="2"/><circle cx="38" cy="132" r="5" fill="#c99a0a"/></g>' +
  '<g class="acc acc-pensar"><circle cx="34" cy="70" r="20" fill="#fff" stroke="#16361f" stroke-width="2"/><text x="34" y="78" text-anchor="middle" font-size="24" font-weight="700" fill="#00843d">?</text><circle cx="52" cy="100" r="5" fill="#fff" stroke="#16361f" stroke-width="2"/></g>' +
  '</svg>';

  var el = null;
  function mount(container) {
    container.innerHTML = svg + '<div class="brai-tag">BRAI</div>';
    el = container;
  }
  /* pose: saludo | senala | arriba(puño) | pulgar | lupa | profesor | normal ; flags: lista de accesorios */
  function setPose(pose, flags) {
    if (!el) return;
    var cls = ['brai', 'pose-' + (pose || 'normal')];
    (flags || []).forEach(function (f) { cls.push('with-' + f); });
    el.className = cls.join(' ') + (el.classList.contains('talking') ? ' talking' : '');
  }
  function talking(on) { if (el) el.classList.toggle('talking', !!on); }
  return { mount: mount, setPose: setPose, talking: talking, svg: svg };
})();
