# devault-app

### 1. Create User Account

Sign up: Use CURL directly or import in POSTMAN

```
curl --location --request POST 'http://localhost:3000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "sam",
    "password": "sam"
}'
```

### 2. Get Token By Logging In the App

Copy the token in the response

```
curl --location --request POST 'http://localhost:3000/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
	"email": "sam",
	"password": "sam"
}'
```

### 3. Make any request now. Just Add `x-access-token` in the request. Look at the app.js for base controller url and the controller file for the exact endpoint.
