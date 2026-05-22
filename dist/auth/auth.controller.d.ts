import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AdminRegisterDto } from './auth.dto';
import { UserRole } from '../entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    registerAdmin(dto: AdminRegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
        };
    }>;
    profile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
