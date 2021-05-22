import React, {Component} from 'react';
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
import Photos from './Photos';




class Dashboard extends Component {
  ipfsGateway = 'https://hub.textile.io'
  keyInfo = {
    key: 'bsikziz2tomz3wevoemfbdkx6ia'
  }
  keyInfoOptions = {
    debug: false
  }
  constructor(props){
      super(props);
      this.state = {
        metadata: [],
        photos: [],
        isLoading: true,
        isDragActive: false,
        index: {
          author: '',
          date: 0,
          paths: []
        }
      }

  }
  
  async componentDidMount() {
    // Clear your user during development
    // await localStorage.clear()
    const identity = await this.getIdentity()
    // you might want to do the I18N setup here
    this.setState({ 
      identity: identity
    })

    // get their photo bucket
    const {bucketKey, buckets} = await this.getBucketKey()
    this.setState({ 
      buckets: buckets,
      bucketKey: bucketKey
    })

    await this.getBucketLinks()
    const index = await this.getPhotoIndex()
    if (index) {
      await this.galleryFromIndex(index)
      this.setState({ 
        index,
        isLoading: false
      })
    }
  }

  /**
   * getIdentity uses a basic private key identity.
   * The user's identity will be cached client side. This is long
   * but ephemeral storage not sufficient for production apps.
   * 
   * Read more here:
   * https://docs.textile.io/tutorials/hub/libp2p-identities/
   */
  getIdentity = async () => {
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
        const identity = PrivateKey.fromRandom()
        const identityString = identity.toString()
        localStorage.setItem("identity", identityString)
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
  getBucketKey = async () => {
    if (!this.state.identity) {
      throw new Error('Identity not set')
    }
    const buckets = await Buckets.withKeyInfo(this.keyInfo, this.keyInfoOptions)
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(this.state.identity)
    const username = localStorage.getItem("userName");
    const buck = await buckets.getOrCreate(`devault-user${username}`)
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
  getBucketLinks = async () => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const links = await this.state.buckets.links(this.state.bucketKey)
    alert(`LINKS ${JSON.stringify(links)}`)
    this.setState({
      ...links
    })
  }

  /**
   * storeIndex stores the updated index of all images in the Bucket
   * This could easily be designed to write directly to the thread
   * instead of json files. 
   * @param index 
   */
  storeIndex = async (index) => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const buf = Buffer.from(JSON.stringify(index, null, 2))
    const path = `index.json`
    await this.state.buckets.pushPath(this.state.bucketKey, path, buf)
  }

  initIndex = async () => {
    if (!this.state.identity) {
      console.error('Identity not set')
      return
    }
    const index = {
      author: this.state.identity.public.toString(),
      date: (new Date()).getTime(),
      paths: []
    }
    await this.storeIndex(index)
    return index
  }

  /**
   * initPublicGallery will write a basic HTML file to the root of the bucket
   * that knows how to read the index.json and load all the images. This will
   * allow the bucket to be rendered over any gateway or ipns endpoint.
   */
  initPublicGallery = async () => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const buf = Buffer.from(publicGallery)
    await this.state.buckets.pushPath(this.state.bucketKey, 'index.html', buf)
  }

  /**
   * galleryFromIndex parses the index.json and pulls the metadata for each image
   * @param index 
   */
  galleryFromIndex = async (index) => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    for (let path of index.paths) {
      const metadata = await this.state.buckets.pullPath(this.state.bucketKey, path)
      console.log(await this.state.buckets.links(this.state.bucketKey))
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const json = JSON.parse(str)
      const photo = index.paths.length > 1 ? json.preview : json.original
      this.setState({ 
        photos: [
          ...this.state.photos,
          {
            src:`${this.ipfsGateway}/ipfs/${photo.cid}`,
            width: photo.width,
            height: photo.height,
            key: photo.name,
          }
        ]
      })
    }
  }

  /**
   * getPhotoIndex pulls the index.json from the root of the bucket (or creates it
   * if it doesn't exist yet)
   */
  getPhotoIndex = async () => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    try {
      const metadata = this.state.buckets.pullPath(this.state.bucketKey, 'index.json')
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const index = JSON.parse(str)
      return index
    } catch (error) {
      const index = await this.initIndex()
      await this.initPublicGallery()
      return index
    }
  }

  /**
   * Pushes files to the bucket
   * @param file 
   * @param path 
   */
  insertFile = async (file, path) => {
    if (!this.state.buckets || !this.state.bucketKey) {
      throw new Error('No bucket client or root key')
    }
    const buckets = this.state.buckets
    return await buckets.pushPath(this.state.bucketKey, path, file.stream())
  }

  /**
   * processAndStore resamples the image and extracts the metadata. Next, it
   * calls insertFile to store each of the samples plus the metadata in the bucket.
   * @param image 
   * @param path 
   * @param name 
   * @param limits 
   */
  processAndStore = async (image, path, name, limits) => {
    const finalImage = limits ? await readAndCompressImage(image, limits) : image
    const size = await browserImageSize(finalImage)
    const location = `${path}${name}`
    const raw = await this.insertFile(finalImage, location)
    const metadata = {
      cid: raw.path.cid.toString(),
      name: name,
      path: location,
      ...size
    }
    return metadata
  }

  handleNewFile = async (file) => {
    const preview = {
      maxWidth: 800,
      maxHeight: 800
    }
    const thumb = {
      maxWidth: 200,
      maxHeight: 200
    }
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const imageSchema = {}
    const now = new Date().getTime()
    imageSchema['date'] = now
    imageSchema['name'] = `${file.name}`
    const filename = `${now}_${file.name}`
    
    imageSchema['original'] = await this.processAndStore(file, 'originals/', filename)
    
    imageSchema['preview'] = await this.processAndStore(file, 'previews/', filename, preview)

    imageSchema['thumb'] = await this.processAndStore(file, 'thumbs/', filename, thumb)

    const metadata = Buffer.from(JSON.stringify(imageSchema, null, 2))
    const metaname = `${now}_${file.name}.json`
    const path = `metadata/${metaname}`
    await this.state.buckets.pushPath(this.state.bucketKey, path, metadata)

    const photo = this.state.photos.length > 1 ? imageSchema['preview'] : imageSchema['original']
    
    alert(`picture ${JSON.stringify(photo)}`)
    alert(`Links ${JSON.stringify(path)}`)
    alert()
    this.setState({ 
      index: {
        ...this.state.index,
        paths: [...this.state.index.paths, path]
      },
      photos: [
        ...this.state.photos,
        {
          src: `${this.ipfsGateway}/ipfs/${photo.cid}`,
          width: photo.width,
          height: photo.height,
          key: photo.name,
        }
      ]
    })
  }
  onDrop = async (acceptedFiles) => {
    if (this.state.photos.length > 50) {
      throw new Error('Gallery at maximum size')
    }
    if (acceptedFiles.length > 5) {
      throw new Error('Max 5 images at a time')
    }
    for (const accepted of acceptedFiles) {
      await this.handleNewFile(accepted)
    }
    this.storeIndex(this.state.index)
  }

  renderDropzone = () => {
    return (
      <Dropzone 
        onDrop={this.onDrop}
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
  render () {
      
    return (
        <div className="App">
          <Container maxWidth="xl">
                  
          {this.renderDropzone()}

              <Photos photos={this.state.photos}/>
    
    
          
      
        </Container>
        </div>
      );
  }
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
