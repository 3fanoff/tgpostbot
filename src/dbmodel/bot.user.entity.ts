import { Column, Entity, OneToMany } from 'typeorm';
import { BotEntity } from '@model/bot.entity';
import { AbstractBotEntity } from '@model/abstract.bot.entity';
import { USER_ROLE } from '@lib/bot.const';

@Entity('bot_user')
export class BotUserEntity extends AbstractBotEntity {
    @Column({ type: 'enum', enum: USER_ROLE, default: USER_ROLE.ADMINISTRATOR })
    role: USER_ROLE;

    @OneToMany(() => BotEntity, (bot) => bot.user)
    bots: BotEntity[];
}
