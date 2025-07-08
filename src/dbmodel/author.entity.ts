import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ArticleEntity } from './article.entity';

@Entity()
export class AuthorEntity {
    @PrimaryColumn({ unique: true, type: 'integer' })
    id: number;

    @Column({ type: 'varchar', length: 64, nullable: true })
    lastName: string;

    @Column({ type: 'varchar', length: 64 })
    firstName: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => ArticleEntity, (article) => article.author)
    article: ArticleEntity[];
}
