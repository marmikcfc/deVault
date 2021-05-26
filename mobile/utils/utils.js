var CryptoJS = require("crypto-js");

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
  

  