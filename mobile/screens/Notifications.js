import {Provider, TextInput} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, Image} from 'react-native';
import {endpoint} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';

function Notifications() {

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text>Notifications!</Text>

      <Image
        style={{ width: '100%', height: '100%' }}
        source={{ uri: "https://hub.textile.io/ipfs/bafkreibovl3vkgwzelf4krteqx3qzpf6ceg2mhtex4wr6tvcffmugm57ku" }}
      />

    </View>
  );
  
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
});

export default Notifications;
