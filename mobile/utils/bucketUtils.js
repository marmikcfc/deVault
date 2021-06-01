
import { Buckets, PushPathResult, PrivateKey, WithKeyInfoOptions } from '@textile/hub'
import {keyInfoOptions,publicGallery} from './constants';

/**
   * getBucketKey will create a new Buckets client with the UserAuth
   * and then open our custom bucket named, 'io.textile.dropzone'
   */
  export const getBucketKey = async (keyInfo,identity,bucketName) => {
    if (!identity) {
      throw new Error('Error fetching bucket keyys. Identity not set');
    }
    const buckets = await Buckets.withKeyInfo(keyInfo, keyInfoOptions);
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(identity);
    const buck = await buckets.getOrCreate(bucketName);
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
  export const getBucketLinks = async (buckets,bucketKey) => {
    if (!buckets || !bucketKey) {
      console.error('Error fetching bucket links. No bucket client or root key')
      return
    }
    const links = await buckets.links(bucketKey)
    return links;
  }

    /**
   * getPhotoIndex pulls the index.json from the root of the bucket (or creates it
   * if it doesn't exist yet)
   */
  export const getPhotoIndex = async (buckets,bucketKey,identity) => {
    if (!buckets || !bucketKey) {
      console.error('Error fetching photoindex. No bucket client or root key')
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
      return index;
    } catch (error) {
      const index = await initIndex(identity,buckets,bucketKey)
      await initPublicGallery(buckets,bucketKey)
      return index;
    }
  }



  const initIndex = async (identity,buckets,bucketKey) => {
    
    if (!identity) {
      console.error('Error initialising index. Identity not set')
      return
    }
    const index = {
      author: identity.public.toString(),
      date: (new Date()).getTime(),
      paths: []
    }
    await storeIndex(index,buckets,bucketKey);
    return index
  }


   /**
   * storeIndex stores the updated index of all images in the Bucket
   * This could easily be designed to write directly to the thread
   * instead of json files. 
   * @param index 
   */
  const storeIndex = async (index,buckets,bucketKey) => {
    if (!buckets || !bucketKey) {
      console.error('Error storing index. No bucket client or root key')
      return
    }
    const buf = Buffer.from(JSON.stringify(index, null, 2))
    const path = `index.json`
    await buckets.pushPath(bucketKey, path, buf)
  }


   /**
   * initPublicGallery will write a basic HTML file to the root of the bucket
   * that knows how to read the index.json and load all the images. This will
   * allow the bucket to be rendered over any gateway or ipns endpoint.
   */
  const initPublicGallery = async (buckets,bucketKey) => {
    if (!buckets || !bucketKey) {
      console.error('Error initiialising public gallery. No bucket client or root key')
      return
    }
    const buf = Buffer.from(publicGallery)
    await buckets.pushPath(bucketKey, 'index.html', buf)
  }


    /**
   * galleryFromIndex parses the index.json and pulls the metadata for each image
   * @param index 
   */
  export const galleryFromIndex = async (index,buckets,bucketKey,links,ipfsGateway) => {
    if (!buckets || !bucketKey) {
      console.error('Error fecthing bucket from gallery. No bucket client or root key')
      return
    }
    let photos = [];
    for (let path of index.paths) {
      const metadata = await buckets.pullPath(bucketKey, path)
      console.log(links)
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const json = JSON.parse(str)
      const photo = index.paths.length > 1 ? json.preview : json.original
      let photoObject  =  { src:`${ipfsGateway}/ipfs/${photo.cid}`,width: photo.width, height: photo.height, key: photo.name,}
      photos.push(photoObject);
      
    }

    return photos;
  }