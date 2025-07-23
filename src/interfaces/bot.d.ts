import { Message, Update } from '@telegraf/types';
import { TranslateOptions } from 'nestjs-i18n';
import { I18nPath } from '@/gensrc/i18n.types';
import { Context, UpdateContext } from 'telegraf';

declare module 'telegraf' {
    interface Session {
        language: string | null | undefined;
        ctx_action?: number;
    }
    interface UpdateContext {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }

    type TelegrafI18nService<P> = {
        changeLanguage(lang: string): void;
        t(key: P, options?: TranslateOptions): string;
    };

    interface Context<U, S extends Session> {
        i18n: TelegrafI18nService<I18nPath>;
        session: S;
        update: U;
    }
}

export declare namespace BotParent {
    interface BotSession {
        language: string | null;
        bot: BotData;
    }
    interface BotDataMessage {
        type: string;
        bot: boolean;
        id: number;
    }
    interface BotData {
        isNewUser: boolean;
        userHasBot: boolean;
        allowAction: Set<number>;
        messages: Array<BotDataMessage>;
    }

    type BotContext = Context<UpdateContext & Update.CallbackQueryUpdate, BotSession>;
}
