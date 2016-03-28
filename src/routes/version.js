import Router from 'koa-router';
import { error } from '../middlewares';
import pkg from '../../package.json';

const info = {
  name: pkg.name,
  version: pkg.version,
  env: process.env.NODE_ENV,
};

const router = new Router();
export default router;

router.prefix('/version');
router.use(error());

router.get('/', async (ctx) => {
  ctx.body = info;
});
