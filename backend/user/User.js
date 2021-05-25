import {Schema, model} from 'mongoose';
const UserSchema = new Schema({
  email: {type: String, unique: true},
  displayName:{type: String, unique: true},
  photoURL:{type: String, unique: true},
  identity: {type: String, unique: true},
  bucketName: {type: String, unique: true},
  thread: String,
});
model('User', UserSchema);

export default model('User');