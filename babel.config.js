const presets = [
  '@babel/preset-react',
  [
    '@babel/env',
    {
      targets: {
        browsers: ['last 3 versions', 'safari >= 7'],
      },
      useBuiltIns: 'usage',
      corejs: 2,
      modules: false,
    },
  ],
];
const plugins = [['@babel/plugin-transform-runtime', { corejs: 2 }]];
const ignore = ['./dll/methods.min.js'];
module.exports = { presets, plugins, ignore };
