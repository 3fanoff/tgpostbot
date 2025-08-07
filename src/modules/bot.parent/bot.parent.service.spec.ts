import { Test, TestingModule } from '@nestjs/testing';
import { BotParentService } from './bot.parent.service';

import { InvalidArgumentException } from '@decorator/bot.decorator';
import { BotDto } from '@dto/bot.dto';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BotUserEntity } from '@model/bot.user.entity';
import { BotEntity } from '@model/bot.entity';
import { I18nService } from 'nestjs-i18n';
import { HttpService } from '@nestjs/axios';
import { BotGetMeConverter } from "@converter/bot.get.me.converter";

/* eslint-disable */
describe('BotParentService', () => {
    let service: BotParentService;
    const mockAxiosService = {
        axiosRef: {
            get: jest.fn(),
        }
    };

    const mockUserRepository = {
        findOneBy: jest.fn(),
        exists: jest.fn(),
        create: jest.fn(),
    }

    const validAxiosResponse = {
        data: {
            ok: true,
            result: {
                id: 567659876,
                is_bot: true,
                username: 'some_bot_name',
            },
        },
        status: 200,
    };

    const falsyAxiosResponse = { data: {...validAxiosResponse.data}, status: 200 };
    falsyAxiosResponse.data.ok = false;

    const validNotBotAxiosResponse = { data: { ok: true, result: {...validAxiosResponse.data.result} }, status: 200}
    validNotBotAxiosResponse.data.result.is_bot = false;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BotParentService,
                {
                    provide: HttpService,
                    useValue: mockAxiosService,
                },
                {
                    provide: I18nService,
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(BotUserEntity),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(BotEntity),
                    useValue: {},
                },
                BotGetMeConverter,
                ...BotGetMeConverter.providers,
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
            name: 'should return valid botDTO with token',
            token: '2754537916:AAHgXFLoUQVBjHWQYnedfNPsydVRlRuwUfo', //non-existent token in correct format
            axiosResponse: validAxiosResponse,
        },
        {
            name: 'should return InvalidArgumentException',
            token: 'sdfsdfsfsfsfd',
            axiosResponse: validAxiosResponse,
        },
        {
            name: 'should return UnauthorizedException',
            token: '2754537916:AAHgXFLoUQVBjHWQYnedfNPsydVRlRuwUfo', //non-existent token in correct format
            axiosResponse: falsyAxiosResponse,
        },
        {
            name: 'should return valid botDTO without token',
            token: '2754537916:AAHgXFLoUQVBjHWQYnedfNPsydVRlRuwUfo', //non-existent token in correct format
            axiosResponse: validNotBotAxiosResponse,
        }
    ];
    const hasUser = [
        {
            name: "true : user in db",
            userId: 5754567616,
            inDB: true,
        },
        {
            name: "false : user is not in db",
            userId: 9754567616,
            inDB: false,
        },
    ]

    dataForBot.forEach((test) => {
        it(`getDataForBot => ${test.name}`, async () => {
            jest.spyOn(mockAxiosService.axiosRef, 'get').mockResolvedValue(test.axiosResponse);
            const result_dto = new BotDto();
            result_dto.id = test.axiosResponse.data.result.id;
            result_dto.name = test.axiosResponse.data.result.username;
            result_dto.isBot = test.axiosResponse.data.result.is_bot
            if (result_dto.isBot) {
                result_dto.token = test.token;
            }
            try {
                const result = await service.getDataForBot(test.token);
                expect(mockAxiosService.axiosRef.get).toHaveBeenCalled();
                expect(result).toHaveProperty('id', test.axiosResponse.data.result.id);
                expect(result).toMatchObject<BotDto>(result_dto);
            } catch (e) {
                if (!test.axiosResponse.data.ok) {
                    expect(e).toBeInstanceOf(UnauthorizedException);
                } else {
                    expect(e).toBeInstanceOf(InvalidArgumentException);
                }
            }
        });
    });

    hasUser.forEach(test => {
        it(`hasUser => ${test.name}`, async () => {
            jest.spyOn(mockUserRepository, "exists").mockResolvedValue(test.inDB);
            const hasUser = await service.hasUser(test.userId);

            expect(mockUserRepository.exists).toHaveBeenCalledWith({ where: { id: test.userId }  });
            expect(hasUser).toEqual<boolean>(test.inDB);
        })
    })

});
