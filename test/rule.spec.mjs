import {describe, it} from './lang';
import {create} from '../src/index';
import {isFalsy} from '../src/utils';
import assert from 'assert';

const now = new Date();
const data = {
  key1: 'simple string',
  key2: now,
  key3: '2018-06-06T09:00:17.943Z',
  key4: Date.parse('2020-09-06T09:00:17.943Z'),
  key5: 123455,
  key6: NaN,
  key7: [],
  key8: '',
  key9: undefined,
  key10: null,
  key11: false,
  key12: true,
  key13: 0,
  key14: '全是中文的字符串',
  key15: 'i am Sam',
  key16: '中英chinese文混english编'
};
const keys = Object.keys(data);

function stringify(value) {
  if (typeof value === 'number' && isNaN(value)) return 'NaN';
  if (value === Infinity) return 'Infinity';
  if (value instanceof RegExp) return '/' + value.source + '/' + value.flags;
  if (value instanceof Date) return 'Date<' + value.toISOString() + '>';
  return JSON.stringify(value);
}

describe('rule.accordance', function () {
  it('should yes', function () {
    assert(create('key1').accordance('shdcudhud')(data) === false);
  });
  it('should no', function () {
    assert(create('key1').accordance(data.key1)(data) === true);
  });
});
describe('rule.difference', function () {
  it('should yes', function () {
    assert(create('key1').difference('shdcudhud')(data) === true);
  });
  it('should no', function () {
    assert(create('key1').difference(data.key1)(data) === false);
  });
});
describe('rule.existence', function () {
  it('should yes', function () {
    assert(create('key1').existence()(data) === true);
  });
  it('should no', function () {
    assert(create('keyN').existence()(data) === false);
  });
});
describe('rule.inside', function () {
  it('should yes', function () {
    assert(create('key1').inside('adcasimple stringssss')(data) === true);
  });
  it('should no', function () {
    assert(create('key1').inside([])(data) === false);
    assert(create('key1').inside('')(data) === false);
    assert(create('keyN').inside('')(data) === false);
    assert(create('keyN').inside([])(data) === false);
  });
});
describe('rule.empty', function () {
  ['key1', 'key2', 'key3', 'key4', 'key5', 'key6'].forEach(function (key) {
    it('no: ' + stringify(data[key]), function () {
      assert(create(key).empty()(data) === false);
    });
  });
  ['key7', 'key8', 'key9', 'key10', 'keyN'].forEach(function (key) {
    it('yes: ' + stringify(data[key]), function () {
      assert(create(key).empty()(data) === true);
    });
  });
});
describe('rule.falsy', function () {
  keys.forEach(function (key) {
    const value = data[key];
    it((isFalsy(value) ? 'yes: ' : 'no: ') + stringify(value), function () {
      assert(create(key).falsy()(data) === isFalsy(value));
    });
  });
});
describe('rule.truthy', function () {
  keys.forEach(function (key) {
    const value = data[key];
    it((!isFalsy(value) ? 'yes: ' : 'no: ') + stringify(value), function () {
      assert(create(key).truthy()(data) === !isFalsy(value));
    });
  });
});
describe('rule.match', function () {
  const yes = {
    key1: /simple/,
    key3: /\d{4}-\d{1,2}-\d{1,2}/
  };
  keys.forEach(function (key) {
    const reg = yes[key];
    it((reg ? 'yes: ' : 'no: ') + stringify(data[key]), function () {
      assert(create(key).match(reg)(data) === !!reg);
    });
  });
});
describe('rule.startsWith', function () {
  const starts = {
    key1: 'simple',
    key3: '2018-06-',
    key14: '全是',
    key15: 'i a',
    key16: '中英chin'
  };
  keys.forEach(function (key) {
    const ok = starts[key];
    it((ok ? 'yes: ' : 'no: ') + stringify(data[key]), function () {
      assert(create(key).startsWith(ok)(data) === !!ok);
    });
  });
});
describe('rule.endsWith', function () {
  const yes = {
    key1: 'ring',
    key3: '7.943Z',
    key14: '字符串',
    key15: 'Sam',
    key16: 'lish编'
  };
  keys.forEach(function (key) {
    const ok = yes[key];
    it((ok ? 'yes: ' : 'no: ') + stringify(data[key]), function () {
      assert(create(key).endsWith(ok)(data) === !!ok);
    });
  });
});
