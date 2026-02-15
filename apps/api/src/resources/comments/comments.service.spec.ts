import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';

vi.mock('nanoid', () => ({
    nanoid: () => 'mock-id',
}));
import { getModelToken } from '@nestjs/mongoose';
import { Comment } from '../../database/schemas/comment.schema';
import { Report } from '../../database/schemas/report.schema';
import { User } from '../../database/schemas/user.schema';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';

describe('CommentsService', () => {
    let service: CommentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {
                    provide: getModelToken(Comment.name),
                    useValue: {},
                },
                {
                    provide: getModelToken(Report.name),
                    useValue: {},
                },
                {
                    provide: getModelToken(User.name),
                    useValue: {},
                },
                {
                    provide: AiService,
                    useValue: {},
                },
                {
                    provide: UsersService,
                    useValue: {
                        _aiAccountId: 'mock-ai-account-id',
                    },
                },
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

