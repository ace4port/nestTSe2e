import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthDto } from "./dto";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("signin")
    signIn(@Body() dto: AuthDto) {
        return this.authService.signin(dto);
    }
    
    @Post("signup")
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto);
    }

}
