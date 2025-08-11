import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BotUserEntity } from './bot.user.entity';
import { USER_ROLE } from '@lib/bot.const';
import { BotEntity } from './bot.entity';

@Entity()
export class CredentialEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => BotEntity)
    @JoinColumn({ name: 'bot_id' })
    bot: BotEntity;

    @ManyToOne(() => BotUserEntity)
    @JoinColumn({ name: 'user_id' })
    user: BotUserEntity;

    @Column({ type: 'enum', enum: USER_ROLE, default: USER_ROLE.GHOST })
    role: USER_ROLE;

    @Column({ type: 'boolean', default: true, name: 'active' })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true, name: 'active_until' })
    activeUntil: Date;
}
