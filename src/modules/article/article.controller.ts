import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleDto } from '@dto/article.dto';

@Controller('article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get(':id')
    getArticle(@Param('id', ParseIntPipe) id: number) {
        return this.articleService.findById(id);
    }

    @Get()
    getArticles(
        @Query('author', new ParseBoolPipe({ optional: true }))
        attachAuthor: boolean,
    ) {
        return this.articleService.find(attachAuthor);
    }

    @Post('create')
    createArticle(@Body() articleDto: ArticleDto) {
        return this.articleService.create(articleDto);
    }

    @Delete(':id')
    removeArticle(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
        return this.articleService.remove(id);
    }
}
