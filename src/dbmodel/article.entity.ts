import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuthorEntity } from './author.entity';

@Entity()
export class ArticleEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 240 })
    title: string;

    @Column({ nullable: true })
    text: string;

    @Column({ length: 99, unique: true, type: 'varchar' })
    alias: string;

    @ManyToOne(() => AuthorEntity, (author) => author.article)
    author: AuthorEntity;
}
