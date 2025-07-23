FROM node:19-alpine
LABEL authors="Michael Trifanov"
#WORKDIR /usr/src/app-build
#COPY package*.json .
#RUN npm install && npm install -g @nestjs/cli

WORKDIR /usr/src/app
COPY package*.json .
RUN npm install && npm install -g @nestjs/cli
COPY . .
EXPOSE 3000
#RUN chmod +x /usr/src/app/entrypoint.sh
#ENTRYPOINT ["sh", "/usr/src/app/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
