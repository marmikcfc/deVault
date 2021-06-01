import {Provider, TextInput} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

import DropDown from 'react-native-paper-dropdown';
import {endpoint} from './../utils/constants';
import axios from 'axios';

export default function Notifications() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [gender, setGender] = useState();

  const [docType,setDocType] = useState(null);
  const [docTypes,setDocTypes] = useState(null);
  const [docCategoryCounts,setDocCategoryCounts] = useState(null);
  const [docsToUpload,setDocsToUpload] = useState(0);
  const [visible,setVisible] = useState(false);

  useEffect(() => {
    console.log("use effect and docTypes == null")
    if (docTypes ===null){
      console.log("use effect and docTypes == null")
      axios.get(`${endpoint}document/types`).then(response => {
        if(response?.data){
            let values = [];
            let categoryCounts = {}
            console.log(`Data recieved ${JSON.stringify(response.data)}`);
            response.data.forEach(val => {
              if (val.category in categoryCounts){
                categoryCounts[val.category] +=1;
              }
              else{
                values.push({label:val.category, value:val.category});
                categoryCounts[val.category] =1;
              }
            })
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

  
  return (
    <Provider>
      <SafeAreaView style={styles.containerStyle}>
        <DropDown
          label={'Gender'}
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

      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
});

