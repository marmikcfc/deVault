import {Provider, TextInput} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, Image} from 'react-native';
import {endpoint} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';

function Notifications() {

  return (
    <View style={{ flex:1 , justifyContent: 'center', alignItems: 'center' }}>
      <Text>Notifications!</Text>

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
