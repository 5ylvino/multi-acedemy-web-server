const webpack = require('webpack');

module.exports = function (options, webpack) {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'class-validator',
    'class-transformer',
  ];

  return {
    ...options,
    externals: {
      'bcrypt': 'commonjs bcrypt',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            return false;
          }
          // Ignore nock and node-pre-gyp dependencies
          if (resource.includes('nock') || resource.includes('node-pre-gyp')) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};
