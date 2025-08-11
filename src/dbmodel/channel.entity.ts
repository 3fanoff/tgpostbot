import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBotEntity } from '@model/abstract.bot.entity';
import { BotEntity } from '@model/bot.entity';

@Entity('channel')
export class ChannelEntity extends AbstractBotEntity {
    @ManyToOne(() => BotEntity, (bot) => bot.channels)
    @JoinColumn({ name: 'bot_id' })
    bot: BotEntity;
}
