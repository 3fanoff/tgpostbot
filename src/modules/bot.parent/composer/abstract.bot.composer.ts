import { Composer, MiddlewareFn } from 'telegraf';
import { BotContext } from '@interface/bot';
import { AsyncPredicate, Predicate } from 'telegraf/typings/composer';

interface IBotComposer {
    middleware(): MiddlewareFn<any>;
    predicate: Predicate<BotContext> | AsyncPredicate<BotContext>;
}

export abstract class AbstractBotComposer implements IBotComposer {
    protected composer: Composer<any>;

    protected constructor() {
        this.composer = new Composer();
    }

    abstract predicate: Predicate<BotContext> | AsyncPredicate<BotContext>;

    abstract middleware(): MiddlewareFn<any>;
}
