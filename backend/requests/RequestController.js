import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import ShareRequest from './ShareRequest';
import {config} from 'dotenv';

import mongoose from 'mongoose';
import History from '../documents/History';

config();

const router = Router();
router.use(urlencoded({ extended: true }));
router.use(json());

// Creates a sharing request
router.post('/create', function(req,res){   
    
    console.log(`Addding ${JSON.stringify(req.body)}`)
    return ShareRequest.create(req.body).then(result => {
        console.log(`added ${JSON.stringify(result)}`);

        //Create History record
        // Replace with QLDB Persistence
        History.create({
            documentId: req.body.documentId,
            shareRequestId: result._id,
            status:req.body.status
        }).then(history => {
            console.log(`Created History for user ${req.body.user}`);
        }).catch(err => {
            console.log(`Something Went Wrong`)
        });


        return res.status(200).send(result);
    }).catch(err => {
        console.log(`There was an error adding a request. ${JSON.stringify(request)} \n ${err}`);
        return res.status(500).send("There was a problem finding request types.");
    });
});


// Updates a given share request
router.put('/:id', function(req,res) {
    return ShareRequest.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)},req.body, {upsert:false}).then(result => {
            
            //Create History record
            // Replace with QLDB Persistence
            History.create({
                documentId: result.documentId,
                shareRequestId: result._id,
                status:req.body.status
            }).then(history => {
                console.log(`Created History for user ${req.body.email}`);
            }).catch(err => {
                console.log(`Something Went Wrong`)
            });

            console.log(`Successfully update ${JSON.stringify(result)}`);
            res.status(200).send(Object.assign(result,req.body));
    }).catch(err => {

        console.log(`There was a mistake adding a request. ${err}`);
        return res.status(500).send("There was a problem finding request types.");    
    })

});


//gets details of a share request
router.get('/:id', function(req,res) {

    return ShareRequest.findById(req.params.id).populate('user').populate('company').populate('documentId').exec((err,requests) => {
        if(err){
            console.log(`There was a mistake retriving a request. ${err}`);
            return res.status(500).send("There was a problem finding request.");    
        }
        console.log(`Successfully requests ${JSON.stringify(requests)}`);
            return res.status(200).send(requests);
    });
});


    /*let request = {}
    var toPopulate = '';
    console.log(`request ${JSON.stringify(request)}`);      
    if (req.body.hasOwnProperty("toUserId")){
        request.toUserId = mongoose.Types.ObjectId(req.body.toUserId);
        toPopulate = 'toUserId';

        if (req.body.notification === false){
            request.expiryDate  = {$gte: new Date()}
        }
        else {
            request.isViewed = false;
        }

    }

    console.log(`request ${JSON.stringify(request)}`);      

    if (req.body.hasOwnProperty("fromUserId")){
        request.fromUserId = mongoose.Types.ObjectId(req.body.fromUserId);
        toPopulate = 'fromUserId';

        if (req.body.notification === false){
            request.expiryDate  = {$gte: new Date()}
        }
        else {
            request.isViewed = false;
        }
        
    }

    console.log(`request ${JSON.stringify(request)}`);      

    console.log(`request ${JSON.stringify(request)}`);      
    
    return ShareRequest.find(request).populate('fromUserId').populate('toUserId').populate('documentId').exec((err,requests) => {
        if(err){
            console.log(`There was a mistake retriving a request. ${err}`);
            return res.status(500).send("There was a problem finding request.");    
        }
        console.log(`Successfully requests ${JSON.stringify(requests)}`);
            return res.status(200).send(requests);
    });
    */




export default router;
