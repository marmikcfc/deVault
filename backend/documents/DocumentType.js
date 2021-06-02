import {Schema, model} from 'mongoose';
const DocumentTypeSchema = new Schema({
  category: {type:String, required:true},
  name: {type:String, required:true},
  createdAt: {type: Date,default:Date.now},
  recUpdatedAt: {type: Date,default:Date.now}
  //thread: String,
});
model('DocumentType', DocumentTypeSchema);

export default model('DocumentType');