const res = (ctx, result) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
    ...result,
  };
};

res.err = (content, others) => {
  throw {
    type: 'return',
    status: 403,
    content,
    ...others,
  };
};

export default res;
