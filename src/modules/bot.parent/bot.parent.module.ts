import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotParentUpdate } from './bot.parent.update';
import { HttpModule } from '@nestjs/axios';
import { I18nService } from 'nestjs-i18n';
import { TelegrafMiddleware } from '@middleware/telegraf.middleware';
import { i18nTelegrafMiddleware } from '@middleware/i18n.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotParentService } from './bot.parent.service';
import { session } from 'telegraf';
import { BotParentSessionService } from './bot.parent.session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotUserEntity } from '@model/bot.user.entity';
import { BotEntity } from '@model/bot.entity';
import { ChannelEntity } from '@model/channel.entity';
import { BotGetMeConverter } from '@converter/bot.get.me.converter';
import { BotActionManager } from '@lib/bot.action.manager';
import { BotParentContextService } from './bot.parent.context.service';
import { CredentialEntity } from '@model/credential.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([BotUserEntity, BotEntity, ChannelEntity, CredentialEntity]),
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
        HttpModule,
    ],
    controllers: [],
    providers: [
        BotParentUpdate,
        BotParentService,
        BotParentSessionService,
        BotParentContextService,
        BotGetMeConverter,
        ...BotGetMeConverter.providers,
        BotActionManager,
        ...BotParentUpdate.composers,
    ],
})
export class BotParentModule {}
