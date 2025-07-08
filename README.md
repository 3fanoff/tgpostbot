<p style="text-align: center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

Telegram bot backend application based on Nest.js

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

Run app from Docker with compose
1. You must have docker installed
2. Create .env file in project root with the following variables:
    `DB_NAME, DB_USER, DB_HOST ('db' on default), DB_PASSWORD, DB_PORT` and `COMPOSE_PROJECT_NAME` optionally
3. Run next command in project root:

```bash
$ docker compose up 
```

With docker, you can deploy application with database in just a few clicks.

## Resources

## Support

## Stay in touch

- Author - [Michael Trifanov](https://github.com/3fanoff)

## License

