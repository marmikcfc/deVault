import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import SignUp from './Signup';

const router = Router();
router.use(json());

router.post('/', function (req, res) {
 

    SignUp.create(Object.assign(req.body),
        function (err, backtest) {
            console.log(err);
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(backtest);
    });
});


export default router;