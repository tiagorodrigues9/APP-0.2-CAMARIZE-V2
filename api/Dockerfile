FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 4000

