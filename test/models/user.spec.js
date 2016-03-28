import { getAllMocks, setupModels } from '../func';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { expect } from 'chai';

describe('User model', function () {
  this.timeout(5000);
  let mocks;
  let User;

  before(() => {
    mocks = getAllMocks();
    setupModels(mocks);
    User = mongoose.model('User');
  });

  afterEach(async () => {
    mocks.email.reset();
    await User.remove({});
  });

  it('should return `emailAlreadyUsed` with register', async () => {
    const { email } = mocks;

    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    email.reset();

    const failUser = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });

    expect(email.generateVerifyCode.called).to.be.false;
    expect(email.sendVerifyEmail.called).to.be.false;
    expect(failUser).to.equal('emailAlreadyUsed');
  });

  it('should pass with register', async () => {
    const { email } = mocks;

    const user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    expect(email.generateVerifyCode.called).to.be.true;
    expect(email.sendVerifyEmail.called).to.be.true;
    expect(user.firstName).to.equal('Test');
    expect(user.lastName).to.equal('User');
    expect(user.login.email).to.equal('test@test.com');
    expect(await new Promise(resolve =>
      bcrypt.compare(
        'testuser',
        user.login.password,
        (err, passed) => resolve(passed)
      )
    )).to.be.true;
    expect(user.login.verifyCode).to.equal('12345678'); // default match code
  });

  it('should return `invalidCode` with registerEmailCheck', async () => {
    // no user
    let result = await User.registerEmailCheck('12345678');  // default match code
    expect(result).to.equal('invalidCode');

    const user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    user.login.verifyExpires = new Date();
    await user.save();

    // expired
    result = await User.registerEmailCheck('12345678');  // default match code
    expect(result).to.equal('invalidCode');
  });

  it('should pass with registerEmailCheck', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const result = await User.registerEmailCheck('12345678');  // default match code
    expect(result).to.be.an('object');
    expect(result.login.verified).to.be.true;
  });

  it('should return `userNotFound` with login', async () => {
    const result = await User.login('abc@gmail.com', '123456');
    expect(result).to.equal('userNotFound');
  });

  it('should return `emailNotVerify` with login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const result = await User.login('test@test.com', 'testuser');
    expect(result).to.equal('emailNotVerify');
  });

  it('should return `invalidPassword` with login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await User.registerEmailCheck('12345678');  // default match code
    const result = await User.login('test@test.com', '123456');
    expect(result).to.equal('invalidPassword');
  });

  it('should pass with login', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    await User.registerEmailCheck('12345678');  // default match code
    const result = await User.login('test@test.com', 'testuser');
    expect(result).to.be.an('object');
  });

  it('should pass with get', async () => {
    await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });

    const user = await User.get('test@test.com');
    expect(user.login.email).to.equal('test@test.com');
  });

  it('should updateInfo', async () => {
    let user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    user = await user.updateInfo({
      firstName: 'Renamed',
      lastName: 'Renamed',
    });
    expect(user.firstName).to.equal('Renamed');
    expect(user.lastName).to.equal('Renamed');
  });

  it('should clearResponse', async () => {
    const user = await User.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'testuser',
    });
    const result = user.clearResponse();
    expect(result).to.eql({
      _id: user._id.toString(),
      firstName: 'Test',
      lastName: 'User',
      login: {
        email: 'test@test.com',
        verified: false,
        verifiedDateTime: undefined,
      },
    });
  });
});
