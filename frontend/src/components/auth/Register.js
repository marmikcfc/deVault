import React, {  useState } from 'react';
import axios from 'axios';
import {
  Grid, Paper, TextField, Button, Typography, FormLabel, RadioGroup, FormControlLabel, Radio
} from "@material-ui/core";
import { Link } from 'react-router-dom';





const Register = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userType, setUserType] = useState("false");

    //const [age, setAge] = useState("");

    const handleChange = (event) => {
    setUserType(event.target.value);
  };

    const fetchToken =  () => {
      var isAnalyst = false;
      if (userType === "true"){
        isAnalyst = true;
      }
        axios.post("http://localhost:3000/devault/api/authenticate/register", {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            username:username,
            isAnalyst: isAnalyst
        }).then((response) => {

            window.localStorage.setItem("voyant-jwt-token", response.data.token);
            window.localStorage.setItem("currentUser", JSON.stringify(response.data));
            window.localStorage.setItem("username",response.data.username);
            props.history.push('/dashboard');
        }).catch(err => {
          alert(JSON.stringify(err))
        });
    };




    return (





        <Grid
  container
  spacing={0}
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '100vh' }}
>

<Paper style={{padding:15}} elevation = {3} >
   <img alt ="logo" src="./logo.svg" />

  <Grid item xs={12}>
     

   <Grid item xs={12} >
   <TextField
              fullWidth
              required
              type="text"
              label="First Name"
              name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        />
            
        </Grid>


        <Grid item xs={12} >
   <TextField
              fullWidth
              required
              type="text"
              label="Last Name"
              name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)}
                        />
            
        </Grid>




        <Grid item  xs={12} >
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              name="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        />
        </Grid>


            <TextField
              fullWidth
              required
              type="text"
              label="Username"
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
            <br />

          <FormLabel component="legend">Are you registering as an advisor/analyst?</FormLabel>
      <RadioGroup aria-label="role" name="role" value={userType} onChange={handleChange}>
        <FormControlLabel value="true" control={<Radio />} label="Yes" />
        <FormControlLabel value="false" control={<Radio />} label="No" />
      </RadioGroup>



                <br />
             <Button onClick={fetchToken} color="primary">
            Submit
          </Button>

          <Typography> Have an Account? <Link to="/signin"> Login </Link> </Typography>
           
        

  </Grid>   


</Paper>
</Grid> 




       
    )
}

export default Register;
