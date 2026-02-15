import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigurationService } from './system-configuration.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigField } from '../../database/schemas/system-config.schema';

describe('SystemConfigurationService', () => {
    let service: SystemConfigurationService;

    const mockConfigFieldModel = {
        find: vi.fn().mockResolvedValue([]),
        insertMany: vi.fn().mockResolvedValue([]),
        updateOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SystemConfigurationService,
                {
                    provide: getModelToken(ConfigField.name),
                    useValue: mockConfigFieldModel,
                },
            ],
        }).compile();

        service = module.get<SystemConfigurationService>(
            SystemConfigurationService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
