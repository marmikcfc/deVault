import {Provider, TextInput} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text, ScrollView} from 'react-native';
import {endpoint} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewDocuments from './ViewDocuments';

export default function Profile() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [gender, setGender] = useState();

  const [docType,setDocType] = useState("");
  const [docTypes,setDocTypes] = useState([]);
  const [docCategoryCounts,setDocCategoryCounts] = useState({});
  const [docsToUpload,setDocsToUpload] = useState(0);
  const [visible,setVisible] = useState(false);
  const [docs,setDocs] = useState([]);



  useEffect(() => {
    (async function setDocuments(){
    const documents = await AsyncStorage.getItem("documents");
    console.log(`docs unloadedddd  ${JSON.stringify(docs)}`)
    setDocs(JSON.parse(documents));
    })();
    console.log(`docs loadedddd  ${JSON.stringify(docs)}`);

  },[]);


  useEffect(() => {
    console.log("use effect ")
    if (docTypes.length === 0 ){
      console.log("use effect and docTypes == null")
      axios.get(`${endpoint}document/types`).then(response => {
        if(response?.data){
            let values = [];
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
            setVisible(true);
        }
      }).catch(err => {
        console.log(`something went wrong mofos ${err}`);
      });
    }
});


  const genderList = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Others', value: 'others'},
  ];

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

  return (
    <Provider>
      <ScrollView style={styles.containerStyle}>
      <Text  style={styles.title}>Profile!</Text>

      <DropDown
          label={'Document Type'}
          mode={'outlined'}
          value={docType} 
          setValue={setDocType}
          list={docTypes}
          visible={visible}
          showDropDown={() => setVisible(true)}
          onDismiss={() => setVisible(false)}
          inputProps={{
            right: <TextInput.Icon name={'menu-down'} />,
          }}
        />

        {docType ===""? null:renderUploadComponents()}
        
        {docs.length == 0 ? null:(<ViewDocuments docs = {docs} />)}
        
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    marginHorizontal: 20,
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

