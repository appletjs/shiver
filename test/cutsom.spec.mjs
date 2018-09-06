import {describe, it} from './lang';
import {custom, create} from '../src/index';
import assert from 'assert';

describe('shiver.custom', function () {
  const data = {
    NaN,
    Infinity,
    num: 189378,
    null: null,
    undefined,
    date: new Date(),
    obj: {
      key0: 18778,
      key1: 'value1',
      key2: undefined,
      key3: NaN,
      key4: null,
      key5: '',
      key6: 'string',
      key7: [],
      key8: [1, '2', null, undefined, Infinity, NaN],
      key9: {
        key11: 'value11',
        key22: 1128789
      }
    }
  };

  it('rule.$path', function () {
    const rule = create('a.b.c');
    assert(rule.$path === 'a.b.c');
  });

  it('rule.$value', function () {
    const rule = create('a.b.c');
    assert(rule.$value === undefined);
    rule.existence();
    rule({a: {b: {c: 'ssjjs'}}});
    assert(rule.$value === 'ssjjs');
  });

  it('custom validator', function () {
    custom('test', (assert, value, reg, message) => assert(reg.test(value), message));
    assert(typeof custom('test') === 'function');
  });

  it('use custom validator', function () {
    const rule = create('obj.key1');
    rule.test(/val/);
    assert(rule(data));
    rule.test(/valx/);
    assert(!rule(data));
  });

  it('use custom validator of message', function () {
    const rule = create('obj.key1');
    const msg = '{PATH} {VALUE}';
    rule.test(/val/, msg);
    assert(rule(data));
    rule.test(/valux/, msg);
    try {
      rule(data);
    } catch (e) {
      assert(e.message === '"obj.key1" "value1"');
    }
  });
});
