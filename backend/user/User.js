import {Schema, model} from 'mongoose';
const UserSchema = new Schema({
  email: {type: String, unique: true},
  displayName:{type: String},
  photoURL:{type: String},
  identity: {type: String},
  bucketName: {type: String},
  createdAt: {type: Date,default:Date.now},
  recUpdatedAt: {type: Date,default:Date.now}
  //thread: String,
});
model('User', UserSchema);

export default model('User');