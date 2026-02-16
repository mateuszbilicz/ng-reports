import {Test, TestingModule} from '@nestjs/testing';
import {StatisticsController} from './statistics.controller';
import {StatisticsService} from './statistics.service';
import {of} from 'rxjs';
import {JwtService} from '@nestjs/jwt';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '../auth/auth.guard';

describe('StatisticsController', () => {
    let controller: StatisticsController;
    let service: any;

    beforeEach(async () => {
        service = {
            getStatistics: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [StatisticsController],
            providers: [
                {provide: StatisticsService, useValue: service},
                {provide: AuthGuard, useValue: {canActivate: () => true}},
                {provide: JwtService, useValue: {verifyAsync: jest.fn()}},
                {provide: Reflector, useValue: {getAllAndOverride: jest.fn()}},
            ],
        }).compile();

        controller = module.get<StatisticsController>(StatisticsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get statistics', () => {
        const dateFrom = new Date();
        const dateTo = new Date();
        service.getStatistics.mockReturnValue(of({totalReports: 0, samples: []}));

        controller.getStatistics('day', dateFrom, dateTo);
        expect(service.getStatistics).toHaveBeenCalledWith('day', dateFrom, dateTo, undefined, undefined, undefined, undefined, undefined);
    });
});
