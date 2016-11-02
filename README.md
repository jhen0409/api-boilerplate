# API Boilerplate [![Build Status](https://travis-ci.org/jhen0409/api-boilerplate.svg)](https://travis-ci.org/jhen0409/api-boilerplate) [![Test coverage](https://coveralls.io/repos/jhen0409/api-boilerplate/badge.svg?branch=master&service=github)](https://coveralls.io/r/jhen0409/api-boilerplate?branch=master) [![Dependency Status](https://david-dm.org/jhen0409/api-boilerplate.svg)](https://david-dm.org/jhen0409/api-boilerplate) [![devDependency Status](https://david-dm.org/jhen0409/api-boilerplate/dev-status.svg)](https://david-dm.org/jhen0409/api-boilerplate#info=devDependencies)

> A RESTful API boilerplate with Koa for personal usage

## Prerequisite

* Node.js ^6.x
* MongoDB ^3.x
* Redis ^3.x

## Installation

```bash
$ yarn install
```

## Usage

#### Development

```bash
$ yarn run dev
```

#### Production

```bash
$ yarn run build
$ yarn start
```

## Docker

#### Development on local

Use [Docker](https://www.docker.com/products/docker) for development.

```bash
$ docker-compose -f docker-compose.dev.yml up
```

#### Production

```bash
$ yarn run build
$ docker-compose up
```

## Test

First start MongoDB, and run:

```bash
# Lint
$ yarn run lint
# Test
$ yarn test
# Watch test
$ yarn test -- --watch
# Get code coverage report
$ yarn run test-cov
```

## License

[MIT](LICENSE.md)
