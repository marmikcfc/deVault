import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import User from './User';
import {bip39} from 'bip39';
import {config} from 'dotenv';

import {encrypt, decrypt} from '../utils/utils';
var CryptoJS = require("crypto-js");
import { getIdentity } from '../utils/utils';


config();


  

const router = Router();
router.use(urlencoded({ extended: true }));
router.use(json());

// CREATES A NEW USER
router.post('/', function (req, res) {
    User.create({
            email : req.body.email,
            password : req.body.password
        },
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/', function (req, res) {
    User.findById(req.locals.decodedJwt.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// GETS A Credentials
router.post('/credentials', function (req, res) {
    User.findOne({ email: req.body.email}, function (err, user) {

        let response = {};
        let userName = req.body.email.split("@")[0];
        console.log(req.body.email);
        
        console.log("############");
        
        console.log(`TEXTILE KEY ${process.env.TEXTILE_KEY}`);
        
        var encryptedIdentity = encrypt(process.env.TEXTILE_KEY,req.body.email.trim())
        console.log(`encrypted identity ${encryptedIdentity}`);
        

        response['bucketName'] = `deVault/${userName}`
        response['textileKey'] = encryptedIdentity;
        response['ipfsGateway'] = process.env.IPFS_GATEWAY;
        

        if (err) {
            console.log(`ERR in finding users ${JSON.stringify(err)}`)
            return res.status(500).send("There was a problem finding the user.");
        }
        if (!user) {
            //create a user
            const identity = getIdentity();
            
           response['identity'] = identity;

           console.log(`Identity String ${identity}`);
           return User.create({
                email: req.body.email,
                displayName: req.body.displayName,
                photoURL:req.body.photoURL,
                bucketName:`deVault/${userName}`,
                identity: identity

            }).then(resp => {
                return res.status(200).send(response);
            }).catch(err => {
                console.log(`ERR in creating users ${JSON.stringify(err)}`)
                return res.status(500).send("There was a problem creating the user.");
            });
        }
        else{
            response['identity'] = user.identity;
        }

        return res.status(200).send(response);

        
    });
});

export default router;
