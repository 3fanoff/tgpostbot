import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BigintNumberTransformer } from './transformers/bigint.number.transformer';

export abstract class AbstractBotEntity {
    @PrimaryGeneratedColumn('uuid')
    pk: string;

    @Column({
        type: 'bigint',
        unique: true,
        transformer: new BigintNumberTransformer(),
    })
    id: number;

    @Column({ type: 'varchar', length: 48 })
    name: string;

    @CreateDateColumn()
    createdOn: Date;

    @UpdateDateColumn()
    updatedOn: Date;
}
