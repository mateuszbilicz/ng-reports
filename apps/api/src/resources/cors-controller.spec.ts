import {Test, TestingModule} from '@nestjs/testing';
import {CORSController} from './cors-controller';
import {SystemConfigurationService} from './system-configuration/system-configuration.service';
import {getModelToken} from '@nestjs/mongoose';
import {Environment} from '../database/schemas/environment.schema';
import {BehaviorSubject} from 'rxjs';

describe('CORSController', () => {
    let service: CORSController;
    let environmentModel: any;
    let systemConfigurationService: any;

    beforeEach(async () => {
        systemConfigurationService = {
            config: new BehaviorSubject({allowReportsIncomeFromUnknownSources: true}),
        };
        environmentModel = {
            find: jest.fn().mockResolvedValue([]),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CORSController,
                {provide: SystemConfigurationService, useValue: systemConfigurationService},
                {provide: getModelToken(Environment.name), useValue: environmentModel},
            ],
        }).compile();

        service = module.get<CORSController>(CORSController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return default cors options', () => {
        const callback = jest.fn();
        service.dynamicCorsController({}, callback);
        expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({origin: '*'}));
    });

    it('should update cors when config changes', async () => {
        environmentModel.find.mockResolvedValue([{urls: [{url: 'http://test.com'}]}]);
        systemConfigurationService.config.next({allowReportsIncomeFromUnknownSources: false});

        // Wait for async updateCors
        await new Promise(resolve => setTimeout(resolve, 0));

        const callback = jest.fn();
        service.dynamicCorsController({}, callback);
        expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({
            origin: expect.arrayContaining(['http://test.com'])
        }));
    });
});
