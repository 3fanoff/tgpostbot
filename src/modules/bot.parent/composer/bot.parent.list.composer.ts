import { AbstractBotComposer } from './abstract.bot.composer';
import { Composer, Markup, MiddlewareFn } from 'telegraf';
import { BotContext, BotMessageContext } from '@interface/bot';
import { BotParentService } from '../bot.parent.service';
import { BotActionManager } from '@lib/bot.action.manager';

import { Injectable } from '@nestjs/common';
import { availableCommands } from '../lib/bot.parent.const';

@Injectable()
export class BotParentListComposer extends AbstractBotComposer {
    constructor(
        private botParentService: BotParentService,
        private listManager: BotActionManager,
    ) {
        super();
    }

    predicate = () => {
        return true;
    };

    public middleware(): MiddlewareFn<any> {
        return Composer.optional(
            () => this.predicate(),
            this.listManager.middleware(),
            Composer.command(availableCommands.LIST, (ctx: BotMessageContext) => this.onBotsListAction(ctx)),
            Composer.hears<BotContext>(
                (text: string, ctx) => {
                    return new RegExp(`^${text}$`).exec(ctx.i18n.t('bot.parent.button.list'));
                },
                (ctx: BotMessageContext) => this.onBotsListAction(ctx),
            ),
        );
    }

    async onBotsListAction(ctx: BotMessageContext) {
        const botList = await this.botParentService.getListOfOwnBotsByUserId(ctx.update.message.from.id);
        if (botList.length) {
            const keyboardBotList = Markup.inlineKeyboard(
                botList.map((bot) => {
                    this.listManager.bindHandler(ctx.from.id, `bot_${bot.id}`, (ctx: BotContext) => {
                        console.log('command for ' + bot.name, ctx.msgId);
                    });

                    return Markup.button.callback(`@${bot.name}`, `bot_${bot.id}`);
                }),
            );

            await ctx.reply('Список Ваших привязанных ботов', keyboardBotList);
        } else {
            await ctx.reply(`У Вас еще нет привязанных ботов! Выполните команду /newbot чтобы добавить`);
        }
    }
}
