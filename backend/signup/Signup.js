import {Schema, model} from 'mongoose';

const SignUpSchema = new Schema({
    email: String,
    type: String
    
});

model('SignUp', SignUpSchema);
export default model('SignUp');
