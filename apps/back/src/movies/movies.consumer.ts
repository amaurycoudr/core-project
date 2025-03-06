import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { addMovieFromTmdb, AddMovieFromTmdb, MOVIE_JOBS, MOVIE_QUEUE, MovieJob } from './movies.jobs';
import { MoviesService } from './movies.service';

@Injectable()
@Processor({ name: MOVIE_QUEUE })
export class MovieConsumer extends WorkerHost {
    private readonly logger = new Logger(MovieConsumer.name, { timestamp: true });

    constructor(private readonly movieService: MoviesService) {
        super();
    }
    async process(job: Job<any, any, MovieJob>): Promise<any> {
        if (job.name === MOVIE_JOBS.ADD_MOVIE_FROM_TMDB) {
            const jobData = addMovieFromTmdb.parse(job.data);
            this.logger.log(`${job.name} (ID=${jobData.tmdbId}) START`);
            await this.addMovieFromTmdb(jobData);
            this.logger.log(`${job.name} (ID=${jobData.tmdbId}) FINISHED`);
        }

        job.progress = 100;

        return;
    }

    @OnWorkerEvent('closed')
    on() {
        this.logger.log('closed');
    }
    @OnWorkerEvent('failed')
    onError(args: { name: string; failedReason: string; prev?: string }) {
        this.logger.error(`Error on job ${args.name}: ${args.failedReason}`);
    }

    async addMovieFromTmdb(job: AddMovieFromTmdb) {
        return await this.movieService.addMovieFromTmdb(job.tmdbId, { refresh: job.refresh });
    }
}
