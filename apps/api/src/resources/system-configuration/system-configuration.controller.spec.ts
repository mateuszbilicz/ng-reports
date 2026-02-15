import {Test, TestingModule} from '@nestjs/testing';
import {SystemConfigurationController} from './system-configuration.controller';

describe('SystemConfigurationController', () => {
    let controller: SystemConfigurationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SystemConfigurationController],
        }).compile();

        controller = module.get<SystemConfigurationController>(SystemConfigurationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
