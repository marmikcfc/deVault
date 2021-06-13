import React, {useState, useEffect } from 'react';
import './App.css';
import {Button, TextField, Grid, Typography} from '@material-ui/core';
import MuiPhoneNumber from 'material-ui-phone-number';
import OtpInput from 'react-otp-input';


import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import { render } from 'react-dom';
import Hibp from './Hibp';
Amplify.configure(awsconfig);

const NOTSIGNIN = 'You are NOT logged in';
const SIGNEDIN = 'You have logged in successfully';
const SIGNEDOUT = 'You have logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number (Country code +XX needed)';


function App() {


  <div className="App">

  </div>

  const [otp,setOtp] = useState('');
  const [message, setMessage] = useState('Welcome to AWS Amplify Demo');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [number, setNumber] = useState('');
  const password = Math.random().toString(10) + 'Abc#';
  const [data,setData] = useState({'name':'','PhoneNumber':'','email':''})
  const [screenToShow,setScreenToShow] = useState(0);


  const showOtp = () => {
    alert(otp);
  }


  useEffect(() => {
    console.log('Ready to auth');
    setTimeout(verifyAuth, 1500);
  }, []);

  const verifyAuth = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
      })
      .catch((err) => {
        console.error(err);
        setMessage(NOTSIGNIN);
      });
  };

  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setOtp('');
      setMessage(SIGNEDOUT);
    } else {
      setMessage(NOTSIGNIN);
    }
  };

  const signIn = () => {
    //alert(number);
    let nums = number.split(" ");
    //alert(nums);
    let n = nums[1].split("-");
    //alert(n);
    let num = nums[0] + n[0]+n[1]
    alert(num);

    setData(Object.assign(data,{PhoneNumber:num}));
    setScreenToShow(3);
    return;
    /*
    setMessage(VERIFYNUMBER);
    Auth.signIn(num)
      .then((result) => {
        alert(`${JSON.stringify(result)}`);
        setSession(result);
        setMessage(WAITINGFOROTP);
      })
      .catch((e) => {
        alert(`${JSON.stringify(e)}`);
        if (e.code === 'UserNotFoundException') {
          signUp();
        } else if (e.code === 'UsernameExistsException') {
          setMessage(WAITINGFOROTP);
          signIn();
        } else {
          console.log(e.code);
          console.error(e);
        }
      }); */
  };

  const signUp = async () => {
    setScreenToShow(3);
    return;
    /*let nums = number.split(" ");
    //alert(nums);
    let n = nums[1].split("-");
    //alert(n);
    let num = nums[0] + n[0]+n[1]
    alert(num);

    const result = await Auth.signUp({
      username: num,
      password,
      attributes: {
        phone_number: num,
      },
    }).then(() => signIn());
    return result;*/
  };

  const verifyOtp = () => {
    Auth.sendCustomChallengeAnswer(session, otp)
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
        setScreenToShow(3);
      })
      .catch((err) => {
        setMessage(err.message);
        setOtp('');
        console.log(err);
      });
  };

  const handleChange = (field,e) => {
    let val = e.target.value;
    if (field == "name"){

      setData({...data,name:val});
    }

    if (field == "email"){
      setData({...data,email:val});
    }
  }

  const nextPage= (field) => {
    if (field == 'name'){
      setScreenToShow(1);
    }
    if (field == 'email'){
      setScreenToShow(2);
    }
  }

  const renderTextField = (field) => {
    return(
      <div>
        <TextField id="outlined-basic" label={field} placeholder={field} value={data[field]} onChange={(e) => handleChange(field,e)} variant="outlined" />
        <Button variant="contained" color="primary" onClick = {() => nextPage(field)}>
          Next
        </Button>
      </div>

      
    )
   /**
    *  if(field == 'name'){
      setScreenToShow(1);
    }
    else{
      setScreenToShow(2);
    }

    */
  }

  const renderCongratulationsScreen = () => {
    return (
      <Typography>
        Thanks {data.name} for signing in for early access.
        We'll let you in quickly.
        Till then, we've crawled over the internet to get you this 
        <Hibp email={data.email} />
      </Typography>
    )
  }

  const renderPhoneScreen = () => {
   return (
            <div>
              <p>{message}</p>



        <MuiPhoneNumber
              
              defaultCountry={"in"}
              value={number}
              inputClass = {TextField}
              onChange={(val) => setNumber(val)}
            />



        <Button variant="contained" color="primary" onClick = {() => signIn()}>
          Get Otp
        </Button>


        <Grid style={{margin:15}} alignContent='center'>
        <OtpInput
            value={otp}
          onChange={(e) => setOtp(e)}
            numInputs={6}
            separator={<span style={{margin:2}}>-</span>}
            inputStyle="inputStyle"
            
          />


        </Grid>

        <Button variant="contained" color="primary" onClick = {() => verifyOtp()}>
          Confirm
        </Button>
    </div>);

  }

  const renderScreenToShow = (screenNum) => {
      if(screenNum == 0){
        return renderTextField('name');
      }
      else if (screenNum == 1){
        return renderTextField('email');
      }
      else if (screenNum == 2){
        return renderPhoneScreen();
      }

      else if (screenNum == 3){
        return renderCongratulationsScreen();
      }

  }

  
  return (
    <div className="App">

<Grid
  container
  spacing={0}
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '100vh' }}
>

  <Grid item xs={3}>

    {renderScreenToShow(screenToShow)}
  
  </Grid>   

</Grid> 



    

    </div>
  );
}

export default App;
