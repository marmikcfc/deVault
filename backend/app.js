import express from 'express';
import cors from 'cors';
import UserController from './user/UserController';
import AuthController from './auth/AuthController';
import SignupController from './signup/SignupController';
import DocumentController from './documents/DocumentController';
import ShareRequestController from './requests/RequestController';
import WaitingListController from './waitingList/WaitingListController';


import { connect,mongoose } from 'mongoose';
import {config} from 'dotenv';

config();
connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).then(done => {
  console.log("CONEECTED TO MONGO")
}).catch(err => {
  console.log(err);
});

const app = express();

app.use(cors());
app.options('*', cors());

app.use('/devault/api/users', UserController);
app.use('/devault/api/authenticate', AuthController);
app.use('/devault/api/signup', SignupController);
app.use('/devault/api/document', DocumentController);
app.use('/devault/api/request', ShareRequestController);
app.use('/devault/api/waitingList', WaitingListController);





app.get('/health/full', (req, res) => {
   res.send("Ok: " + new Date().toISOString())
});


const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

export default app;
