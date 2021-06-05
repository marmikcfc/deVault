import React, {useState, useEffect} from 'react';
import Authentication from './screens/Authentication';
import AuthenticatedScreen from './screens/AuthenticatedScreen';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import {decrypt, getIdentity } from './utils/utils';
import {endpoint} from './utils/constants';

var CryptoJS = require("crypto-js");


GoogleSignin.configure({
  scopes: ['https://mail.google.com'],
  webClientId:
    '258831820848-egcoqt2hasp6kdad3u8ck4ov3erbmp35.apps.googleusercontent.com',
});



const saveIntoStorage = (key, value) =>{
  return AsyncStorage.setItem(key, value).
    then(resp => console.log("AFTER STORING "+ JSON.stringify(resp)))
    .catch(err => console.log("ERROR MOFOS"+JSON.stringify(err)))
};


export default function App() {

  

  const [authenticated, setAutheticated] = useState(false);
  const [loader,setLoader] = useState(false);
  



  useEffect(()=> {
    if(authenticated){
      
      let payload = {}
      currentUser = auth().currentUser;
      payload['email'] = currentUser?.email;
      payload['displayName'] = currentUser?.displayName;
      payload['photoURL'] = currentUser?.photoURL;
      
      /* 
        Genereate key from email id
        Store key to local storage
        Store email id to localsorage
        store identity to localstorage
      */
      if(currentUser?.email){
        //alert(`EMAIL ${currentUser.email}`);
        //let key = crypto.createHash('sha256').update(currentUser?.email).digest('hex');
        let key =  CryptoJS.SHA256(currentUser?.email).toString();

        console.log("############");
        console.log(key);

        saveIntoStorage("email", currentUser?.email);
        saveIntoStorage("pvtKey", key);

        //Then Send it to backend to persists and send textile details to the frontend
        const credentialsRequest = axios.post(`${endpoint}users/credentials`,payload);
        const getMyDocumentsRequest = axios.get(`${endpoint}document/${payload['email']}`);

        axios.all([credentialsRequest, getMyDocumentsRequest]).then(axios.spread(async (...responses) => {

          const responseOne = responses[0];
          const responseTwo = responses[1];

          if(responseOne.data){
            let textileKey = decrypt(responseOne.data.textileKey,currentUser?.email.trim());
            console.log(`Textile Key ${textileKey}`);
            //alert(textileKey);
            
            saveIntoStorage("bucketName", responseOne.data.bucketName);
            //saveIntoStorage("textileKey", textileKey);
            let keyInfoString = {key: textileKey};
            saveIntoStorage("keyInfoString", JSON.stringify(keyInfoString));
            saveIntoStorage("ipfsGateway", responseOne.data.ipfsGateway);
            saveIntoStorage("ipfsURL",`${responseOne.data.ipfsGateway}/ipfs/`)
            saveIntoStorage("identity",responseOne.data.identity);
            saveIntoStorage("userId",responseOne.data._id);

            console.log(`Encrypted identity gotten ${responseOne.data.textileKey}`)
            console.log(`decrypted identity ${textileKey}`)

          }

          
          
          saveIntoStorage("documents",JSON.stringify(responseTwo.data));
          console.log(`documents ${JSON.stringify(responseTwo.data)}`);
          setLoader(false);

        })).catch(err => {
          console.log(`ERROR WITH AXIOS ${JSON.stringify(err)}`)
          setLoader(false);
        });;

       
      }
    }

  },[authenticated])

  auth().onAuthStateChanged((user) => {
    if(user) {
      setAutheticated(true);
    }
    else{
      setAutheticated(false);
      setLoader(false)
    }
  })
  

  async function onGoogleButtonPress() {
    // Sign-in Process here
    setLoader(true);

    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
    
  }

  
  function authScreen(){

    if (authenticated) {
      if(loader){
        <ActivityIndicator size="large" color="#0000ff"  />
      }
      else{
        return <AuthenticatedScreen />;
      }
      
    }
    
    return <Authentication onGoogleButtonPress={onGoogleButtonPress} />;
    
  }
  
  


  return authScreen();
}
