import { Module } from '@nestjs/common';
import { TmdbModule } from 'src/tmdb/tmdb.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieConsumer } from './movies.consumer';
import { BullModule } from '@nestjs/bullmq';
import { MOVIE_QUEUE } from './movies.jobs';

@Module({
    imports: [TmdbModule, BullModule.registerQueue({ name: MOVIE_QUEUE })],
    controllers: [MoviesController],
    providers: [MoviesService, MovieConsumer],
})
export class MoviesModule {}
