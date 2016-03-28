import _ from 'lodash';

export default function (schema) {
  // Add items to array, but item is unique
  schema.methods.listAddItems = async function (key, items, save) {
    if (!Array.isArray(this[key])) return this;

    this[key] = _.union(this[key], items);
    if (save) return this.save();
    return this;
  };

  // Remove items from array
  // items value: isObject ? _id : value
  schema.methods.listDelItems = async function (key, isObject, items, save) {
    if (!Array.isArray(this[key])) return this;

    if (isObject) {
      this[key] = this[key].filter(item => !items.includes(item._id.toString()));
    } else {
      this[key] = _.without.apply(this, [this[key], ...items]);
    }

    if (save) return this.save();
    return this;
  };
}
