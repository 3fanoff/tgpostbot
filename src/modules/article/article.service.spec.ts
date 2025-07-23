import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { ArticleDto } from '@dto/article.dto';
import { ArticleEntity } from '@model/article.entity';
import { AuthorEntity } from '@model/author.entity';
import { isNil, isNumber } from '@nestjs/common/utils/shared.utils';
import { DeleteResult, QueryFailedError } from 'typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ArticleService', () => {
    let service: ArticleService;
    const mockArticleRepo = {
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        findOneBy: jest.fn(),
        find: jest.fn(),
    };
    const mockAuthorRepo = { ...mockArticleRepo };

    const articlesTestData = [{ title: 'title #1', text: 'text #1', alias: 'title-alias-1' }];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticleService,
                {
                    provide: getRepositoryToken(ArticleEntity),
                    useValue: mockArticleRepo,
                },
                {
                    provide: getRepositoryToken(AuthorEntity),
                    useValue: mockAuthorRepo,
                },
            ],
        }).compile();

        service = module.get<ArticleService>(ArticleService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
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

                jest.spyOn(mockAuthorRepo, 'findOneBy').mockResolvedValue(throwErr ? null : authorEntity);
            }

            jest.spyOn(mockArticleRepo, 'create').mockReturnValue(articleEntity_response);

            if (authorEntity) {
                articleEntity_response.author = authorEntity;
            }

            if (isNil(authorID) && throwErr) {
                jest.spyOn(mockArticleRepo, 'save').mockImplementation(() => {
                    throw new QueryFailedError('', [], new Error());
                });
            } else {
                jest.spyOn(mockArticleRepo, 'save').mockResolvedValue(articleEntity_response);
            }

            try {
                const articleEntity_result = await service.create(articleDto);
                if (isNumber(authorID)) {
                    expect(mockAuthorRepo.findOneBy).toHaveBeenCalledWith({ id: articleDto.authorID });
                }
                expect(mockArticleRepo.create).toHaveBeenCalledWith(articleDto);
                expect(mockArticleRepo.save).toHaveBeenCalledWith(articleEntity_result);
                expect(articleEntity_result).toEqual(articleEntity_response);
            } catch (e) {
                if (isNumber(authorID) && throwErr) {
                    expect(e).toBeInstanceOf(NotFoundException);
                }
                if (isNil(authorID) && throwErr) {
                    expect(e).toBeInstanceOf(InternalServerErrorException);
                }
            }
        };
    };

    it('create => should create ArticleEntity by ArticleDto and save it', createTestFn(null));
    it('create (& authorID) => should create ArticleEntity with AuthorEntity by ArticleDto and save it', createTestFn(25));
    it('create (& authorID not found) => should return NotFoundException', createTestFn(25, true));
    it('create (error on save) => should return InternalServerErrorException', createTestFn(null, true));

    const findByIdTestFn = (throwErr: boolean) => {
        return async () => {
            let body: ArticleEntity | NotFoundException;
            const articleEntity = Object.assign(new ArticleEntity(), articlesTestData);
            articleEntity.id = 457;
            jest.spyOn(mockArticleRepo, 'findOneBy').mockResolvedValue(throwErr ? null : articleEntity);

            try {
                body = await service.findById(articleEntity.id);
            } catch (e) {
                body = e as NotFoundException;
            }
            expect(mockArticleRepo.findOneBy).toHaveBeenCalledWith({
                id: articleEntity.id,
            });
            if (throwErr) {
                expect(body).toBeInstanceOf(NotFoundException);
            } else {
                expect(body).toEqual(articleEntity);
            }
        };
    };

    it('findById => should return valid ArticleEntity', findByIdTestFn(false));
    it('findById (& undefined ID) => should return NotFoundException', findByIdTestFn(true));

    it('find => should return all articles', async () => {
        const articlesEntityList = [Object.assign(new ArticleEntity(), articlesTestData)];
        jest.spyOn(mockArticleRepo, 'find').mockResolvedValue(articlesEntityList);

        const articlesEntityList_result = await service.find(false);

        expect(mockArticleRepo.find).toBeCalled();
        expect(articlesEntityList_result).toEqual(articlesEntityList);
    });

    const removeTestFn = (toBeSuccess: boolean) => {
        return async () => {
            jest.spyOn(mockArticleRepo, 'delete').mockResolvedValue({ affected: toBeSuccess ? 1 : 0 } as DeleteResult);

            const articleWasDelete: boolean = await service.remove(27);

            expect(mockArticleRepo.delete).toHaveBeenCalledWith({ id: 27 });
            expect(articleWasDelete).toBe(toBeSuccess);
        };
    };

    it('remove (successfully) => method should return "true"', removeTestFn(true));
    it('remove (failed) => method should return "false"', removeTestFn(false));
});
