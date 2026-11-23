/* Envoltorio mínimo SCORM 1.2. Si no hay LMS (abierto localmente), funciona en modo autónomo. */
var SCORM = (function () {
  var api = null, active = false;

  function findAPI(win) {
    var tries = 0;
    while (win && !win.API && win.parent && win.parent !== win && tries < 10) { tries++; win = win.parent; }
    return win ? win.API || null : null;
  }

  function init() {
    try {
      api = findAPI(window) || (window.opener ? findAPI(window.opener) : null);
      if (api && String(api.LMSInitialize('')) === 'true') {
        active = true;
        var st = get('cmi.core.lesson_status');
        if (!st || st === 'not attempted') set('cmi.core.lesson_status', 'incomplete');
        commit();
      }
    } catch (e) { active = false; }
    window.addEventListener('beforeunload', finish);
    return active;
  }
  function get(k) { try { return active ? api.LMSGetValue(k) : ''; } catch (e) { return ''; } }
  function set(k, v) { try { if (active) api.LMSSetValue(k, String(v)); } catch (e) {} }
  function commit() { try { if (active) api.LMSCommit(''); } catch (e) {} }
  var finished = false;
  function finish() {
    if (!active || finished) return;
    finished = true;
    try { api.LMSCommit(''); api.LMSFinish(''); } catch (e) {}
  }

  return {
    init: init,
    isActive: function () { return active; },
    studentName: function () { return get('cmi.core.student_name'); },
    getLocation: function () { return get('cmi.core.lesson_location'); },
    setLocation: function (n) { set('cmi.core.lesson_location', n); commit(); },
    getSuspend: function () { return get('cmi.suspend_data'); },
    setSuspend: function (s) { set('cmi.suspend_data', s.slice(0, 4000)); commit(); },
    complete: function () {
      var st = get('cmi.core.lesson_status');
      if (st !== 'passed' && st !== 'failed') set('cmi.core.lesson_status', 'completed');
      commit();
    },
    setScore: function (score, passed) {
      set('cmi.core.score.min', 0); set('cmi.core.score.max', 100);
      set('cmi.core.score.raw', Math.round(score));
      set('cmi.core.lesson_status', passed ? 'passed' : 'failed');
      commit();
    },
    finish: finish
  };
})();
