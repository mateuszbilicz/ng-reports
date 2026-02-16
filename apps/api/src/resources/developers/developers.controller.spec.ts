import { Test, TestingModule } from '@nestjs/testing';
import { DevelopersController } from './developers.controller';
import * as fs from 'node:fs';

jest.mock('node:fs', () => ({
  readdirSync: jest.fn(),
  createReadStream: jest.fn(),
}));

describe('DevelopersController', () => {
  let controller: DevelopersController;

  beforeEach(async () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['ng-reports-collector-1.0.0.tgz']);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevelopersController],
    }).compile();

    controller = module.get<DevelopersController>(DevelopersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return streamable file', () => {
    (fs.createReadStream as jest.Mock).mockReturnValue({ pipe: jest.fn() });
    const result = controller.getLibFile();
    expect(result).toBeDefined();
    expect(fs.createReadStream).toHaveBeenCalled();
  });
});
