import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ActiveUser, ActiveUserData } from 'src/iam/decorators/active-user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create() {
        return this.userService.create();
    }

    @Get()
    findOne(@ActiveUser() { id }: ActiveUserData) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string) {
        return this.userService.update(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
