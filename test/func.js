import sinon from 'sinon';
import proxyquire from 'proxyquire';
import Koa from 'koa';
import body from 'koa-bodyparser';
import { error } from '../src/middlewares';

const defaultEmailMock = {
  matchCode: '12345678',
};
export function mockEmail({ matchCode } = defaultEmailMock) {
  return {
    generateVerifyCode: sinon.spy(() => matchCode),
    sendEmail: sinon.spy(async () => null),
    sendVerifyEmail: sinon.spy(async () => null),
    reset(options = defaultEmailMock) {
      const newMock = mockEmail(options);
      this.generateVerifyCode = newMock.generateVerifyCode;
      this.sendEmail = newMock.sendEmail;
      this.sendVerifyEmail = newMock.sendVerifyEmail;
    },
  };
}

export function getAllMocks() {
  return {
    email: mockEmail(),
  };
}

export function setupModels(mocks = {}) {
  const allMocks = getAllMocks();
  const { email } = mocks;
  proxyquire('../src/models/user', {
    '../utils': {
      email: email || allMocks.email,
    },
  });
  return {
    email: email || allMocks.email,
  };
}

export function setupKoa() {
  const app = new Koa();
  app.use(body());
  app.use(error());
  app.use((ctx, next) => {
    ctx.session = {};
    return next();
  });
  return app;
}
