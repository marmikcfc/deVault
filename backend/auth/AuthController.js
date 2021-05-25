import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import User from '../user/User';
import {sign, verify} from 'jsonwebtoken';
import {hashSync, compareSync} from 'bcryptjs';
import {PrivateKey} from '@textile/hub';
import {bip39} from 'bip39';
import {CryptoJS} from "crypto-js";

// Encrypt

const router = Router();
router.use(urlencoded({
    extended: true
}));
router.use(json());

router.post('/register', async function (req, res) {
    console.log("Incoming request into /register", req);
    const hashedPassword = hashSync(req.body.password, 8);
    const userIdentity = await PrivateKey.fromRandom().toString();
    memonicPhrases = bip39.generateMnemonic();
    const key = bip39.mnemonicToSeedSync(memonicPhrases).toString('hex');
    var encryptedIdentity = CryptoJS.AES.encrypt(identity,key).toString();
    
    User.create({
        email: req.body.email,
        password: hashedPassword,
        username: req.body.username,
        identity: encryptedIdentity,  
    },
    function (err, user) {
        console.log(err);
        if (err) return res.status(500).send("There was a problem registering the user.")
        // create a token
        const token = sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({
            auth: true,
            token: token,
            username:user.username,
            phrases:memonicPhrases,
            privateKey:key,
            identity:userIdentity
        });
    });
});

router.post('/login', function (req, res) {

    console.log(JSON.stringify(req.body));
    var parameter = {}

    if (req.body.hasOwnProperty("email")){
        parameter.email = req.body.email
    }
    else{
        parameter.username = req.body.username
    }

    User.findOne(parameter, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        console.log(`USER => ${JSON.stringify(user)}`);
        const passwordIsValid = compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({
            auth: false,
            token: null
        });

        console.log("USER FOUND");
        const token = sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({
            auth: true,
            token: token,
            username:user.username
        });
    });
});


router.post('/forgotPassword', function (req, res) {

    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        const hashedPassword = hashSync(req.body.password, 8);


        const upsertData = { email: req.body.email, password: hashedPassword}

        User.update({ email: req.body.email }, upsertData, { multi: false }, function(err,user) {
            if(err) { throw err; }

            res.status(200).send({
            auth: true        });

        });
       

        
    });

});

export default router;
