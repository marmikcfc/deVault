import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import {config} from 'dotenv';
import Company from './Company';
import axios from 'axios'

config();
const router = Router();
router.use(urlencoded({ extended: true }));
router.use(json());

router.post('/company/create', (req,res)=>{
    Company.create(req.body).then((result) => {
        res.status(200).send(result)
        }).catch((err) => {
        console.log(error)
        res.status(400).send(err)
    });
});



router.get('/hibp/:email', (req,res)=>{
    const endpoint = `https://haveibeenpwned.com/api/v3/breachedaccount/${req.params.email}?truncateResponse=false`;
    const headers= {
        "headers": {
            "user-agent":"deVault",
            "hibp-api-key":"2bbb19858ce9494da49a92a404f2dcd0"
        }
    }
    axios.get(endpoint,headers).then(resp => {
       
        console.log(`HIBP DATA ${JSON.stringify}`)
        res.status(200).send(resp.data);

    }).catch(err => {
        console.log(`Error ${err}`);
        res.status(400).send(err);
    });

    
});

export default router;