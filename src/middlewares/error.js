import { returnCode } from '../utils';

export const error = () => async (ctx, next) => {
  try {
    await next();
  } catch (ex) {
    ctx.status = ex.status || 403;

    let result = ex;
    if (ex.message === 'JSONSchema errors') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Schema errors: ', ctx.schemaErrors);
      }
      result = {
        type: 'return',
        content: returnCode.err.schemaNotMatch,
      };
    }
    switch (result.type) {
      case 'return':
        ctx.body = {
          success: false,
          ...result.content,
        };
        break;
      default:
        console.error(result.stack);
        ctx.body = {
          success: false,
          ...returnCode.err.undefine,
        };
    }
  }
};
