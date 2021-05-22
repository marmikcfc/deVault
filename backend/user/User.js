import {Schema, model} from 'mongoose';
const UserSchema = new Schema({
  email: {type: String, unique: true},
  password: String,
  username:{type: String, unique: true},
  identity: {type: String, unique: true},
  thread: String,
});
model('User', UserSchema);

export default model('User');