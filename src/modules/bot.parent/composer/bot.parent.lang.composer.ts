import { AbstractBotComposer } from './abstract.bot.composer';
import { Composer, Markup } from 'telegraf';
import { BotCallbackContext, BotContext, BotMessageContext } from '@interface/bot';
import { I18nPath } from '../../../gensrc/i18n.types';
import { BotParentSessionService } from '../bot.parent.session.service';
import { BotParentService } from '../bot.parent.service';
import { availableCommands, SYMBOLS_FOR_ESCAPE } from '../lib/bot.parent.const';
import { BotActionManager } from '@lib/bot.action.manager';
import { Injectable } from '@nestjs/common';
import { BotParentKeyboard } from '../lib/bot.parent.keyboard';
import { BotParentContextService } from '../bot.parent.context.service';

@Injectable()
export class BotParentLangComposer extends AbstractBotComposer {
    constructor(
        private botSessionService: BotParentSessionService,
        private botParentService: BotParentService,
        private botContextService: BotParentContextService,
        private langManager: BotActionManager,
    ) {
        super();
    }

    predicate = () => {
        return true;
    };

    public middleware() {
        return Composer.optional(
            () => this.predicate(),
            Composer.command(availableCommands.LANG, (ctx: BotMessageContext) => this.onChooseLangAction(ctx)),
            Composer.action('choose.lang', (ctx: BotCallbackContext) => this.onChooseLangAction(ctx)),
            this.langManager.middleware(),
        );
    }

    async onChooseLangAction(ctx: BotMessageContext): Promise<void>;
    async onChooseLangAction(ctx: BotCallbackContext): Promise<void>;
    async onChooseLangAction(ctx: BotMessageContext | BotCallbackContext): Promise<void> {
        this.botSessionService.resetAllowActions(ctx);
        const inlineKeyboard = Markup.inlineKeyboard(
            this.botParentService.getLanguages().map((lang) => {
                this.langManager.bindHandler(ctx.from.id, `choose.lang.${lang}`, (ctx: BotMessageContext) => this.onSelectLang(lang, ctx));

                const translateLang = `bot.parent.language.${lang}` as I18nPath;
                return Markup.button.callback(ctx.i18n.t(translateLang), `choose.lang.${lang}`);
            }),
        );
        await ctx.reply('Вы можете выбрать любой из доступных языков:', inlineKeyboard);
    }

    async onSelectLang(lang: string, ctx: BotMessageContext) {
        if (ctx.i18n.changeLanguage(lang)) {
            const appliedLang = `bot.parent.language.${lang}` as I18nPath;
            const appliedText = ctx.i18n.t('bot.parent.language.applied', { args: { lang: ctx.i18n.t(appliedLang) } });

            await this.botContextService.editMessage(ctx, appliedText.replace(SYMBOLS_FOR_ESCAPE, '\\$1'), Markup.inlineKeyboard([]), 'MarkdownV2');

            if (!this.botSessionService.isNewUser(ctx)) {
                const keyboardMessage = await ctx.reply(
                    ctx.i18n.t('bot.parent.language.applied.keyboard'),
                    BotParentKeyboard.staticKeyboard(ctx.i18n, { showLang: false }).resize(true),
                );

                this.botSessionService.addMessage(ctx, 'reply', true, keyboardMessage.message_id);
            } else {
                const startMessage = this.botSessionService.getMessages(ctx)?.find((message) => message.type === 'start_reply');
                if (startMessage) {
                    await this.botContextService.editMessageById(
                        ctx,
                        startMessage.id,
                        ctx.i18n.t('bot.parent.start.new'),
                        BotParentKeyboard.inlineKeyboard(ctx.i18n),
                    );
                }
            }

            this.langManager.unbindHandlers(ctx.from.id);
            await this.botContextService.updateCurrentMenuCommandList<BotContext>(ctx);
        }
    }
}
