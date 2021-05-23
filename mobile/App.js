import React, {useState} from 'react';
import Authentication from './screens/Authentication';
import AuthenticatedScreen from './screens/AuthenticatedScreen';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';

GoogleSignin.configure({
  scopes: ['https://mail.google.com'],
  webClientId:
    '258831820848-egcoqt2hasp6kdad3u8ck4ov3erbmp35.apps.googleusercontent.com',
});


export default function App() {

  const [authenticated, setAutheticated] = useState(false);
  auth().onAuthStateChanged((user) => {
    if(user) {
      setAutheticated(true);
    }
    else{
      setAutheticated(false);
    }
  })
  

  async function onGoogleButtonPress() {
    // Sign-in Process here

    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
    
  }

  function authScreen(){

    if (authenticated) {
      AuthenticatedScreen
      return <AuthenticatedScreen />;
    }
    
    return <Authentication onGoogleButtonPress={onGoogleButtonPress} />;
    

  }
  


  return authScreen();
}
