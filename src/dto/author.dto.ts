import { ArticleDto } from './article.dto';

export class AuthorDto {
    lastName: string;
    firstName: string;
    isActive: boolean;
    article: ArticleDto[];
}
