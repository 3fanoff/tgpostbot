import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BotUserEntity } from '@model/bot.user.entity';
import { AbstractBotEntity } from '@model/abstract.bot.entity';
import { ChannelEntity } from '@model/channel.entity';
import { CredentialEntity } from './credential.entity';

@Entity('bot')
export class BotEntity extends AbstractBotEntity {
    @Column({ unique: true, type: 'varchar', length: 100 })
    token: string;

    @Column({ name: 'active', default: true })
    isActive: boolean;

    @ManyToOne(() => BotUserEntity, (user) => user.own)
    owner: BotUserEntity;

    @OneToMany(() => CredentialEntity, (cred) => cred.bot)
    users: CredentialEntity[];

    @OneToMany(() => ChannelEntity, (channel) => channel.bot)
    channels: ChannelEntity[];
}
