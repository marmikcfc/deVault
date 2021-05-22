import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import User from './User';

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

export default router;