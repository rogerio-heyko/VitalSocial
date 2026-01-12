import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function errorMiddleware(
    err: Error,
    request: Request,
    response: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        return response.status(err.statusCode).json({
            status: 'erro',
            mensagem: err.message,
        });
    }

    console.error(err);

    return response.status(500).json({
        status: 'erro',
        mensagem: 'Erro interno do servidor',
    });
}
