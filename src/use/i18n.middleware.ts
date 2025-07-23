import { I18nService, TranslateOptions } from 'nestjs-i18n';
import { I18nTranslations } from '@/gensrc/i18n.types';
import { Logger } from '@nestjs/common';
import { Context, Session, UpdateContext } from 'telegraf';
import { PathImpl2 } from '@nestjs/config';
import { NextFunction } from 'express';
import { Update } from '@telegraf/types';

export function i18nTelegrafMiddleware(i18nService: I18nService) {
    const logger = new Logger('middleware');
    const findLanguage = (ctx: Context<UpdateContext, Session>): string | null | undefined => {
        logger.debug(ctx.session);
        if (ctx.session && ctx.session.language) {
            return ctx.session.language;
        }
        try {
            const chatMemberUpdate = ctx.update as UpdateContext & Update.MyChatMemberUpdate;
            if (chatMemberUpdate.my_chat_member) {
                ctx.session.language = chatMemberUpdate.my_chat_member.from.language_code;
            }
            else if (chatMemberUpdate.message) {
                ctx.session.language = ctx.update.message.from.language_code;
            }
            return ctx.session.language;
        } catch (e) {
            logger.error(e);
            return null;
        }
    };

    return (ctx: Context<UpdateContext, Session>, next: NextFunction) => {
        const lang = findLanguage(ctx);

        ctx.i18n = {
            t: (key: PathImpl2<I18nTranslations>, options?: TranslateOptions) => {
                const opts = lang ? { lang, ...options } : { ...options };
                return i18nService.translate(key, opts);
            },
            changeLanguage: (lang: string) => {
                if (!ctx.session) {
                    ctx.session = { language: lang };
                }
                if (i18nService.getSupportedLanguages().includes(lang)) {
                    ctx.session.language = lang;
                } else {
                    ctx.session.language = null;
                }
            },
        };

        next();
    };
}
