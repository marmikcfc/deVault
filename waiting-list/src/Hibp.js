
import axios from 'axios';
import React, {useState, useEffect } from 'react';

import {Card, Typography,makeStyles,useTheme,CardContent ,Grid, Paper} from '@material-ui/core';
import { func } from 'prop-types';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: '1 0 auto',
    },
    cover: {
      width: 151,
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    playIcon: {
      height: 38,
      width: 38,
    },
  }));

export default function Hibp({email}) {

    const classes = useStyles();
        const theme = useTheme();


    const [loader,setLoader] = useState(false);
    const [hipbData,setHibpData]= useState([]);

    const endpoint = `http://localhost:3000/devault/api/waitingList/hibp/${email}`;
    
    useEffect(()=> {
        alert("SENDING axios");
        axios.get(endpoint).then(resp => {
            if (resp.data){
                setHibpData(resp.data);
                alert(`HIBP DATA ${resp.data}`)
            }
        }).catch(err => {
            alert(`Error ${err}`)
        })
    },[]);

    return(
        <div>

            {
                hipbData.map((d,index) =>{
                    return(
                        <Paper key={index}>
                           <Grid container spacing={3} className={classes.root}>

                               <Grid xs={8} className={classes.details}>
                               <Typography component="h5" variant="h5">
                              {d.Name} -  {d.Domain}
                            </Typography>

                            <Typography variant="subtitle1" color="textSecondary">
                                {d.BreachDate}
                            </Typography>

                            <Typography>
                                Information leaked
                                {
                                    d.DataClasses.map((kind,index) =>{
                                        return(
                                           <p key = {index}> {kind} </p> 
                                        )
                                    })
                                }
                            </Typography>

                               </Grid>

                               <Grid xs={4}>
                               <img src={d.LogoPath}  />
                               </Grid>

                            </Grid>
                        </Paper>
                        
                         
                   
                    )
                })
            }

        </div>
       
       
    )

}