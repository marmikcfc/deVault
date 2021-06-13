import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import {config} from 'dotenv';
import Company from './Company';
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



router.get('/hibp', (req,res)=>{
    res.status(200).send({})
});

export default router;