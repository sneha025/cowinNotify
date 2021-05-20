const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, require: true },
  district_id: { type: String, require: true },
});

module.exports = mongoose.model("user", UserSchema, "users");
