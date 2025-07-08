import { AuthorDto } from './author.dto';

export class ArticleDto {
    title: string;
    text: string;
    id: number;
    authorID: number;
    author: AuthorDto;
    alias: string;
}
