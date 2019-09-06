FROM node:11

# Create app directory
#WORKDIR /app
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./

# Install app dependencies
COPY package*.json /usr/src/app/
RUN npm install


#RUN npm install

# Bundle app source
#COPY . ./
# Bundle app source
COPY . /usr/src/app

ENV MONGODB_URL mongodb://mongo:27017/door2door-api
EXPOSE 3000

CMD [ "npm", "start" ]