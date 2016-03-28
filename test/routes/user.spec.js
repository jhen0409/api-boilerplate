import { getAllMocks, setupModels, setupKoa } from '../func';
import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import userRouter from '../../src/routes/user';
import { returnCode } from '../../src/utils';
import { expect } from 'chai';

function setupKoaLogin(middlewares = []) {
  const app = setupKoa();
  middlewares.forEach(middleware => app.use(middleware));
  app.use(userRouter.routes());
  app.use(userRouter.allowedMethods());
  return app;
}

describe('User route', function () {
  this.timeout(5000);
  let mocks;
  let app;
  let User;

  before(() => {
    mocks = getAllMocks();
    setupModels(mocks);
    app = setupKoaLogin();
    User = mongoose.model('User');
  });

  afterEach(async () => {
    mocks.email.reset();
    await User.remove({});
  });

  it('should return `schemaNotMatch` with POST /user/register', async () => {
    const test = obj => request(app.listen())
      .post('/user/register')
      .send(obj)
      .expect(403, {
        ...returnCode.err.schemaNotMatch,
        success: false,
      });

    const data = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    };

    await test({ ...data, firstName: 't'.repeat(21) }); // len > 20
    await test({ ...data, lastName: 't'.repeat(21) }); // len > 20
    await test({ ...data, email: 'test' }); // isn't email
    await test({ ...data, password: 't'.repeat(17) }); // len > 16
    await test({ ...data, additional: 'test' }); // additional properties
  });

  it('should register', async () => {
    await request(app.listen())
      .post('/user/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'testuser',
      })
      .expect(200);
    expect(await User.get('test@test.com')).to.be.an('object');
    const { email } = mocks;
    expect(email.generateVerifyCode.called).to.be.true;
    expect(email.sendVerifyEmail.called).to.be.true;
  });

  it('should return `emailAlreadyUsed` with POST /user/register', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });

    const { email } = mocks;
    email.reset();

    await request(app.listen())
      .post('/user/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'testuser',
      })
      .expect(403, {
        ...returnCode.err.emailAlreadyUsed,
        success: false,
      });

    expect(email.generateVerifyCode.called).to.be.false;
    expect(email.sendVerifyEmail.called).to.be.false;
  });

  it('should return `invalidCode` with GET /user/register/email-check', async () => {
    // no user
    await request(app.listen())
      .get('/user/register/email-check?code=12345678')  // default match code
      .expect(403, {
        ...returnCode.err.invalidCode,
        success: false,
      });

    const user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    // code not match
    await request(app.listen())
      .get('/user/register/email-check?code=123456')  // default match code
      .expect(403, {
        ...returnCode.err.invalidCode,
        success: false,
      });
    user.login.verifyExpires = new Date();
    await user.save();
    // expired
    await request(app.listen())
      .get('/user/register/email-check?code=12345678')  // default match code
      .expect(403, {
        ...returnCode.err.invalidCode,
        success: false,
      });
  });

  it('should pass with GET /user/register/email-check', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await request(app.listen())
      .get('/user/register/email-check?code=12345678')
      .expect(200, {
        ...returnCode.valid.success,
        success: true,
      });
  });

  it('should return `schemaNotMatch` with POST /user/login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await User.registerEmailCheck('12345678');  // default match code

    const test = obj => request(app.listen())
      .post('/user/register')
      .send(obj)
      .expect(403, {
        ...returnCode.err.schemaNotMatch,
        success: false,
      });

    const data = {
      email: 'test@test.com',
      password: 'testuser',
    };
    await test({ ...data, email: 'test' }); // isn't email
    await test({ ...data, password: 't'.repeat(17) }); // len > 16
    await test({ ...data, additional: 'test' }); // additional properties
  });

  it('should return `userNotFound` with POST /user/login', async () => {
    await request(app.listen())
      .post('/user/login')
      .send({
        email: 'invalid@test.com',
        password: 'testuser',
      })
      .expect(403, {
        ...returnCode.err.userNotFound,
        success: false,
      });
  });

  it('should return `emailNotVerify` with POST /user/login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await request(app.listen())
      .post('/user/login')
      .send({
        email: 'test@test.com',
        password: 'testuser',
      })
      .expect(403, {
        ...returnCode.err.emailNotVerify,
        success: false,
      });
  });

  it('should return `invalidPassword` with POST /user/login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await User.registerEmailCheck('12345678');  // default match code

    await request(app.listen())
      .post('/user/login')
      .send({
        email: 'test@test.com',
        password: 'invalid',
      })
      .expect(403, {
        ...returnCode.err.invalidPassword,
        success: false,
      });
  });

  it('should pass with POST /user/login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await User.registerEmailCheck('12345678');  // default match code
    await request(app.listen())
      .post('/user/login')
      .send({
        email: 'test@test.com',
        password: 'testuser',
      })
      .expect(200);
  });

  it('should return `mustLogin` with POST /user/logout', async () => {
    await request(app.listen())
      .post('/user/logout')
      .expect(403, {
        ...returnCode.err.mustLogin,
        success: false,
      });
  });

  it('should pass with POST /user/logout', async () => {
    const user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const unitApp = setupKoaLogin([
      (ctx, next) => {
        ctx.session = { user: { _id: user._id } };
        return next();
      },
    ]);
    await request(unitApp.listen())
      .post('/user/logout')
      .expect(200);
  });

  it('should return `mustLogin` with GET /user/me', async () => {
    await request(app.listen())
      .get('/user/me')
      .expect(403, {
        ...returnCode.err.mustLogin,
        success: false,
      });
  });

  it('should pass with GET /user/me', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const user = await User.registerEmailCheck('12345678');  // default match code
    const unitApp = setupKoaLogin([
      (ctx, next) => {
        ctx.session = { user: { _id: user._id } };
        return next();
      },
    ]);
    await request(unitApp.listen())
      .get('/user/me')
      .expect(200, {
        ...returnCode.valid.success,
        success: true,
        object: {
          _id: user._id.toString(),
          firstName: 'Test',
          lastName: 'User',
          login: {
            email: 'test@test.com',
            verified: true,
            verifiedDateTime: JSON.stringify(user.login.verifiedDateTime).replace(/"/g, ''),
          },
        },
      });
  });

  it('should return `mustLogin` with PUT /user/me', async () => {
    await request(app.listen())
      .put('/user/me')
      .send({
        firstName: 'Renamed',
        lastName: 'Renamed',
      })
      .expect(403, {
        ...returnCode.err.mustLogin,
        success: false,
      });
  });

  it('should return `schemaNotMatch` with PUT /user/me', async () => {
    const user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const unitApp = setupKoaLogin([
      (ctx, next) => {
        ctx.session = { user: { _id: user._id } };
        return next();
      },
    ]);
    const test = obj => request(unitApp.listen())
      .put('/user/me')
      .send(obj)
      .expect(403, {
        ...returnCode.err.schemaNotMatch,
        success: false,
      });

    const data = {
      firstName: 'Renamed',
      lastName: 'Renamed',
    };
    await test({ ...data, firstName: 't'.repeat(21) });  // len > 20
    await test({ ...data, lastName: 't'.repeat(21) });  // len > 20
    await test({ ...data, additional: 'test' });  // additional properties
  });

  it('should pass with PUT /user/me', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const user = await User.registerEmailCheck('12345678');  // default match code
    const unitApp = setupKoaLogin([
      (ctx, next) => {
        ctx.session = { user: { _id: user._id } };
        return next();
      },
    ]);
    await request(unitApp.listen())
      .put('/user/me')
      .send({
        firstName: 'Renamed',
        lastName: 'Renamed',
      })
      .expect(200, {
        ...returnCode.valid.success,
        success: true,
        object: {
          _id: user._id.toString(),
          firstName: 'Renamed',
          lastName: 'Renamed',
          login: {
            email: 'test@test.com',
            verified: true,
            verifiedDateTime: JSON.stringify(user.login.verifiedDateTime).replace(/"/g, ''),
          },
        },
      });
  });
});
