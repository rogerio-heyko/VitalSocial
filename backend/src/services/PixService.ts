import { ConfigService } from './ConfigService';

function crc16(payload: string): string {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) > 0) crc = (crc << 1) ^ 0x1021;
            else crc = crc << 1;
        }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

export class PixService {
    private configService = new ConfigService();

    async gerarPayloadPix(valor: number, txId: string = 'TELEIOS01'): Promise<string> {
        const chavePix = await this.configService.getConfig('PIX_KEY');
        if (!chavePix) throw new Error('Chave PIX não configurada no sistema.');

        const valorStr = valor.toFixed(2);

        // Payload Format (Simplificado - Padrão BACEN)
        const payload = [
            '000201', // Payload Format Indicator
            '26580014BR.GOV.BCB.PIX', // Merchant Account Information
            `01${chavePix.length.toString().padStart(2, '0')}${chavePix}`,
            '52040000', // Merchant Category Code (0000 = Not def)
            '5303986', // Transaction Currency (BRL)
            `54${valorStr.length.toString().padStart(2, '0')}${valorStr}`, // Transaction Amount
            '5802BR', // Country Code
            '5913Inscrito Teleios', // Merchant Name (Truncated for safety)
            '6008Brasilia', // Merchant City
            `62${(txId.length + 4).toString().padStart(2, '0')}05${txId.length.toString().padStart(2, '0')}${txId}`, // Additional Data Field Template
            '6304' // CRC16 Placeholder
        ].join('');

        const crc = crc16(payload);
        return payload + crc;
    }
}
