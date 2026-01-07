import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';

async function createAdmin() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const userService = app.get(UserService);

    const adminData = {
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        cedula: '1002323245',
        role: UserRole.ADMIN
    };

    try {
        const existingAdmin = await userService.findByEmail(adminData.email);

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            console.log(`📧 Email: ${adminData.email}`);
            if (existingAdmin.role === UserRole.ADMIN) {
                console.log('👑 Role: Admin');
            } else {
                existingAdmin.role = UserRole.ADMIN;
                await userService.update(existingAdmin.id, { role: UserRole.ADMIN });
                console.log('🔄 Updated existing user to Admin role');
            }
            console.log('💡 To reset the password, use the forgot password feature.');
        } else {
            await authService.register(adminData);
            console.log('✅ Admin user created successfully');
            console.log(`📧 Email: ${adminData.email}`);
            console.log(`🔑 Password: ${adminData.password} (please change it after first login)`);
        }
    } catch (error) {
        console.error('❌ An error occurred:', error.message);
        if (error.response) {
            console.error('Error details:', error.response);
        }
    } finally {
        await app.close();
        process.exit(0);
    }
}

createAdmin().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});