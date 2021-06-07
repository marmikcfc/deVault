var CryptoJS = require("crypto-js");
import { Buckets, PushPathResult, PrivateKey, WithKeyInfoOptions } from '@textile/hub'

/*
Inspired from http://www.adonespitogo.com/articles/encrypting-data-with-cryptojs-aes/
*/

var keySize = 256;
var iterations = 100;


export const encrypt = (msg, pass) => {
    var salt = CryptoJS.lib.WordArray.random(128/8); //
  
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize/32,
        iterations: iterations
      });
  
    var iv = CryptoJS.lib.WordArray.random(128/8);
  
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(msg), key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7  
    });
  
    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    var transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
    return transitmessage;
  }


  export const decrypt = (transitmessage, pass) => {
    var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
    var encrypted = transitmessage.substring(64);
  
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize/32,
        iterations: iterations
      });
  
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7  
    }).toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
  

  export const saveIntoStorage = (key, value) =>{
    return AsyncStorage.setItem(key, value).
      then(resp => console.log("AFTER STORING "+ JSON.stringify(resp)))
      .catch(err => console.log("ERROR MOFOS"+JSON.stringify(err)))
  };
  

  /**
  * getIdentity uses a basic private key identity.
  * The user's identity will be cached client side. This is long
  * but ephemeral storage not sufficient for production apps.
  * 
  * Read more here:
  * https://docs.textile.io/tutorials/hub/libp2p-identities/
  */
  export const  getIdentity = async () => {
   try {
     var storedIdent = await AsyncStorage.getItem("identity");
     if (storedIdent === null) {
       throw new Error('No identity')
     }
     const restored = PrivateKey.fromString(storedIdent)
     return restored
   }
   catch (e) {
     /**
      * If any error, create a new identity.
      */
     try {
       const identity = PrivateKey.fromRandom()
       const identityString = identity.toString()
       await saveIntoStorage("identity", identityString)
       return identity
     } catch (err) {
       return err.message
     }
   }
 }


  /**
   * getBucketKey will create a new Buckets client with the UserAuth
   * and then open our custom bucket named, 'io.textile.dropzone'
   */
  export const getBucketKey = async (identity,keyInfo,keyInfoOptions,bucketName) => {
    if (!identity) {
      throw new Error('Identity not set')
    }


    const buckets = await Buckets.withKeyInfo(this.keyInfo, this.keyInfoOptions)
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(this.state.identity)
    const buck = await buckets.getOrCreate(`devault-user${username}`)
    if (!buck.root) {
      throw new Error('Failed to open bucket')
    }
    return {buckets: buckets, bucketKey: buck.root.key};
  }

  /**
   * Returns a random integer between min and max number
   */
  export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }