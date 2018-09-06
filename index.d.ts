declare namespace shiver {
  type MessageGenerator = (path: string, value: any) => any;
  type Message = string | MessageGenerator;
  type Assertion = (value: any, message?: Message) => boolean | never;
  type Validator = (assert: Assertion, value: any, data?: any, message?: string) => boolean | never;
  type Results = Record<string, ShiverError | true>;
  type IPVersion = 4 | 6 | '4' | '6';

  interface ShiverError extends Error {
    name: 'ShiverError';
    path: string;
    value: any;
    original?: Error;
  }

  interface Rule {
    (object: object): boolean | never;

    // mixed
    accordance(data: any, message?: Message): Rule;
    difference(data: any, message?: Message): Rule;
    existence(message?: Message): Rule;
    inside(data: any[] | string, message?: Message): Rule;
    empty(message?: Message): Rule;

    // boolean
    falsy(message?: Message): Rule;
    truthy(message?: Message): Rule;

    // regex
    match(reg: RegExp, message?: Message): Rule;

    // string
    startsWith(data: string, message?: Message): Rule;
    endsWith(data: string, message?: Message): Rule;
    acsii(message?: Message): Rule;
    chinese(message?: Message): Rule;
    md5(message?: Message): Rule;
    dataURI(message?: Message): Rule;
    base64(message?: Message): Rule;
    ip(message?: Message): Rule;
    ip(version: IPVersion, message?: Message): Rule;
    lowercase(message?: Message): Rule;
    uppercase(message?: Message): Rule;
    phone(message?: Message): Rule;
    mail(message?: Message): Rule;

    // number
    numeric(message?: Message): Rule;
    int(message?: Message): Rule;
    int(zeroable: boolean, message?: Message): Rule;
    safeInt(message?: Message): Rule;
    safeInt(zeroable: boolean, message?: Message): Rule;

    // date
    yesterday(message?: Message): Rule;
    yesterday(date?: Date | string, message?: Message): Rule;
    today(message?: string): Rule;
    today(date?: Date | string, message?: Message): Rule;
    tomorrow(message?: Message): Rule;
    tomorrow(date?: Date | string, message?: Message): Rule;
    before(message?: string): Rule;
    before(date?: Date | string, message?: Message): Rule;
    after(message?: string): Rule;
    after(date?: Date | string, message?: Message): Rule;
  }

  function custom(name: string): Validator | void;
  function custom(name: string, validator: null): void;
  function custom(name: string, validator: Validator): void;

  function create(path: string, validators?: Record<string, Validator>): Rule;

  function execute(rules: Rule[], object: object): boolean | never;
  function execute(rules: Rule[], object: object, detail?: boolean): Results | never;
}

export = shiver
