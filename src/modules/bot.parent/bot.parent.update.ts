import { Logger, OnModuleInit, Provider } from '@nestjs/common';
import { InjectBot, Update } from 'nestjs-telegraf';
import { Telegraf, TelegramError } from 'telegraf';
import { Message } from '@telegraf/types';
import { BotParentSessionService } from './bot.parent.session.service';
import { BotContext, BotMemberContext, BotMessageContext } from '@interface/bot';
import { NextFunction } from 'express';
import { BotParentStartComposer } from './composer/bot.parent.start.composer';
import { BotParentNewbotComposer } from './composer/bot.parent.newbot.composer';
import { BotParentLangComposer } from './composer/bot.parent.lang.composer';
import { BotParentListComposer } from './composer/bot.parent.list.composer';
import { BotParentAddbotComposer } from './composer/bot.parent.addbot.composer';

@Update()
export class BotParentUpdate implements OnModuleInit {
    private readonly logger: Logger = new Logger(BotParentUpdate.name);

    static readonly composers: Provider[] = [
        BotParentStartComposer,
        BotParentNewbotComposer,
        BotParentListComposer,
        BotParentLangComposer,
        BotParentAddbotComposer,
    ];

    constructor(
        @InjectBot('PARENT_POST_BOT')
        private readonly bot: Telegraf,
        private botSessionService: BotParentSessionService,
        private startComposer: BotParentStartComposer,
        private newBotComposer: BotParentNewbotComposer,
        private langComposer: BotParentLangComposer,
        private listComposer: BotParentListComposer,
        private addBotComposer: BotParentAddbotComposer,
    ) {}

    onModuleInit(): any {
        this.bot.catch(async (err, ctx: BotContext) => this.globalCatch(err, ctx));
        this.bot.use(async (ctx: BotMemberContext, next: NextFunction) => this.sessionMiddleware(ctx, next));

        this.bot
            .use(this.startComposer.middleware())
            .use(this.newBotComposer.middleware())
            .use(this.addBotComposer.middleware())
            .use(this.langComposer.middleware())
            .use(this.listComposer.middleware());
    }

    async globalCatch(err, ctx: BotContext) {
        this.logger.error(`Ошибка для update ${ctx.update.update_id}:`, err);
        let replyMessage: Message.TextMessage | null = null;
        if (err instanceof TelegramError) {
            switch (err.code) {
                case 400:
                    this.logger.log('Некорректный запрос:', err.description);
                    replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.error.400'));
                    break;
                case 403:
                    this.logger.log('Бот заблокирован пользователем');
                    break;
                case 429:
                    this.logger.log('Лимит запросов превышен:', err.parameters);
                    replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.error.429'));
                    break;
                default:
                    this.logger.log('Неизвестная ошибка Telegram:', err);
                    replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.error.default'));
            }
            if (replyMessage) {
                this.botSessionService.addMessage(ctx, 'error', true, replyMessage.message_id, replyMessage.text);
            }
        } else {
            this.logger.error('Неизвестная ошибка:', err);
        }
    }

    async sessionMiddleware(ctx: BotMessageContext, next: NextFunction): Promise<void>;
    async sessionMiddleware(ctx: BotMemberContext, next: NextFunction): Promise<void>;
    async sessionMiddleware(ctx: BotMessageContext | BotMemberContext, next: NextFunction): Promise<void> {
        if (ctx.myChatMember?.new_chat_member.status === 'kicked') {
            if (this.botSessionService.hasBotSession(ctx)) {
                this.botSessionService.resetAllowActions(ctx);
            }

            return next();
        }

        if (!this.botSessionService.hasBotSession(ctx)) {
            await this.botSessionService.initSession(ctx);
        }

        if (ctx.message) {
            if (ctx.message.text === '/start') {
                this.botSessionService.clearMessages(ctx);
            } else {
                this.botSessionService.addMessage(ctx, 'message', false, ctx.message.message_id, ctx.message.text);
            }
        }
        this.logger.debug(this.botSessionService.getMessages(ctx));

        return next();
    }
}
