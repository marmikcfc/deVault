import React, {useState, useEffect} from 'react';
import Authentication from './screens/Authentication';
import AuthenticatedScreen from './screens/AuthenticatedScreen';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import {decrypt} from './utils/utils';

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

  const endpoint = 'http://10.0.2.2:3000/devault/api/';

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
      */
      if(currentUser?.email){
        //alert(`EMAIL ${currentUser.email}`);
        //let key = crypto.createHash('sha256').update(currentUser?.email).digest('hex');
        let key =  CryptoJS.SHA256(currentUser?.email).toString();

        console.log("############");
        console.log(key);
        var encryptedIdentity = CryptoJS.AES.encrypt("bsikziz2tomz3wevoemfbdkx6ia",key).toString();
        console.log(`encrypted identity generated ${encryptedIdentity}`);

        


        saveIntoStorage("email", currentUser?.email);
        saveIntoStorage("pvtKey", key);

        //Then Send it to backend to persists and send textile details to the frontend
        
        axios.post(`${endpoint}users/credentials`,payload).then(async(resp) => {

          if(resp.data){

            let textileKey = decrypt(resp.data.textileKey,currentUser?.email.trim());
            console.log(`Textile Key ${textileKey}`);
            //alert(textileKey);
            saveIntoStorage("bucketName", resp.data.bucketName);
            saveIntoStorage("textileKey", textileKey);
            saveIntoStorage("ipfsGateway", resp.data.ipfsGateway);
            console.log(`Encrypted identity gotten ${resp.data.textileKey}`)
            console.log(`decrypted identity ${textileKey}`)

          }
          setLoader(false);
          }).catch(err => {
            console.log(`ERROR WITH AXIOS ${JSON.stringify(err)}`)
            setLoader(false);
          });
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
