FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json .
RUN npm install vorpal superagent vorpal-less vorpal-grep vorpal-tour

# Bundle app source
#COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
