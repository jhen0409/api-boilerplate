const site = {
  protocol: 'http',
  host: 'localhost',
  port: process.env.PORT || 8000,
  url: 'http://localhost',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(site, {
  });
}

export default site;
