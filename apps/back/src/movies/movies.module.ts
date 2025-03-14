import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TmdbModule } from "src/tmdb/tmdb.module";
import { MovieConsumer } from "./movies.consumer";
import { MoviesController } from "./movies.controller";
import { MOVIE_QUEUE } from "./movies.jobs";
import { MoviesService } from "./movies.service";

@Module({
	imports: [TmdbModule, BullModule.registerQueue({ name: MOVIE_QUEUE })],
	controllers: [MoviesController],
	providers: [MoviesService, MovieConsumer],
})
export class MoviesModule {}
