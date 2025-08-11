import { Test, TestingModule } from '@nestjs/testing';
import { BotParentSessionService } from '../bot.parent.session.service';
import { BotParentContextService } from '../bot.parent.context.service';
import { BotParentStartComposer } from '../composer/bot.parent.start.composer';
import { BotMessageContext } from '@interface/bot';
import { BotParentKeyboard } from '../lib/bot.parent.keyboard';
import { Message } from '@telegraf/types';
import { actionTypes, defaultMenuCommands } from '../lib/bot.parent.const';

describe('BotParentStartComposer', () => {
    let composer: BotParentStartComposer;
    const mockSessionService = {
        isUserHasABot: jest.fn(),
        isAllowAction: jest.fn(),
        addMessage: jest.fn(),
        resetAllowActions: jest.fn(),
    };
    const mockContextService = {
        setMenuCommandList: jest.fn(),
    };
    const mockCtx = {
        reply: jest.fn(),
        replyWithHTML: jest.fn(),
        i18n: { t: jest.fn() },
        msg: { from: { username: 'test_user' } },
    } as unknown as BotMessageContext;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BotParentStartComposer,
                {
                    provide: BotParentSessionService,
                    useValue: mockSessionService,
                },
                {
                    provide: BotParentContextService,
                    useValue: mockContextService,
                },
            ],
        }).compile();

        composer = module.get<BotParentStartComposer>(BotParentStartComposer);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(composer).toBeDefined();
    });

    const onStartAction = [
        {
            name: 'print message and keyboard for OLD users',
            userHasBot: true,
            allowHelp: true,
            text: 'u are OLD user',
            message_id: 3241,
        },
        {
            name: 'print message and keyboard for NEW users',
            userHasBot: false,
            allowHelp: true,
            text: 'u are NEW user',
            message_id: 2643,
        },
    ];

    onStartAction.forEach((testData) => {
        it('onStartAction => ' + testData.name, async () => {
            (jest.spyOn(BotParentKeyboard, 'staticKeyboard') as jest.Mock).mockReturnValue({ resize: jest.fn().mockReturnValue([]) });
            (jest.spyOn(BotParentKeyboard, 'inlineKeyboard') as jest.Mock).mockReturnValue([]);
            jest.spyOn(mockSessionService, 'isUserHasABot').mockReturnValue(testData.userHasBot);
            jest.spyOn(mockSessionService, 'isAllowAction').mockReturnValue(testData.allowHelp);
            jest.spyOn(mockCtx.i18n, 't').mockReturnValue(testData.text);
            jest.spyOn(mockCtx, 'reply').mockResolvedValue({ text: testData.text, message_id: testData.message_id } as Message.TextMessage);

            await composer.onStartAction(mockCtx);
            expect(mockCtx.msg.from.username).toBeDefined();
            expect(mockContextService.setMenuCommandList).toHaveBeenCalledWith(mockCtx, defaultMenuCommands);
            expect(mockSessionService.isUserHasABot).toHaveBeenCalledWith(mockCtx);
            expect(mockSessionService.isAllowAction).toHaveBeenCalledWith(mockCtx, actionTypes.SHOW_HELP);
            if (testData.userHasBot) {
                expect(BotParentKeyboard.staticKeyboard).toHaveBeenCalledWith(mockCtx.i18n, {
                    showHelp: testData.allowHelp,
                    showLang: false,
                });
            } else {
                expect(BotParentKeyboard.inlineKeyboard as jest.Mock).toHaveBeenCalledWith(mockCtx.i18n, { showHelp: testData.allowHelp });
            }
            expect(mockCtx.i18n.t).toHaveBeenCalled();
            expect(mockCtx.reply).toHaveBeenCalledWith(testData.text, []);
            expect(mockSessionService.addMessage).toHaveBeenCalledWith(mockCtx, 'start_reply', true, testData.message_id, testData.text);
        });
    });

    it('onHelpDialog => print help text', async () => {
        jest.spyOn(mockCtx.i18n, 't').mockReturnValue('help text');
        jest.spyOn(mockCtx, 'replyWithHTML').mockResolvedValue({ text: 'help text', message_id: 234243 } as Message.TextMessage);

        await composer.onHelpDialog(mockCtx);
        expect(mockSessionService.resetAllowActions).toHaveBeenCalledWith(mockCtx);
        expect(mockCtx.i18n.t).toHaveBeenCalled();
        expect(mockCtx.replyWithHTML).toHaveBeenCalledWith('help text');
        expect(mockSessionService.addMessage).toHaveBeenCalledWith(mockCtx, 'help', true, 234243, 'help text');
    });
});
