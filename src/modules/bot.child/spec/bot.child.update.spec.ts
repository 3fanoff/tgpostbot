import { Test, TestingModule } from '@nestjs/testing';
import { BotChildUpdate } from '../bot.child.update';
import { BotChildService } from '../bot.child.service';

describe('BotChildUpdate', () => {
    let controller: BotChildUpdate;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BotChildUpdate],
            providers: [BotChildService],
        }).compile();

        controller = module.get<BotChildUpdate>(BotChildUpdate);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
