if (process.env.NODE_ENV === 'production') {
  require('source-map-support').install();
}

require('babel-polyfill');
require('./server');
