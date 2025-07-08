import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '../../dbmodel/article.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { AuthorEntity } from '../../dbmodel/author.entity';
import { ArticleDto } from '../../dto/article.dto';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepo: Repository<ArticleEntity>,
        @InjectRepository(AuthorEntity)
        private authorRepo: Repository<AuthorEntity>,
    ) {}

    async create(articleDto: ArticleDto): Promise<ArticleEntity> {
        let author: AuthorEntity | null = null;
        if (articleDto.authorID) {
            author = await this.authorRepo.findOneBy({
                id: articleDto.authorID,
            });
            if (!author) {
                throw new NotFoundException('author with id=' + articleDto.authorID + ' not found');
            }
        }

        const article = this.articleRepo.create(articleDto);

        try {
            if (author) {
                article.author = author;
            }
            return await this.articleRepo.save(article);
        } catch (e) {
            throw new InternalServerErrorException((e as QueryFailedError).driverError.message);
        }
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.articleRepo.delete({ id });
        return result.affected !== 0;
    }

    async findById(id: number): Promise<ArticleEntity> {
        const entity = await this.articleRepo.findOneBy({ id });
        if (!(entity instanceof ArticleEntity)) {
            throw new NotFoundException('article with id=' + id + ' not found');
        }
        return entity;
    }

    find(attachAuthor?: boolean): Promise<ArticleEntity[]> {
        return this.articleRepo.find({
            relations: {
                author: attachAuthor,
            },
        });
    }
}
