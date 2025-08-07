import { AbstractBaseConverter } from '@converter/abstract.base.converter';
import { BotDto } from '@dto/bot.dto';
import { BotGetMePopulator } from '@populator/bot.get.me.populator';
import { TelegramGetMe } from '@interface/bot';
import { Injectable, Provider } from '@nestjs/common';

@Injectable()
export class BotGetMeConverter extends AbstractBaseConverter<TelegramGetMe, BotDto> {
    constructor(private readonly botGetMePopulator: BotGetMePopulator) {
        super([botGetMePopulator]);
    }

    static providers: Provider[] = [BotGetMePopulator];

    protected targetInstance(): BotDto {
        return new BotDto();
    }
}
