import { Composer } from 'telegraf';
import { BotContext, BotMessageContext } from '@interface/bot';
import { actionTypes, availableCommands as commands, defaultMenuCommands } from '../lib/bot.parent.const';
import { Message } from '@telegraf/types';
import { BotParentSessionService } from '../bot.parent.session.service';
import { AbstractBotComposer } from './abstract.bot.composer';
import { Injectable } from '@nestjs/common';
import { BotParentKeyboard } from '../lib/bot.parent.keyboard';
import { BotParentContextService } from '../bot.parent.context.service';

@Injectable()
export class BotParentStartComposer extends AbstractBotComposer {
    constructor(
        private botSessionService: BotParentSessionService,
        private botContextService: BotParentContextService,
    ) {
        super();
    }

    public middleware() {
        return Composer.compose([
            Composer.command(commands.START, (ctx: BotMessageContext) => this.onStartAction(ctx)),
            Composer.command(commands.HELP, (ctx: BotContext) => this.onHelpDialog(ctx)),
            Composer.action('help', (ctx: BotContext) => this.onHelpDialog(ctx)),
            Composer.hears<BotContext>(
                (text, ctx) => {
                    return new RegExp(`^${text}$`).exec(ctx.i18n.t('bot.parent.button.help'));
                },
                (ctx: BotContext) => this.onHelpDialog(ctx),
            ),
        ]);
    }

    predicate = () => {
        return false;
    };

    public async onStartAction(ctx: BotMessageContext) {
        const { username } = ctx.msg.from;

        await this.botContextService.setMenuCommandList<BotMessageContext, commands>(ctx, defaultMenuCommands);

        const isUserHasABot = this.botSessionService.isUserHasABot(ctx);
        const isShowHelpButton = this.botSessionService.isAllowAction(ctx, actionTypes.SHOW_HELP);
        let replyMessage: Message.TextMessage;
        if (isUserHasABot) {
            const keyboard = BotParentKeyboard.staticKeyboard(ctx.i18n, { showHelp: isShowHelpButton, showLang: false });
            replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.start.old', { args: { username } }), keyboard.resize());
        } else {
            const inlineKeyboard = BotParentKeyboard.inlineKeyboard(ctx.i18n, { showHelp: isShowHelpButton });
            replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.start.new'), inlineKeyboard);
        }

        this.botSessionService.addMessage(ctx, 'start_reply', true, replyMessage.message_id, replyMessage.text);
    }

    async onHelpDialog(ctx: BotContext) {
        this.botSessionService.resetAllowActions(ctx);
        const replyMessage = await ctx.replyWithHTML(ctx.i18n.t('bot.parent.help.text'));

        this.botSessionService.addMessage(ctx, 'help', true, replyMessage.message_id, replyMessage.text);
    }
}
