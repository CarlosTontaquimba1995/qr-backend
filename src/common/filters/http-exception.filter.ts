import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserPayload } from '../../auth/interfaces/user-payload.interface';

declare module 'express' {
    interface Request {
        user?: UserPayload;
    }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const errorResponse: any = exception.getResponse();

        const user = request.user;
        console.log('User in exception filter:', user);

        let message = 'Ha ocurrido un error inesperado';
        const errorName = exception.name.replace('Exception', '') || 'Error';

        const getUserRole = (user: any): string => {
            if (!user) return 'sin rol definido';
            return user.role ||
                (user.user && user.user.role) ||
                (user.roles && user.roles[0]) ||
                'sin rol definido';
        };

        const userRole = getUserRole(user);

        console.log("ERROR MESSAGE", errorResponse);

        switch (status) {
            case 409:
                if (errorResponse && typeof errorResponse === 'object') {
                    if (errorResponse.message === 'Email already in use') {
                        message = 'El correo electrónico ya está en uso';
                    } else if (errorResponse.message?.includes('email') ||
                        errorResponse.message?.includes('correo')) {
                        message = 'El correo electrónico ya está registrado. Por favor, utilice otro correo o inicie sesión.';
                    } else if (errorResponse.message === 'Cedula already in use' ||
                        errorResponse.message?.includes('cedula') ||
                        errorResponse.message?.includes('cédula')) {
                        message = 'La cédula ya está registrada. Por favor, verifique sus datos.';
                    } else {
                        message = 'Conflicto: El recurso ya existe o hay un problema con los datos proporcionados.';
                    }
                } else {
                    message = 'Conflicto: El recurso que intenta crear ya existe';
                }
                break;
            case 403:
                if (user) {
                    message = `Acceso denegado. Su rol actual (${userRole}) no tiene permiso para acceder a este recurso.`;
                } else {
                    message = 'Acceso denegado. Debe iniciar sesión para acceder a este recurso.';
                }
                break;
            case 401:
                message = 'No autorizado. Por favor, verifique sus credenciales.';
                break;
            case 404:
                message = 'El recurso solicitado no fue encontrado.';
                break;
            case 400:
                if (errorResponse && typeof errorResponse === 'object' && 'message' in errorResponse) {
                    if (Array.isArray(errorResponse.message)) {
                        message = 'Error de validación: ' + errorResponse.message.join(', ');
                    } else if (typeof errorResponse.message === 'string') {
                        message = errorResponse.message;
                    }
                } else {
                    message = 'Solicitud incorrecta. Verifique los datos enviados.';
                }
                break;
            case 422:
                message = 'Error de validación. Por favor, verifique los datos del formulario.';
                break;
            default:
                if (errorResponse && typeof errorResponse === 'object' && 'message' in errorResponse) {
                    message = Array.isArray(errorResponse.message)
                        ? errorResponse.message.join(', ')
                        : errorResponse.message;
                } else if (typeof errorResponse === 'string') {
                    message = errorResponse;
                }
        }

        const responseBody: any = {
            success: false,
            message: message,
            error: errorName,
            statusCode: status,
            path: request.url,
            timestamp: new Date().toISOString()
        };

        if ((status === 422 || status === 409) && errorResponse && typeof errorResponse === 'object') {
            if (errorResponse.message && !message.includes(errorResponse.message)) {
                responseBody.details = errorResponse.message;
            }
            if (errorResponse.error === 'Bad Request' && Array.isArray(errorResponse.message)) {
                responseBody.errors = errorResponse.message;
            }
        }

        response.status(status).json(responseBody);
    }
}
