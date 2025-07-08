import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleDto } from '../../dto/article.dto';
import { ArticleEntity } from '../../dbmodel/article.entity';
import { AuthorEntity } from '../../dbmodel/author.entity';
import { isNil, isNumber } from '@nestjs/common/utils/shared.utils';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ArticleController', () => {
    let controller: ArticleController;
    const mockAppService = {
        create: jest.fn(),
        remove: jest.fn(),
        findById: jest.fn(),
        find: jest.fn(),
    };

    const articlesTestData = [{ title: 'title #1', text: 'text #1', alias: 'title-alias-1' }];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ArticleController],
            providers: [
                {
                    provide: ArticleService,
                    useValue: mockAppService,
                },
            ],
        }).compile();

        controller = module.get<ArticleController>(ArticleController);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    const createTestFn = (authorID: number | null, throwErr?: boolean) => {
        return async () => {
            const articleDto = Object.assign(new ArticleDto(), articlesTestData);
            const articleEntity_response = Object.assign(new ArticleEntity(), articlesTestData);
            let authorEntity: AuthorEntity | null = null;
            articleEntity_response.id = Math.floor(Math.random() * 100);

            if (isNumber(authorID)) {
                articleDto.authorID = authorID;
                authorEntity = Object.assign(new AuthorEntity(), {
                    firstName: 'Author #' + authorID,
                    isActive: true,
                    id: authorID,
                });
            }

            if (authorEntity) {
                articleEntity_response.author = authorEntity;
            }

            if (throwErr) {
                jest.spyOn(mockAppService, 'create').mockImplementation(() => {
                    throw isNil(authorID) ? new InternalServerErrorException() : new NotFoundException();
                });
            } else {
                jest.spyOn(mockAppService, 'create').mockResolvedValue(articleEntity_response);
            }

            try {
                const articleEntity_result = await controller.createArticle(articleDto);

                expect(mockAppService.create).toHaveBeenCalledWith(articleDto);
                expect(articleEntity_result).toEqual(articleEntity_response);
            } catch (e) {
                if (throwErr) {
                    expect(e).toBeInstanceOf(isNil(authorID) ? InternalServerErrorException : NotFoundException);
                }
            }
        };
    };
    it('create => should create new article by dto', createTestFn(null));
    it('create (& authorID) => should create new article with author by dto', createTestFn(25));
    it('create (& authorID not found) => should return NotFoundException', createTestFn(25, true));
    it('create (error) => should return InternalServerErrorException', createTestFn(null, true));

    const getArticleTestFn = (throwErr: boolean) => {
        return async () => {
            const articleId = 232;
            let body: ArticleEntity | NotFoundException;
            const articleEntity = Object.assign(new ArticleEntity(), articlesTestData);
            articleEntity.id = articleId;
            jest.spyOn(mockAppService, 'findById').mockImplementation(() => {
                if (throwErr) {
                    throw new NotFoundException();
                } else {
                    return Promise.resolve(articleEntity);
                }
            });

            try {
                body = await controller.getArticle(articleId);
            } catch (e) {
                body = e as NotFoundException;
            }

            expect(mockAppService.findById).toHaveBeenCalledWith(articleId);
            if (throwErr) {
                expect(body).toBeInstanceOf(NotFoundException);
            } else {
                expect(body).toEqual(articleEntity);
            }
        };
    };

    it('get article by ID => should return article', getArticleTestFn(false));
    it('get article by undefined ID => should return NotFoundException', getArticleTestFn(true));

    it('get articles => should return all articles in array', async () => {
        const articlesEntityList = [Object.assign(new ArticleEntity(), articlesTestData)];
        jest.spyOn(mockAppService, 'find').mockResolvedValue(articlesEntityList);

        const articlesEntityList_result = await controller.getArticles(false);

        expect(mockAppService.find).toHaveBeenCalledWith(false);
        expect(articlesEntityList_result).toEqual(articlesEntityList);
    });

    const removeTestFn = (toBeSuccess: boolean) => {
        return async () => {
            jest.spyOn(mockAppService, 'remove').mockResolvedValue(toBeSuccess);

            const articleWasDelete: boolean = await controller.removeArticle(30);

            expect(mockAppService.remove).toHaveBeenCalledWith(30);
            expect(articleWasDelete).toBe(toBeSuccess);
        };
    };

    it('removeArticle (successfully) => method should return "true"', removeTestFn(true));
    it('removeArticle (failed) => method should return "false"', removeTestFn(false));
});
