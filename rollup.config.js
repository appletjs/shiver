import buble from 'rollup-plugin-buble';

function pack(format) {
  const plugins = [];
  const ext = format !== 'cjs' ? '.' + format : '';

  if (format === 'umd') {
    plugins.push(buble());
  }

  return {
    input: './src/index.mjs',
    plugins,
    output: {
      file: `lib/shiver${ext}.js`,
      name: 'shiver',
      format
    }
  };
}

export default [
  pack('cjs'),
  pack('esm'),
  pack('umd')
];
