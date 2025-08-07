import { PartialType } from '@nestjs/mapped-types';

export class BotUserDto {
    public id: number;
    public name: string;
}

export class UpdateBotUserDto extends PartialType(BotUserDto) {}
