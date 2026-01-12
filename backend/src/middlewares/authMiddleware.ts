import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

interface TokenPayload {
    iat: number;
    exp: number;
    sub: string;
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError('Token JWT não informado.', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, process.env.JWT_SECRET || 'default');
        const { sub } = decoded as TokenPayload;

        // Adiciona o ID do usuário ao objeto request para uso posterior
        req.user = {
            id: sub,
        };

        return next();
    } catch (err) {
        console.error('Erro na verificação do token:', err);
        throw new AppError('Token JWT inválido.', 401);
    }
}
