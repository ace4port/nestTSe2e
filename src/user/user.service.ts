import { Injectable } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class editUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    name?: string;

    // pw ?
}

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }
    
    async editUser(userId: number, dto: editUserDto) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: dto });

        delete user.password;
        return user;
    }
}
