import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: Awaited<ReturnType<AppController['handler']>>;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = await app.get<AppController>(AppController).handler();
    });

    describe('root', () => {
        it('should return "Hello World!"', async () => {
            const test = await appController.getHealth({ headers: {} });

            expect(test.status).toBe(200);
            if (test.status === 200) {
                expect(test.body.status).toBe('Hello World!');
            }
        });
    });
});
