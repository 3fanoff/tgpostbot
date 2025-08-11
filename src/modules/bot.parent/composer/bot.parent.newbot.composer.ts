import { AbstractBotComposer } from './abstract.bot.composer';
import { Composer, MiddlewareFn } from 'telegraf';
import { actionTypes, availableActions, availableCommands as commands } from '../lib/bot.parent.const';
import { BotParentSessionService } from '../bot.parent.session.service';
import { BotContext } from '@interface/bot';
import { Injectable } from '@nestjs/common';
import { BotParentKeyboard } from '../lib/bot.parent.keyboard';

@Injectable()
export class BotParentNewbotComposer extends AbstractBotComposer {
    constructor(private botSessionService: BotParentSessionService) {
        super();
    }

    predicate = (ctx: BotContext) => {
        return this.botSessionService.isAllowAction(ctx, actionTypes.ADDING_BOT);
    };

    public middleware(): MiddlewareFn<any> {
        return Composer.compose([
            Composer.optional(
                (ctx: BotContext) => this.predicate(ctx),
                Composer.command(commands.NEWBOT, (ctx: BotContext) => this.onNewBot(ctx)),
                Composer.action('add_new_bot', (ctx: BotContext) => this.onNewBot(ctx)),
                Composer.hears(
                    (value: string, ctx: BotContext) => this.hearsTrigger(value, ctx),
                    (ctx: BotContext) => this.onNewBot(ctx),
                ),
            ),
            Composer.optional(
                (ctx: BotContext) => this.botSessionService.isAllowAction(ctx, actionTypes.UNDO_ADDING_BOT),
                Composer.action('undo_add_new_bot', (ctx: BotContext) => this.onUndoNewBot(ctx)),
            ),
        ]);
    }

    hearsTrigger(text: string, ctx: BotContext) {
        if (!this.botSessionService.isAllowAction(ctx, actionTypes.HEARS_ADDING_BOT)) return null;
        return new RegExp(`^${text}$`).exec(ctx.i18n.t('bot.parent.button.add'));
    }

    async onNewBot(ctx: BotContext) {
        this.botSessionService.setAllowActions(ctx, [availableActions.UNDO, availableActions.ALLOW_TOKEN]);

        const replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.send'), BotParentKeyboard.inlineUndoKeyboard(ctx.i18n, 'undo_add_new_bot'));
        this.botSessionService.addMessage(ctx, 'reply', true, replyMessage.message_id, replyMessage.text);
    }

    async onUndoNewBot(ctx: BotContext) {
        const messageIds = this.botSessionService
            .getMessages(ctx)
            ?.splice(1)
            .map((msg) => msg.id);

        if (messageIds) {
            await ctx.deleteMessages(messageIds);
        }
        this.botSessionService.resetAllowActions(ctx);
    }
}
