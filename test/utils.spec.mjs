import {describe, it} from './lang';
import assert from 'assert';
import {parsePath, makeError, format, assert as ass} from '../src/utils';

describe('utils.parsePath', function () {
  const obj = {
    simple: 'simple value',
    search: [
      {url: 'https://www.baidu.com', name: 'baidu'},
      {url: 'https://www.google.com', name: 'google'},
    ],
    results: {
      baidu: {
        post: 100,
        page: 10,
        result: []
      }
    }
  };
  it('simple path', function () {
    assert(parsePath('simple')(obj) === 'simple value');
  });

  it('deep path for array', function () {
    assert(parsePath('search.0.name')(obj) === 'baidu');
  });

  it('deep path', function () {
    assert(parsePath('results.baidu.post')(obj) === 100);
  });
});

describe('utils.makeError', function () {
  const path = 'obj.path.key';
  const value = 'test value string';
  const msg = 'error message';
  const err = makeError(path, value, msg);
  it('name', () => assert(err.name === 'ShiverError'));
  it('path', () => assert(err.path === path));
  it('message', () => assert(err.message === msg));
});

describe('utils.format', function () {
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

  it('format number', () => {
    assert(format('this is {num}', data) === ('this is ' + data.num));
  });

  it('format Infinity', function () {
    assert(format('this is {Infinity}', data) === 'this is Infinity');
  });

  it('format NaN', function () {
    assert(format('this is {NaN}', data) === 'this is NaN');
  });

  it('format null', function () {
    assert(format('this is {null}', data) === 'this is null');
  });

  it('format undefined', function () {
    assert(format('this is {undefined}', data) === 'this is undefined');
  });

  it('format date', function () {
    assert(format('this is {date}', data) === ('this is "' + data.date.toISOString() + '"'));
  });

  it('format object', function () {
    assert(format('result: {obj}', data) === ('result: ' + JSON.stringify(data.obj)));
  });

  it('format some', function () {
    assert(format('{NaN} {Infinity} {num} {null} {undefined} {date} {obj}', data) === (
      'NaN Infinity ' + data.num + ' null undefined "' + data.date.toISOString() + '" ' + JSON.stringify(data.obj)
    ));
  });
});

describe('utils.assert', function () {
  const falsys = [
    false,
    0,
    '',
    null,
    undefined,
    NaN,
    true,
    123,
    'true',
    {jsj: 'jjj'},
    new Date(),
    [],
    [1, 2, 3, 4, 5]
  ];

  function isFalsy(value) {
    // `value == null`  => undefined or null
    return value === false || value === 0 || value === '' || value == null || isNaN(value);
  }

  falsys.forEach(function (value) {
    if (!isFalsy(value)) {
      it(format('assert truthy {value}', {value}), function () {
        const name = 'truthyName';
        ass(value, name);
        assert(true);
      });
    } else {
      it(format('assert falsy {value}', {value}), function () {
        const name = 'falsyName';
        try {
          ass(value, name);
        } catch (e) {
          assert(e.name === 'ShiverError');
          assert(e.message === 'Invalid params "' + name + '"');
        }
      });
    }
  });


  falsys.forEach(function (value) {
    if (!isFalsy(value)) {
      it(format('assert truthy {value} for deital', {value}), function () {
        const name = 'truthyName';
        const detail = 'the truthy detail message';
        ass(value, name, detail);
        assert(true);
      });
    } else {
      it(format('assert falsy {value} for deital', {value}), function () {
        const name = 'falsyName';
        const detail = 'the falsy detail message';
        try {
          ass(value, name, detail);
        } catch (e) {
          assert(e.name === 'ShiverError');
          assert(e.message === 'Invalid params "' + name + '", ' + detail);
        }
      });
    }
  });
});
