/**
 * Created by Mirco on 24.02.2017.
 */

define(function (require) {

  function Util() {

  }

  Util.prototype = {
    log: function (fct, msg) {
      console.log('[' + fct + ']', msg);
    }
  };

  return Util;
});
