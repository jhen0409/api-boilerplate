import Router from 'koa-router';
import mongoose from 'mongoose';
import { error, schema, mustLogin } from '../middlewares';
import { returnCode, res } from '../utils';

const router = new Router();
export default router;

router.prefix('/user');
router.use(error());

router.post('/register', schema({
  type: 'object',
  properties: {
    firstName: { type: 'string', maxLength: 20 },
    lastName: { type: 'string', maxLength: 20 },
    email: { type: 'string', is: 'email' },
    password: { type: 'string', maxLength: 16 },
  },
  required: ['firstName', 'lastName', 'email', 'password'],
  additionalProperties: false,
}), async ctx => {
  const data = ctx.request.body;
  const User = mongoose.model('User');
  const result = await User.register(data);
  if (typeof result === 'string') {
    res.err(returnCode.err[result]);
  }
  res(ctx, returnCode.valid.success);
});

router.get('/register/email-check', async ctx => {
  const { code } = ctx.request.query;
  const User = mongoose.model('User');
  const result = await User.registerEmailCheck(code);
  if (typeof result === 'string') {
    res.err(returnCode.err[result]);
  }
  res(ctx, returnCode.valid.success);
});

router.post('/login', schema({
  type: 'object',
  properties: {
    email: { type: 'string', is: 'email' },
    password: { type: 'string' },
  },
  required: ['email', 'password'],
  additionalProperties: false,
}), async ctx => {
  const User = mongoose.model('User');
  const { email, password } = ctx.request.body;
  const result = await User.login(email, password);
  if (typeof result === 'string') {
    res.err(returnCode.err[result]);
  }
  ctx.session.user = { _id: result._id };
  res(ctx, returnCode.valid.success);
});

router.post('/logout', mustLogin(), async ctx => {
  delete ctx.session.user;
  res(ctx, returnCode.valid.success);
});

router.get('/me', mustLogin(), async ctx => {
  res(ctx, {
    ...returnCode.valid.success,
    object: ctx.user.clearResponse(),
  });
});

router.put('/me', mustLogin(), schema({
  type: 'object',
  properties: {
    firstName: { type: 'string', maxLength: 20 },
    lastName: { type: 'string', maxLength: 20 },
  },
  required: ['firstName', 'lastName'],
  additionalProperties: false,
}), async ctx => {
  await ctx.user.updateInfo(ctx.request.body);
  res(ctx, {
    ...returnCode.valid.success,
    object: ctx.user.clearResponse(),
  });
});
