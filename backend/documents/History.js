import {Schema, model} from 'mongoose';
const DocsSchema = new Schema({
  documentId: {type: Schema.Types.ObjectId, ref: 'Document'},
  shareRequestId: {type: Schema.Types.ObjectId, ref: 'ShareRequest'},
  status: {type: String,enum : ['created','requested','granted','approved','rejected','request_expired','document_expired']},
  createdAt: {type: Date,default:Date.now},
});
model('History', DocsSchema);

export default model('History');