export default {
  host: process.env.DOCKER ? 'redis' : 'localhost',
  port: 6379,
  keys: ['_api_nhvOFuFvE7VpifanXTG74cnGl5OTJUm'],
  prefix: 'api::',
};
