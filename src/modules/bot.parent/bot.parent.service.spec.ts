import { Test, TestingModule } from '@nestjs/testing';
import { BotParentService, TelegramGetMeResponse } from './bot.parent.service';
import { AxiosService } from 'nestjs-axios-promise';
import { InvalidArgumentException } from '@decorator/bot.decorator';

describe('BotParentService', () => {
    let service: BotParentService;
    const mockAxiosService = {
        get: jest.fn(),
    };

    const validAxiosResponse = {
        data: {
            ok: true,
            result: {
                is_bot: true,
                username: 'some_bot_name',
            },
        },
        status: 200,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BotParentService,
                {
                    provide: AxiosService,
                    useValue: mockAxiosService,
                },
            ],
        }).compile();

        service = module.get<BotParentService>(BotParentService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    const dataForBot = [
        {
            name: 'should return valid bot data',
            token: '2754537916:AAHgXFLoUQVBjHWQYnedfNPsydVRlRuwUfo',
            axiosResponse: validAxiosResponse,
        },
        {
            name: 'should return Exception',
            token: 'sdfsdfsfsfsfd',
            axiosResponse: {},
        },
    ];

    dataForBot.forEach((test) => {
        it(`getDataForBot => ${test.name}`, async () => {
            jest.spyOn(mockAxiosService, 'get').mockResolvedValue(test.axiosResponse);

            try {
                const result = await service.getDataForBot(test.token);
                expect(mockAxiosService.get).toHaveBeenCalled();
                expect(result).toHaveProperty('ok', true);
                expect(result).toMatchObject<TelegramGetMeResponse>(validAxiosResponse.data);
                expect(result).toHaveProperty('result.is_bot', true);
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidArgumentException);
            }
        });
    });
});
