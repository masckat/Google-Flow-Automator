// recap-capture.js — MAIN world, run_at: document_start.
// Intercepts grecaptcha.enterprise.execute before Flow's x2a trap overwrites it.
// Exposes the clean function via window.__tatRealExecute and window.__fk_hijack.
(function () {
  "use strict";
  window.__tatCaptureLoaded = true;

  var _pristineExecute = null;
  var _capturedTrapped = false;
  var _captureSource = null;

  function isPristine(fn) {
    if (typeof fn !== "function") return false;
    try {
      var src = Function.prototype.toString.call(fn);
      if (src.indexOf("extension_hijack_detected") >= 0) {
        _capturedTrapped = true;
        return false;
      }
    } catch (_) {}
    return true;
  }

  function savePristine(fn, enterprise, source) {
    if (_pristineExecute || !isPristine(fn)) return false;
    try {
      var bound = fn.bind(enterprise);
      _pristineExecute = bound;
      window.__tatRealExecute = bound;
      _captureSource = source;
      Promise.resolve().then(cleanAllTraps);
      return true;
    } catch (_) {
      return false;
    }
  }

  function cleanTrap(obj, prop) {
    try {
      var desc = Object.getOwnPropertyDescriptor(obj, prop);
      if (!desc || (!desc.get && !desc.set)) return;
      Object.defineProperty(obj, prop, {
        value: desc.get ? desc.get() : undefined,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  }

  var _cleanedUp = false;
  function cleanAllTraps() {
    if (_cleanedUp) return;
    _cleanedUp = true;
    try {
      var gc = window.grecaptcha;
      if (gc) {
        var ent = gc.enterprise;
        if (ent) cleanTrap(ent, "execute");
        cleanTrap(gc, "enterprise");
      }
      cleanTrap(window, "grecaptcha");
    } catch (_) {}
  }

  // Level 3: enterprise.execute
  function watchExecute(enterprise) {
    if (!enterprise || enterprise.__tatTrapped) return;
    enterprise.__tatTrapped = true;
    var _val = enterprise.execute;
    if (typeof _val === "function" && savePristine(_val, enterprise, "L3-immediate")) {
      return;
    }
    try {
      Object.defineProperty(enterprise, "execute", {
        get: function () { return _val; },
        set: function (fn) {
          _val = fn;
          savePristine(fn, enterprise, "L3-setter");
        },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  }

  // Level 2: grecaptcha.enterprise
  function watchEnterprise(grecaptcha) {
    if (!grecaptcha || grecaptcha.__tatGreTrapped) return;
    grecaptcha.__tatGreTrapped = true;
    var _val = grecaptcha.enterprise;
    if (_val && typeof _val === "object") {
      watchExecute(_val);
    }
    try {
      Object.defineProperty(grecaptcha, "enterprise", {
        get: function () { return _val; },
        set: function (obj) {
          _val = obj;
          if (obj && typeof obj === "object") {
            watchExecute(obj);
          }
        },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  }

  // Level 1: window.grecaptcha
  function installCapture() {
    var _val = window.grecaptcha;
    if (_val && typeof _val === "object") {
      watchEnterprise(_val);
    }
    try {
      Object.defineProperty(window, "grecaptcha", {
        get: function () { return _val; },
        set: function (obj) {
          _val = obj;
          if (obj && typeof obj === "object") {
            watchEnterprise(obj);
          }
        },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}

    // Lightweight polling without freezing the browser (50ms poll, max 20 times)
    var pollCount = 0;
    var pollId = setInterval(function () {
      pollCount++;
      if (_pristineExecute || pollCount > 20) { clearInterval(pollId); return; }
      try {
        var exec = window.grecaptcha && window.grecaptcha.enterprise && window.grecaptcha.enterprise.execute;
        if (typeof exec === "function") {
          savePristine(exec, window.grecaptcha.enterprise, "poll-50ms");
          if (_pristineExecute) clearInterval(pollId);
        }
      } catch (_) {}
    }, 50);

    // Ready callback registration without busy-looping
    var readyCount = 0;
    var readyPollId = setInterval(function () {
      readyCount++;
      if (_pristineExecute || readyCount > 15) { clearInterval(readyPollId); return; }
      try {
        var ready = window.grecaptcha && window.grecaptcha.enterprise && window.grecaptcha.enterprise.ready;
        if (typeof ready === "function") {
          clearInterval(readyPollId);
          ready.call(window.grecaptcha.enterprise, function () {
            try {
              var exec = window.grecaptcha && window.grecaptcha.enterprise && window.grecaptcha.enterprise.execute;
              if (typeof exec === "function") {
                savePristine(exec, window.grecaptcha.enterprise, "ready-race");
              }
            } catch (_) {}
          });
        }
      } catch (_) {}
    }, 100);
  }

  installCapture();

  try {
    Object.defineProperty(window, "__fk_hijack", {
      value: Object.freeze({
        get pristine() { return _pristineExecute; },
        get trapped() { return _capturedTrapped; },
        get source() { return _captureSource; }
      }),
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch (_) {
    window.__fk_hijack = {
      get pristine() { return _pristineExecute; },
      get trapped() { return _capturedTrapped; },
      get source() { return _captureSource; }
    };
  }
})();
