import {verify} from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({
        auth: false,
        message: 'No JWT token in request'
    });

    verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token'
        });
        req.locals = {
            decodedJwt: decoded
        };
        next();
    });
};

export default authenticate;
