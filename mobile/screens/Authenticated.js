import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Button,ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {endpoint} from './../utils/constants';
import ViewDocuments from './ViewDocuments';




export default function Authenticated() {

  const signOut = async () => {
    auth().signOut();
    await AsyncStorage.clear();
  }
  const user = auth().currentUser;

  const [userId,setUserId] = useState(null); 
  const [docs,setDocs] = useState([]); 
  const [userIds,setUserIds] = useState([]); 

  //const getDocsPayload = {"toUserId": }
  useEffect(() => {

    (async function setDocuments(){
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
      console.log("user id "+id);
      })();
  },[]);

  useEffect(()=> {
    const getDocsPayload = {toUserId: userId, notification:false};
    axios.get(`${endpoint}document`,getDocsPayload).then(response=>{

       var documents = response.data.map(function (obj) {
          return obj.documentId;
        });

        var userIds = response.data.map(function (obj) {
          return obj.fromUserId;
        });

        setUserIds(userIds);
      
        setDocs(documents);
        console.log(`data recieved ${JSON.stringify(response.data)}`);
    }).catch(err => {
      console.log(`Error ${JSON.stringify(err)}`);
    });
    console.log(`docs loadedddd  ${JSON.stringify(docs)}`);
  },[]);

  return (
      <View style={styles.screen}>
      <Text style={styles.title}>You're Logged In</Text>
      <Image source={{ uri: user?.photoURL }} style={styles.image} />
      <Text style={styles.text}>{user?.displayName}</Text>
      <Text style={styles.text}>{user?.email}</Text>
      <View style={{ marginTop: 30 }}>
        <Button title="Signout" onPress={() => signOut()} />
        <Text style={styles.text}>Documents shared with me</Text>
      </View>

      <ScrollView>
      {docs.length == 0 ? null:(<ViewDocuments docs = {docs} userIds= {userIds}/>)}

    </ScrollView>

    </View>

    
  );
}

const styles = StyleSheet.create({
  screen: {
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
