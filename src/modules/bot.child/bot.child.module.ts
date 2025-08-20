import { Module } from '@nestjs/common';
import { BotChildService } from './bot.child.service';
import { BotChildUpdate } from './bot.child.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotEntity } from '@model/bot.entity';
import { BotManager } from './bot.manager';
import { BotChildChannelService } from './bot.child.channel.service';
import { BotChannelBaseConverter } from '@converter/bot.channel.base.converter';

@Module({
    imports: [TypeOrmModule.forFeature([BotEntity])],
    providers: [BotChildUpdate, BotChildService, BotManager, BotChildChannelService, BotChannelBaseConverter, ...BotChannelBaseConverter.providers],
})
export class BotChildModule {}
