FROM dockerfile/nodejs
EXPOSE 8080
CMD npm run dev
RUN npm install -g nodemon

# There goes the cache...
ADD ./SPACESHIPS /space
WORKDIR /space
RUN npm install