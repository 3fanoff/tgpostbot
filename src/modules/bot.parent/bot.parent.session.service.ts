import { Injectable } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { BotParentSessionDTO } from './dto/bot.parent.session.dto';
import { BotParentService } from './bot.parent.service';
import { BotParent } from '@interface/bot';
import { actionTypes, availableActions } from './lib/bot.parent.const';

@Injectable()
export class BotParentSessionService {
    static DEFAULT_ACTIONS = [availableActions.HELP, availableActions.ADD_NEW_TOKEN];

    constructor(private botParentService: BotParentService) {}

    public async initSession(ctx: BotParent.BotContext) {
        if (isNil(ctx.session.bot)) {
            ctx.session.bot = new BotParentSessionDTO();
        }
        const bot = ctx.session.bot;
        if (isNil(bot.isNewUser)) {
            bot.userHasBot = await this.botParentService.isUserHasABot();
            bot.isNewUser = !bot.userHasBot;
        }
        //if (!bot.allowAction.size) {
        this.setAllowActions(ctx, BotParentSessionService.DEFAULT_ACTIONS);
        //}
        if (isNil(bot.messages)) {
            bot.messages = [];
        }
    }

    public isUserHasABot(ctx: BotParent.BotContext) {
        return ctx.session.bot?.userHasBot || false;
    }

    public isAllowAction(ctx: BotParent.BotContext, type: actionTypes): boolean {
        const { allowAction } = ctx.session.bot;
        switch (type) {
            case actionTypes.HEARS_ADD_NEW_BOT:
                return !allowAction.has(availableActions.ALLOW_TOKEN);
            case actionTypes.ADD_NEW_BOT:
                return allowAction.has(availableActions.ADD_NEW_TOKEN);
            case actionTypes.ALLOW_ACCEPT_TOKEN:
                return allowAction.has(availableActions.ALLOW_TOKEN);
            case actionTypes.SHOW_HELP:
                return allowAction.has(availableActions.HELP);
            case actionTypes.UNDO_NEW_BOT:
                return allowAction.has(availableActions.UNDO) && allowAction.has(availableActions.ALLOW_TOKEN);
            default:
                return true;
        }
    }

    public setAllowActions(ctx: BotParent.BotContext, actions: availableActions[]) {
        ctx.session.bot.allowAction = new Set<number>(actions);
    }

    public resetAllowActions(ctx: BotParent.BotContext) {
        this.setAllowActions(ctx, BotParentSessionService.DEFAULT_ACTIONS);
    }

    public addMessage(ctx: BotParent.BotContext, type: string, bot: boolean, id: number) {
        ctx.session.bot.messages.push({
            type,
            bot,
            id,
        });
    }

    public clearMessages(ctx: BotParent.BotContext) {
        ctx.session.bot.messages.splice(0);
    }

    public getMessages(ctx: BotParent.BotContext): Array<BotParent.BotDataMessage> {
        return ctx.session.bot.messages;
    }
}
