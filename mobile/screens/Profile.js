import {Provider, TextInput} from 'react-native-paper';
import React, {useState,useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, View,Text} from 'react-native';
import {endpoint} from './../utils/constants';
import axios from 'axios';

import DropDown from 'react-native-paper-dropdown';
import UploadFile from './UploadFile';

export default function Profile() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [gender, setGender] = useState();

  const [docType,setDocType] = useState("");
  const [docTypes,setDocTypes] = useState([]);
  const [docCategoryCounts,setDocCategoryCounts] = useState({});
  const [docsToUpload,setDocsToUpload] = useState(0);
  const [visible,setVisible] = useState(false);



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
      <View style={styles.containerStyle}>
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

      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
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

