import { Test, TestingModule } from '@nestjs/testing';
import { BotChildService } from '../bot.child.service';

describe('BotChildService', () => {
    let service: BotChildService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BotChildService],
        }).compile();

        service = module.get<BotChildService>(BotChildService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
