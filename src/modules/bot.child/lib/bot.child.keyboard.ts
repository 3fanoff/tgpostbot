import { I18nPath } from '@/gensrc/i18n.types';
import { Markup } from 'telegraf';
import { TelegrafI18nService } from '@interface/bot';
import { callbackData } from './bot.child.const';

export class BotChildKeyboard {
    static startKeyboard(i18n: TelegrafI18nService<I18nPath>) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(i18n.t('bot.child.button.start.new.post'), callbackData.NEW_POST),
                Markup.button.callback(i18n.t('bot.child.button.start.edit.post'), callbackData.EDIT_POST),
                Markup.button.callback(i18n.t('bot.child.button.start.add.channel'), callbackData.ADD_CHANNEL),
                Markup.button.callback(i18n.t('bot.child.button.start.settings'), callbackData.SETTINGS),
            ],
            {
                columns: 2,
            },
        );
    }
}
