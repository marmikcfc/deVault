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
import Timeline from 'react-native-timeline-flatlist'


var logger = log.getLogger("ProfileTrial");
logger.setLevel('INFO');

export function History({ route, navigation }) {
    const  {docId,docType}  = route.params;
    
    const [data,setData] = useState([]);

    const data1 = [
        {time: '09:00', title: 'Event 1', description: 'Event 1 Description'},
        {time: '10:45', title: 'Event 2', description: 'Event 2 Description'},
        {time: '12:00', title: 'Event 3', description: 'Event 3 Description'},
        {time: '14:00', title: 'Event 4', description: 'Event 4 Description'},
        {time: '16:30', title: 'Event 5', description: 'Event 5 Description'}
      ]
    
  

    useEffect(()=>{
        axios.get(`${endpoint}document/history/${docId}`).then(response=>{
            const history = response.data.map(hist=>{
                let obj = {};
                obj.time=new Date(hist.time);
                var time_arr = obj.time.toDateString().split(' ');
                obj.time = `${time_arr[1]} ${time_arr[2]}`
                //obj.time = `${obj.time.getDay()}/${obj.time.getMonth()+1}/${obj.time.getFullYear()}`;
                obj.title= docType.name;
                var desc  = ''
                var action = hist.action;
                logger.warn(`HIST ${JSON.stringify(hist)}`)
                    switch(action){
                        case "created":
                            obj.description= `${hist.by.displayName} ${action}`
                            break;
                        case "granted":
                            obj.description= `${hist.by.displayName} ${action} access to ${hist.for.displayName}`
                            break;
                        case "approved":
                            obj.description= `${hist.by.displayName} ${action} access for ${hist.for.displayName}`
                            break;
                        case "requested":
                            obj.description= `${hist.by.displayName} ${action} access from ${hist.for.displayName}`
                            break;
                        case "rejected":
                            obj.description= `${hist.by.displayName} ${action} access for ${hist.for.displayName}`
                            break;
                        default:
                            obj.description= `${action}`
                            break;
                    }
                    return obj;
                 
            });
            Promise.all(history).then(h=> {setData(h)}).catch(err => { logger.error(`Some thing went wrong ${err}`)});

        });
    },[]);
  
    return (
      <View style={{ flex: 1 }}>
  
        <Text>History Screen for {docId}</Text>
          
                      
        <Timeline
          data={data}
          circleSize={20}
          circleColor='rgb(45,156,219)'
          lineColor='rgb(45,156,219)'
          descriptionStyle={{color:'gray'}}
          options={{
            style:{paddingTop:5}
          }}
        />
        
      </View>
    );
  }