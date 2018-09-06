let indent = 0;

const cyan = msg => '\x1B[36m' + msg + '\x1B[39m';
const red = msg => '\x1B[31m' + msg + '\x1B[39m';
const green = msg => '\x1B[32m' + msg + '\x1B[39m';
const grey = msg => '\x1B[90m' + msg + '\x1B[39m';
const bold = msg => '\x1B[1m' + msg + '\x1B[22m';

export function describe(name, fn) {
  const indentString = ' '.repeat(indent * 2);

  process.stdout.write(indentString);
  process.stdout.write(bold(cyan(name)) + '\n');

  try {
    indent++;
    fn();
  } catch (e) {
    e.message.split('\n').forEach(function (line) {
      process.stdout.write(indentString + '    ' + grey(line.trim()));
    });
  }

  indent--;
}

export function it(name, fn) {
  const indentString = ' '.repeat(indent * 2);
  process.stdout.write(indentString);

  try {
    fn();
    process.stdout.write(green(' ✔ ' + name) + '\n');
  } catch (e) {
    process.stdout.write(red(' ✘ ' + name) + '\n');
    e.message.split('\n').forEach(function (line) {
      process.stdout.write(indentString + '    ' + grey(line.trim()) + '\n');
    });
  }
}
