import React, {useState,useEffect} from 'react';
import {SafeAreaView, StyleSheet, View,Text, ScrollView} from 'react-native';
import {Provider, TextInput, Button} from 'react-native-paper';

import {endpoint} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewDocuments from './ViewDocuments';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import log from 'loglevel';

var logger = log.getLogger("ProfileTrial");
logger.setLevel('INFO');

function ProfileScreen({ navigation }) {

  const [docTypes,setDocTypes] = useState([]);
  const [docs,setDocs] = useState([]);
  const [docIdMap,setDocIdMap] = useState({}); //Already uploaded docIds




  useEffect(() => {
    (async function setDocuments(){
    const documents = await AsyncStorage.getItem("documents");
    logger.info(`docs unloadedddd  ${JSON.stringify(docs)}`)
    setDocs(JSON.parse(documents));
    //let docMap = {};
    //logger.info(`docssss ${JSON.stringify(docs)}`)
    if (documents){
        /*JSON.parse(documents).forEach(element => {
            docMap[element.documentType] = element;
        });*/
            //const docTypeSet = JSON.parse(documents).map( d => {return d._id;});
        setDocIdMap(JSON.parse(documents));
        logger.info(`Docs set up clearly ${JSON.stringify(documents)}`);    
    }

    })();
    logger.info(`docs loadedddd  ${JSON.stringify(docs)}`);

  },[]);


  useEffect(() => {
    logger.info("use effect ")
    if (docTypes.length === 0 ){
      logger.info("use effect and docTypes == null")
      axios.get(`${endpoint}document/types`).then(response => {
        if(response?.data){
          logger.info(`Document Type recieved ${JSON.stringify(response.data)}`);
            setDocTypes(response.data);
        }
      }).catch(err => {
        logger.info(`something went wrong mofos ${err}`);
      });
    }
});

  const renderButtons = () => {

    if(docTypes.length > 0){

      return docTypes.map((docType,index) => {
            return (
                <View key={index} style={{alignContent: 'center', alignItems:'center',marginTop:40}}>
             

                <Button style={{padding:10, marginHorizontal:20, borderRadius:20, height:65 , width:300}} icon="camera" mode="contained" 
                onPress={() => {
                    /* 1. Navigate to the Details route with params */
                    navigation.navigate('Details', {
                      doc: docIdMap.hasOwnProperty(docType.id)? docIdMap[docType.id]:null,
                      docType: docType
                    });
                  }}>
                    
                     {docType.name}
                </Button>
                  
                </View>
            );
      });
      
    }

  }
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      

<ScrollView>

{renderButtons()}



</ScrollView>

    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { doc,docType } = route.params;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Text>doc: {JSON.stringify(doc)}</Text>
      <Text> <UploadFile documentType = {docType}/> </Text>
        
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={ProfileScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
