if (process.env.NODE_ENV === 'production') {
  require('source-map-support').install();
}

require('./server');
