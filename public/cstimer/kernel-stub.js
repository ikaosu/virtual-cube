/*
 * kernel-stub.js — minimal stand-in for cstimer's src/js/kernel.js.
 *
 * The real kernel.js is ~1300 lines wired into cstimer's UI/storage. The
 * vendored twisty/twistynnn only needs `kernel.getProp(key, defaultVal)`.
 * Returning the supplied default for everything is sufficient.
 *
 * vrcSpeed is overridden to 0 (instant moves, no animation) because this app
 * is a speedsolving timer — animation lag is undesirable.
 *
 * Original kernel.js: github.com/cs0x7f/cstimer (GPLv3).
 * This stub written for the virtual-cube project, also GPLv3.
 */
(function (window) {
  if (window.kernel) return;
  var overrides = {
    vrcSpeed: 0, // instant move application (no animation tweening)
  };
  window.kernel = {
    getProp: function (key, defaultVal) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        return overrides[key];
      }
      return defaultVal;
    },
    setProp: function () {},
    regProp: function () {},
    regListener: function () {},
    blur: function () {},
    focus: function () {},
  };
})(window);
