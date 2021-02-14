# VERSION 0.1
# DOCKER-VERSION  1.7.0
# AUTHOR:         Antonio Lain <antlai@cafjs.com>
# DESCRIPTION:    Cloud Assistants application hellohue
# TO_BUILD:        cafjs mkImage . gcr.io/cafjs-k8/<user>-hellohue
# TO_RUN:         cafjs run --appImage gcr.io/cafjs-k8/<user>-hellohue hellohue

FROM node:12

EXPOSE 3000

RUN mkdir -p /usr/src

ENV PATH="/usr/src/node_modules/.bin:${PATH}"

RUN apt-get update && apt-get install -y rsync

ENV PATH="/usr/local/bin:${PATH}"

RUN yarn config set prefix /usr/local

RUN yarn global add caf_build browserify@17.0.0 uglify-es@3.3.9  && yarn cache clean

# fill the local cache
RUN yarn global add react-dom@16.14.0 react@16.14.0 react-bootstrap@0.32.4 redux@3.7.2 && yarn global remove react-dom react react-bootstrap redux

# fill the local cache
RUN yarn global add aframe@1.2.0 && yarn global remove aframe

# fill the local cache
RUN yarn global add aframe-gui@0.3.8 aframe-colorwheel-component@1.2.1 react-color@2.19.3 && yarn global remove aframe-gui aframe-colorwheel-component react-color

COPY . /usr/src

RUN   cd /usr/src/app && yarn install --production --ignore-optional && cafjs build && yarn cache clean

WORKDIR /usr/src/app

ENTRYPOINT ["node"]

CMD [ "./index.js" ]
