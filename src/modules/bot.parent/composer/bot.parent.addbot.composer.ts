import { AbstractBotComposer } from './abstract.bot.composer';
import { Composer, MiddlewareFn } from 'telegraf';
import { BotContext, BotMessageContext, DriverError } from '@interface/bot';
import { actionTypes, availableActions } from '../lib/bot.parent.const';
import { Message } from '@telegraf/types';
import { BotDto } from '@dto/bot.dto';
import { BotParentSessionService } from '../bot.parent.session.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { BotParentService } from '../bot.parent.service';
import { BotEntity } from '@model/bot.entity';
import { BotUserEntity } from '@model/bot.user.entity';
import { message } from 'telegraf/filters';
import { BotParentKeyboard } from '../lib/bot.parent.keyboard';
import { QueryFailedError } from 'typeorm';
import { InvalidArgumentException } from '@decorator/bot.decorator';

@Injectable()
export class BotParentAddbotComposer extends AbstractBotComposer {
    private readonly logger: Logger = new Logger(BotParentAddbotComposer.name);

    constructor(
        private botSessionService: BotParentSessionService,
        private botParentService: BotParentService,
    ) {
        super();
    }

    predicate = (ctx: BotContext) => {
        return this.botSessionService.isAllowAction(ctx, actionTypes.ALLOW_ACCEPT_TOKEN);
    };

    middleware(): MiddlewareFn<any> {
        return Composer.optional(
            (ctx: BotContext) => this.predicate(ctx),
            Composer.on(message('text'), (ctx: BotMessageContext) => this.addNewBot(ctx)),
        );
    }

    private async addNewBot(ctx: BotMessageContext) {
        //if (!ctx.message) return;
        if (ctx.from.is_bot) return;

        this.logger.debug('msg:', ctx.msg);
        let replyMessage: Message.TextMessage;

        try {
            const botDto: BotDto = await this.botParentService.getDataForBot(ctx.msg.text);
            if (!botDto.isBot) {
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.is_user'));
            } else {
                const username = botDto.name;
                this.botSessionService.setAllowActions(ctx, [availableActions.ADD_TOKEN]);
                replyMessage = await ctx.reply(ctx.i18n.t('bot.parent.add.attach', { args: { username } }));

                await this.createBotAndAddToUser(ctx, botDto, ctx.from.id, ctx.from.username);
                await ctx.reply(
                    ctx.i18n.t('bot.parent.add.success', { args: { username } }),
                    BotParentKeyboard.staticKeyboard(ctx.i18n).resize(true),
                );
            }
        } catch (e) {
            replyMessage = await ctx.reply(
                ctx.i18n.t(
                    this.botParentService.catchAddNewBotReply(e as QueryFailedError<DriverError> | InvalidArgumentException | UnauthorizedException),
                ),
                { parse_mode: 'HTML' },
            );
            this.botSessionService.setAllowActions(ctx, [availableActions.ALLOW_TOKEN, availableActions.UNDO]);
        }

        this.botSessionService.addMessage(ctx, 'reply', true, replyMessage.message_id, replyMessage.text);
    }

    private async createBotAndAddToUser(ctx: BotContext, botDto: BotDto, userID: number, username?: string) {
        const bot: BotEntity = await this.botParentService.createBot(botDto);

        if (this.botSessionService.isNewUser(ctx)) {
            const user: BotUserEntity = await this.botParentService.createUser(userID, username);
            await this.botParentService.addBotOwner(bot, user);
        } else {
            await this.botParentService.addBotOwnerByUserId(bot, userID);
        }

        this.botSessionService.setIsNewUser(ctx, false);
        this.botSessionService.setIsUserHasBot(ctx, true);
    }
}
