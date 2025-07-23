import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({
            prefix: 'TG_POSTBOT',
            logLevels: ['error', 'fatal', 'warn', 'verbose'],
        }),
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
    .then(() => {
        console.log('running up successfully');
    })
    .catch((e) => console.log(e));
