/**
 * module dependencies
 */
import {assert, format, makeError, parsePath} from './utils';
import * as defaults from './defaults';

/**
 * 自定义的校验器
 *
 * @type {object}
 * @private
 */
const customs = Object.create(null);

/**
 * 自定义校验器或取消之
 *
 * @param {string} name
 * @param {function|null} validator
 * @return {void|function}
 *
 * @public
 */
export function custom(name, validator) {
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
export function create(path, privates = {}) {
  const get = parsePath(path);
  const validators = [];

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
      validate => validate(object, (rule.$value = get(object)))
    );
  }

  function use(name, validator) {
    assert(typeof name === 'string', 'name');
    assert(name[0] !== '$', 'name', 'can not be starts with char "$"');
    assert(typeof validator === 'function', 'validator');

    rule[name] = function wrappedValidator(...args) {
      validators.push(function (object, value) {
        return validator.call(object, function (ok, message) {
          if (ok) return ok;
          if (typeof message === 'function') message = message(path, value);
          if (message == null) return false;
          // 检验失败，且给出了错误信息
          throw makeError(path, value, format(message, {
            PATH: path, // 校验路径
            VALUE: value, // 用于校验的值
            NAME: name, // 校验器名称
            ARGS: args.slice(0, -1)// 用于校验的参数列表
          }));
        }, value, ...args);
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
export function execute(rules, object, detail = false) {
  assert(
    Array.isArray(rules) &&
    rules.every(r => typeof r === 'function' && r.$path && r.$get),
    'rules'
  );

  // 不需要详情，制作简单校验，可能会触发异常
  if (detail !== true) {
    return rules.every(rule => rule(object));
  }

  return rules.reduce(function (details, rule) {
    const path = rule.$path;

    try {
      if (rule(object)) {
        details[path] = true;
        return details;
      }
      // eslint-disable-next-line
      throw {name: 'NotOriginalError'};
    } catch (e) {
      if (e.name !== 'ShiverError') {
        const err = makeError(path, rule.$value, 'unknown error for path {PATH}');
        if (e.name !== 'NotOriginalError') err.original = e;
        details[path] = err;
      } else {
        details[path] = e;
      }
      return details;
    }
  }, {});
}
