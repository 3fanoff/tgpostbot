import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '../../dbmodel/article.entity';
import { AuthorEntity } from '../../dbmodel/author.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ArticleEntity, AuthorEntity])],
    controllers: [ArticleController],
    providers: [ArticleService],
})
export class ArticleModule {}
