import { Controller, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf, TelegrafI18nService, TelegramError } from 'telegraf';
import { message } from 'telegraf/filters';

import { I18nPath } from '@/gensrc/i18n.types';
import { Message } from '@telegraf/types';
import { BotParentService } from './bot.parent.service';
import { InvalidArgumentException } from '@decorator/bot.decorator';
import { BotParentSessionService } from './bot.parent.session.service';
import { BotParent } from '@interface/bot';
import { actionTypes, availableActions } from './lib/bot.parent.const';
import { NextFunction } from 'express';

@Controller()
export class BotParentController implements OnModuleInit {
    private readonly logger: Logger = new Logger(BotParentController.name);

    constructor(
        @InjectBot('PARENT_POST_BOT')
        private readonly bot: Telegraf,
        private botParentService: BotParentService,
        private botSessionService: BotParentSessionService,
    ) {}

    static staticKeyboard(i18n: TelegrafI18nService<I18nPath>, showList?: boolean, showHelp?: boolean) {
        return Markup.keyboard(
            [
                Markup.button.text(i18n.t('bot.parent.button.add')),
                Markup.button.text(i18n.t('bot.parent.button.list'), showList ?? true),
                Markup.button.text(i18n.t('bot.parent.button.help'), !showHelp),
            ],
            {
                columns: 2,
            },
        );
    }

    static inlineKeyboard(i18n: TelegrafI18nService<I18nPath>, showList?: boolean, showHelp?: boolean) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(i18n.t('bot.parent.button.add'), 'add_new_bot'),
                Markup.button.callback(i18n.t('bot.parent.button.list'), 'bot_list', showList ?? true),
                Markup.button.callback(i18n.t('bot.parent.button.help'), 'help', !showHelp),
            ],
            {
                columns: 2,
            },
        );
    }

    static inlineUndoKeyboard(i18n: TelegrafI18nService<I18nPath>) {
        return Markup.inlineKeyboard([Markup.button.callback(i18n.t('bot.parent.button.undo'), 'undo')]);
    }

    onModuleInit(): any {
        this.bot.catch((err, ctx: BotParent.BotContext) => this.globalCatch(err, ctx));
        this.bot.use((ctx: BotParent.BotContext, next: NextFunction) => this.sessionMiddleware(ctx, next));
        this.bot.start((ctx: BotParent.BotContext) => this.onStartAction(ctx));

        this.bot.command('newbot', (ctx: BotParent.BotContext) => this.onNewBot(ctx));
        this.bot.action('add_new_bot', (ctx: BotParent.BotContext) => this.onNewBot(ctx));
        this.bot.action('help', (ctx: BotParent.BotContext) => this.onHelpDialog(ctx));
        this.bot.action('undo', (ctx: BotParent.BotContext) => this.onUndoAction(ctx));

        this.bot.hears(
            (text, ctx: BotParent.BotContext) => {
                if (!this.botSessionService.isAllowAction(ctx, actionTypes.HEARS_ADD_NEW_BOT)) return null;
                const ADD_TEXT = ctx.i18n.t('bot.parent.button.add');
                return ADD_TEXT === text ? ([text] as RegExpExecArray) : null;
            },
            (ctx: BotParent.BotContext) => this.onNewBot(ctx),
        );


        this.bot.on(message('text'), (ctx: BotParent.BotContext) => this.addNewBot(ctx));
    }

    async globalCatch(err, ctx: BotParent.BotContext) {
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
                this.botSessionService.addMessage(ctx, 'error', true, replyMessage.message_id);
            }
        } else {
            this.logger.error('Неизвестная ошибка:', err);
        }
    }

    async sessionMiddleware(ctx: BotParent.BotContext, next: NextFunction) {
        if (ctx.session.bot === null) {
            await this.botSessionService.initSession(ctx);
        }
        this.logger.debug(this.botSessionService.getMessages(ctx));

        if (ctx.update.message) {
            if (ctx.update.message.text === '/start') {
                this.botSessionService.clearMessages(ctx);
            } else {
                this.botSessionService.addMessage(ctx, 'message', false, ctx.update.message.message_id);
            }
        }
        next();
    }

    async onStartAction(ctx: BotParent.BotContext) {
        const { username } = ctx.update.message.from;

        await ctx.setChatMenuButton({ type: "default" });

        const isUserHasABot = this.botSessionService.isUserHasABot(ctx);
        const isShowHelpButton = this.botSessionService.isAllowAction(ctx, actionTypes.SHOW_HELP);
        let replyMessage: Message.TextMessage;
        if (isUserHasABot) {
            const keyboard = BotParentController.staticKeyboard(ctx.i18n, true, isShowHelpButton);
            replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.start.old', { args: { username } }), keyboard.resize());
        } else {
            const inlineKeyboard = BotParentController.inlineKeyboard(ctx.i18n, true, isShowHelpButton);
            replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.start.new'), inlineKeyboard);
        }

        this.botSessionService.addMessage(ctx, 'start_reply', true, replyMessage.message_id);
    }

    async onNewBot(ctx: BotParent.BotContext) {
        if (!this.botSessionService.isAllowAction(ctx, actionTypes.ADD_NEW_BOT)) return;
        this.botSessionService.setAllowActions(ctx, [availableActions.ALLOW_TOKEN, availableActions.UNDO]);

        const replyMessage = await ctx.reply('Отправьте токен своего бота следующим сообщением', BotParentController.inlineUndoKeyboard(ctx.i18n));
        this.botSessionService.addMessage(ctx, 'reply', true, replyMessage.message_id);
    }

    async addNewBot(ctx: BotParent.BotContext) {
        if (!this.botSessionService.isAllowAction(ctx, actionTypes.ALLOW_ACCEPT_TOKEN)) return;

        if (!ctx.message) return;
        if (ctx.message.from.is_bot) return;

        this.logger.debug('msg:', ctx.message);
        let replyMessage: Message.TextMessage;

        try {
            const data = await this.botParentService.getDataForBot(ctx.message.text);
            if (!data.ok) {
                const error = new UnauthorizedException(`invalid token ${ctx.message.text}`);
                this.logger.error(error.message);
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.exception'));
            } else if (data.result?.is_bot) {
                const { username } = data.result;
                this.botSessionService.setAllowActions(ctx, [availableActions.ADD_NEW_TOKEN]);
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.attach', { args: { username } }));
            } else {
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.is_user'));
            }
        } catch (e) {
            if (e instanceof InvalidArgumentException) {
                this.logger.error(e.what());
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.is_not_token'));
            } else {
                this.logger.error(e instanceof Error ? e.message : e);
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.exception'));
            }
        }
        this.botSessionService.addMessage(ctx, 'reply', true, replyMessage.message_id);
    }

    onHelpDialog(ctx: BotParent.BotContext) {
        console.log(ctx.session);
    }

    async onUndoAction(ctx: BotParent.BotContext) {
        if (this.botSessionService.isAllowAction(ctx, actionTypes.UNDO_NEW_BOT)) {
            const messageIds = this.botSessionService
                .getMessages(ctx)
                .splice(1)
                .map((msg) => msg.id);
            await ctx.deleteMessages(messageIds);
            this.botSessionService.resetAllowActions(ctx);
        }
    }
}
