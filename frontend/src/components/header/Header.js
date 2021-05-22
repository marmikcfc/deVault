import {
  AppBar,
  Container,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Toolbar} from "@material-ui/core";
import { Home } from "@material-ui/icons";
import * as React from "react";
import SideDrawer from "./SideDrawer";
import { message } from "antd";

const useStyles = makeStyles({
  navbarDisplayFlex: {
    display: `flex`,
    justifyContent: `space-between`
  },
  navListDisplayFlex: {
    display: `flex`,
    justifyContent: `space-between`
  },
  linkText: {
    textDecoration: `none`,
    textTransform: `uppercase`,
    color: `white`
  }
});

const navLinks = [
  { title: `About Us`, path: `/about-us` },
  { title: `Explore Ideas`, path: `/explore` },
  { title: `Sign In`, path: `/signin` },
  { title: `Register`, path: `/register` },
  {title: `Dashboard`, path:`/dashboard`}
];



const logoutMessage = () => {
 message.success("successfully logged out")
}

const Header = (props) => {
  const classes = useStyles();



  const logout = () => {
    window.localStorage.clear();
    const currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    if (!currentUser) {
      window.location.reload(false);
      logoutMessage();

    } else {
      console.log("log out failed");
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  return (
        <AppBar position="fixed">
          <Toolbar component="nav">
            <Container maxWidth="xl" className={classes.navbarDisplayFlex}>
              <IconButton edge="start" aria-label="home">
                <a href="/" style={{ color: `white`, left:0 }}>
                  <Home fontSize="large" />
                </a>
              </IconButton>

              <Hidden smDown>
                <List
                  component="nav"
                  aria-labelledby="main navigation"
                  className={classes.navListDisplayFlex}
                >
                  {navLinks.map(({ title, path }) => (


                   <span key={title}>  

                    {currentUser != null && title === "Sign In" ? 

                      ( 
                        <a href={"/profile"} key={title} className={classes.linkText}>
                      
                                            <ListItem button>
                                              <ListItemText primary={currentUser.username} />
                                            </ListItem>
                        </a>) : (

                        <span>
                        {

                          currentUser != null && title === "Register"? (

                             <a href="/" onClick={logout} key={title} className={classes.linkText}>
                      
                                            <ListItem button>
                                              <ListItemText primary={"Logout"} />
                                            </ListItem>
                        </a>


                            ) : (

                            <span>

                            {title === "Dashboard"?

                              (
                                <span>

                                {currentUser != null? (

                                  <a href={path} key={title} className={classes.linkText}>
                      
                                            <ListItem button>
                                              <ListItemText primary={title} />
                                            </ListItem>
                            </a>

                                  ) : null}

                                </span>

                                ): (

                                <a href={path} key={title} className={classes.linkText}>
                      
                                            <ListItem button>
                                              <ListItemText primary={title} />
                                            </ListItem>
                            </a>

                                )

                            }

                             

                        </span>
                            )

                        }

                        

                        </span>
                        )

                        

                    
                    }


                   </span>
                   
                  ))}
                </List>
              </Hidden>
              <Hidden mdUp>
                <SideDrawer navLinks={navLinks} />
              </Hidden>
            </Container>
          </Toolbar>
        </AppBar>

    
    
  );
};

export default Header;
