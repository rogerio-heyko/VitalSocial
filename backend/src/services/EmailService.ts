import nodemailer, { Transporter } from 'nodemailer';

class EmailService {
    private client: Transporter | null = null;

    constructor() {
        // Inicializa o cliente SMTP
        this.createClient();
    }

    private async createClient() {
        try {
            const account = await nodemailer.createTestAccount();

            this.client = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass,
                },
            });

            console.log('📧 [EmailService] Cliente Ethereal iniciado!');
        } catch (err) {
            console.error('❌ [EmailService] Erro ao criar cliente de e-mail:', err);
        }
    }

    async sendVerificationEmail(to: string, token: string) {
        if (!this.client) {
            await this.createClient();
        }

        const message = await this.client!.sendMail({
            from: 'Teleios <noreply@teleios.com>',
            to,
            subject: 'Confirme seu cadastro - Teleios',
            text: `Olá! Seu código de verificação é: ${token}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a90e2;">Bem-vindo à Teleios!</h2>
                <p>Obrigado por se cadastrar. Para garantir a segurança da nossa comunidade, precisamos confirmar seu e-mail.</p>
                <p>Seu código de verificação é:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${token}</h1>
                <p>Se preferir, clique no link abaixo:</p>
                <a href="http://localhost:3000/auth/verify?token=${token}" style="display: block; background: #4a90e2; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px;">Confirmar E-mail</a>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">Se você não criou esta conta, ignore este e-mail.</p>
            </div>
            `,
        });

        console.log('📨 E-mail enviado: %s', message.messageId);
        console.log('🔑 Token: %s', token);
        console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(message));
        console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(message));
    }
    async sendRecoveryEmail(to: string, token: string) {
        if (!this.client) {
            await this.createClient();
        }

        const message = await this.client!.sendMail({
            from: 'Vital.Social <noreply@vitalsocial.com>',
            to,
            subject: 'Recuperação de Senha - Vital.Social',
            text: `Seu código de recuperação é: ${token}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #EF5825;">Recuperação de Senha</h2>
                <p>Recebemos uma solicitação para redefinir sua senha.</p>
                <p>Seu código de recuperação é:</p>
                <h1 style="background: #E0F2F1; padding: 10px; text-align: center; letter-spacing: 5px; color: #00A9A5;">${token}</h1>
                <p>Use este código no App para criar uma nova senha.</p>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">Se não foi você, ignore este e-mail.</p>
            </div>
            `,
        });

        console.log('📨 E-mail de recuperação enviado: %s', message.messageId);
        console.log('🔑 Token de Recuperação: %s', token);
        console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(message));
    }
}

export default new EmailService();
