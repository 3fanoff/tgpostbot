import { Test, TestingModule } from '@nestjs/testing';
import { BotParentUpdate } from '../bot.parent.update';
import { BotParentService } from '../bot.parent.service';
import { BotParentSessionService } from '../bot.parent.session.service';
import { Telegraf } from 'telegraf';
import { Module } from '@nestjs/common';
import { BotParentContextService } from '../bot.parent.context.service';
import { BotActionManager } from '@lib/bot.action.manager';

/*const mockTelegraf = {
    bot: {},
    telegram: {
        sendMessage: jest.fn().mockResolvedValue({ message_id: 1 }),
    },
};*/

describe('BotParentUpdate', () => {
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

    let controller: BotParentUpdate;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [mockTelegrafModule()],
            controllers: [],
            providers: [
                BotParentUpdate,
                {
                    provide: BotParentSessionService,
                    useValue: {},
                },
                {
                    provide: BotParentContextService,
                    useValue: {},
                },
                {
                    provide: BotParentService,
                    useValue: {},
                },
                BotActionManager,
                ...BotParentUpdate.composers,
            ],
        }).compile();

        controller = module.get<BotParentUpdate>(BotParentUpdate);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
