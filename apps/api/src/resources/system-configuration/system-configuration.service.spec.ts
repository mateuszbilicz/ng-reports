import {Test, TestingModule} from '@nestjs/testing';
import {SystemConfigurationService} from './system-configuration.service';

describe('SystemConfigurationService', () => {
    let service: SystemConfigurationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SystemConfigurationService],
        }).compile();

        service = module.get<SystemConfigurationService>(
            SystemConfigurationService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
