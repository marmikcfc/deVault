import {Provider, TextInput, Button} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, ScrollView} from 'react-native';
import {endpoint} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewDocuments from './ViewDocuments';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';



const Stack = createStackNavigator();


const ProfileScreen = ({navigation}) => {
   
  return (<View style={styles.containerStyle}>
   <Text  style={styles.title}>Profile!</Text>

   <Button
       title="Go to Details"
       onPress={() => {
         /* 1. Navigate to the Details route with params */
         navigation.navigate('Details', {
           itemId: 86,
           otherParam: 'anything you want here',
         });
       }}
     />

     <ScrollView>

       {renderButtons()}

       

     </ScrollView>


   </View>)

 }


export default function Profile() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [gender, setGender] = useState();

  //const [docType,setDocType] = useState("");
  const [docTypes,setDocTypes] = useState([]);
  const [docCategoryCounts,setDocCategoryCounts] = useState({});
  //const [docsToUpload,setDocsToUpload] = useState(0);
  //const [visible,setVisible] = useState(false);
  const [docs,setDocs] = useState([]);
  const [docIds,setDocIds] = useState([]);




  useEffect(() => {
    (async function setDocuments(){
    const documents = await AsyncStorage.getItem("documents");
    console.log(`docs unloadedddd  ${JSON.stringify(docs)}`)
    setDocs(JSON.parse(documents));
    const docTypeSet = JSON.parse(documents).map( d => {return d._id;});
    setDocIds(docTypeSet);
    console.log("Docs set up clearly");
    })();
    console.log(`docs loadedddd  ${JSON.stringify(docs)}`);

  },[]);


  useEffect(() => {
    console.log("use effect ")
    if (docTypes.length === 0 ){
      console.log("use effect and docTypes == null")
      axios.get(`${endpoint}document/types`).then(response => {
        if(response?.data){
          console.log(`Document Type recieved ${JSON.stringify(response.data)}`);
            setDocTypes(response.data);
            /*let values = [];
            let categoryCounts = {}
            console.log(`Data recieved ${JSON.stringify(response.data)}`);
            response.data.forEach(val => {
              if (val.category in categoryCounts){
                categoryCounts[val.category].push(val);
              }
              else{
                values.push({label:val.category, value:val.category});
                categoryCounts[val.category] =[val];
              }
            });
            console.log(`Values ${JSON.stringify(values)}`);
            console.log(`Category Counts ${JSON.stringify(categoryCounts)}`);

            setDocTypes(values);
            setDocCategoryCounts(categoryCounts);
            setVisible(true);*/
        }
      }).catch(err => {
        console.log(`something went wrong mofos ${err}`);
      });
    }
});




  const renderUploadComponents = () => {
    
    if(docCategoryCounts[docType].length ===1 ){
        return( <Text> <UploadFile documentType = {docCategoryCounts[docType][0]}/> </Text> );s
    }
    else{   
        return (  <Text>  
            
            <Text> 
            <UploadFile documentType = {docCategoryCounts[docType][0]}/> 
                </Text> 
                
                {"\n"}
                <Text>

                <UploadFile documentType = {docCategoryCounts[docType][1]} /> 
                </Text>
                </Text> );
    }

  }

  const renderButtons = () => {

    if(docTypes.length > 0){

      return docTypes.map((r,index) => {
            return (
                <View key={index} style={{alignContent: 'center', alignItems:'center',marginTop:40}}>

                <Button style={{padding:10, marginHorizontal:20, borderRadius:20, height:65 , width:300}} icon="camera" mode="contained" onPress={() => console.log('Pressed')}>
                     {r.name}
                </Button>
                  
                </View>
            );
      });
      
    }

  }



  function DetailsScreen({ route, navigation }) {
    /* 2. Get the param */
    const { itemId } = route.params;
    const { otherParam } = route.params;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details Screen</Text>
        <Text>itemId: {JSON.stringify(itemId)}</Text>
        <Text>otherParam: {JSON.stringify(otherParam)}</Text>
        <Button
          title="Go to Details... again"
          onPress={() =>
            navigation.push('Details', {
              itemId: Math.floor(Math.random() * 100),
            })
          }
        />
      </View>
    );
  }

  


  return ( 


    <NavigationContainer independent={true}>
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Home" component={ProfileScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  containerStyle: {
    marginHorizontal: 20,
    flex: 1,
    alignContent:'center',
    alignItems:'center',
  },
  title: {
    fontSize: 25,
    marginBottom: 30,
  },
  text: {
    fontSize: 20,
  },
});

