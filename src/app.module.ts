import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ArticleModule } from '@/modules/article/article.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotParentModule } from '@/modules/bot.parent/bot.parent.module';
import databaseConfig from '@config/database.config';
import { I18nModule } from 'nestjs-i18n';
import { BotChildModule } from './modules/bot.child/bot.child.module';
import i18nConfig from '@config/i18n.config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [
                ConfigModule.forRoot({
                    load: [databaseConfig],
                }),
            ],
            useFactory: (configService: ConfigService) => {
                return configService.get('database') as TypeOrmModuleOptions;
            },
            inject: [ConfigService],
        }),
        I18nModule.forRoot(i18nConfig()),
        EventEmitterModule.forRoot(),
        ArticleModule,
        BotParentModule,
        BotChildModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
