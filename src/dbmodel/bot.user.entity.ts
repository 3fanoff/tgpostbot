import { Entity, OneToMany } from 'typeorm';
import { AbstractBotEntity } from '@model/abstract.bot.entity';
import { CredentialEntity } from './credential.entity';
import { BotEntity } from './bot.entity';

@Entity('bot_user')
export class BotUserEntity extends AbstractBotEntity {
    @OneToMany(() => BotEntity, (bot) => bot.owner)
    own: BotEntity[];

    @OneToMany(() => CredentialEntity, (cred) => cred.user)
    credentials: CredentialEntity[];
}
