import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import User from './User';
import {bip39} from 'bip39';
import {config} from 'dotenv';
var CryptoJS = require("crypto-js");


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
        //const key = crypto.createHash('sha256').update(req.body.email).digest('hex').toString();  //bip39.mnemonicToSeedSync(memonicPhrases).toString('hex');
        console.log(req.body.email);
        let key = CryptoJS.SHA256(req.body.email).toString();
        console.log("############");
        console.log(key);
        var encryptedIdentity = CryptoJS.AES.encrypt(process.env.TEXTILE_KEY,key).toString();
        
        response['bucketName'] = `deVault/${userName}`
        response['textileKey'] = encryptedIdentity;
        response['ipfsGateway'] = process.env.IPFS_GATEWAY;
        
        
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) {
            //create a user
           return User.create({
                email: req.body.email,
                displayName: req.body.displayName,
                photoURL:req.body.photoURL,
                bucketName:`deVault/${userName}`

            }).then(resp => {
                res.status(200).send(response);
            }).catch(err => {
                return res.status(500).send("There was a problem creating the user.");
            });
        }

        return res.status(200).send(response);

        
    });
});

export default router;
