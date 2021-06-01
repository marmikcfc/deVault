import React, {useState, useEffect}from 'react';
import { StyleSheet, Text, View, Image, Button, TouchableOpacity,SafeAreaView } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import publicGallery from './../utils/constants';
import {getBucketKey,getBucketLinks, getPhotoIndex,galleryFromIndex} from './../utils/bucketUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PrivateKey} from '@textile/hub';
import ImageResizer from 'react-native-image-resizer';
import getPath from '@flyerhq/react-native-android-uri-path';
import axios from 'axios';
import {Provider, TextInput} from 'react-native-paper';

import  DropDown  from  'react-native-paper-dropdown';

import {endpoint} from './../utils/constants';

var RNFS = require('react-native-fs');


export default function UploadFile( {documentType}) {

    const [singleFile, setSingleFile] = useState(null);
    //const [firstLoad, setFirstLoad] = useState(true);
    const [config,setConfig] = useState({});
    
    const readAndCompressImage = async(image, limits) => {
        console.log(`image to resize ${JSON.stringify(image)}`);
        const path = `file://${getPath(image.uri)}`
        console.log(path);
        const resizedImageUri = await ImageResizer.createResizedImage(path, limits.maxWidth, limits.maxHeight, "PNG", 100, 0,undefined,false,{mode:'contain',onlyScaleDown:false});
        console.log(`Resized image size ${JSON.stringify(resizedImageUri)}`);

        //Read from react native filesystem and upload

        return resizedImageUri.uri;
    }

    console.log(`doc Type = ${JSON.stringify(documentType)}`)



    const getImageSize = (uri) => {

        return new Promise(
            (resolve, reject) => {
              Image.getSize(uri, (width, height) => {
                resolve({ width, height });
              });
            },
            (error) => reject(error)
          );
    }

     /**
     * Pushes files to the bucket
     * @param file 
     * @param path 
     */
  const insertFile = async (file, path,buckets,bucketKey) => {
      console.log(`bucjets: ${JSON.stringify(buckets)} && bucketKEys: ${JSON.stringify(bucketKey)}`)
    if (!buckets || !bucketKey) {
      throw new Error('Error inserting a file. No bucket client or root key')
    }
    const fileBuff = new Buffer(file,'base64');
    return await buckets.pushPath(bucketKey, path, fileBuff)
  }

    
    /**
     * processAndStore resamples the image and extracts the metadata. Next, it
     * calls insertFile to store each of the samples plus the metadata in the bucket.
     * @param image 
     * @param path 
     * @param name 
     * @param limits 
     */
    const processAndStore = async (image, path, name, limits,buckets,bucketKey, email) => {
    
    const finalImageURl = limits ? await readAndCompressImage(image, limits)  : `file://${getPath(image.uri)}`;

    console.log(`buckets: ${JSON.stringify(buckets)} && bucketKeys: ${JSON.stringify(bucketKey)}`)

    const finalImage =await RNFS.readFile(finalImageURl,"base64");

    //console.log(`FINAL Image ${JSON.stringify(finalImage)}`);
    
    const location = `${path}${name}`
    const size = await getImageSize(finalImageURl);

    console.log(`SIze of image = ${JSON.stringify(size)}`);

    const raw = await insertFile(finalImage, location,buckets,bucketKey)

    console.log(`Raw data ${JSON.stringify(raw)}`)
    
    const metadata = {
      cid: raw.path.cid.toString(),
      name: name,
      path: location,
      email:email,
      documentType: documentType.id,
      photoType:path.split("/")[0],
      ...size
    }

    console.log(`metadata = ${JSON.stringify(metadata)}`);
    return metadata;
  }

    

  const persistFileDetails = async (imageSchema) => {
    console.log(`posting ${JSON.stringify(imageSchema)}`);

    axios.post(`${endpoint}document/create`,imageSchema).then(resp => {
        console.log(JSON.stringify(resp.data));
    }).catch(err => {
        console.log(`Something went wrong error! ${JSON.stringify(err)}`);
    })

  }



    const handleNewFile = async (file) => {
        
        const configString = await AsyncStorage.getItem("config");
        let config = await retriveConfig();
        console.log(`Config: ${JSON.stringify(config)}`)
        const preview = {
          maxWidth: 500,
          maxHeight: 500
        }
        const thumb = {
          maxWidth: 200,
          maxHeight: 200
        }
        const buckets = config.buckets;
        const bucketKey = config.bucketKey;
        const email = await AsyncStorage.getItem("email");

        if (!config["buckets"] || !config["bucketKey"]) {
          console.error('Error uploading a file. No bucket client or root key')
          return
        }
        const imageSchema = {}
        const now = new Date().getTime()
        imageSchema['date'] = now
        imageSchema['name'] = `${file.name}`
        const filename = `${now}_${file.name}`
        
        console.log(`File being uploaded ${filename}`);

        console.log(`buckets and bucket key before process and store ${JSON.stringify(buckets)} \n ${bucketKey}`);
        
        imageSchema['original'] = await processAndStore(file, 'originals/', filename,null,buckets ,bucketKey,email);
        
        imageSchema['preview'] = await processAndStore(file, 'previews/', filename,preview,buckets ,bucketKey,email);
    
        imageSchema['thumb'] = await processAndStore(file, 'thumbs/', filename, thumb,buckets ,bucketKey,email);
    
        const metadata = Buffer.from(JSON.stringify(imageSchema, null, 2));
        const metaname = `${now}_${file.name}.json`;
        const path = `metadata/${metaname}`;

        console.log(`Metadata of file uploaded ${metadata}`);
        await config["buckets"].pushPath(config["bucketKey"], path, metadata);
    
        //const photo = imageSchema['preview'] : imageSchema['original'];
        
        //console.log(`picture ${JSON.stringify(photo)}`);
        //console.log(`Links ${JSON.stringify(path)}`);

        //let pic = { src: `${config["ipfsGateway"]}/ipfs/${photo.cid}`, width: photo.width, height: photo.height, key: photo.name};

        //config["index"].path = [...config["index"].path, path];
        //config["photos"] = [...config["photos"], pic];
        //await AsyncStorage.setItem("config",JSON.stringify(config));
        //console.log(`uploaded image => ${JSON.stringify(pic)}`);

        await persistFileDetails(imageSchema);
        //await retriveConfig();
        
      }

    const retriveConfig = async () => {

        let config = {};
        
        const ipfsGateway = await AsyncStorage.getItem("ipfsGateway");
        const identityString = await AsyncStorage.getItem("identity");
        const identity = PrivateKey.fromString(identityString);
        console.log(`IDENTITY ${identity} \n String  ${identityString}`)

        const keyInfoString = await AsyncStorage.getItem("keyInfoString");

        console.log(`key INfo String  ${keyInfoString}`);
        const keyInfo = JSON.parse(keyInfoString);

        const bucketName = await AsyncStorage.getItem("bucketName");

        console.log(`bucket name  ${bucketName}`);

        const {bucketKey, buckets} = await getBucketKey(keyInfo,identity,bucketName);

        console.log(`Bucket Key  ${bucketKey}`);
        console.log(`Buckets ${JSON.stringify(buckets)}`);

        
        const bucketLinks = await getBucketLinks(buckets,bucketKey);

        console.log(`Links ${JSON.stringify(bucketLinks)}`);

        const index = await getPhotoIndex(buckets,bucketKey,identity);

        console.log(`index ${JSON.stringify(index)}`);

        if (index){
            
            const gallery = await galleryFromIndex(index,buckets,bucketKey,bucketLinks,ipfsGateway);
            console.log(`galley ${JSON.stringify(gallery)}`)
            config["gallery"] = gallery;
        }

        config["identity"] = identity;
        config["keyInfoString"] = keyInfoString;
        config["keyInfo"] = keyInfo;
        config["bucketName"] = bucketName;
        config["bucketKey"] = bucketKey;
        config["buckets"] = buckets;
        config["bucketLinks"]= bucketLinks
        config["index"] = index;
        config["ipfsGateway"] = ipfsGateway;

        JSON.stringify(`config ${JSON.stringify(config)}`);

        await AsyncStorage.setItem("config",JSON.stringify(config));
        return config;
    }

    const uploadImage = async () => {
        console.log("Upload Image Called");
       // await retriveConfig();

        await handleNewFile(singleFile);
    }

    const selectFile = async () => {
        // Opening Document Picker to select one file
        try {
          const res = await DocumentPicker.pick({
            // Provide which type of file you want user to pick
            type: [DocumentPicker.types.allFiles],
            // There can me more options as well
            // DocumentPicker.types.allFiles
            // DocumentPicker.types.images
            // DocumentPicker.types.plainText
            // DocumentPicker.types.audio
            // DocumentPicker.types.pdf
          });
          // Printing the log realted to the file
          console.log('res : ' + JSON.stringify(res));
          // Setting the state to show single file attributes
          setSingleFile(res);
        } catch (err) {
          setSingleFile(null);
          // Handling any exception (If any)
          if (DocumentPicker.isCancel(err)) {
            // If user canceled the document selection
            alert('Canceled');
          } else {
            // For Unknown Error
            alert('Unknown Error: ' + JSON.stringify(err));
            throw err;
          }
        }

      };

    return (
      <View style={styles.screen} >

        <Text  style={styles.text}>Add documents!</Text>

        {singleFile != null ? (
        <Text style={styles.textStyle}>
          File Name: {singleFile.name ? singleFile.name : ''}
          {'\n'}
          Type: {singleFile.type ? singleFile.type : ''}
          {'\n'}
          File Size: {singleFile.size ? singleFile.size : ''}
          {'\n'}
          URI: {singleFile.uri ? singleFile.uri : ''}
          {'\n'}
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.buttonStyle}
        activeOpacity={0}
        onPress={selectFile}>
        <Text style={styles.buttonTextStyle}>Select File</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonStyle}
        activeOpacity={0}
        onPress={uploadImage}>
        <Text style={styles.buttonTextStyle}>Upload File</Text>
      </TouchableOpacity>

          
      </View>
    ); 
  }

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    marginBottom: 30,
  },
  image: {
    height: 150,
    width: 150,
    borderRadius: 150,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
  },
});

