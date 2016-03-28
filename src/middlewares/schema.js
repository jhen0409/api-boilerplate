import { Validator } from 'jsonschema';
import isJs from 'jsonschema-is-js';
import koaSchema from 'koa-jsonschema';

const v = new Validator();
v.attributes.is = isJs();

export const schema = (schemaObj, pass) => koaSchema(schemaObj, v, pass);
