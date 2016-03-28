# API Boilerplate [![Build Status](https://travis-ci.org/jhen0409/api-boilerplate.svg)](https://travis-ci.org/jhen0409/api-boilerplate) [![Test coverage](https://coveralls.io/repos/jhen0409/api-boilerplate/badge.svg?branch=master&service=github)](https://coveralls.io/r/jhen0409/api-boilerplate?branch=master) [![Dependency Status](https://david-dm.org/jhen0409/api-boilerplate.svg)](https://david-dm.org/jhen0409/api-boilerplate) [![devDependency Status](https://david-dm.org/jhen0409/api-boilerplate/dev-status.svg)](https://david-dm.org/jhen0409/api-boilerplate#info=devDependencies)

> A RESTful API boilerplate with Koa for personal usage

## Prerequisite

* Node.js ^5.x
* MongoDB ^3.x
* Redis ^3.x

## Installation

```bash
$ npm install
```

## Usage

#### Development

```bash
$ npm run dev
```

#### Production

```bash
$ npm run build
$ npm start
```

## Docker

#### Development on local

__*[OS X]*__ If you're using Docker ToolBox (or Boot2Docker) in development mode, you should use [docker-osx-dev](https://github.com/brikis98/docker-osx-dev):

```bash
$ docker-osx-dev -e node_modules -e .git -e build
```

Waiting [Docker for OS X/Windows beta](https://beta.docker.com/) release, we will not need `docker-osx-dev` in the future.

```bash
$ docker-compose -f docker-compose.dev.yml up
```

#### Production

```bash
$ npm run build
$ docker-compose up
```

## Test

First start MongoDB, and run:

```bash
$ npm test
# watch
$ npm test -- --watch
# get code coverage report
$ npm run test-cov
```

#### Lint

```bash
$ npm run lint
```

## License

[MIT](LICENSE.md)
