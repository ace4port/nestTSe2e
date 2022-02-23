import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { editUserDto, UserService } from './user.service';


@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('me')
    getUser(@GetUser() user: User) {
        return user;
    } 

    @Patch()
    editUser(@GetUser('id') userId: number, @Body() dto: editUserDto) {
        return this.userService.editUser(userId, dto);
    }    
}
