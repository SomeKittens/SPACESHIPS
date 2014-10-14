FROM dockerfile/nodejs
ADD ./SPACESHIPS /space
WORKDIR /space
RUN npm install
RUN npm install -g nodemon
EXPOSE 8080
CMD npm run dev