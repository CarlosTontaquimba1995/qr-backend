import { Controller, Post, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER'
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be at least 8 characters'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User already exists',
        error: 'Conflict'
      }
    }
  })
  @ApiBody({
    description: 'User registration data',
    type: RegisterDto,
    examples: {
      user: {
        summary: 'User registration example',
        value: {
          email: 'user@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
    examples: {
      user: {
        summary: 'User login example',
        value: {
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('Login attempt for:', loginDto.email);
      const result = await this.authService.login(loginDto);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}