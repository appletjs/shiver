## create(path，validators)



> **create('数据路径').校验器(参考数据, 异常信息)**



该方法生成一个**规则函数**用于校验数据；该规则函数包含了一系列**校验器**，
所有的校验器返回规则函数本身，便于链式调用。



参数说明：

- **path** `string` 数据路径
- **validators** `Object` 规则校验器



### 数据路径

数据路径指的是用于在被校验数据内寻值的键名，比如：

- 要校验当前请求方法，数据路径是 'method'；
- 要检验通过 GET 方法提交到服务器内的数据，数据路径是 'query.key'；



### 使用校验器

规则一旦创建，如果没有使用校验器，在验证数据的时候会忽略之。

```js
const rule = create('method') // 创建规则
  .inside(['POST', 'PUT', 'PATCH'], 'error message') // 使用校验器
  .existence('error message')// 使用校验器
  // 还可以使用其它的校验器

// 使用规则
try {
  return rule({method: 'DELETE'})
} catch (err) {
  console.log(err.name) // => maybe 'ShiverError'
  console.log(err.path) // => 'method'
  console.log(err.value) // => 'DELETE'
  return false
}
```


规则属性

* **$path** `string`
* $value `mixed`

规则方法

* **$use(name: string, validator: function): rule** 
* **$batch(validators: object): rule**

内置的校验器

- **accordance(data: any, message?: string)** 是否与给出的值相等
- **difference(data: any, message?: string)** 是否与给出的值不一致
- **existence(message?: string)** 是否存在值
- **inside(data: array|string, message?: string)** 是不是给出的数组或字符串的一部分
- **empty(message?: string)** 是不是为空数据
- **falsy(message?: string)** 是不是假值
- **truthy(message?: string)** 是不是真值
- **match(reg: RegExp, message?: string)** 能够通过给出的正则表达式校验
- **startsWith(str: string, message?: string)** 是否以给出的字符串开头
- **endsWith(str: string, message?: string)** 是否以给出的字符串结尾
- **ascii(message?: string)** 是不是全 ASCII 字符串
- **chinese(message?: string)** 是不是全中文字符
- **md5(message?: string)** 是不是 MD5 字符串
- **lowercase(message?: string)** 是不是全小写
- **uppercase(message?: string)** 是不是全大写
- **ip(version?: 4|6|'4'|'6', message?: string)** 是不是IP地址
- **phone(message?: string)** 是不是手机号码
- **mail(message?: string)** 是不是邮箱
- **dataURI(message?: string)** 是不是 data-uri 数据
- **base64(message?: string)** 是不是使用 base64 加密的字符串
- **numeric(message?: string)** 是不是数字
- **int(message?: string)** 是不是整数
- **safeInt(message?: string)** 是不是安全整数
- **yesterday(message?: string)** 是不是昨天
- **today(message?: string)** 是不是今天
- **tomorrow(message?: string)** 是不是明天
- **after(date?: string|number|Date, message?: string)** 是不是在指定时间之后
- **before(date?: string|number|Date, message?: string)** 是不是在指定时间之前


## custom(name[, validator])

- name `string` 检验器名称
- validator 可选
  - 值为 null 时，删除自定义的
  - 未指定时，返回检验器
  - 值为函数时，设置校验器


## execute(rules, object, detail)

执行规则，根据参数 detail，做出不同的返回值。

- **rules** `array` 规则列表
- **object** `object` 被校验的数据对象
- **detail** `boolean` 是否返回校验详情
