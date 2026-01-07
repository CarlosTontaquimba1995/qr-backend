import { UserRole } from '../../users/entities/user.entity';

export interface CurrentUser {
    id: string;
    email: string;
    role: UserRole;
}
