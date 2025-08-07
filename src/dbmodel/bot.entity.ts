import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BotUserEntity } from '@model/bot.user.entity';
import { AbstractBotEntity } from '@model/abstract.bot.entity';
import { ChannelEntity } from '@model/channel.entity';

@Entity('bot')
export class BotEntity extends AbstractBotEntity {
    @Column({ unique: true, type: 'varchar', length: 100 })
    token: string;

    @ManyToOne(() => BotUserEntity, (user) => user.bots)
    user: BotUserEntity;

    @OneToMany(() => ChannelEntity, (channel) => channel.bot)
    channels: ChannelEntity[];
}
