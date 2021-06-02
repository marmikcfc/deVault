import {Schema, model} from 'mongoose';

const shareSchema = new Schema({
  documentId: {type: Schema.Types.ObjectId, ref: 'Document'},
  fromUserId: {type: Schema.Types.ObjectId, ref: 'User'},
  toUserId: {type: Schema.Types.ObjectId, ref: 'User'},
  isDownloadable: {type:Boolean, default: false},
  expiryDate:{type:Date,default:new Date(+new Date() + 1*24*60*60*1000) },
  isViewed: {type:Boolean, default: false}, 
  status: {type: String,enum : ['requested','granted','success','failed','expired'],default: 'requested'}
  //thread: String,
});
model('ShareRequest', shareSchema);

export default model('ShareRequest');