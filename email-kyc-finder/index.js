//const Company = require('./model');
const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
const base64 = require('base-64');
const MailParser = require('mailparser').MailParser;
const cheerio = require('cheerio');
const { request } = require('express');
var express = require('express');
const mongoose = require('mongoose')
var app = express();
const model = require('./model'); 
//const Company = require('./model');

var oAuth2Client

const bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

mongoose.connect('mongodb+srv://marmik:M40HPVcpGbD6Hcok@cluster0.vjw23.mongodb.net/deVault-KYC?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true,})
.then(() => {
    console.log('connected to db')
}).catch((error) => {
    console.log(error)
})

const companies = mongoose.model('companies', mongoose.Schema(model.companySchema))

kyc = {}

app.get('/validate_google_login', async (req, res) => {
   code = req.query.code
   oAuth2Client.getToken(code, async (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        email = await getUserEmail(oAuth2Client)
        kyc[email] = {}
        listMessages(oAuth2Client, email);
    });
    await sleep(5000)
    message = kyc[email]
    kyc[email] = {}
    res.status(200).send(message)
})

app.post('/add_new_company',  (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const body = req.body.body;
    const news = req.body.news;
    // let newCompany = new companies({
    //     name,
    //     email,
    //     body,
    //     news
    // })
    companies.create(req.body).then((result) => {
        res.status(200).send(result)
        }).catch((err) => {
        console.log(error)
        res.status(400).send(err)
    })
})

app.get('/getCompanies', (req, res) =>{
    companies.find((err, result) => {
        if(!err){
            res.send(result)
        }else{
            res.status(400).send(err)
        }
    })
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("App listening at http://%s:%s", host, port)
 })



// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), listMessages);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    // fs.readFile(TOKEN_PATH, (err, token) => {
    //     if (err) return getNewToken(oAuth2Client, callback);
    //     oAuth2Client.setCredentials(JSON.parse(token));
    //     callback(oAuth2Client);
    // });
    return getNewToken(oAuth2Client, callback);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    // });
    // rl.question('Enter the code from that page here: ', (code) => {
    //     rl.close();
    //     oAuth2Client.getToken(code, (err, token) => {
    //         if (err) return console.error('Error retrieving access token', err);
    //         oAuth2Client.setCredentials(token);
    //         // Store the token to disk for later program executions
    //         fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    //             if (err) return console.error(err);
    //             console.log('Token stored to', TOKEN_PATH);
    //         });
    //         callback(oAuth2Client);
    //     });
    // });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({
        version: 'v1',
        auth
    });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name} : ${label.id}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}

async function getUserEmail(auth) {
    const gmail = google.gmail({
        version: 'v1',
        auth
    });
    const response = await gmail.users.getProfile({
        userId: 'me',
      });
    return response.data.emailAddress
}

async function listMessages(auth, email) {
    companies = getCompanyList()
    companies.forEach((company) => {
        let query = company.email;
        return new Promise((resolve, reject) => {
            const gmail = google.gmail({
                version: 'v1',
                auth
            });
            gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: 10
            }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!res.data.messages) {
                    resolve([]);
                    return;
                }
                // console.log(res.data)
                for (let index = 0; index < res.data.messages.length; index++) {
                    getMail(res.data.messages[index].id, auth, company.check, company.name, email);
                }
                resolve(res.data);
            });
        })
    });
}

function getCompanyList() {
    let companies = [
            {email : 'do-not-reply@directmail2.binance.com', check : 'Deposit Confirmed', name : 'Binance'},
            {email : 'no-reply-contract-notes@qmailer.zerodha.net', check : 'combined equity contract note', name : 'Zerodha'},
            {email : 'CitiAlert.India@citicorp.com', check : 'balance in your Citibank account', name : 'Citibank'},
        ]
    return companies
}


function getMail(msgId, auth, checker, company, email) {
    // console.log(msgId)
    const gmail = google.gmail({
        version: 'v1',
        auth
    });
    // console.log(res.data.emailAddress)
    //This api call will fetch the mailbody.
    return gmail.users.messages.get({
        userId: 'me',
        id: msgId,
    }, (err, res) => {
        // console.log(res.data.labelIds.INBOX)
        if (!err) {
            // console.log("no error")
            if(res.data.snippet.includes(checker)){
                console.log("KYC exists for : ", company)
                kyc[email][company] = true;
            }
            return
            var body = res.data.payload.parts[0].body.data;

            var htmlBody = base64.decode(body.replace(/-/g, '+').replace(/_/g, '/'));
            console.log(htmlBody)
            var mailparser = new MailParser();

            mailparser.on("end", (err, res) => {
                console.log("res", res);
            })

            mailparser.on('data', (dat) => {
                if (dat.type === 'text') {
                    const $ = cheerio.load(dat.textAsHtml);
                    var links = [];
                    var modLinks = [];
                    $('a').each(function (i) {
                        links[i] = $(this).attr('href');
                    });

                    //Regular Expression to filter out an array of urls.
                    var pat = /------[0-9]-[0-9][0-9]/;

                    //A new array modLinks is created which stores the urls.
                    modLinks = links.filter(li => {
                        if (li.match(pat) !== null) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    console.log(modLinks);

                    //This function is called to open all links in the array.

                }
            })

            mailparser.write(htmlBody);
            mailparser.end();

        }
    });
}