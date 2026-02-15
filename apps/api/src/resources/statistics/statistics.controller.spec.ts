import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/auth.guard';

describe('StatisticsController', () => {
    let controller: StatisticsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StatisticsController],
            providers: [
                {
                    provide: StatisticsService,
                    useValue: {},
                }
            ]
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<StatisticsController>(StatisticsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
