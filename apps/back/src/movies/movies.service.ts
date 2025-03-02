import { Injectable } from '@nestjs/common';

@Injectable()
export class MoviesService {
    create() {
        return 'This action adds a new movie';
    }

    findAll() {
        return `This action returns all movies`;
    }

    findOne(id: number) {
        return `This action returns a #${id} movie`;
    }

    update(id: number) {
        return `This action updates a #${id} movie`;
    }

    remove(id: number) {
        return `This action removes a #${id} movie`;
    }
}
