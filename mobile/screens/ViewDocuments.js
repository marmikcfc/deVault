import {Provider, TextInput, Button, DropDown} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, Image} from 'react-native';
import {endpoint, ipfsGateway} from './../utils/constants';
import axios from 'axios';

import UploadFile from './UploadFile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownScreen from './ShareScreen';

function ViewDocuments({docs, userIds}) {
  
    const [userId,setUserId] = useState(null); 
    const [shareWith,setShareWith] = useState([]);
    const [usernames,setUsernames] = useState([]);

    console.log(`USerIds to render ${JSON.stringify(userIds)}`);

    useEffect(() => {
      (async function setDocuments(){
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
        console.log("user id "+id);
        setShareWith(Array.apply(null, Array(userIds.length)).map(function () {}));
        let uname = await AsyncStorage.getItem("userNames");
        let unames = JSON.parse(uname);
        setUsernames(unames);
        })();
          
    },[]);

    const setToUserId = (index,text) => {
      var sharedWith = [...shareWith];
      sharedWith[index] = text;
      setShareWith(sharedWith);
    }

    const shareWithUser = (doc,index) => {
      let payload = {
        documentId: doc._id,
        fromUserId: userId,
        toUserId: shareWith[index],
        isDownloadable: false,
        status: 'granted'
      };

      axios.post(`${endpoint}document/share`,payload).then(response => {
        console.log(`Shared documet ${doc._id}`);
      }).then(err => {
        console.log(`something went wrong ${err}`);
      });
    }

    /*const renderShareComponent = (doc,index) => {
     return ( <Text key={index}>

    <Button mode="contained" onPress={() => shareWithUser(doc,index)}>
          Press me
        </Button>

      <TextInput
      label="Email"
      value={shareWith[index]}
      onChangeText={text => setToUserId(index,text)}
      />
      </Text>)      
    }*/

    const renderDoc = (doc,index) => {
        console.log(`rendering ${JSON.stringify(doc)} \n for userID ${JSON.stringify(userIds[index])}  \n rendering ${ipfsGateway}/ipfs/${doc.cid}`)
       return (

      <View>
         {userIds.length >0? ( <Text key ={index}> Shared by {userIds[index].displayName}  </Text>) : <DropDownScreen doc={doc} userId={userId} index={index} /> }

          <Image key={doc._id}
          style={{ width: 300, height: 300, marginBottom:30 }}
          source={{ uri:  `${ipfsGateway}/ipfs/${doc.cid}`}}
          resizeMode = {'contain'}
          />
        
      </View>

       )
   }


  return (
    <View >
        <Text> Documents</Text>
      {
          docs.map((doc,index) => {
                    return renderDoc(doc,index);
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

export default ViewDocuments;
