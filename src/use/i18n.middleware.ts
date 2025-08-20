import { I18nService, TranslateOptions } from 'nestjs-i18n';
import { I18nTranslations } from '@/gensrc/i18n.types';
import { Logger } from '@nestjs/common';
import { PathImpl2 } from '@nestjs/config';
import { NextFunction } from 'express';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { BotBaseSession, BotContext } from '@interface/bot';

export function i18nTelegrafMiddleware<S extends BotBaseSession>(i18nService: I18nService) {
    const logger = new Logger('i18nTelegrafMiddleware');
    const findLanguage = (ctx: BotContext<S>) => {
        //logger.debug(ctx.session);
        if (ctx.session && ctx.session.language) {
            return ctx.session.language;
        }
        try {
            //let lang: UseLanguage;
            const lang = ctx.from?.language_code;
            if (lang) {
                ctx.session.language = i18nService.resolveLanguage(lang);
            }
            return ctx.session.language;
        } catch (e) {
            logger.error(e);
            return null;
        }
    };

    return (ctx: BotContext<S>, next: NextFunction) => {
        ctx.i18n = {
            t: (key: PathImpl2<I18nTranslations>, options?: TranslateOptions) => {
                const lang = findLanguage(ctx);
                const opts = lang ? { lang, ...options } : { ...options };
                return i18nService.translate(key, opts);
            },
            changeLanguage: (lang: string): boolean => {
                if (i18nService.getSupportedLanguages().includes(lang)) {
                    ctx.session.language = i18nService.resolveLanguage(lang);
                } else {
                    ctx.session.language = null;
                }
                return !isNil(ctx.session.language);
            },
        };

        next();
    };
}
