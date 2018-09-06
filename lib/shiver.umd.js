(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.shiver = {})));
}(this, (function (exports) { 'use strict';

  var bailRE = /[^\w.$]/;

  /**
   * 根据路径获取对象的数据
   *
   * @example
   *
   * ```js
   * const obj = {
   *   simple: 'simple value',
   *   search: [
   *      {url: 'https://www.baidu.com', name: 'baidu'},
   *      {url: 'https://www.google.com', name: 'google'},
   *   ],
   *   results: {
   *     baidu: {
   *       post: 100,
   *       page: 10,
   *       result: []
   *     }
   *   }
   * }
   *
   * parsePath('simple')(obj)
   * // => 'simple value'
   *
   * parsePath('search.0.name')(obj)
   * // => 'baidu'
   *
   * parsePath('results.baidu.post')(obj)
   * // => 10
   * ```
   *
   * @param path
   * @return {*}
   *
   * @private
   */
  function parsePath(path) {
    if (bailRE.test(path)) {
      return function (object) {
        return object[path];
      };
    }

    var segments = path.split('.');

    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return; }
        var key = segments[i];
        if (Array.isArray(obj)) { key = +key; }
        obj = obj[segments[i]];
      }
      return obj;
    };
  }

  /**
   * 简单断言参数
   *
   * @param {*} value
   * @param {string} name
   * @param {string} [detail]
   * @throws {Error}
   *
   * @private
   */
  function assert(value, name, detail) {
    if (value) { return; }
    var msg = "Invalid params \"" + name + "\"";
    if (detail) { msg += ', ' + detail; }
    var err = new Error(msg);
    err.name = 'ShiverError';
    throw err;
  }

  /**
   * 简单字符串替换模板
   *
   * @param {*} tpl 模板
   * @param {object} data 数据
   * @return {string}
   *
   * @private
   */
  function format(tpl, data) {
    var reg = new RegExp('\\{(' + Object.keys(data).join('|') + ')\\}', 'g');
    return tpl.replace(reg, function (_, key) {
      var value = data[key];
      if (typeof value === 'number' && isNaN(value)) { return 'NaN'; }
      if (value === Infinity) { return 'Infinity'; }
      return JSON.stringify(value);
    });
  }

  /**
   * 创建错误对象
   *
   * @param {string} path 数据路径
   * @param {*} value 被校验的数据
   * @param {string} message 错误信息
   * @return {Error}
   *
   * @private
   */
  function makeError(path, value, message) {
    var err = new Error(message);
    err.name = 'ShiverError';
    err.path = path;
    err.value = value;
    return err;
  }

  function getType(obj) {
    if (isNaN(obj)) { return 'NaN'; }
    if (obj === Infinity) { return 'Infinity'; }
    return Object.prototype.toString
      .call(obj)
      .substring(8, -1)
      .toLowerCase();
  }

  /**
   * @param types
   * @param message
   * @param param
   * @return {*}
   */
  function expect(types, message, param) {
    if (message == null) { return undefined; }
    if (Array.isArray(types)) { types = types.join('" or "'); }
    if (arguments.length > 2) { return function () { return ("expected params \"" + types + "\", give \"" + (getType(param)) + "\""); }; }
    return function (_, value) { return ("expected \"" + types + "\": {PATH}, found \"" + (getType(value)) + "\""); };
  }

  // https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy
  function isFalsy(value) {
    if (isNum(value)) { return value === 0 || isNaN(value); }
    // `value == null`  => undefined or null
    return value === false || value === '' || value == null;
  }

  var isStr = function (o) { return typeof o === 'string'; };
  var isArr = function (o) { return Array.isArray(o); };
  var isReg = function (o) { return o instanceof RegExp; };
  var isNum$1 = function (o) { return typeof o === 'number'; };

  /**********************************************
   * mixed
   **********************************************/

  // 是否与给出的值一致
  function accordance(assert$$1, value, data, message) {
    return assert$$1(value === data, message);
  }

  // 是否不同于给出的值
  function difference(assert$$1, value, data, message) {
    return assert$$1(value !== data, message);
  }

  // 非 undefined 或 null
  function existence(assert$$1, value, message) {
    return assert$$1(value != null, message);
  }

  // 包含某个值
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
  function inside(assert$$1, value, data, message) {
    return assert$$1(isArr(data) || isStr(data), expect(['string', 'array'], message, data))
      && assert$$1(data.includes(value), message);
  }

  function isEmpty(value) {
    return typeof value === 'undefined' || value === null || value === '';
  }

  function empty(assert$$1, value, message) {
    return Array.isArray(value)
      ? assert$$1(value.length === 0, message)
      : assert$$1(isEmpty(value), message);
  }

  /**********************************************
   * boolean
   **********************************************/

  // 是否为 falsy 类型的值
  function falsy(assert$$1, value, message) {
    return assert$$1(isFalsy(value), message);
  }

  // 是否为 truthy 类型的值
  function truthy(assert$$1, value, message) {
    return assert$$1(!isFalsy(value), message);
  }

  /**********************************************
   * regex
   **********************************************/

  // 使用正则表达式验证
  function match(assert$$1, value, reg, message) {
    return assert$$1(isReg(reg), expect('regexp', message, reg))
      && assert$$1(isStr(value), expect('string', message))
      && assert$$1(reg.test(value), message);
  }

  /**********************************************
   * string
   **********************************************/

  // 是否以某个字符串开头
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
  function startsWith(assert$$1, value, data, message) {
    return assert$$1(isStr(data), expect('string', message, data))
      && assert$$1(isStr(value), expect('string', message))
      && assert$$1(value.startsWith(data), message);
  }

  // 是否以某个字符串结尾
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
  function endsWith(assert$$1, value, data, message) {
    return assert$$1(isStr(data), expect('string', message, data))
      && assert$$1(isStr(value), expect('string', message))
      && assert$$1(value.endsWith(data), message);
  }

  function ascii(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(/^[\x00-\x7F]+$/.test(value), message);
  }

  function chinese(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(/^[\u4e00-\u9fa5]+$/.test(value), message);
  }

  function md5(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(/^[a-f0-9]{32}$/.test(value), message);
  }

  function lowercase(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(value === value.toLowerCase(), message);
  }

  function uppercase(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(value === value.toUpperCase(), message);
  }

  // https://github.com/chriso/validator.js/blob/48d68bda5652eb7153a94cda62e904b639df2f4d/src/lib/isIP.js
  var ipv4Maybe = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  var ipv6Block = /^[0-9A-F]{1,4}$/i;

  function isIP4(str) {
    if (!ipv4Maybe.test(str)) { return false; }
    var parts = str.split('.').sort(function (a, b) { return a - b; });
    return parts[3] <= 255;
  }

  function isIP6(str) {
    var blocks = str.split(':');
    var foundOmissionBlock = false; // marker to indicate ::

    // At least some OS accept the last 32 bits of an IPv6 address
    // (i.e. 2 of the blocks) in IPv4 notation, and RFC 3493 says
    // that '::ffff:a.b.c.d' is valid for IPv4-mapped IPv6 addresses,
    // and '::a.b.c.d' is deprecated, but also valid.
    var foundIPv4TransitionBlock = isIP4(blocks[blocks.length - 1]);
    var expectedNumberOfBlocks = foundIPv4TransitionBlock ? 7 : 8;

    if (blocks.length > expectedNumberOfBlocks) {
      return false;
    }

    // initial or final ::
    if (str === '::') {
      return true;
    } else if (str.substr(0, 2) === '::') {
      blocks.shift();
      blocks.shift();
      foundOmissionBlock = true;
    } else if (str.substr(str.length - 2) === '::') {
      blocks.pop();
      blocks.pop();
      foundOmissionBlock = true;
    }

    for (var i = 0; i < blocks.length; ++i) {
      // test for a :: which can not be at the string start/end
      // since those cases have been handled above
      if (blocks[i] === '' && i > 0 && i < blocks.length - 1) {
        if (foundOmissionBlock) {
          return false; // multiple :: in address
        }
        foundOmissionBlock = true;
      } else if (foundIPv4TransitionBlock && i === blocks.length - 1) ; else if (!ipv6Block.test(blocks[i])) {
        return false;
      }
    }

    if (foundOmissionBlock) {
      return blocks.length >= 1;
    }

    return blocks.length === expectedNumberOfBlocks;
  }

  function ip(assert$$1, value, version, message) {
    if (assert$$1(isStr(value), expect('string', message))) {
      var v = String(version);
      if (v === '4') { return assert$$1(isIP4(value), message); }
      if (v === '6') { return assert$$1(isIP6(value), message); }
      // version 不符合版本声明，则将 version 作为 message 使用
      return assert$$1(isIP4(value) || isIP6(value), version);
    }
    return false;
  }

  function phone(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(value), message);
  }

  function mail(assert$$1, value, message) {
    return assert$$1(isStr(value), expect('string', message))
      && assert$$1(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value), message);
  }

  var validMediaType = /^[a-z]+\/[a-z0-9\-\+]+$/i;
  var validAttribute = /^[a-z\-]+=[a-z0-9\-]+$/i;
  var validData = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;

  function dataURI(assert$$1, value, message) {
    if (!assert$$1(isStr(value), expect('string', message))) {
      return false;
    }

    var data = value.split(',');
    if (data.length < 2) {
      return assert$$1(false, message);
    }

    var attributes = data.shift().trim().split(';');
    var schemeAndMediaType = attributes.shift();
    if (schemeAndMediaType.substr(0, 5) !== 'data:') {
      return assert$$1(false, message);
    }

    var mediaType = schemeAndMediaType.substr(5);
    if (mediaType !== '' && !validMediaType.test(mediaType)) {
      return assert$$1(false, message);
    }

    for (var i = 0; i < attributes.length; i++) {
      if (i === attributes.length - 1 && attributes[i].toLowerCase() === 'base64') {
        continue; // ok
      }
      if (!validAttribute.test(attributes[i])) {
        return assert$$1(false, message);
      }
    }

    for (var i$1 = 0; i$1 < data.length; i$1++) {
      if (!validData.test(data[i$1])) {
        return assert$$1(false, message);
      }
    }

    return true;
  }

  var notBase64RE = /[^A-Z0-9+\/=]/i;

  function base64(assert$$1, value, message) {
    if (!assert$$1(isStr(value), expect('string', message))) {
      return false;
    }

    var len = value.length;
    if (!len || len % 4 !== 0 || notBase64RE.test(value)) {
      return assert$$1(false, message);
    }

    var firstPaddingChar = value.indexOf('=');

    return assert$$1(
      firstPaddingChar === -1 ||
      firstPaddingChar === len - 1 ||
      (firstPaddingChar === len - 2 && value[len - 1] === '='),
      message
    );
  }

  /**********************************************
   * number
   **********************************************/

  function numeric(assert$$1, value, message) {
    var valueIsNum = isNum$1(value);
    if (valueIsNum && value === Infinity) { return true; }
    if (valueIsNum && isNaN(value)) { return assert$$1(false, expect(['number', 'string'], message)); }
    return assert$$1(valueIsNum || isStr(value), expect(['number', 'string'], message))
      && assert$$1(/^[+-]?([0-9]*[.])?[0-9]+$/.test(String(value)), message);
  }

  var intRE = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
  var intLeadingZeroesRE = /^[-+]?[0-9]+$/;

  function int(assert$$1, value, zeroable, message) {
    if (isStr(zeroable)) {
      message = zeroable;
      zeroable = false;
    }
    return assert$$1(isNum$1(value), expect('number', message))
      && assert$$1(!isNaN(value) && value !== Infinity, expect('number', message))
      && assert$$1((zeroable ? intLeadingZeroesRE : intRE).test(String(value)), message);
  }

  function safeInt(assert$$1, value, zeroable, message) {
    return int(assert$$1, value, zeorable, message)
      && assert$$1(Number.isSafeInteger(value), isStr(zeroable) ? zeroable : message);
  }

  /**********************************************
   * date
   **********************************************/

  function toDate(date) {
    if (date instanceof Date) { return date; }
    if (!isStr(date)) { return false; }
    date = Date.parse(date);
    return !isNaN(date) ? new Date(date) : null;
  }

  function getOffsetDays(time1, time2) {
    return Math.floor((time1 - time2) / (3600 * 24 * 1e3));
  }

  function createIsDate(fn) {
    return function dateIs(assert$$1, value, date, message) {
      var original = toDate(value);
      if (!assert$$1(original, expect('date', message))) {
        return false;
      }

      // date 是错误消息函数
      if (typeof date === 'function') {
        message = date;
        date = new Date();
      }

      // 尝试转换带三个参数，如果不能转换成 时间
      var comparison = toDate(date);
      if (comparison == null && typeof date === 'string') {
        message = date;
        comparison = toDate(new Date());
      }
      if (!assert$$1(comparison, expect('date', message, date))) {
        return false;
      }

      return assert$$1(fn(getOffsetDays(original.getTime(), comparison.getTime())), message);
    };
  }

  var yesterday = createIsDate(function (v) { return v === -1; });
  var today = createIsDate(function (v) { return v === 0; });
  var tomorrow = createIsDate(function (v) { return v === 1; });

  function createDateComparison(name, fn) {
    return function dateComparison(assert$$1, value, date, message) {
      var original = toDate(value);
      if (!assert$$1(original, expect('date', message))) {
        return false;
      }
      // date 是错误消息函数
      if (typeof date === 'function') {
        message = date;
        date = new Date();
      }
      var comparison = toDate(date);
      if (comparison == null && typeof date === 'string') {
        message = date;
        comparison = toDate(new Date());
      }
      if (!assert$$1(comparison, expect('date', message, date))) {
        return false;
      }
      return assert$$1(fn(original, comparison), message);
    };
  }

  var after = createDateComparison('after', function (original, comparison) { return original > comparison; });
  var before = createDateComparison('before', function (original, comparison) { return original > comparison; });

  var defaults = /*#__PURE__*/Object.freeze({
    accordance: accordance,
    difference: difference,
    existence: existence,
    inside: inside,
    empty: empty,
    falsy: falsy,
    truthy: truthy,
    match: match,
    startsWith: startsWith,
    endsWith: endsWith,
    ascii: ascii,
    chinese: chinese,
    md5: md5,
    lowercase: lowercase,
    uppercase: uppercase,
    ip: ip,
    phone: phone,
    mail: mail,
    dataURI: dataURI,
    base64: base64,
    numeric: numeric,
    int: int,
    safeInt: safeInt,
    yesterday: yesterday,
    today: today,
    tomorrow: tomorrow,
    after: after,
    before: before
  });

  /**
   * module dependencies
   */

  /**
   * 自定义的校验器
   *
   * @type {object}
   * @private
   */
  var customs = Object.create(null);

  /**
   * 自定义校验器或取消之
   *
   * @param {string} name
   * @param {function|null} validator
   * @return {void|function}
   *
   * @public
   */
  function custom(name, validator) {
    if (validator === null) {
      delete customs[name];
    } else if (validator) {
      assert(typeof validator === 'function', 'validator');
      customs[name] = validator;
    } else {
      return customs[name];
    }
  }

  /**
   * 创建规则
   *
   * @param {string} path
   * @param {object} [privates]
   * @return {function(Object): boolean}
   *
   * @public
   */
  function create(path, privates) {
    if ( privates === void 0 ) privates = {};

    var get = parsePath(path);
    var validators = [];

    /**
     * 规则函数
     * @param {object} object 被校验的数据对象
     * @return {boolean}
     * @throws {Error}
     */
    function rule(object) {
      return validators.length === 0 || validators.every(
        // 允许运行时改变 object 内部值，所以在这里
        // 采用了动态获取需要被校验的数据的方式
        function (validate) { return validate(object, (rule.$value = get(object))); }
      );
    }

    function use(name, validator) {
      assert(typeof name === 'string', 'name');
      assert(name[0] !== '$', 'name', 'can not be starts with char "$"');
      assert(typeof validator === 'function', 'validator');

      rule[name] = function wrappedValidator() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        validators.push(function (object, value) {
          return validator.call.apply(validator, [ object, function (ok, message) {
            if (ok) { return ok; }
            if (typeof message === 'function') { message = message(path, value); }
            if (message == null) { return false; }
            // 检验失败，且给出了错误信息
            throw makeError(path, value, format(message, {
              PATH: path, // 校验路径
              VALUE: value, // 用于校验的值
              NAME: name, // 校验器名称
              ARGS: args.slice(0, -1)// 用于校验的参数列表
            }));
          }, value ].concat( args ));
        });

        // 返回 rule，便于链式调用
        return rule;
      };

      return rule;
    }

    function batch(validators) {
      validators && Object.keys(validators).forEach(function (key) {
        use(key, validators[key]);
      });
      return rule;
    }

    rule.$path = path;
    rule.$value = undefined;
    rule.$get = get;
    rule.$use = use;
    rule.$batch = batch;

    return rule
      .$batch(defaults) // 默认的规则校验器
      .$batch(customs) // 自定义的规则校验器
      .$batch(privates);// 私有的规则校验器
  }

  /**
   * 执行规则列表
   *
   * @param {function[]} rules 规则列表
   * @param {object } object 被校验的数据源
   * @param {boolean} detail 是否返回详情
   * @return {boolean|object}
   * @throws
   *
   * @public
   */
  function execute(rules, object, detail) {
    if ( detail === void 0 ) detail = false;

    assert(
      Array.isArray(rules) &&
      rules.every(function (r) { return typeof r === 'function' && r.$path && r.$get; }),
      'rules'
    );

    // 不需要详情，制作简单校验，可能会触发异常
    if (detail !== true) {
      return rules.every(function (rule) { return rule(object); });
    }

    return rules.reduce(function (details, rule) {
      var path = rule.$path;

      try {
        if (rule(object)) {
          details[path] = true;
          return details;
        }
        // eslint-disable-next-line
        throw {name: 'NotOriginalError'};
      } catch (e) {
        if (e.name !== 'ShiverError') {
          var err = makeError(path, rule.$value, 'unknown error for path {PATH}');
          if (e.name !== 'NotOriginalError') { err.original = e; }
          details[path] = err;
        } else {
          details[path] = e;
        }
        return details;
      }
    }, {});
  }

  exports.custom = custom;
  exports.create = create;
  exports.execute = execute;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
