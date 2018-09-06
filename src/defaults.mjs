import {expect, isFalsy} from './utils';

const isStr = o => typeof o === 'string';
const isArr = o => Array.isArray(o);
const isReg = o => o instanceof RegExp;
const isNum = o => typeof o === 'number';

/**********************************************
 * mixed
 **********************************************/

// 是否与给出的值一致
export function accordance(assert, value, data, message) {
  return assert(value === data, message);
}

// 是否不同于给出的值
export function difference(assert, value, data, message) {
  return assert(value !== data, message);
}

// 非 undefined 或 null
export function existence(assert, value, message) {
  return assert(value != null, message);
}

// 包含某个值
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
export function inside(assert, value, data, message) {
  return assert(isArr(data) || isStr(data), expect(['string', 'array'], message, data))
    && assert(data.includes(value), message);
}

function isEmpty(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

export function empty(assert, value, message) {
  return Array.isArray(value)
    ? assert(value.length === 0, message)
    : assert(isEmpty(value), message);
}

/**********************************************
 * boolean
 **********************************************/

// 是否为 falsy 类型的值
export function falsy(assert, value, message) {
  return assert(isFalsy(value), message);
}

// 是否为 truthy 类型的值
export function truthy(assert, value, message) {
  return assert(!isFalsy(value), message);
}

/**********************************************
 * regex
 **********************************************/

// 使用正则表达式验证
export function match(assert, value, reg, message) {
  return assert(isReg(reg), expect('regexp', message, reg))
    && assert(isStr(value), expect('string', message))
    && assert(reg.test(value), message);
}

/**********************************************
 * string
 **********************************************/

// 是否以某个字符串开头
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
export function startsWith(assert, value, data, message) {
  return assert(isStr(data), expect('string', message, data))
    && assert(isStr(value), expect('string', message))
    && assert(value.startsWith(data), message);
}

// 是否以某个字符串结尾
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
export function endsWith(assert, value, data, message) {
  return assert(isStr(data), expect('string', message, data))
    && assert(isStr(value), expect('string', message))
    && assert(value.endsWith(data), message);
}

export function ascii(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(/^[\x00-\x7F]+$/.test(value), message);
}

export function chinese(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(/^[\u4e00-\u9fa5]+$/.test(value), message);
}

export function md5(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(/^[a-f0-9]{32}$/.test(value), message);
}

export function lowercase(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(value === value.toLowerCase(), message);
}

export function uppercase(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(value === value.toUpperCase(), message);
}

// https://github.com/chriso/validator.js/blob/48d68bda5652eb7153a94cda62e904b639df2f4d/src/lib/isIP.js
const ipv4Maybe = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const ipv6Block = /^[0-9A-F]{1,4}$/i;

function isIP4(str) {
  if (!ipv4Maybe.test(str)) return false;
  const parts = str.split('.').sort((a, b) => a - b);
  return parts[3] <= 255;
}

function isIP6(str) {
  const blocks = str.split(':');
  let foundOmissionBlock = false; // marker to indicate ::

  // At least some OS accept the last 32 bits of an IPv6 address
  // (i.e. 2 of the blocks) in IPv4 notation, and RFC 3493 says
  // that '::ffff:a.b.c.d' is valid for IPv4-mapped IPv6 addresses,
  // and '::a.b.c.d' is deprecated, but also valid.
  const foundIPv4TransitionBlock = isIP4(blocks[blocks.length - 1]);
  const expectedNumberOfBlocks = foundIPv4TransitionBlock ? 7 : 8;

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

  for (let i = 0; i < blocks.length; ++i) {
    // test for a :: which can not be at the string start/end
    // since those cases have been handled above
    if (blocks[i] === '' && i > 0 && i < blocks.length - 1) {
      if (foundOmissionBlock) {
        return false; // multiple :: in address
      }
      foundOmissionBlock = true;
    } else if (foundIPv4TransitionBlock && i === blocks.length - 1) {
      // it has been checked before that the last
      // block is a valid IPv4 address
    } else if (!ipv6Block.test(blocks[i])) {
      return false;
    }
  }

  if (foundOmissionBlock) {
    return blocks.length >= 1;
  }

  return blocks.length === expectedNumberOfBlocks;
}

export function ip(assert, value, version, message) {
  if (assert(isStr(value), expect('string', message))) {
    const v = String(version);
    if (v === '4') return assert(isIP4(value), message);
    if (v === '6') return assert(isIP6(value), message);
    // version 不符合版本声明，则将 version 作为 message 使用
    return assert(isIP4(value) || isIP6(value), version);
  }
  return false;
}

export function phone(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(value), message);
}

export function mail(assert, value, message) {
  return assert(isStr(value), expect('string', message))
    && assert(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value), message);
}

const validMediaType = /^[a-z]+\/[a-z0-9\-\+]+$/i;
const validAttribute = /^[a-z\-]+=[a-z0-9\-]+$/i;
const validData = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;

export function dataURI(assert, value, message) {
  if (!assert(isStr(value), expect('string', message))) {
    return false;
  }

  let data = value.split(',');
  if (data.length < 2) {
    return assert(false, message);
  }

  const attributes = data.shift().trim().split(';');
  const schemeAndMediaType = attributes.shift();
  if (schemeAndMediaType.substr(0, 5) !== 'data:') {
    return assert(false, message);
  }

  const mediaType = schemeAndMediaType.substr(5);
  if (mediaType !== '' && !validMediaType.test(mediaType)) {
    return assert(false, message);
  }

  for (let i = 0; i < attributes.length; i++) {
    if (i === attributes.length - 1 && attributes[i].toLowerCase() === 'base64') {
      continue; // ok
    }
    if (!validAttribute.test(attributes[i])) {
      return assert(false, message);
    }
  }

  for (let i = 0; i < data.length; i++) {
    if (!validData.test(data[i])) {
      return assert(false, message);
    }
  }

  return true;
}

const notBase64RE = /[^A-Z0-9+\/=]/i;

export function base64(assert, value, message) {
  if (!assert(isStr(value), expect('string', message))) {
    return false;
  }

  const len = value.length;
  if (!len || len % 4 !== 0 || notBase64RE.test(value)) {
    return assert(false, message);
  }

  const firstPaddingChar = value.indexOf('=');

  return assert(
    firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && value[len - 1] === '='),
    message
  );
}

/**********************************************
 * number
 **********************************************/

export function numeric(assert, value, message) {
  const valueIsNum = isNum(value);
  if (valueIsNum && value === Infinity) return true;
  if (valueIsNum && isNaN(value)) return assert(false, expect(['number', 'string'], message));
  return assert(valueIsNum || isStr(value), expect(['number', 'string'], message))
    && assert(/^[+-]?([0-9]*[.])?[0-9]+$/.test(String(value)), message);
}

const intRE = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
const intLeadingZeroesRE = /^[-+]?[0-9]+$/;

export function int(assert, value, zeroable, message) {
  if (isStr(zeroable)) {
    message = zeroable;
    zeroable = false;
  }
  return assert(isNum(value), expect('number', message))
    && assert(!isNaN(value) && value !== Infinity, expect('number', message))
    && assert((zeroable ? intLeadingZeroesRE : intRE).test(String(value)), message);
}

export function safeInt(assert, value, zeroable, message) {
  return int(assert, value, zeorable, message)
    && assert(Number.isSafeInteger(value), isStr(zeroable) ? zeroable : message);
}

/**********************************************
 * date
 **********************************************/

function toDate(date) {
  if (date instanceof Date) return date;
  if (!isStr(date)) return false;
  date = Date.parse(date);
  return !isNaN(date) ? new Date(date) : null;
}

function getOffsetDays(time1, time2) {
  return Math.floor((time1 - time2) / (3600 * 24 * 1e3));
}

function createIsDate(fn) {
  return function dateIs(assert, value, date, message) {
    const original = toDate(value);
    if (!assert(original, expect('date', message))) {
      return false;
    }

    // date 是错误消息函数
    if (typeof date === 'function') {
      message = date;
      date = new Date();
    }

    // 尝试转换带三个参数，如果不能转换成 时间
    let comparison = toDate(date);
    if (comparison == null && typeof date === 'string') {
      message = date;
      comparison = toDate(new Date());
    }
    if (!assert(comparison, expect('date', message, date))) {
      return false;
    }

    return assert(fn(getOffsetDays(original.getTime(), comparison.getTime())), message);
  };
}

export const yesterday = createIsDate(v => v === -1);
export const today = createIsDate(v => v === 0);
export const tomorrow = createIsDate(v => v === 1);

function createDateComparison(name, fn) {
  return function dateComparison(assert, value, date, message) {
    const original = toDate(value);
    if (!assert(original, expect('date', message))) {
      return false;
    }
    // date 是错误消息函数
    if (typeof date === 'function') {
      message = date;
      date = new Date();
    }
    let comparison = toDate(date);
    if (comparison == null && typeof date === 'string') {
      message = date;
      comparison = toDate(new Date());
    }
    if (!assert(comparison, expect('date', message, date))) {
      return false;
    }
    return assert(fn(original, comparison), message);
  };
}

export const after = createDateComparison('after', (original, comparison) => original > comparison);
export const before = createDateComparison('before', (original, comparison) => original > comparison);
