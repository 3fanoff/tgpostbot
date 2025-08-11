import { Message, Update } from '@telegraf/types';
import { TranslateOptions } from 'nestjs-i18n';
import { I18nPath } from '@/gensrc/i18n.types';
import { Context as ContextTelegraf } from 'telegraf';
import * as tg from 'telegraf/src/core/types/typegram';

type TelegrafI18nService<P> = {
    changeLanguage(lang: string): boolean;
    t(key: P, options?: TranslateOptions): string;
};

export interface BotSession {
    language: string | null | undefined;
    ctx_action: number;
    bot: BotData;
}

interface BotDataMessage {
    type: MessageType;
    bot: boolean;
    id: number;
    text?: string;
}

interface BotData {
    isNewUser: boolean;
    userHasBot: boolean;
    allowAction: Set<number>;
    messages: Array<BotDataMessage>;
}

interface BotContextAdditions<S extends BotSession = BotSession> {
    i18n: TelegrafI18nService<I18nPath>;
    session: S;
}

interface BotContext<S extends BotSession = BotSession, U = Update> extends BotContextAdditions<S>, ContextTelegraf<U> {
    system: boolean;
}

interface BotMessageContext<S = BotSession> extends BotContext<S, Update.MessageUpdate<Message.TextMessage>> {
    system: boolean;
}

interface BotCallbackContext<S = BotSession, Q = tg.CallbackQuery> extends BotContext<S, Update.CallbackQueryUpdate<Q>> {
    system: boolean;
}

interface BotMemberContext<S = BotSession> extends BotContext<S, Update.MyChatMemberUpdate> {
    system: boolean;
}

export type BotUpdate = Update.CallbackQueryUpdate<tg.CallbackQuery.DataQuery> &
    Update.ChannelPostUpdate &
    Update.ChatMemberUpdate &
    Update.ChosenInlineResultUpdate &
    Update.EditedChannelPostUpdate &
    Update.MessageReactionUpdate &
    Update.MessageReactionCountUpdate &
    Update.EditedMessageUpdate &
    Update.InlineQueryUpdate &
    Update.MessageUpdate<Message.TextMessage> &
    Update.MyChatMemberUpdate &
    Update.PreCheckoutQueryUpdate &
    Update.PollAnswerUpdate &
    Update.PollUpdate &
    Update.ShippingQueryUpdate &
    Update.ChatJoinRequestUpdate &
    Update.ChatBoostUpdate &
    Update.RemovedChatBoostUpdate;

export type BotFullContext<S = BotSession> = BotMessageContext<S> | BotCallbackContext<S> | BotMemberContext<S>;

//export type DriverError = { [key: string]: string | number } & Error;
interface DriverError extends Error {
    code: string;
    table: string;
}

export declare namespace BotParent {
    type MessageType = 'start_reply' | 'reply' | 'message' | 'help' | 'error';

    interface BotData {
        isNewUser: boolean;
        userHasBot: boolean;
        allowAction: Set<number>;
        messages: Array<BotDataMessage>;
    }
}

export namespace TGResponse {
    export interface GetMe<R> {
        ok: boolean;
        result: R;
    }

    export interface GetMeResult {
        id: number;
        is_bot: boolean;
        username: string;
    }
}

export type TelegramGetMe = TGResponse.GetMe<TGResponse.GetMeResult>;
