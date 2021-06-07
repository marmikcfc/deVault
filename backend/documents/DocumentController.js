import {Router} from 'express';
import {urlencoded, json} from 'body-parser';
import Document from './Document';
import DocumentType from './DocumentType';
import {config} from 'dotenv';
import History from './History';
import mongoose from 'mongoose'
import ShareRequest from '../requests/ShareRequest';
import User from '../user/User';
config();

const router = Router();
router.use(urlencoded({ extended: true }));
router.use(json());

// CREATES A NEW Document for a user
router.post('/create', function (req, res) {
    Document.create(req.body).then(docs => {

        console.log(`added ${JSON.stringify(docs)}`);

        //Create History record
        // Replace with QLDB Persistence
        History.create({
            documentId: docs._id.toString(),
            status:'created'
        }).then(history => {
            console.log(`Created History for user ${req.body.email}`);
        }).catch(err => {
            console.log(`Something Went Wrong ${err}`)
        });

        res.status(200).send(docs);
    }).catch(err => {
        console.log(`There was a problem adding the information to the database. ${err}`)
        return res.status(500).send("There was a problem adding the information to the database.");
    })
});


// Creates a new document type
router.post('/types/create', function (req, res) {
    return DocumentType.create(req.body).then(docType => {
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



//gets all documents for provided email
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


//gets all documents for provided id
router.get('/doc/:id', function (req, res) {
    console.log(`Returning for ${req.params.id}`)
    
    return Document.findById(req.params.id).populate('documentType').exec((err,docs)=> {
        
        if(err){
            console.log(`There was a problem finding doc types. ${err}`);
            return res.status(500).send("There was a problem finding doc types.");    
        }

        console.log(`returning all documents for ${req.params.id}. Documents are ${JSON.stringify(docs)}`)
        return res.status(200).send(docs);
    })
});



//gets document history
router.get('/history/:id', function(req,res) {
    History.find({documentId:req.params.id}).populate('documentId').
            populate({ path: 'shareRequestId', populate: { path: 'company' }})
            .exec(async (err,results) => {
                console.log(`returning all documents for ${req.params.id}. Documents are ${JSON.stringify(results)}`)
                if(err){
                    console.log(`ERROR ${err}`);
                }

                let user =  await User.findOne({email:results[0].documentId.email});
                console.log(`user ${JSON.stringify(user)} for email ${results[0].documentId.email}`);
                console.log(`results ${results} \n\n`)
                var response = [];
                var userActions = ['created','granted'];
                var systemActions = ['request_expired','document_expired'];
                var companyActions = ["requested","approved","rejected"];
        
                results.forEach( result => {
                    let r = {document:result.documentId};
                    console.log(`resulrt ${result} \n\n`)
                    var stat = result.status

                    console.log(`status ${stat} \n\n`)
                    switch(stat) {
                        case "created":
                            console.log("IN CREAED")
                            r.action = 'created';
                            r.by = user;
                            r.for = '';
                            break;

                        case 'granted':
                            r.action = 'granted';
                            r.by = user;
                            if(result.hasOwnProperty('shareRequestId')){
                                r.for = result.shareRequestId.company;
                            }
                            break;
                        
                        case "requested":
                            console.log("IN Company Actions")
                            r.action = stat;
                            r.for = user;
                            r.by = result.shareRequestId.company;
                            
                            break;

                        case "approved":
                            console.log("IN Company Actions")
                            r.action = stat;
                            r.for = user;
                            r.by = result.shareRequestId.company;
                            
                            break;

                        case "rejected":
                            console.log("IN Company Actions")
                            r.action = stat;
                            r.for = user;
                            r.by = result.shareRequestId.company;
                            break;
                            
                        default:
                            console.log("Default")
                            r.action = stat;
                            r.for = '';
                            r.by = '';
                    }
                    response.push(r);                    
                });

                return res.status(200).send(response);

            }); 

    /*

    return Document.findById(req.params.id).populate('user').populate('company').populate('documentId').exec((err,requests) => {

        if(err){
            console.log(`There was a mistake retriving a request. ${err}`);
            return res.status(500).send("There was a problem finding request.");    
        }
           
        
            return res.status(200).send(requests);
    });*/
});





export default router;
