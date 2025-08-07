import { I18nPath } from '../../../gensrc/i18n.types';
import { TranslateOptions } from 'nestjs-i18n';
import { Markup } from 'telegraf';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { TelegrafI18nService } from '@interface/bot';

interface KeyboardOptions {
    showList?: boolean;
    showHelp?: boolean;
    showLang?: boolean;
    lang?: string;
}

export class BotParentKeyboard {
    static staticKeyboard(i18n: TelegrafI18nService<I18nPath>, options: KeyboardOptions = <KeyboardOptions>{}) {
        const i18nOptions: TranslateOptions = {};
        if (options.lang) {
            i18nOptions.lang = options.lang;
        }
        return Markup.keyboard(
            [
                Markup.button.text(i18n.t('bot.parent.button.add', i18nOptions)),
                Markup.button.text(i18n.t('bot.parent.button.list', i18nOptions), isNil(options.showList) ? false : !options.showList),
                Markup.button.text(i18n.t('bot.parent.button.help', i18nOptions), isNil(options.showHelp) ? false : !options.showHelp),
                Markup.button.text(i18n.t('bot.parent.button.choose.lang', i18nOptions), isNil(options.showLang) ? false : !options.showLang),
            ],
            {
                columns: 2,
            },
        );
    }

    static inlineKeyboard(i18n: TelegrafI18nService<I18nPath>, options: KeyboardOptions = <KeyboardOptions>{}) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(i18n.t('bot.parent.button.add'), 'add_new_bot'),
                Markup.button.callback(i18n.t('bot.parent.button.help'), 'help', isNil(options.showHelp) ? false : !options.showHelp),
                Markup.button.callback(i18n.t('bot.parent.button.choose.lang'), 'choose.lang', isNil(options.showLang) ? false : !options.showLang),
            ],
            {
                columns: 2,
            },
        );
    }

    static inlineUndoKeyboard(i18n: TelegrafI18nService<I18nPath>, data = 'undo') {
        return Markup.inlineKeyboard([Markup.button.callback(i18n.t('bot.parent.button.undo'), data)]);
    }
}
