import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto, RegisterDto, AdminRegisterDto } from './auth.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    private createUser;
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
    profile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
