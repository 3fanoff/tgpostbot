import { AbstractBaseConverter } from '@converter/abstract.base.converter';
import { Injectable, Provider } from '@nestjs/common';
import { Chat } from '@telegraf/types/manage';
import { ChannelDto } from '@dto/channel.dto';
import { BotChannelBasePopulator } from '@populator/bot.channel.base.populator';
import { BotChannelMemberCountPopulator } from '@populator/bot.channel.membercount.populator';
import { POPULATOR } from '@lib/bot.const';
import { PartialSource } from '@interface/bot';

@Injectable()
export class BotChannelBaseConverter extends AbstractBaseConverter<Chat.ChannelGetChat | PartialSource, ChannelDto> {
    constructor(
        private readonly botChannelBasePopulator: BotChannelBasePopulator,
        private readonly botChannelMemberCountPopulator: BotChannelMemberCountPopulator,
    ) {
        super({
            [POPULATOR.GET_CHANNEL]: botChannelBasePopulator,
            [POPULATOR.MEMBER_COUNT]: botChannelMemberCountPopulator,
        });
    }

    static providers: Provider[] = [BotChannelBasePopulator, BotChannelMemberCountPopulator];

    protected targetInstance(): ChannelDto {
        return new ChannelDto();
    }
}
