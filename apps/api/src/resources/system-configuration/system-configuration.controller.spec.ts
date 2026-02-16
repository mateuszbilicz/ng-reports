import {Test, TestingModule} from '@nestjs/testing';
import {SystemConfigurationController} from './system-configuration.controller';
import {SystemConfigurationService} from './system-configuration.service';
import {of} from 'rxjs';
import {JwtService} from '@nestjs/jwt';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '../auth/auth.guard';

describe('SystemConfigurationController', () => {
    let controller: SystemConfigurationController;
    let service: any;

    beforeEach(async () => {
        service = {
            getConfigRaw: jest.fn(),
            updateManyConfigValues: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [SystemConfigurationController],
            providers: [
                {provide: SystemConfigurationService, useValue: service},
                {provide: AuthGuard, useValue: {canActivate: () => true}},
                {provide: JwtService, useValue: {verifyAsync: jest.fn()}},
                {provide: Reflector, useValue: {getAllAndOverride: jest.fn()}},
            ],
        }).compile();

        controller = module.get<SystemConfigurationController>(SystemConfigurationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get config', () => {
        service.getConfigRaw.mockReturnValue({enableAISummary: true});
        expect(controller.getConfig()).toEqual({enableAISummary: true});
    });

    it('should update config', () => {
        const values = {enableAISummary: false};
        service.updateManyConfigValues.mockReturnValue(of({}));
        controller.updateManyConfigValues(values);
        expect(service.updateManyConfigValues).toHaveBeenCalledWith(values);
    });
});
