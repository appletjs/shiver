const bailRE = /[^\w.$]/;

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
export function parsePath(path) {
  if (bailRE.test(path)) {
    return function (object) {
      return object[path];
    };
  }

  const segments = path.split('.');

  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      let key = segments[i];
      if (Array.isArray(obj)) key = +key;
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
export function assert(value, name, detail) {
  if (value) return;
  let msg = `Invalid params "${name}"`;
  if (detail) msg += ', ' + detail;
  const err = new Error(msg);
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
export function format(tpl, data) {
  const reg = new RegExp('\\{(' + Object.keys(data).join('|') + ')\\}', 'g');
  return tpl.replace(reg, function (_, key) {
    let value = data[key];
    if (typeof value === 'number' && isNaN(value)) return 'NaN';
    if (value === Infinity) return 'Infinity';
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
export function makeError(path, value, message) {
  const err = new Error(message);
  err.name = 'ShiverError';
  err.path = path;
  err.value = value;
  return err;
}

function getType(obj) {
  if (isNaN(obj)) return 'NaN';
  if (obj === Infinity) return 'Infinity';
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
export function expect(types, message, param) {
  if (message == null) return undefined;
  if (Array.isArray(types)) types = types.join('" or "');
  if (arguments.length > 2) return () => `expected params "${types}", give "${getType(param)}"`;
  return (_, value) => `expected "${types}": {PATH}, found "${getType(value)}"`;
}

// https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy
export function isFalsy(value) {
  if (typeof value === 'number') return value === 0 || isNaN(value);
  // `value == null`  => undefined or null
  return value === false || value === '' || value == null;
}
