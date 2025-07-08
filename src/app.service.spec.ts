import { AppService } from './app.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppService', () => {
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppService],
        }).compile();
        appService = module.get(AppService);
    });

    it('should be defined', () => {
        expect(appService).toBeDefined();
    });
});
