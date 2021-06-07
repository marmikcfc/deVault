import React, {useState, useEffect, useCallback}from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,SafeAreaView, ScrollView } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import publicGallery from './../utils/constants';
import {getBucketKey,getBucketLinks, getPhotoIndex,galleryFromIndex} from './../utils/bucketUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PrivateKey} from '@textile/hub';
import ImageResizer from 'react-native-image-resizer';
import getPath from '@flyerhq/react-native-android-uri-path';
import axios from 'axios';
import { DatePickerModal } from 'react-native-paper-dates';
import ViewDocument from './ViewDocument';

import {Provider, TextInput, Button} from 'react-native-paper';

import  DropDown  from  'react-native-paper-dropdown';

import {endpoint} from './../utils/constants';
import log from 'loglevel';
import 'intl';
import 'intl/locale-data/jsonp/en'; // or any other locale you need
import ViewDocuments from './ViewDocuments';



var logger = log.getLogger("UploadFile");
logger.setLevel('INFO');



var RNFS = require('react-native-fs');



export default function UploadFile( {documentType}) {

    const [files, setFiles] = useState(['','']);
    //const [firstLoad, setFirstLoad] = useState(true);
    const [config,setConfig] = useState({});

    const [docNumber,setDocNumber] = useState(1);
    const [expiryDate,setExpiryDate] = useState(new Date());

    const [date, setDate] = useState(undefined);
    const [open, setOpen] = useState(false);
    const [number, setNumber] = useState('');

    const [documentObject,setDocumentObject] = useState({
      cid:['','']
    });


    useEffect(() => {
      (async function setDocuments(){
        const documentsStrings = await AsyncStorage.getItem("documents");
        let docs = JSON.parse(documentsStrings);
        if (docs.hasOwnProperty(documentType._id)){
          setDocumentObject(docs[documentType._id]);
          setExpiryDate(docs[documentType._id].expiryDate);
          setDocNumber(docs[documentType._id].documentNumber);
        }
        })();
    },[]);


    /**
     * For date
     */
    const onDismissSingle = useCallback(() => {
      setOpen(false);
    }, [setOpen]);
  
    const onConfirmSingle = useCallback(
      (params) => {
        setOpen(false);
        setDate(params.date);
        logger.info(`Selected Expiry date ${params.date}`)
      },
      [setOpen, setDate]
    );
    
    /**
     * Image utils
     */

    /**
     * Compresses images and returns the new uri
     * @param {object} image 
     * @param {object} limits  
     */
    const readAndCompressImage = async(image, limits) => {
        logger.info(`image to resize ${JSON.stringify(image)}`);
        const path = `file://${getPath(image.uri)}`
        logger.info(path);
        const resizedImageUri = await ImageResizer.createResizedImage(path, limits.maxWidth, limits.maxHeight, "PNG", 100, 0,undefined,false,{mode:'contain',onlyScaleDown:false});
        logger.info(`Resized image size ${JSON.stringify(resizedImageUri)}`);

        //Read from react native filesystem and upload

        return resizedImageUri.uri;
    }

    logger.info(`doc Type = ${JSON.stringify(documentType)}`)




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
      logger.info(`bucjets: ${JSON.stringify(buckets)} && bucketKEys: ${JSON.stringify(bucketKey)}`)
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
    const processAndStore = async (image, path, name, limits,buckets,bucketKey, email,index) => {
    
    const finalImageURl = limits ? await readAndCompressImage(image, limits)  : `file://${getPath(image.uri)}`;

    logger.info(`buckets: ${JSON.stringify(buckets)} && bucketKeys: ${JSON.stringify(bucketKey)}`);

    const finalImage =await RNFS.readFile(finalImageURl,"base64");

    //logger.info(`FINAL Image {index} ${JSON.stringify(finalImage)}`);
    
    const location = `${path}${name}`;
    const size = await getImageSize(finalImageURl);

    logger.info(`SIze of image = ${JSON.stringify(size)}`);

    const raw = await insertFile(finalImage, location,buckets,bucketKey);
    logger.info(`Raw data ${JSON.stringify(raw)} \n index ${index}`);
    
    //let raw = { path: {cid:''}};


    const metadata = {
      cid: [raw.path.cid.toString()],
      name: name,
      path: location,
      email:email,
      documentType: documentType._id,
      photoType:path.split("/")[0],
      documentNumber: number,
      expiryDate:(documentType.doesExpire? expiryDate:null),
      ...size
    };

    //setDocumentObject(Object.assign({},metadata));
    logger.info(`metadata = ${JSON.stringify(metadata)}`);
    return metadata;
  }

    

  const  persistFileDetails =async (docObj) => {
    logger.info(`posting ${JSON.stringify(docObj)}`);

    axios.post(`${endpoint}document/create`,docObj).then(resp => {
        logger.info(JSON.stringify(resp.data));
    }).catch(err => {
        logger.info(`Something went wrong error! ${JSON.stringify(err)}`);
    });

    let documentString = await AsyncStorage.getItem("documents");
    let docs = JSON.parse(documentString);
    docs[documentType._id] = docObj;
    await AsyncStorage.setItem("documents",JSON.stringify(docs));
    logger.info(`persisted ${JSON.stringify(docs)}`);
    setDocumentObject(docObj);

  }



    const handleNewFile = async (config,file,index) => {
        
        //const configString = await AsyncStorage.getItem("config");
        logger.info(`Config: ${JSON.stringify(config)}`)

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
        var imageSchema = {}
        const now = new Date().getTime()
        //imageSchema['date'] = now
        //imageSchema['name'] = `${file.name}`
        const filename = `${now}_${file.name}`
        
        logger.info(`File being uploaded ${filename}`);

        logger.info(`buckets and bucket key before process and store ${JSON.stringify(buckets)} \n ${bucketKey}`);
        
        //imageSchema['original'] = await processAndStore(file, 'originals/', filename,null,buckets ,bucketKey,email,index);
        imageSchema = await processAndStore(file, 'originals/', filename,null,buckets ,bucketKey,email,index);  
        return imageSchema;      

        //imageSchema['preview'] = await processAndStore(file, 'previews/', filename,preview,buckets ,bucketKey,email,index);
        //imageSchema['thumb'] = await processAndStore(file, 'thumbs/', filename, thumb,buckets ,bucketKey,email,index);
        
       /*
        const metadata = Buffer.from(JSON.stringify(imageSchema, null, 2));
        const metaname = `${now}_${file.name}.json`;
        const path = `metadata/${metaname}`;

        logger.info(`Metadata of file uploaded ${metadata}`);
        await config["buckets"].pushPath(config["bucketKey"], path, metadata);
      
        */
        //const photo = imageSchema['preview'] : imageSchema['original'];
        
        //logger.info(`picture ${JSON.stringify(photo)}`);
        //logger.info(`Links ${JSON.stringify(path)}`);
        //let pic = { src: `${config["ipfsGateway"]}/ipfs/${photo.cid}`, width: photo.width, height: photo.height, key: photo.name};

        //config["index"].path = [...config["index"].path, path];
        //config["photos"] = [...config["photos"], pic];
        //await AsyncStorage.setItem("config",JSON.stringify(config));
        //logger.info(`uploaded image => ${JSON.stringify(pic)}`);

      
        //await retriveConfig();
        
      }

    const retriveConfig = async () => {

        let config = {};
        logger.info(`Retriving Config`);
        const ipfsGateway = await AsyncStorage.getItem("ipfsGateway");

        logger.info(`IPFS Gateway ${ipfsGateway}`);
        const identityString = await AsyncStorage.getItem("identity");
        const identity = PrivateKey.fromString(identityString);
        logger.info(`IDENTITY ${identity} \n String  ${identityString}`)

        const keyInfoString = await AsyncStorage.getItem("keyInfoString");

        logger.info(`key INfo String  ${keyInfoString}`);
        const keyInfo = JSON.parse(keyInfoString);

        const bucketName = await AsyncStorage.getItem("bucketName");

        logger.info(`bucket name  ${bucketName}`);

        const {bucketKey, buckets} = await getBucketKey(keyInfo,identity,bucketName);

        logger.info(`Bucket Key  ${bucketKey}`);
        logger.info(`Buckets ${JSON.stringify(buckets)}`);

        
        const bucketLinks = await getBucketLinks(buckets,bucketKey);

        logger.info(`Links ${JSON.stringify(bucketLinks)}`);

        const index = await getPhotoIndex(buckets,bucketKey,identity);

        logger.info(`index ${JSON.stringify(index)}`);

        if (index){
            
            const gallery = await galleryFromIndex(index,buckets,bucketKey,bucketLinks,ipfsGateway);
            logger.info(`galley ${JSON.stringify(gallery)}`)
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
        logger.info("Upload Image Called");
       // await retriveConfig();

       let config = await retriveConfig();

        var docObj = {}
        if(documentType.numDocuments == 2){
        logger.error(`sending files ${JSON.stringify(files[0])}  and ${JSON.stringify(files[1])}`)
        //const [value1,value2] = Promise.all(handleNewFile(config,files[0],0),handleNewFile(config,files[1],1)).then((v1,v2)=> {
        var value1 = await handleNewFile(config,files[0],0);
        var value2 = await handleNewFile(config,files[1],1);
        console.log(`value1 ${JSON.stringify(value1)} \n value2 ${JSON.stringify(value2)}`);
        value1.cid.push(value2.cid[0])
        docObj = Object.assign({},value1);

        }
        else{
          docObj = await handleNewFile(config,files[0],0) ;
        }
       await persistFileDetails(docObj);
        
    }

    const selectFile = async (index) => {
        // Opening Document Picker to select one file
        try {
          const res = await DocumentPicker.pick({
            // Provide which type of file you want user to pick
            type: [DocumentPicker.types.images],
          });
          // Printing the log realted to the file
          logger.info('res : ' + JSON.stringify(res));
          // Setting the state to show single file attributes
          if(documentType.numDocuments == 1){
            setFiles([res]);
            logger.info(`set files ${JSON.stringify(files)} \n files[index].length ${files[index].length}`)
            
          }
          else{
            let arr = [...files];
            arr[index] = res;
            setFiles(arr);
            logger.info(`set files ${JSON.stringify(arr)} \n files[index].length ${files[index]}` )
          }

          
        } catch (err) {
          setFiles(['','']);
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

    const renderUploadComponents = (infoText,index) => {
      return(
        <View style={styles.screen} >

        <Text  style={styles.text}>Add {infoText}!</Text>

      <Button
        style={styles.buttonStyle}
        activeOpacity={1}
        onPress={async () => await selectFile(index)}>
        Select File
      </Button>

      </View>
      )
    }

    const renderDateComponent = () => {
      return (<View>
        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
        Select Expiry Date
      </Button>
      <DatePickerModal
        // locale={'en'} optional, default: automatic
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={date}
        onConfirm={onConfirmSingle}
        // validRange={{
        //   startDate: new Date(2021, 1, 2),  // optional
        //   endDate: new Date(), // optional
        // }}
        // onChange={} // same props as onConfirm but triggered without confirmed by user
        // saveLabel="Save" // optional
        // label="Select date" // optional
        // animationType="slide" // optional, default is 'slide' on ios/android and 'none' on web
      />
      </View>)
    }

    const renderUploadButton = () => {
      return(       <Button
        style={styles.buttonStyle}
        activeOpacity={1}
        onPress={() => uploadImage()}>
        Upload File
      </Button>);
    }


    return (
      <View>

        <ScrollView>

        {
          documentObject.hasOwnProperty('documentType')? (<ViewDocument document = {documentObject} />):null
        }

        {documentType.category == "SELFIE"? null:( <TextInput
              label={`Document Number`}
              value={number}
              onChangeText={text => setNumber(text)}
            />)}

        {documentType.doesExpire == true? renderDateComponent(): null}

        <View>  
        {documentType.numDocuments == 1 ? 
        ( <Text> {renderUploadComponents(documentType.name,0) }
        </Text>) : 
        (<View>
            <Text > {renderUploadComponents("front page",0)} </Text> 
            <Text> {renderUploadComponents("back page",1)} </Text> 
          
        </View> ) }

        <Text>
        {renderUploadButton()}
        </Text>

        </View>

        </ScrollView> 




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

