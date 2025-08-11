import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractBotEntity {
    @PrimaryGeneratedColumn('uuid')
    pk: string;

    @Column({ type: 'bigint', unique: true })
    id: number;

    @Column({ type: 'varchar', length: 48 })
    name: string;

    @CreateDateColumn()
    createdOn: Date;

    @UpdateDateColumn()
    updatedOn: Date;
}
