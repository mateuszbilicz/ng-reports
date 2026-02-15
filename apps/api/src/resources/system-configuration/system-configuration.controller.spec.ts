import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigurationController } from './system-configuration.controller';
import { SystemConfigurationService } from './system-configuration.service';
import { AuthGuard } from '../auth/auth.guard';

describe('SystemConfigurationController', () => {
    let controller: SystemConfigurationController;

    const mockService = {
        getConfigRaw: vi.fn().mockReturnValue({}),
        setConfigValue: vi.fn().mockReturnValue({ pipe: vi.fn() }),
        updateManyConfigValues: vi.fn().mockReturnValue({ pipe: vi.fn() }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SystemConfigurationController],
            providers: [
                {
                    provide: SystemConfigurationService,
                    useValue: mockService,
                }
            ]
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<SystemConfigurationController>(SystemConfigurationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
