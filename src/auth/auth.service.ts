import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon from 'argon2'

import { AuthDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
            },  
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials - no such email');
        }

        // check password
        const valid = await argon.verify(user.password, dto.password);
        if (!valid) {
            throw new ForbiddenException('Invalid credentials');
        }
        
        return this.singin_token(user.id, user.email);
    }
    
    async signup(dto: AuthDto) {
        // generate pw hash
        const hash = await argon.hash(dto.password);

        try {
            // save user in db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                }
            })
            // return user
            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                throw new ForbiddenException('Email already exists');
            }
            throw error;
        }
        }

    }

    async singin_token(userId: number, email: string): Promise<{access_token: string }> {
        const payload = {sub: userId, email}
        const secret = this.config.get('JWT_SECRET');
        
        const token = await this.jwt.signAsync(payload, {expiresIn: '45min', secret: secret});
        return { access_token: token };

    }

}