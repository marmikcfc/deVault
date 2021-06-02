import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import Document from './Document';
import DocumentType from './DocumentType';
import ShareRequest from './ShareRequest';
import {config} from 'dotenv';

import mongoose from 'mongoose'
config();

const router = Router();
router.use(urlencoded({ extended: true }));
router.use(json());

// CREATES A NEW Document for a user
router.post('/create', function (req, res) {
    let original = req.body.original;
    let thumb = req.body.thumb;
    let preview = req.body.preview;
    Document.insertMany([original,thumb,preview]).then(docs => {

        console.log(`added ${JSON.stringify(docs)}`);
        res.status(200).send(docs);
    }).catch(err => {
        console.log(`There was a problem adding the information to the database. ${err}`)
        return res.status(500).send("There was a problem adding the information to the database.");
    })
});


// Creates a new document type
router.post('/types/create', function (req, res) {
    return DocumentType.create({
        category:req.body.category,
        name: req.body.name
    }).then(docType => {
        console.log(`added ${JSON.stringify(docType)}`);
        return res.status(200).send(docType);
    }).catch(err => {
        console.log(`There was a problem adding the information to the database. ${err}`)
        return res.status(500).send("There was a problem adding the information to the database.");
    })

});


//gets all document types
router.get('/types', function (req, res) {
    return DocumentType.find().then(docTypes => {
        return res.status(200).send(docTypes);
    }).catch(err => {
        console.log(`There was a problem finding doc types. ${err}`);
        return res.status(500).send("There was a problem finding doc types.");
    }) 
});



//gets all documents
router.get('/:email', function (req, res) {
    return Document.find({email:req.params.email}).populate('documentType').exec((err,docs)=> {
        
        if(err){
            console.log(`There was a problem finding doc types. ${err}`);
            return res.status(500).send("There was a problem finding doc types.");    
        }

        console.log(`returning all documents for ${req.params.email}. Documents are ${JSON.stringify(docs)}`)
        return res.status(200).send(docs);
    })
});


/*
    1) Add Request
    2) Update Status
    3) Get All shareRequests
*/
router.post('/share', function(req,res){   
    
    console.log(`Addding ${JSON.stringify(req.body)}`)
    return ShareRequest.create(req.body).then(request => {
        console.log(`added ${JSON.stringify(request)}`);
        return res.status(200).send(request);
    }).catch(err => {
        console.log(`There was an error adding a request. ${JSON.stringify(request)} \n ${err}`);
        return res.status(500).send("There was a problem finding request types.");
    });
});


router.put('/share/:id', function(req,res) {
    return ShareRequest.findOneAndUpdate(req.params.id,req.body, {upsert:false}).then(request => {
            console.log(`Successfully update ${JSON.stringify(request)}`);
            res.status(200).send(request);
    }).catch(err => {

        console.log(`There was a mistake adding a request. ${err}`);
        return res.status(500).send("There was a problem finding request types.");    
    })

});



router.get('/', function(req,res) {
    let request = {}
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

    return ShareRequest.find(request).populate(toPopulate).populate('documentId').exec((err,requests) => {

        if(err){
            console.log(`There was a mistake retriving a request. ${err}`);
            return res.status(500).send("There was a problem finding request.");    
       
        }

        console.log(`Successfully requests ${JSON.stringify(requests)}`);
            return res.status(200).send(requests);
    });
});




export default router;
