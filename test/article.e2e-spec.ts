import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ArticleEntity } from '../src/dbmodel/article.entity';

describe('ArticleController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/article (GET)', () => {
        return request(app.getHttpServer())
            .get('/article')
            .expect(200)
            .then((response) => {
                const responseBody = response.body as object[];
                const bodyIsArray = Array.isArray(responseBody);
                expect(bodyIsArray).toBeTruthy();
                if (bodyIsArray && responseBody.length) {
                    expect(responseBody[0]).toStrictEqual<object>(new ArticleEntity());
                }
            });
    });
});
