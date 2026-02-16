import {Test, TestingModule} from '@nestjs/testing';
import {SystemConfigurationService} from './system-configuration.service';
import {getModelToken} from '@nestjs/mongoose';
import {ConfigField} from '../../database/schemas/system-config.schema';

describe('SystemConfigurationService', () => {
    let service: SystemConfigurationService;
    let model: any;

    beforeEach(async () => {
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        model = {
            find: jest.fn().mockReturnValue(mockQuery([])),
            insertMany: jest.fn().mockResolvedValue([]),
            updateOne: jest.fn().mockReturnValue(mockQuery({})),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SystemConfigurationService,
                {provide: getModelToken(ConfigField.name), useValue: model},
            ],
        }).compile();

        service = module.get<SystemConfigurationService>(SystemConfigurationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should set config value', (done) => {
        service.setConfigValue('enableAISummary', true).subscribe(() => {
            expect(model.updateOne).toHaveBeenCalledWith(
                {fieldName: 'enableAISummary'},
                expect.any(Object)
            );
            expect(service.config.getValue().enableAISummary).toBe(true);
            done();
        });
    });

    it('should update many config values', (done) => {
        const values = {enableAISummary: false};
        service.updateManyConfigValues(values).subscribe(() => {
            expect(model.updateOne).toHaveBeenCalledWith(
                {fieldName: 'enableAISummary'},
                expect.any(Object)
            );
            expect(service.config.getValue().enableAISummary).toBe(false);
            done();
        });
    });
});
