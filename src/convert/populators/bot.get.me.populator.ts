import { Populator } from '@interface/converter';
import { TelegramGetMe } from '@interface/bot';
import { BotDto } from '@dto/bot.dto';

export class BotGetMePopulator implements Populator<TelegramGetMe, BotDto> {
    populate(source: TelegramGetMe, target: BotDto): void {
        target.id = source.result.id;
        target.name = source.result.username;
        target.isBot = source.result.is_bot;
    }
}
