export declare enum UserRole {
    ADMIN = "admin",
    VIEWER = "viewer"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
