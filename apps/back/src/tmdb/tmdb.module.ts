import { Module } from '@nestjs/common';
import { TmdbService } from './tmdb.service';

@Module({
    providers: [TmdbService],
})
export class TmdbModule {}
