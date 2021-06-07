import {Provider, TextInput,Button} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';

import DropDown from 'react-native-paper-dropdown';
import {endpoint} from '../utils/constants';
import axios from 'axios';
import log from 'loglevel';


var logger = log.getLogger("ShareScreen");

export default function DropDownScreen({doc, index, userId}) {

  const [userName,setUserName] = useState(null);
  const [usernames,setUsernames] = useState([]);
  const [visible,setVisible] = useState(false);

  useEffect(() => {
    logger.info("use effect and docTypes == null")
    if (usernames.length == 0){
      logger.info("use effect and docTypes != null")
      logger.info(`User ID ${userId}`);
      axios.get(`${endpoint}users`).then(response => {

        if(response?.data){
          let userNames = response.data.map(u => {
           
            return {value:u._id,label:u.displayName}
          });
          logger.info(`userNAmes   ${JSON.stringify(usernames)}`);
            setUsernames(userNames);
            setVisible(true);
        }
      }).catch(err => {
        logger.info(`something went wrong mofos ${err}`);
      });
    }
});

const shareWithUser = () => {
  let payload = {
    documentId: doc._id,
    fromUserId: userId,
    toUserId: userName,
    isDownloadable: false,
    status: 'granted'
  };

  axios.post(`${endpoint}document/share`,payload).then(response => {
    logger.info(`Shared documet ${doc._id}`);
  }).then(err => {
    logger.info(`something went wrong ${err}`);
  });
}


  const genderList = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Others', value: 'others'},
  ];



  
  return (
      <View  key={index}>
        <DropDown
          label={'Users'}
          mode={'outlined'}
          value={userName}
          setValue={setUserName}
          list={usernames}
          visible={visible}
          showDropDown={() => setVisible(true)}
          onDismiss={() => setVisible(false)}
          inputProps={{
            right: <TextInput.Icon name={'menu-down'} />,
          }}
        />

      <Button mode="contained" onPress={() => shareWithUser()}>
          Press me
        </Button>

      </View>
  );
}

const styles = StyleSheet.create({

});

