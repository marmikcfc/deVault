import React from "react";
import {Redirect , Route} from "react-router-dom";

export const PrivateRoute=({component: Component, ...rest})=>(
    <Route
    {...rest}
    render={props=>
    window.localStorage.getItem("voyant-jwt-token") ?(
        <Component {...props} />
    ) :(
        <Redirect to={{
            pathname:"/",
            state:{from:props.location}
        }}
        />
    )
    }
    />
)