import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CreateAdminService } from './create-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [CreateAdminService],
  exports: [CreateAdminService],
})
export class ScriptsModule {}
