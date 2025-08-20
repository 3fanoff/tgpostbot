import { Populator } from '@interface/converter';
import { Chat } from '@telegraf/types/manage';
import { ChannelDto } from '@dto/channel.dto';

export class BotChannelBasePopulator implements Populator<Chat.ChannelGetChat, ChannelDto> {
    populate(source: Chat.ChannelGetChat, target: ChannelDto): void {
        target.id = source.id;
        target.username = source.username || null;
        target.title = source.title;
        target.type = source.type;
    }
}
