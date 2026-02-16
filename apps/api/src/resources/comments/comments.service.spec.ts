jest.mock('nanoid', () => ({nanoid: () => 'id'}));
import {Test, TestingModule} from '@nestjs/testing';
import {CommentsService} from './comments.service';
import {getModelToken} from '@nestjs/mongoose';
import {Comment} from '../../database/schemas/comment.schema';
import {Report} from '../../database/schemas/report.schema';
import {User} from '../../database/schemas/user.schema';
import {AiService} from '../ai/ai.service';
import {UsersService} from '../users/users.service';
import {of} from 'rxjs';

describe('CommentsService', () => {
    let service: CommentsService;
    let commentModel: any;
    let reportModel: any;
    let userModel: any;
    let aiService: any;
    let usersService: any;

    beforeEach(async () => {
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        commentModel = jest.fn().mockImplementation((data) => ({
            ...data,
            save: jest.fn().mockResolvedValue({_id: 'cid', ...data}),
        }));
        (commentModel as any).find = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue(mockQuery([])),
            exec: jest.fn().mockReturnValue(Promise.resolve([])),
        });
        (commentModel as any).findOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue(mockQuery({_id: 'cid', content: 'C1'})),
            exec: jest.fn().mockReturnValue(Promise.resolve({_id: 'cid', content: 'C1'})),
        });
        (commentModel as any).findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue(mockQuery({_id: 'cid', content: 'C1', author: {username: 'user1'}})),
            exec: jest.fn().mockReturnValue(Promise.resolve({_id: 'cid', content: 'C1', author: {username: 'user1'}})),
        });
        (commentModel as any).findOneAndUpdate = jest.fn().mockReturnValue(mockQuery(null));
        (commentModel as any).findOneAndDelete = jest.fn().mockReturnValue(mockQuery(null));
        (commentModel as any).countDocuments = jest.fn().mockReturnValue(mockQuery(0));
        (commentModel as any).findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery({_id: 'cid', content: 'C1'}));

        reportModel = {
            findOne: jest.fn().mockReturnValue(mockQuery({_id: 'rid', title: 'R1', comments: []})),
            updateOne: jest.fn().mockReturnValue(mockQuery({})),
        };

        userModel = {
            findOne: jest.fn().mockReturnValue(mockQuery({_id: 'uid', username: 'user1'})),
        };

        aiService = {
            generateSummary: jest.fn().mockReturnValue(of('AI Summary')),
            processReport: jest.fn().mockReturnValue(of({severity: 1, summary: 'AI Summary'})),
        };

        usersService = {
            _aiAccountId: 'ai-uid',
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {provide: getModelToken(Comment.name), useValue: commentModel},
                {provide: getModelToken(Report.name), useValue: reportModel},
                {provide: getModelToken(User.name), useValue: userModel},
                {provide: AiService, useValue: aiService},
                {provide: UsersService, useValue: usersService},
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a comment', (done) => {
        const user = {_id: 'uid', username: 'user1'};
        const dto = {reportId: 'r1', content: 'C1'};

        service.create(dto as any, user.username).subscribe((result) => {
            expect(result.content).toBe('C1');
            expect(commentModel).toHaveBeenCalled();
            expect(reportModel.updateOne).toHaveBeenCalled();
            done();
        });
    });

    it('should generate AI summary', (done) => {
        const user = {_id: 'uid', username: 'user1'};
        const req = {reportId: 'r1'};

        service.generateSummary(req, user.username).subscribe((result) => {
            // Check if result content contains the summary
            expect(result.content).toContain('AI Summary');
            expect(aiService.processReport).toHaveBeenCalledWith('r1');
            done();
        });
    });
});
