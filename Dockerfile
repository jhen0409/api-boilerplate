FROM node:5

ENV DOCKER 1
ADD . /src
WORKDIR /src

RUN apt-get update && \
    apt-get install -y rsync python && \
    npm install --production && \
    rm -rf node_modules/*/{example,examples,test,tests,*.md,*.markdown,LICENSE*,CHANGELOG*,.travis.yml,.github,.idea,.npmignore}

CMD ["npm", "start", "--", "--no-daemon"]
