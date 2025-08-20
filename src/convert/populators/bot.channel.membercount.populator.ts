import { Populator } from '@interface/converter';
import { ChannelDto } from '@dto/channel.dto';
import { PartialSource } from '@interface/bot';

type MemberCountSource = Pick<PartialSource, 'chatMemberCount'>;

export class BotChannelMemberCountPopulator implements Populator<MemberCountSource, ChannelDto> {
    populate(source: MemberCountSource, target: ChannelDto): void {
        target.memberCount = source.chatMemberCount;
    }
}
