import { Test, TestingModule } from '@nestjs/testing';
import { BotParentController } from './bot.parent.controller';
import { BotParentService } from '@/modules/bot.parent/bot.parent.service';
import { BotParentSessionService } from '@/modules/bot.parent/bot.parent.session.service';
import { Telegraf } from 'telegraf';
import { Module } from '@nestjs/common';

/*const mockTelegraf = {
    bot: {},
    telegram: {
        sendMessage: jest.fn().mockResolvedValue({ message_id: 1 }),
    },
};*/

describe('BotParentController', () => {
    const mockTelegrafModule = () => {
        jest.mock('telegraf');

        @Module({
            providers: [
                {
                    provide: 'PARENT_POST_BOTBot',
                    useValue: new Telegraf('token') as jest.Mocked<Telegraf>,
                },
            ],
            exports: ['PARENT_POST_BOTBot'],
        })
        class MockTelegrafModule {}
        return MockTelegrafModule;
    };

    let controller: BotParentController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [mockTelegrafModule()],
            controllers: [BotParentController],
            providers: [
                {
                    provide: BotParentService,
                    useValue: {},
                },
                {
                    provide: BotParentSessionService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<BotParentController>(BotParentController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
