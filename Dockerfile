
FROM node:11
WORKDIR /app
COPY package.json package-lock.json ./
COPY ./bin ./bin 
RUN npm ci
COPY . ./
RUN npm run build
CMD npm start