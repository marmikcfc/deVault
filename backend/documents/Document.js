import {Schema, model} from 'mongoose';
const DocsSchema = new Schema({
  email: {type: String},
  documentType: {type: Schema.Types.ObjectId, ref: 'DocumentType'},
  photoType: {type:String}, 
  cid: {type:String},
  size:{type:Object},
  createdAt: {type: Date,default:Date.now},
  recUpdatedAt: {type: Date,default:Date.now}
  //thread: String,
});
model('Document', DocsSchema);

export default model('Document');