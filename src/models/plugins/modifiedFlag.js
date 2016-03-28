export default function (schema) {
  schema.methods.addModified = function (subject) {
    if (!this.modified) this.modified = [];
    if (this.modified.indexOf(subject) < 0) this.modified.push(subject);
  };
  schema.methods.isModified = function (subject) {
    return this.modified && this.modified.indexOf(subject) >= 0;
  };
}
