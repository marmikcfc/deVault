import React, {useState,useEffect} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import {ExpansionPanel, ExpansionPanelSummary, Typography, Button} from '@material-ui/core';
import axios from 'axios';
import configData from "./../config.json";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Dropzone from 'react-dropzone'
import browserImageSize from 'browser-image-size'
import { readAndCompressImage } from 'browser-image-resizer'
import { Buckets, PushPathResult, KeyInfo, PrivateKey, WithKeyInfoOptions } from '@textile/hub'



import "./../../App.css";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
  },
   formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },


}));


function Dashboard(props) {
  const classes = useStyles();


 /*const goToCreatePortfolio = () =>{
    props.history.push("/create")
  }*/


  const ipfsGateway = 'https://hub.textile.io'
  const keyInfo = {
    key: 'bsikziz2tomz3wevoemfbdkx6ia'
  }
  const keyInfoOptions = {
    debug: false
  }

  const [count,setCount] = useState(0);
  const [metadata,setMetadata] = useState([]);
  const [photos,setPhotos] = useState([]);
  const [isLoading,setIsLoading] = useState(true);
  const [isDragActive,setIsDragActive] = useState(false);
  const [index,setIndex] = useState({author: '',date: 0,paths: []});
  const [identity,setIdentity] = useState('');
  const [buckets,setBuckets] = useState({});
  const [bucketKey,setBucketKey] = useState('');
  const [links,setLinks] = useState({});
  
   useEffect(() => {
     // Clear your user during development
    // await localStorage.clear()

  
    if (count == 1){
      return;
    }
   (async function initialSetup() {

    alert("BEFORE SETTING"+identity);
    const userIdentity = await getIdentity();
    
    setIdentity(userIdentity);
    setCount(1)
      alert(userIdentity);

  })();
    
});


useEffect(() => {

  (async function initialSetup() {
    const {hubBucketKey, hubBuckets} = await getBucketKey();
     setBucketKey(hubBucketKey);
     setBuckets(hubBuckets);

    await getBucketLinks()
    const index = await getPhotoIndex()
    if (index) {
      await galleryFromIndex(index)
      //Setup setState
      setIndex(index);
      setIsLoading(false);
      
    }

  })();
  

 },[identity])


 /**
   * getIdentity uses a basic private key identity.
   * The user's identity will be cached client side. This is long
   * but ephemeral storage not sufficient for production apps.
   * 
   * Read more here:
   * https://docs.textile.io/tutorials/hub/libp2p-identities/
   */
  const getIdentity = async () => {
    try {
      var storedIdent = localStorage.getItem("identity")
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
        const userIdentity = PrivateKey.fromRandom()
        const identityString = userIdentity.toString()
        localStorage.setItem("identity", identityString)
        return userIdentity
      } catch (err) {
        return err.message
      }
    }
  }

/**
   * getBucketKey will create a new Buckets client with the UserAuth
   * and then open our custom bucket named, 'io.textile.dropzone'
   */
 const getBucketKey = async () => {
   alert("IDENTITYU     "+identity)
    if (identity.length == 0) {
      throw new Error('Identity not set')
    }
    const buckets = await Buckets.withKeyInfo(keyInfo, keyInfoOptions)
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(identity)

    const buck = await buckets.getOrCreate('io.textile.dropzone')
    if (!buck.root) {
      throw new Error('Failed to open bucket')
    }
    return {buckets: buckets, bucketKey: buck.root.key};
  }

  /**
   * getBucketLinks returns all the protocol endpoints for the bucket.
   * Read more:
   * https://docs.textile.io/hub/buckets/#bucket-protocols 
   */
  const getBucketLinks = async () => {
    if (buckets.length == 0 || bucketKey.length == 0) {
      console.error('No bucket client or root key')
      return
    }
    const bucketLinks = await buckets.links(this.state.bucketKey)
    setLinks({...bucketLinks});
  }


/**
   * storeIndex stores the updated index of all images in the Bucket
   * This could easily be designed to write directly to the thread
   * instead of json files. 
   * @param index 
   */
  const storeIndex = async (index) => {
    if (buckets.length == 0 || bucketKey.length == 0) {
      console.error('No bucket client or root key')
      return
    }
    const buf = Buffer.from(JSON.stringify(index, null, 2))
    const path = `index.json`
    await buckets.pushPath(bucketKey, path, buf)
  }



const onDrop = async (acceptedFiles) => {
  if (photos.length > 50) {
    throw new Error('Gallery at maximum size')
  }
  if (acceptedFiles.length > 5) {
    throw new Error('Max 5 images at a time')
  }
  for (const accepted of acceptedFiles) {
    await handleNewFile(accepted)
  }
  storeIndex(index)
}


const handleNewFile = async (file) => {
  const preview = {
    maxWidth: 800,
    maxHeight: 800
  }
  const thumb = {
    maxWidth: 200,
    maxHeight: 200
  }
  if (buckets.length == 0 || bucketKey.length == 0) {
    console.error('No bucket client or root key')
    return
  }
  const imageSchema = {}
  const now = new Date().getTime()
  imageSchema['date'] = now
  imageSchema['name'] = `${file.name}`
  const filename = `${now}_${file.name}`
  
  imageSchema['original'] = await processAndStore(file, 'originals/', filename)
  
  imageSchema['preview'] = await processAndStore(file, 'previews/', filename, preview)

  imageSchema['thumb'] = await processAndStore(file, 'thumbs/', filename, thumb)

  const metadata = Buffer.from(JSON.stringify(imageSchema, null, 2))
  const metaname = `${now}_${file.name}.json`
  const path = `metadata/${metaname}`
  await this.state.buckets.pushPath(bucketKey, path, metadata)

  const photo = photos.length > 1 ? imageSchema['preview'] : imageSchema['original']
  setIndex( {
    ...index,
    paths: [...this.state.index.paths, path]
  });

  setPhotos([
    ...photos,
    {
      src: `${this.ipfsGateway}/ipfs/${photo.cid}`,
      width: photo.width,
      height: photo.height,
      key: photo.name,
    }
  ]);
}


 /**
   * Pushes files to the bucket
   * @param file 
   * @param path 
   */
  const insertFile = async (file, path) => {
    if (buckets.length == 0 || bucketKey.length == 0) {
      throw new Error('No bucket client or root key')
    }
    const myBuckets = buckets
    return await myBuckets.pushPath(bucketKey, path, file.stream())
  }

  /**
   * processAndStore resamples the image and extracts the metadata. Next, it
   * calls insertFile to store each of the samples plus the metadata in the bucket.
   * @param image 
   * @param path 
   * @param name 
   * @param limits 
   */
   const processAndStore = async (image, path, name, limits) => {
    const finalImage = limits ? await readAndCompressImage(image, limits) : image
    const size = await browserImageSize(finalImage)
    const location = `${path}${name}`
    const raw = await insertFile(finalImage, location)
    const metadata = {
      cid: raw.path.cid.toString(),
      name: name,
      path: location,
      ...size
    }
    return metadata
  }



/**
   * getPhotoIndex pulls the index.json from the root of the bucket (or creates it
   * if it doesn't exist yet)
   */
  const getPhotoIndex = async () => {
    if (buckets.length === 0|| bucketKey.length === 0) {
      console.error('No bucket client or root key')
      return
    }
    try {
      const metadata = buckets.pullPath(bucketKey, 'index.json')
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const index = JSON.parse(str)
      return index
    } catch (error) {
      const index = await initIndex()
      await initPublicGallery()
      return index
    }
  }


  const initIndex = async () => {
    if (identity.length == 0) {
      console.error('Identity not set')
      return
    }
    const index = {
      author: identity.public.toString(),
      date: (new Date()).getTime(),
      paths: []
    }
    await storeIndex(index)
    return index
  }

  /**
   * galleryFromIndex parses the index.json and pulls the metadata for each image
   * @param index 
   */
  const galleryFromIndex = async (index) => {
    if (buckets.length == 0 || bucketKey.length == 0) {
      console.error('No bucket client or root key')
      return
    }
    for (let path of index.paths) {
      const metadata = await buckets.pullPath(bucketKey, path);
      console.log(await buckets.links(bucketKey))
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const json = JSON.parse(str)
      const photo = index.paths.length > 1 ? json.preview : json.original
      setPhotos([
        ...photos,
        {
          src:`${ipfsGateway}/ipfs/${photo.cid}`,
          width: photo.width,
          height: photo.height,
          key: photo.name,
        }
      ])
    }
  }


   /**
   * initPublicGallery will write a basic HTML file to the root of the bucket
   * that knows how to read the index.json and load all the images. This will
   * allow the bucket to be rendered over any gateway or ipns endpoint.
   */
  const initPublicGallery = async () => {
    if (buckets.length == 0 || bucketKey.length == 0) {
      console.error('No bucket client or root key')
      return
    }
    const buf = Buffer.from(publicGallery)
    await buckets.pushPath(bucketKey, 'index.html', buf)
  }

  
const renderDropzone = () => {
  return (
    <Dropzone 
      onDrop={onDrop}
      accept={'image/jpeg, image/png, image/gif'}
      maxSize={20000000}
      multiple={true}
      >
      {({getRootProps, getInputProps}) => (
        <div className="dropzone" {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            className="icon"
            icon="images"
            title="add"
          />
          <span>DRAG & DROP</span>
        </div>
      )}
    </Dropzone>
  )
}

  return (
    <div className="App">
      <Container maxWidth="xl">

          <Button color="primary">
            Create Portfolio
          </Button>

          {renderDropzone()}



      
  
    </Container>
    </div>
  );
}


const publicGallery = '<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta http-equiv=x-ua-compatible content="ie=edge"><meta property="twitter:description" content="built with textile.io. uses textile buckets and ipns to serve photo galleries over ipns"><title>Public Gallery</title><link rel=stylesheet href=https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css><script src=https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js></script><div class=wrapper><div class=grid></div></div><script>const loadIndex=async()=>{const elements=[]\n' +
'const index=await fetch("index.json")\n' +
'const json=await index.json()\n' +
'for(let path of json.paths){try{const meta=await fetchMetadata(path)\n' +
'elements.push({href:meta.path,type:"image"})}catch(err){console.log(err)}}\n' +
'const lightbox=GLightbox({selector:".grid",touchNavigation:true,closeButton:false,loop:true,elements:elements,});lightbox.open();}\n' +
'const fetchMetadata=async(path)=>{const index=await fetch(path)\n' +
'const json=await index.json()\n' +
'return json.original}\n' +
'window.addEventListener("DOMContentLoaded",function(){loadIndex()});</script>';

export default Dashboard;
