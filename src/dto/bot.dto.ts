import { PartialType } from '@nestjs/mapped-types';
import { BotUserDto } from '@dto/bot.user.dto';

export class BotDto {
    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
    }
    public id: number;
    public isBot: boolean;
    public name: string;
    private _token: string;
    public user: BotUserDto;
}

export class BotDtoUpdate extends PartialType(BotDto) {}
