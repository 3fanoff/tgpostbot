import { Injectable, Logger } from '@nestjs/common';
import { isNil, isObject } from '@nestjs/common/utils/shared.utils';
import { BotParentSessionDTO } from './dto/bot.parent.session.dto';
import { BotParentService } from './bot.parent.service';
import { BotContext, BotDataMessage, BotParent } from '@interface/bot';
import { actionTypes, availableActions } from './lib/bot.parent.const';

@Injectable()
export class BotParentSessionService {
    static DEFAULT_ACTIONS = [availableActions.HELP, availableActions.ADD_TOKEN];

    private logger = new Logger(BotParentSessionService.name);

    constructor(private botParentService: BotParentService) {}

    public async initSession(ctx: BotContext) {
        this.logger.debug('start initSession method');
        ctx.session.bot = new BotParentSessionDTO();

        const { bot } = ctx.session;
        if (isNil(bot.isNewUser)) {
            const dbHasUser = isObject(ctx.myChatMember) ? await this.botParentService.hasUser(ctx.myChatMember.from.id) : false;
            this.logger.debug('dbHasUser', dbHasUser);
            this.setIsNewUser(ctx, !dbHasUser);
            this.setIsUserHasBot(ctx, !bot.isNewUser);
        }
        this.setAllowActions(ctx, BotParentSessionService.DEFAULT_ACTIONS);
        if (isNil(bot.messages)) {
            bot.messages = [];
        }
    }

    public hasBotSession(ctx: BotContext) {
        return !isNil(ctx.session.bot);
    }

    public isUserHasABot(ctx: BotContext) {
        if (this.hasBotSession(ctx)) {
            return ctx.session.bot.userHasBot;
        }
        return false;
    }

    public isNewUser(ctx: BotContext) {
        if (this.hasBotSession(ctx)) {
            return ctx.session.bot.isNewUser;
        }
        return true;
    }

    public setIsNewUser(ctx: BotContext, status: boolean = true) {
        if (this.hasBotSession(ctx)) {
            ctx.session.bot.isNewUser = status;
        }
    }

    public setIsUserHasBot(ctx: BotContext, status: boolean = false) {
        if (this.hasBotSession(ctx)) {
            ctx.session.bot.userHasBot = status;
        }
    }

    public isAllowAction(ctx: BotContext, type: actionTypes): boolean {
        if (!this.hasBotSession(ctx)) return false;
        const { allowAction } = ctx.session.bot;
        switch (type) {
            case actionTypes.HEARS_ADDING_BOT:
                return !allowAction.has(availableActions.ALLOW_TOKEN);
            case actionTypes.ADDING_BOT:
                return allowAction.has(availableActions.ADD_TOKEN);
            case actionTypes.ALLOW_ACCEPT_TOKEN:
                return allowAction.has(availableActions.ALLOW_TOKEN);
            case actionTypes.SHOW_HELP:
                return allowAction.has(availableActions.HELP);
            case actionTypes.UNDO_ADDING_BOT:
                return allowAction.has(availableActions.UNDO) && allowAction.has(availableActions.ALLOW_TOKEN);
            default:
                return true;
        }
    }

    public setAllowActions(ctx: BotContext, actions: availableActions[]) {
        if (this.hasBotSession(ctx)) {
            ctx.session.bot.allowAction = new Set<number>(actions);
        }
    }

    public resetAllowActions(ctx: BotContext) {
        this.setAllowActions(ctx, BotParentSessionService.DEFAULT_ACTIONS);
    }

    public addMessage(ctx: BotContext, type: BotParent.MessageType, bot: boolean, id: number, text: string) {
        if (!this.hasBotSession(ctx)) return;
        ctx.session.bot.messages.push({
            type,
            bot,
            id,
            text,
        });
    }

    public clearMessages(ctx: BotContext) {
        if (this.hasBotSession(ctx)) {
            ctx.session.bot.messages.splice(0);
        }
    }

    public getMessages(ctx: BotContext): Array<BotDataMessage> | null {
        if (this.hasBotSession(ctx)) {
            return ctx.session.bot.messages;
        }
        return null;
    }
}
