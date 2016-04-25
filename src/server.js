import * as configs from './configs';
import Koa from 'koa';
import log from 'koa-logger';
import body from 'koa-bodyparser';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import convert from 'koa-convert';
import routers from './routes';

import './models';

const app = new Koa();
app.keys = configs.session.keys;

app.use(log());
app.use(body());

app.use(convert(session({
  store: redisStore({
    host: configs.session.host,
    port: configs.session.port,
  }),
  prefix: configs.session.prefix,
})));

for (const router of routers) {
  app.use(router.routes());
  app.use(router.allowedMethods());
}

const port = configs.site.port;

app.listen(port);
console.log(`listening on port ${port}`);
