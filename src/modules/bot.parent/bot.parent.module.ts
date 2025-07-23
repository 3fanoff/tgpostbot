import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotParentController } from './bot.parent.controller';
import { AxiosModule } from 'nestjs-axios-promise';
import { I18nService } from 'nestjs-i18n';
import { TelegrafMiddleware } from '@middleware/telegraf.middleware';
import { i18nTelegrafMiddleware } from '@middleware/i18n.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotParentService } from './bot.parent.service';
import { session } from 'telegraf';
import { BotParentSessionService } from './bot.parent.session.service';

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            botName: 'PARENT_POST_BOT',
            imports: [ConfigModule],
            inject: [I18nService, ConfigService],
            useFactory: (i18nService: I18nService, configService: ConfigService) => {
                return {
                    token: configService.get('PARENT_BOT_TOKEN') as string,
                    middlewares: [
                        session({
                            defaultSession: () => ({ ctx_action: 0, bot: null }),
                        }),
                        new TelegrafMiddleware().use.bind(this),
                        i18nTelegrafMiddleware(i18nService),
                    ],
                };
            },
        }),
        AxiosModule.register({}),
    ],
    controllers: [BotParentController],
    providers: [BotParentService, BotParentSessionService],
})
export class BotParentModule {}
