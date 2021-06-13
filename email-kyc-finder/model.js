const companySchema = {
    name: {
     type: String,
     required: true
    },
    email: {
     type: String,
     required: true
    },
    body: {
     type: String,
     required: true
    },
    news: {
     type: String,
     required: true
    }
}

module.exports = companySchema;