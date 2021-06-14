FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY . . 

RUN yarn build
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "dist/app.js" ]
