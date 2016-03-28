import mongoose from 'mongoose';
import { returnCode, res } from '../utils';

function populateModel(promise, populates) {
  if (typeof populates === 'object') {
    return promise.populate(populates.name, populates.select);
  } else if (populates instanceof Array) {
    let returnPromise = promise;
    populates.forEach(item => {
      returnPromise = returnPromise.populate(item.name, item.select);
    });
    return returnPromise;
  }
  return promise;
}

export function getByUserId(populates) {
  return async (ctx, next) => {
    const User = mongoose.model('User');
    const userPromise = User.findById(ctx.params.user_id);

    ctx.user = await populateModel(userPromise, populates);
    if (!ctx.user) {
      res.err(returnCode.err.userNotFound);
    }
    return next();
  };
}
