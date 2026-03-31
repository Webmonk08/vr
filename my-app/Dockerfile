FROM node:24-alpine

WORKDIR /front-end
COPY package*.json ./
RUN npm install 

COPY . /front-end/
RUN npm run build

EXPOSE 3000
CMD [ "npm","start"]