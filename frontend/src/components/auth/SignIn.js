import React, {  useState } from 'react';
import axios from 'axios';
import {
  Grid, Paper, TextField, Button, Typography, FormControl
} from "@material-ui/core";
import { Link } from 'react-router-dom';



const SignIn = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const fetchToken =  () => {
      // axios.post("http://localhost:3000/voyant/api/authenticate/login", {
       
       let payload = {};
       if (username.indexOf('@') > -1){
        payload['email'] = username
       }

       else{
        payload['username']= username;
       }
       payload['password'] = password

        axios.post("http://localhost:3000/devault/api/authenticate/login",payload ).then((response) => {
            window.localStorage.setItem("voyant-jwt-token", response.data.token);
            window.localStorage.setItem("currentUser", JSON.stringify(response.data));
            window.localStorage.setItem("username",response.data.username);
            props.history.push('/dashboard');
            window.location.reload(false);

        });
    };


    return (

<div>




        <Grid
  container
  spacing={0}
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '100vh' }}
>

<Paper style = {{padding:'5%'}} elevation = {3} >
    <img alt ="logo" src="./logo.svg" />
  <Grid item xs={12}>
     <div >
 
        <FormControl style={{width:"100%", padding:2}}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              name="username" value={username} onChange={(e) => setUsername(e.target.value)}
                        />

              <TextField
              fullWidth
              required
              type="password"
              label="Password"
              name="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        />


              <br />


             <Button onClick={fetchToken} color="primary">
            Submit
          </Button>

          </FormControl>

          <Typography> Don't Have an Account? <Link to="/register"> Register </Link> </Typography>
          <Typography> Forgot Password? <Link to="/forgotPassword"> Click Here! </Link> </Typography>
           
        </div>

  </Grid>   

</Paper>
</Grid> 


</div>


       
    )
}

export default SignIn;
