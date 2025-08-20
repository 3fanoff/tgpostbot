import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

const logger = new ConsoleLogger({
    prefix: 'TG_POSTBOT',
    logLevels: ['error', 'fatal', 'warn', 'verbose'],
});

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger,
    });
    logger.verbose(process.env.NODE_ENV, process.env.TZ);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
    .then(() => {
        const currentDateTime = new Date().toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        logger.verbose('Running up successfully [ ' + currentDateTime + ' ]');
    })
    .catch((e) => logger.error(e));
