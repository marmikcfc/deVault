import {Provider, TextInput, Button, DropDown} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, Image} from 'react-native';
import {endpoint, ipfsGateway} from './../utils/constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import log from 'loglevel';

var logger = log.getLogger("View Document");
logger.setLevel('INFO');

function ViewDocument({document}) {
  
    const renderDoc = (doc,index) => {
        logger.info(`rendering ${JSON.stringify(doc)} \n f \n rendering ${ipfsGateway}/ipfs/${doc.cid}`)
       return (

      <View key={index}>
          {index == 0? (<Text> Front Page </Text>):<Text> Back Page </Text>}
          <Image 
          style={{ width: 300, height: 300, marginBottom:30 }}
          source={{ uri:  `${ipfsGateway}/ipfs/${doc}`}}
          resizeMode = {'contain'}
          />

      </View>

       )
   }


  return (
      <View>
      <Text> Documents</Text>
      {
          document.cid.map((cid,index) => {
                    return renderDoc(cid,index);
          })
      }
      </View>
     
      
  );
  
}

const styles = StyleSheet.create({
  image: {
    height: 150,
    width: 150    
  },

});

export default ViewDocument;