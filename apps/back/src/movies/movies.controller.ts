import { Controller } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { contract } from '@repo/contract';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';

@Controller()
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @TsRestHandler(contract.movie)
    async handler() {
        return tsRestHandler(contract.movie, {
            search: async ({ query: { page, query } }) => {
                const result = await this.moviesService.search(query, { page });
                return { body: result, status: 200 };
            },
        });
    }
}
