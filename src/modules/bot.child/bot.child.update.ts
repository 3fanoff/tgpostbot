import { BotChildService } from './bot.child.service';
import { Update } from 'nestjs-telegraf';
import { OnEvent } from '@nestjs/event-emitter';
import { BotDto } from '@dto/bot.dto';
import { BotBaseSession, BotContext } from '@interface/bot';
import { i18nTelegrafMiddleware } from '@middleware/i18n.middleware';
import { I18nService } from 'nestjs-i18n';
import { session, Telegraf } from 'telegraf';
import { OnModuleInit } from '@nestjs/common';
import { BotChildKeyboard } from './lib/bot.child.keyboard';
import { callbackData } from './lib/bot.child.const';
import { BotChildChannelService } from './bot.child.channel.service';

@Update()
export class BotChildUpdate implements OnModuleInit {
    constructor(
        private readonly botChildService: BotChildService,
        private readonly botChannelService: BotChildChannelService,
        private readonly i18nService: I18nService,
    ) {}

    async onModuleInit() {
        const bots = await this.botChildService.launchActiveBotsFromDB();
        bots.forEach((bot) => {
            if (bot.status === 'fulfilled' && bot.value) {
                this.attachComposers(bot.value);
            }
        });
    }

    @OnEvent('bot.add.success')
    async onBotAddToDatabase(botDto: BotDto) {
        await this.botChildService.createBotById(botDto.id);
        const childBot = await this.botChildService.launchBot(botDto.id);

        if (childBot) {
            this.attachComposers(childBot);
        }
    }

    attachComposers(bot: Telegraf<BotContext<BotBaseSession>>) {
        bot.use(
            session({
                defaultSession: () => ({ language: null }),
            }),
        );
        bot.use(i18nTelegrafMiddleware(this.i18nService));
        bot.start(async (ctx: BotContext<BotBaseSession>) => {
            await ctx.reply(ctx.i18n.t('bot.child.start'), BotChildKeyboard.startKeyboard(ctx.i18n));
        });
        bot.action(callbackData.NEW_POST, async (ctx: BotContext<BotBaseSession>) => {
            const channels = await this.botChildService.findChannelsByBotId(ctx.botInfo.id);
            await ctx.reply(channels.length ? 'Список каналов' : 'Добавьте канал');
        });

        bot.action(callbackData.EDIT_POST, (ctx: BotContext<BotBaseSession>) => {
            console.log(ctx.botInfo.id);
        });

        bot.action(callbackData.ADD_CHANNEL, async (ctx: BotContext<BotBaseSession>) => {
            const chatDto = await this.botChannelService.getChatInfo(ctx, '@citymaps');
            console.log('chatInfo', chatDto);
            await ctx.reply(chatDto.title);
            await ctx.reply(chatDto.memberCount.toString());
        });
    }
}
