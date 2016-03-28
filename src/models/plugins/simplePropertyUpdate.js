import _ from 'lodash';
import util from 'util';
import modifiedFlag from './modifiedFlag';

export default function (schema) {
  schema.plugin(modifiedFlag);

  schema.methods.updateSimpleProperty = async function (prop, propList, save) {
    const updateValue = (propPath, type) => {
      const parts = propPath.split('.');
      let target = this;
      if (parts.length > 1) {
        for (let index = 0; index < parts.length - 1; index++) {
          const part = parts[index];
          if (!target[part]) {
            target[part] = {};
          }
          target = target[part];
        }
      }
      let value = prop;
      let canUpdate = true;
      for (const part of parts) {
        if (value[part]) {
          value = value[part];
        } else {
          canUpdate = false;
        }
      }
      if (canUpdate) {
        const lastPart = parts[parts.length - 1];
        switch (type) {
          case 'number':
            if (target[lastPart] !== value) {
              target[lastPart] = value;
              this.addModified(lastPart);
            }
            break;
          case 'string':
            if (String(value) !== '' && target[lastPart] !== value) {
              target[lastPart] = value;
              this.addModified(lastPart);
            }
            break;
          case 'array':
            if (util.isArray(value) &&
              (target[lastPart].length !== value.length ||
              _.difference(value, target[lastPart]).length)
            ) {
              target[lastPart] = value;
              this.addModified(lastPart);
            }
            break;
          default:
        }
      }
    };
    if (util.isArray(propList.stringProp)) {
      propList.stringProp.forEach((propPath) =>
        updateValue(propPath, 'string')
      );
    }
    if (util.isArray(propList.numberProp)) {
      propList.numberProp.forEach((propPath) =>
        updateValue(propPath, 'number')
      );
    }
    if (util.isArray(propList.arrayProp)) {
      propList.arrayProp.forEach((propPath) =>
        updateValue(propPath, 'array')
      );
    }

    if (save) return this.save();
    return this;
  };
}
