# Build DiogenesWeb Docker
FROM node:12
WORKDIR /app
# Install deps
# Copy both package.json AND package-lock.json
COPY package*.json .
RUN npm install
# Bundle app source
COPY . .

EXPOSE 8989
CMD [ "node", "app.js" ]
