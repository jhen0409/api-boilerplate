export default schema => {
  schema.add({
    create_datetime: { type: Date },
    last_modify_datetime: { type: Date },
  });
  schema.pre('save', function (next) {
    if (this.isNew || !this.create_datetime) {
      this.create_datetime = new Date();
    }
    this.last_modify_datetime = new Date();
    next();
  });
};
