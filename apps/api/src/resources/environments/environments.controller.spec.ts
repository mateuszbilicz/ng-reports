import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentsController } from './environments.controller';
import { EnvironmentsService } from './environments.service';
import { AuthGuard } from '../auth/auth.guard';

describe('EnvironmentsController', () => {
    let controller: EnvironmentsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EnvironmentsController],
            providers: [
                {
                    provide: EnvironmentsService,
                    useValue: {},
                }
            ]
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<EnvironmentsController>(EnvironmentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
