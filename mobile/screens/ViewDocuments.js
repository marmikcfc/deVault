import {Provider, TextInput} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, Image} from 'react-native';
import {ipfsGateway} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ViewDocuments({docs}) {

    const renderDoc = (doc) => {
        console.log(`rendering ${JSON.stringify(doc)} \n rendering ${ipfsGateway}/ipfs/${doc.cid}`)
       return (
        <Image key={doc._id}
        style={{ width: 300, height: 300 }}
        source={{ uri:  `${ipfsGateway}/ipfs/${doc.cid}`}}
        resizeMode = {'contain'}
      />
       )
   }
  return (
    <View style={{justifyContent: 'center', alignItems: 'center' }}>
        <Text> Documents</Text>
      {
          docs.map((doc,index) => {
                if(doc.photoType == "previews"){
                    return renderDoc(doc);
                }
          })

      }
    </View>
  );
  
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
});

export default ViewDocuments;
