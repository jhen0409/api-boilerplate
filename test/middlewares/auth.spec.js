import mongoose from 'mongoose';
import sinon from 'sinon';
import { expect } from 'chai';
import { setupModels } from '../func';
import { mustLogin } from '../../src/middlewares/auth';
import { returnCode } from '../../src/utils';

const middleware = mustLogin();

describe('Auth middlewares', () => {
  describe('mustLogin', function () {
    this.timeout(5000);

    let User;
    before(() => {
      setupModels();
      User = mongoose.model('User');
    });

    afterEach(async () => User.remove({}));

    it('should return `mustLogin` message', async () => {
      const ctx = { session: {} };
      const next = sinon.spy();
      try {
        await middleware(ctx, next);
      } catch (ex) {
        expect(ex).to.eql({
          type: 'return',
          status: 403,
          content: returnCode.err.mustLogin,
        });
      } finally {
        expect(next.called).to.be.false;
      }
    });

    it('should return `invalidUser` message', async () => {
      const ctx = { session: { user: { _id: '4fc67871349bb7bf6a000002' } } };
      const next = sinon.spy();
      try {
        await middleware(ctx, next);
      } catch (ex) {
        expect(ex).to.eql({
          type: 'return',
          status: 403,
          content: returnCode.err.invalidUser,
        });
      }
      expect(next.called).to.be.false;
    });

    it('should pass', async () => {
      const user = await User.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'testuser',
      });
      await User.registerEmailCheck('12345678');  // default match code

      const ctx = { session: { user: { _id: user._id } } };
      const next = sinon.spy();
      await middleware(ctx, next);
      expect(next.called).to.be.true;
    });
  });
});
