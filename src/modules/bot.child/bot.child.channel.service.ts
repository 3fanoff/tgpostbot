import { Injectable } from '@nestjs/common';
import { BotBaseSession, BotContext } from '@interface/bot';
import { Chat } from '@telegraf/types/manage';
import { BotChannelBaseConverter } from '@converter/bot.channel.base.converter';
import { POPULATOR } from '@lib/bot.const';

@Injectable()
export class BotChildChannelService {
    constructor(private readonly botChannelBaseConverter: BotChannelBaseConverter) {}

    async getChatInfo(ctx: BotContext<BotBaseSession>, chatName: string) {
        const chatFullInfo = (await ctx.telegram.getChat(chatName)) as Chat.ChannelGetChat;
        const chatMemberCount = await ctx.telegram.getChatMembersCount(chatName);

        return this.botChannelBaseConverter.convertUnion({
            [POPULATOR.GET_CHANNEL]: chatFullInfo,
            [POPULATOR.MEMBER_COUNT]: { chatMemberCount },
        });
    }
}
