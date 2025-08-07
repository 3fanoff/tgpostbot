import { Injectable } from '@nestjs/common';
import { BotContext } from '@interface/bot';

import { TranslateOptions } from 'nestjs-i18n';
import { I18nPath } from '@/gensrc/i18n.types';
import { InlineKeyboardMarkup, ParseMode } from 'telegraf/src/core/types/typegram';
import { Markup } from 'telegraf/src/markup';
import * as tt from 'telegraf/src/telegram-types';
import * as tg from 'telegraf/src/core/types/typegram';

@Injectable()
export class BotParentContextService {
    async setMenuCommandList<C extends BotContext, L>(ctx: C, commandList: Array<L>, lang?: string) {
        const i18nOptions: TranslateOptions = {};
        if (lang) {
            i18nOptions.lang = lang;
        }
        const requestCommandList = commandList.map<tg.BotCommand>((command) => {
            return { command: command, description: ctx.i18n.t(`bot.parent.command.${command as string}` as I18nPath, i18nOptions) } as tg.BotCommand;
        });

        return await ctx.telegram.setMyCommands(requestCommandList);
    }

    async updateCurrentMenuCommandList<C extends BotContext>(ctx: C) {
        const commandsList = await ctx.telegram.getMyCommands();

        return this.setMenuCommandList<C, string>(
            ctx,
            commandsList.map((item) => item.command),
        );
    }

    async editMessage<C extends BotContext>(ctx: C, text: string, keyboard?: Markup<InlineKeyboardMarkup>, parseMode?: ParseMode) {
        return this.editMessageById(ctx, ctx.msgId, text, keyboard, parseMode);
    }

    async editMessageById<C extends BotContext>(
        ctx: C,
        messageId: number | undefined,
        text: string,
        keyboard?: Markup<InlineKeyboardMarkup>,
        parseMode?: ParseMode,
    ) {
        const extra: tt.ExtraEditMessageText = {};
        if (keyboard) extra.reply_markup = keyboard.reply_markup;
        if (parseMode) extra.parse_mode = parseMode;

        return await ctx.telegram.editMessageText(ctx.chat?.id, messageId, void 0, text, extra);
    }
}
