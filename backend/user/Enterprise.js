import {Schema, model} from 'mongoose';
const EnterpriseSchema = new Schema({
  email: {type: String, unique: true},
  username: {type:String,unique:true},
  displayName:{type: String},
  logoURL:{type: String},
  phoneNumber: {type: String},
  description:{type: String},
  createdAt: {type: Date,default:Date.now},
  recUpdatedAt: {type: Date,default:Date.now}
  //thread: String,
});
model('Enterprise', EnterpriseSchema);

export default model('Enterprise');