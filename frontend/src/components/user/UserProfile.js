import React,{useState,useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {Container, Button, TextField,Typography} from '@material-ui/core';
import "./../../App.css";
import configData from "./../config.json";
import axios from 'axios';
import S3Uploader from './../uploader/uploader'; // import the component
import MUIEditor, { MUIEditorState } from "react-mui-draft-wysiwyg";
import {toHTML} from 'react-mui-draft-wysiwyg';
import Skeleton from '@material-ui/lab/Skeleton';
import {convertFromHTML, ContentState, convertFromRaw, convertToRaw, EditorState} from 'draft-js'



const queryString = require('query-string');



const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
  },
   formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  alpacaOauth:{
  	fontSize: "20px",
    margin: "0 auto",
    marginLeft: "30px",
    letterSpacing: "0.025em",
    boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.5)",
    borderRadius: "4px",
    textAlign: "center",
    background: "#FFD700",
    color: "#030303",
    padding: "10px 35px",
    minWidth: "181px",
    fontFamily: 'Carnas',
    fontWeight: "500",

    '&:hover': {
       background: "rgb(255, 215, 0.3)",
    },

  }


}));




function UserProfile() {
	const classes = useStyles();

	const [count,setCount]= useState(0);

  var currentUser = JSON.parse(window.localStorage.getItem("currentUser"));

  const editorConfig = {
    toolbar: { visible: true },
    draftEditor: { readOnly: false },
    editor: {
      wrapperElement: 'div',
      style: {
        padding: 0,
        borderTop: '1px solid gray',
      },
    },
  }



var blocksFromHTML = convertFromHTML(currentUser["userBio"])


const state = ContentState.createFromBlockArray(
  blocksFromHTML.contentBlocks,
  blocksFromHTML.entityMap,
);

 
 const [editorState, setEditorState] = React.useState(EditorState.createWithContent(state))


  const [userDetails,setUserDetails] = useState(currentUser);
  const [url,setURL] = useState("");
  
  const [fName,setfName] = useState("");
  const [lName,setlName] = useState("");
  const [bio,setBio] = useState(currentUser["userBio"]);
  

  const [isSubmitButtonDisabled,setIsSubmitButtonDisabled] = useState("true");
  const [pageLoading,setPageLoading] = useState("true")




  useEffect( () => {
    setPageLoading(false);

    window.localStorage.setItem("currentUser",JSON.stringify(userDetails));
  },[userDetails])

  useEffect(() => {

    if(isSubmitButtonDisabled && (fName.length !== 0 || lName.length !== 0 )){
      setIsSubmitButtonDisabled(false)
    }

  },[fName,lName,editorState])

	useEffect( () => {
   	if (count ===0){
   		const parsed = queryString.parse(window.location.search);

      
      axios.get(`${configData['NODE_SERVER_URL']}devault/api/users/${currentUser['_id']}`).then(resp => {
      setUserDetails(resp.data)
      
      //If code
        if (parsed["code"]){
            var code = parsed["code"];

            let payload = {}
            payload['code'] = parsed['code'];
            payload['userId'] = currentUser['_id'];

             axios.post(`${configData['NODE_SERVER_URL']}devault/api/users/oauth`,payload).then(token => {

            }).catch(err=>{
              alert(err);
            })
        
      }

        }).catch(err=>{
          alert(err);
        })


   		setCount(1);

   	}
   	
})


	const conncectToAlpaca = async () =>{

		const url = `${configData['oauth_base_url']}client_id=${configData['oauth_key_id']}&redirect_uri=${configData['redirectURL']}&state=${configData['oauth_state']}&scope=${configData['scope']}`
		 window.open(url)
	}


  const handleChange = (e) => {
    console.log("I'm ALright")
  }


 const handleFile = (loc,successMessage,errorMessage) => {
    if (loc.length>0){
      setURL(loc)
      alert(successMessage)
     
    }
    else{
      alert(errorMessage)
    }
  }

   const onChange = (newState) => {
    if (fName.length === 0){
      setfName(userDetails["firstName"])
    }
    if (lName.length === 0){
      setlName(userDetails["lastName"])
    }
    setEditorState(newState)
    
  }

  const submitChanges = () => {
    let desc = toHTML(editorState.getCurrentContent())
    let payload = {}
    payload["firstName"] = fName;
    payload["lastName"] = lName;
    payload["userBio"] = desc;
    alert(desc)

    axios.patch(`${configData['NODE_SERVER_URL']}devault/api/users/${userDetails._id}`,payload).then(resp => {
      setUserDetails(resp.data)

    }).catch(err => {
      alert("Something went wrong")
    })
  }


 return (

  <div className="App">
  
  <Container maxWidth="xl">

    <div className={classes.root}>
      <Grid container spacing={3} justify="center" direction="row">
        <Grid item xs align="left">

              <Grid container spacing={3}>
              <Grid item xs >
               <Paper className={classes.paper}>
                  <center>
                  <img height="100%" width="auto" src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairFrizzle&accessoriesType=Prescription02&hairColor=PastelPink&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=White&eyeType=Happy&eyebrowType=RaisedExcitedNatural&mouthType=Disbelief&skinColor=Pale'
/>                
                  <Typography variant="h5"> 
                  {userDetails['username']}
                  </Typography>


                    <S3Uploader 
                      buttonName="Upload Image"
                      bucketRegion="us-east-1"
                      albumBucketName="voyant"
                      handleFile={handleFile}
                    />

                  </center>



              </Paper>
              </Grid>


              <Grid item xs={12} lg={8} md={8} sm={12}>

               <Paper className={classes.paper}>
                  

              
              <TextField fullWidth id="outlined-basic" defaultValue={userDetails['firstName']} label="First Name" onChange ={e=>handleChange(e,"fName")} />

              <TextField fullWidth id="outlined-basic" defaultValue={userDetails['lastName']} label="Last Name" onChange ={e=>handleChange(e,"lName")} />


              </Paper>

              <br />

              <br />

               <Typography variant="h5">
                User Bio
                </Typography>

                <MUIEditor editorState={editorState} onChange={onChange} />


                <br />
                <br />


                  <Typography variant="h5">
                Brokerage
                </Typography>
                

                 <Paper className={classes.paper}>
          


              {pageLoading?(
                <Skeleton variant="rect" width={210} height={118} />

                ):(
                <span>
               {userDetails['userAlpacaToken']!==""?(
                <Typography variant="body1">
                Connected to Alpaca
                </Typography>

                ):
               (
                 <Button onClick={conncectToAlpaca} className={classes.alpacaOauth}>
                Connect to Alpaca
              </Button>
                )
             } 

                </span>
                )

            }

            </Paper>

            <br />
             <Button disabled={isSubmitButtonDisabled} onClick={submitChanges} variant="contained" color="primary" component="span" > Submit </Button>

              </Grid>
              </Grid>



        </Grid>
        
      </Grid>
    </div>

    </Container>
    </div>

  );
}

export default UserProfile;
