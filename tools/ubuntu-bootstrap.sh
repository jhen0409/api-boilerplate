#!/bin/bash

NODE_VERSION=5.9.1

apt-get install -y git curl

# install nvm && nodejs
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
echo ". ~/.nvm/nvm.sh" >> .profile
source .profile
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION

# install lxc-docker
curl -sSL https://get.docker.com | sudo sh

# install docker-compose
curl -L https://github.com/docker/compose/releases/download/1.4.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# pre pull images
docker pull mongo
docker pull redis
docker pull node:$NODE_VERSION
