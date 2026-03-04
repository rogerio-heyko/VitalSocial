import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawPlan = `
FASE 1: A Identidade e o Amor (João e Cartas da Graça)
Foco: Quem é Jesus e quem você é nEle.
Dia 1: Sl 1, João 1, Efésios 1
Dia 2: Sl 2, João 2, Efésios 2
Dia 3: Sl 3, João 3, Efésios 3
Dia 4: Sl 4, João 4, Efésios 4
Dia 5: Sl 5, João 5, Efésios 5
Dia 6: Sl 6, João 6, Efésios 6
Dia 7: Sl 7, João 7, Filipenses 1
Dia 8: Sl 8, João 8, Filipenses 2
Dia 9: Sl 9, João 9, Filipenses 3
Dia 10: Sl 10, João 10, Filipenses 4
Dia 11: Sl 11, João 11, Colossenses 1
Dia 12: Sl 12, João 12, Colossenses 2
Dia 13: Sl 13, João 13, Colossenses 3
Dia 14: Sl 14, João 14, Colossenses 4
Dia 15: Sl 15, João 15, 1 João 1
Dia 16: Sl 16, João 16, 1 João 2
Dia 17: Sl 17, João 17, 1 João 3
Dia 18: Sl 18, João 18, 1 João 4
Dia 19: Sl 19, João 19, 1 João 5
Dia 20: Sl 20, João 20, 2 João e 3 João
Dia 21: Sl 21, João 21, Judas 1

FASE 2: Ação e Serviço (Marcos e Gálatas)
Foco: Jesus como Servo e a liberdade da Lei.
Dia 22: Sl 22, Marcos 1, Gálatas 1
Dia 23: Sl 23, Marcos 2, Gálatas 2
Dia 24: Sl 24, Marcos 3, Gálatas 3
Dia 25: Sl 25, Marcos 4, Gálatas 4
Dia 26: Sl 26, Marcos 5, Gálatas 5
Dia 27: Sl 27, Marcos 6, Gálatas 6
Dia 28: Sl 28, Marcos 7, 1 Tessalonicenses 1
Dia 29: Sl 29, Marcos 8, 1 Tessalonicenses 2
Dia 30: Sl 30, Marcos 9, 1 Tessalonicenses 3
Dia 31: Sl 31, Marcos 10, 1 Tessalonicenses 4
Dia 32: Sl 32, Marcos 11, 1 Tessalonicenses 5
Dia 33: Sl 33, Marcos 12, 2 Tessalonicenses 1
Dia 34: Sl 34, Marcos 13, 2 Tessalonicenses 2
Dia 35: Sl 35, Marcos 14, 2 Tessalonicenses 3
Dia 36: Sl 36, Marcos 15, Filemom 1
Dia 37: Sl 37, Marcos 16, Tiago 1

FASE 3: O Reino e a Justiça (Mateus e Romanos)
Foco: O Sermão do Monte e a Teologia da Salvação.
Dia 38: Sl 38, Mateus 1, Tiago 2
Dia 39: Sl 39, Mateus 2, Tiago 3
Dia 40: Sl 40, Mateus 3, Tiago 4
Dia 41: Sl 41, Mateus 4, Tiago 5
Dia 42: Sl 42, Mateus 5 (Bem-aventuranças), Romanos 1
Dia 43: Sl 43, Mateus 6, Romanos 2
Dia 44: Sl 44, Mateus 7, Romanos 3
Dia 45: Sl 45, Mateus 8, Romanos 4
Dia 46: Sl 46, Mateus 9, Romanos 5
Dia 47: Sl 47, Mateus 10, Romanos 6
Dia 48: Sl 48, Mateus 11, Romanos 7
Dia 49: Sl 49, Mateus 12, Romanos 8 (Vida no Espírito)
Dia 50: Sl 50, Mateus 13, Romanos 9
Dia 51: Sl 51, Mateus 14, Romanos 10
Dia 52: Sl 52, Mateus 15, Romanos 11
Dia 53: Sl 53, Mateus 16, Romanos 12
Dia 54: Sl 54, Mateus 17, Romanos 13
Dia 55: Sl 55, Mateus 18, Romanos 14
Dia 56: Sl 56, Mateus 19, Romanos 15
Dia 57: Sl 57, Mateus 20, Romanos 16
Dia 58: Sl 58, Mateus 21, 1 Pedro 1
Dia 59: Sl 59, Mateus 22, 1 Pedro 2
Dia 60: Sl 60, Mateus 23, 1 Pedro 3
Dia 61: Sl 61, Mateus 24, 1 Pedro 4
Dia 62: Sl 62, Mateus 25, 1 Pedro 5
Dia 63: Sl 63, Mateus 26, 2 Pedro 1
Dia 64: Sl 64, Mateus 27, 2 Pedro 2
Dia 65: Sl 65, Mateus 28, 2 Pedro 3

FASE 4: O Espírito e a Igreja (Atos e Coríntios)
Foco: O poder de Deus em nós.
Dia 66: Sl 66, Atos 1, 1 Coríntios 1
Dia 67: Sl 67, Atos 2 (Pentecostes), 1 Coríntios 2
Dia 68: Sl 68, Atos 3, 1 Coríntios 3
Dia 69: Sl 69, Atos 4, 1 Coríntios 4
Dia 70: Sl 70, Atos 5, 1 Coríntios 5
Dia 71: Sl 71, Atos 6, 1 Coríntios 6
Dia 72: Sl 72, Atos 7, 1 Coríntios 7
Dia 73: Sl 73, Atos 8, 1 Coríntios 8
Dia 74: Sl 74, Atos 9 (Conversão de Paulo), 1 Coríntios 9
Dia 75: Sl 75, Atos 10, 1 Coríntios 10
Dia 76: Sl 76, Atos 11, 1 Coríntios 11
Dia 77: Sl 77, Atos 12, 1 Coríntios 12
Dia 78: Sl 78, Atos 13, 1 Coríntios 13 (Amor)
Dia 79: Sl 79, Atos 14, 1 Coríntios 14
Dia 80: Sl 80, Atos 15, 1 Coríntios 15
Dia 81: Sl 81, Atos 16, 1 Coríntios 16
Dia 82: Sl 82, Atos 17, 2 Coríntios 1
Dia 83: Sl 83, Atos 18, 2 Coríntios 2
Dia 84: Sl 84, Atos 19, 2 Coríntios 3
Dia 85: Sl 85, Atos 20, 2 Coríntios 4
Dia 86: Sl 86, Atos 21, 2 Coríntios 5
Dia 87: Sl 87, Atos 22, 2 Coríntios 6
Dia 88: Sl 88, Atos 23, 2 Coríntios 7
Dia 89: Sl 89, Atos 24, 2 Coríntios 8
Dia 90: Sl 90, Atos 25, 2 Coríntios 9
Dia 91: Sl 91, Atos 26, 2 Coríntios 10
Dia 92: Sl 92, Atos 27, 2 Coríntios 11
Dia 93: Sl 93, Atos 28, 2 Coríntios 12
Dia 94: Sl 94, Lucas 1, 2 Coríntios 13

FASE 5: A Humanidade e a Fé (Lucas e Hebreus)
Foco: Jesus como homem perfeito e o Sumo Sacerdote.
Dia 95: Sl 95, Lucas 2, Hebreus 1
Dia 96: Sl 96, Lucas 3, Hebreus 2
Dia 97: Sl 97, Lucas 4, Hebreus 3
Dia 98: Sl 98, Lucas 5, Hebreus 4
Dia 99: Sl 99, Lucas 6, Hebreus 5
Dia 100: Sl 100, Lucas 7, Hebreus 6
Dia 101: Sl 101, Lucas 8, Hebreus 7
Dia 102: Sl 102, Lucas 9, Hebreus 8
Dia 103: Sl 103, Lucas 10, Hebreus 9
Dia 104: Sl 104, Lucas 11, Hebreus 10
Dia 105: Sl 105, Lucas 12, Hebreus 11 (Galeria da Fé)
Dia 106: Sl 106, Lucas 13, Hebreus 12
Dia 107: Sl 107, Lucas 14, Hebreus 13
Dia 108: Sl 108, Lucas 15, 1 Timóteo 1
Dia 109: Sl 109, Lucas 16, 1 Timóteo 2
Dia 110: Sl 110, Lucas 17, 1 Timóteo 3
Dia 111: Sl 111, Lucas 18, 1 Timóteo 4
Dia 112: Sl 112, Lucas 19, 1 Timóteo 5
Dia 113: Sl 113, Lucas 20, 1 Timóteo 6
Dia 114: Sl 114, Lucas 21, 2 Timóteo 1
Dia 115: Sl 115, Lucas 22, 2 Timóteo 2
Dia 116: Sl 116, Lucas 23, 2 Timóteo 3
Dia 117: Sl 117, Lucas 24, 2 Timóteo 4
Dia 118: Sl 118, Tito 1, Tito 2
Dia 119: Sl 119:1-24, Tito 3, 3 João 1

FASE 6: O Início e a Sabedoria (Gênesis e Provérbios)
Foco: Deus como Criador. Lendo o AT com a mente renovada.
Dia 120: Sl 119:25-48, Gênesis 1, Provérbios 1
Dia 121: Sl 119:49-72, Gênesis 2, Provérbios 2
Dia 122: Sl 119:73-96, Gênesis 3 (A Queda), Provérbios 3
Dia 123: Sl 119:97-120, Gênesis 4, Provérbios 4
Dia 124: Sl 119:121-144, Gênesis 5, Provérbios 5
Dia 125: Sl 119:145-176, Gênesis 6, Provérbios 6
Dia 126: Sl 120, Gênesis 7, Provérbios 7
Dia 127: Sl 121, Gênesis 8, Provérbios 8
Dia 128: Sl 122, Gênesis 9, Provérbios 9
Dia 129: Sl 123, Gênesis 10, Provérbios 10
Dia 130: Sl 124, Gênesis 11, Provérbios 11
Dia 131: Sl 125, Gênesis 12 (Chamado de Abraão), Provérbios 12
Dia 132: Sl 126, Gênesis 13, Provérbios 13
Dia 133: Sl 127, Gênesis 14, Provérbios 14
Dia 134: Sl 128, Gênesis 15, Provérbios 15
Dia 135: Sl 129, Gênesis 16, Provérbios 16
Dia 136: Sl 130, Gênesis 17, Provérbios 17
Dia 137: Sl 131, Gênesis 18, Provérbios 18
Dia 138: Sl 132, Gênesis 19, Provérbios 19
Dia 139: Sl 133, Gênesis 20, Provérbios 20
Dia 140: Sl 134, Gênesis 21, Provérbios 21
Dia 141: Sl 135, Gênesis 22, Provérbios 22
Dia 142: Sl 136, Gênesis 23, Provérbios 23
Dia 143: Sl 137, Gênesis 24, Provérbios 24
Dia 144: Sl 138, Gênesis 25, Provérbios 25
Dia 145: Sl 139, Gênesis 26, Provérbios 26
Dia 146: Sl 140, Gênesis 27, Provérbios 27
Dia 147: Sl 141, Gênesis 28, Provérbios 28
Dia 148: Sl 142, Gênesis 29, Provérbios 29
Dia 149: Sl 143, Gênesis 30, Provérbios 30
Dia 150: Sl 144, Gênesis 31, Provérbios 31

FASE 7: Providência e Êxodo (José e Moisés)
Foco: Deus cuida e Deus liberta.
Dia 151: Sl 145, Gênesis 32, 1 João 1 (Releitura rápida)
Dia 152: Sl 146, Gênesis 33, 1 João 2
Dia 153: Sl 147, Gênesis 34, 1 João 3
Dia 154: Sl 148, Gênesis 35, 1 João 4
Dia 155: Sl 149, Gênesis 36, 1 João 5
Dia 156: Sl 150, Gênesis 37 (José), Salmo 23
Dia 157: Sl 1, Gênesis 38, Salmo 121
Dia 158: Sl 2, Gênesis 39, Salmo 91
Dia 159: Sl 3, Gênesis 40, Efésios 1 (Releitura)
Dia 160: Sl 4, Gênesis 41, Efésios 2
Dia 161: Sl 5, Gênesis 42, Efésios 3
Dia 162: Sl 6, Gênesis 43, Efésios 4
Dia 163: Sl 7, Gênesis 44, Efésios 5
Dia 164: Sl 8, Gênesis 45, Efésios 6
Dia 165: Sl 9, Gênesis 46, Filipenses 1
Dia 166: Sl 10, Gênesis 47, Filipenses 2
Dia 167: Sl 11, Gênesis 48, Filipenses 3
Dia 168: Sl 12, Gênesis 49, Filipenses 4
Dia 169: Sl 13, Gênesis 50 (Fim Gn), Colossenses 1
Dia 170: Sl 14, Êxodo 1, Colossenses 2
Dia 171: Sl 15, Êxodo 2, Colossenses 3
Dia 172: Sl 16, Êxodo 3 (A Sarça), Colossenses 4
Dia 173: Sl 17, Êxodo 4, 1 Tessalonicenses 1
Dia 174: Sl 18, Êxodo 5, 1 Tessalonicenses 2
Dia 175: Sl 19, Êxodo 6, 1 Tessalonicenses 3
Dia 176: Sl 20, Êxodo 7, 1 Tessalonicenses 4
Dia 177: Sl 21, Êxodo 8, 1 Tessalonicenses 5
Dia 178: Sl 22, Êxodo 9, 2 Tessalonicenses 1
Dia 179: Sl 23, Êxodo 10, 2 Tessalonicenses 2
Dia 180: Sl 24, Êxodo 11, 2 Tessalonicenses 3

FASE 8: O Deserto e a Lei (Êxodo e Levítico Selecionado)
Foco: A Santidade de Deus.
Dia 181: Sl 25, Êxodo 12 (Páscoa), Filemom
Dia 182: Sl 26, Êxodo 13, Judas
Dia 183: Sl 27, Êxodo 14 (Mar Vermelho), Romanos 8
Dia 184: Sl 28, Êxodo 15, Gálatas 1
Dia 185: Sl 29, Êxodo 16, Gálatas 2
Dia 186: Sl 30, Êxodo 17, Gálatas 3
Dia 187: Sl 31, Êxodo 18, Gálatas 4
Dia 188: Sl 32, Êxodo 19, Gálatas 5
Dia 189: Sl 33, Êxodo 20 (Mandamentos), Gálatas 6
Dia 190: Sl 34, Êxodo 24, Tiago 1
Dia 191: Sl 35, Êxodo 32 (Bezerro Ouro), Tiago 2
Dia 192: Sl 36, Êxodo 33, Tiago 3
Dia 193: Sl 37, Êxodo 34, Tiago 4
Dia 194: Sl 38, Êxodo 40, Tiago 5
Dia 195: Sl 39, Levítico 1, Hebreus 9 (Conexão)
Dia 196: Sl 40, Levítico 16, Hebreus 10
Dia 197: Sl 41, Levítico 19, 1 Pedro 1
Dia 198: Sl 42, Números 6 (Bênção), 1 Pedro 2
Dia 199: Sl 43, Números 11, 1 Pedro 3
Dia 200: Sl 44, Números 13, 1 Pedro 4

FASE 9: A Terra Prometida e a História (Josué, Juízes, Rute)
Foco: Conquista, fracasso humano e fidelidade divina.
Dia 201: Sl 45, Números 14, 1 Pedro 5
Dia 202: Sl 46, Deuteronômio 6 (Shemá), 2 João
Dia 203: Sl 47, Deuteronômio 30, 3 João
Dia 204: Sl 48, Deuteronômio 34, Judas
Dia 205: Sl 49, Josué 1, Salmo 119:1-20
Dia 206: Sl 50, Josué 2, Salmo 119:21-40
Dia 207: Sl 51, Josué 3, Salmo 119:41-60
Dia 208: Sl 52, Josué 4, Salmo 119:61-80
Dia 209: Sl 53, Josué 5, Salmo 119:81-100
Dia 210: Sl 54, Josué 6 (Jericó), Salmo 119:101-120
Dia 211: Sl 55, Josué 23, Salmo 119:121-140
Dia 212: Sl 56, Josué 24, Salmo 119:141-176
Dia 213: Sl 57, Juízes 1, Provérbios 1
Dia 214: Sl 58, Juízes 2, Provérbios 2
Dia 215: Sl 59, Juízes 6 (Gideão), Provérbios 3
Dia 216: Sl 60, Juízes 7, Provérbios 4
Dia 217: Sl 61, Juízes 13, Provérbios 5
Dia 218: Sl 62, Juízes 14, Provérbios 6
Dia 219: Sl 63, Juízes 15, Provérbios 7
Dia 220: Sl 64, Juízes 16 (Sansão), Provérbios 8
Dia 221: Sl 65, Rute 1, Provérbios 9
Dia 222: Sl 66, Rute 2, Provérbios 10
Dia 223: Sl 67, Rute 3, Provérbios 11
Dia 224: Sl 68, Rute 4, Provérbios 12

FASE 10: Reis e Profetas (Samuel, Davi e Isaías)
Foco: O coração de Deus e a promessa do Messias.
Dia 225: Sl 69, 1 Samuel 1, Provérbios 13
Dia 226: Sl 70, 1 Samuel 2, Provérbios 14
Dia 227: Sl 71, 1 Samuel 3, Provérbios 15
Dia 228: Sl 72, 1 Samuel 8, Provérbios 16
Dia 229: Sl 73, 1 Samuel 15, Provérbios 17
Dia 230: Sl 74, 1 Samuel 16 (Davi), Provérbios 18
Dia 231: Sl 75, 1 Samuel 17 (Golias), Provérbios 19
Dia 232: Sl 76, 1 Samuel 18, Provérbios 20
Dia 233: Sl 77, 1 Samuel 20, Provérbios 21
Dia 234: Sl 78, 1 Samuel 24, Provérbios 22
Dia 235: Sl 79, 2 Samuel 1, Provérbios 23
Dia 236: Sl 80, 2 Samuel 5, Provérbios 24
Dia 237: Sl 81, 2 Samuel 6, Provérbios 25
Dia 238: Sl 82, 2 Samuel 7 (Aliança), Provérbios 26
Dia 239: Sl 83, 2 Samuel 11 (Bate-Seba), Provérbios 27
Dia 240: Sl 84, 2 Samuel 12 (Natã), Salmo 51
Dia 241: Sl 85, 1 Reis 3 (Salomão), Eclesiastes 1
Dia 242: Sl 86, 1 Reis 8, Eclesiastes 2
Dia 243: Sl 87, 1 Reis 17 (Elias), Eclesiastes 3
Dia 244: Sl 88, 1 Reis 18 (Carmelo), Eclesiastes 12
Dia 245: Sl 89, 2 Reis 2, Isaías 1
Dia 246: Sl 90, 2 Reis 5, Isaías 6 (Chamado)
Dia 247: Sl 91, 2 Reis 17, Isaías 9
Dia 248: Sl 92, 2 Reis 25, Isaías 40
Dia 249: Sl 93, Daniel 1, Isaías 43
Dia 250: Sl 94, Daniel 3, Isaías 53 (Servo Sofredor)
Dia 251: Sl 95, Daniel 6 (Leões), Isaías 55
Dia 252: Sl 96, Jonas 1, Isaías 60
Dia 253: Sl 97, Jonas 2, Isaías 61
Dia 254: Sl 98, Jonas 3, Miqueias 6
Dia 255: Sl 99, Jonas 4, Malaquias 3

FASE 11: Retorno aos Evangelhos (João e Revelação)
Foco: Consolidando a visão de Cristo e a Eternidade.
Dia 256: Sl 100, João 1, Apocalipse 1
Dia 257: Sl 101, João 2, Apocalipse 2
Dia 258: Sl 102, João 3, Apocalipse 3
Dia 259: Sl 103, João 4, Apocalipse 4
Dia 260: Sl 104, João 5, Apocalipse 5
Dia 261: Sl 105, João 6, Apocalipse 6
Dia 262: Sl 106, João 7, Apocalipse 7
Dia 263: Sl 107, João 8, Apocalipse 8
Dia 264: Sl 108, João 9, Apocalipse 9
Dia 265: Sl 109, João 10, Apocalipse 10
Dia 266: Sl 110, João 11, Apocalipse 11
Dia 267: Sl 111, João 12, Apocalipse 12
Dia 268: Sl 112, João 13, Apocalipse 13
Dia 269: Sl 113, João 14, Apocalipse 14
Dia 270: Sl 114, João 15, Apocalipse 15
Dia 271: Sl 115, João 16, Apocalipse 16
Dia 272: Sl 116, João 17, Apocalipse 17
Dia 273: Sl 117, João 18, Apocalipse 18
Dia 274: Sl 118, João 19, Apocalipse 19
Dia 275: Sl 119:1-24, João 20, Apocalipse 20
Dia 276: Sl 119:25-48, João 21, Apocalipse 21
Dia 277: Sl 119:49-72, Apocalipse 22, 1 João 1

FASE 12: Aprofundamento e Conclusão (Releituras Chave)
Foco: Fixando o que mais importa nos últimos 3 meses.
Dia 278: Sl 120, Marcos 1, Romanos 8
Dia 279: Sl 121, Marcos 2, Romanos 12
Dia 280: Sl 122, Marcos 3, 1 Coríntios 13
Dia 281: Sl 123, Marcos 4, Gálatas 5
Dia 282: Sl 124, Marcos 5, Efésios 1
Dia 283: Sl 125, Marcos 6, Efésios 2
Dia 284: Sl 126, Marcos 7, Efésios 3
Dia 285: Sl 127, Marcos 8, Efésios 4
Dia 286: Sl 128, Marcos 9, Efésios 5
Dia 287: Sl 129, Marcos 10, Efésios 6
Dia 288: Sl 130, Marcos 11, Filipenses 1
Dia 289: Sl 131, Marcos 12, Filipenses 2
Dia 290: Sl 132, Marcos 13, Filipenses 3
Dia 291: Sl 133, Marcos 14, Filipenses 4
Dia 292: Sl 134, Marcos 15, Colossenses 1
Dia 293: Sl 135, Marcos 16, Colossenses 2
Dia 294: Sl 136, Lucas 1, Colossenses 3
Dia 295: Sl 137, Lucas 2, Colossenses 4
Dia 296: Sl 138, Lucas 3, 1 Tessalonicenses 5
Dia 297: Sl 139, Lucas 4, Tiago 1
Dia 298: Sl 140, Lucas 5, Tiago 2
Dia 299: Sl 141, Lucas 6, Tiago 3
Dia 300: Sl 142, Lucas 7, Tiago 4
Dia 301: Sl 143, Lucas 8, Tiago 5
Dia 302: Sl 144, Lucas 9, 1 Pedro 1
Dia 303: Sl 145, Lucas 10, 1 Pedro 2
Dia 304: Sl 146, Lucas 11, 1 Pedro 3
Dia 305: Sl 147, Lucas 12, 1 Pedro 4
Dia 306: Sl 148, Lucas 13, 1 Pedro 5
Dia 307: Sl 149, Lucas 14, 1 João 1
Dia 308: Sl 150, Lucas 15, 1 João 2
Dia 309: Sl 1, Lucas 16, 1 João 3
Dia 310: Sl 2, Lucas 17, 1 João 4
Dia 311: Sl 3, Lucas 18, 1 João 5
Dia 312: Sl 4, Lucas 19, Salmo 23
Dia 313: Sl 5, Lucas 20, Salmo 32
Dia 314: Sl 6, Lucas 21, Salmo 51
Dia 315: Sl 7, Lucas 22, Salmo 91
Dia 316: Sl 8, Lucas 23, Salmo 100
Dia 317: Sl 9, Lucas 24, Salmo 103
Dia 318: Sl 10, Mateus 1, Salmo 121
Dia 319: Sl 11, Mateus 2, Salmo 139
Dia 320: Sl 12, Mateus 3, Salmo 145
Dia 321: Sl 13, Mateus 4, Romanos 8
Dia 322: Sl 14, Mateus 5, Romanos 12
Dia 323: Sl 15, Mateus 6, 1 Coríntios 13
Dia 324: Sl 16, Mateus 7, Gálatas 5
Dia 325: Sl 17, Mateus 8, Efésios 2
Dia 326: Sl 18, Mateus 9, Filipenses 2
Dia 327: Sl 19, Mateus 10, Colossenses 3
Dia 328: Sl 20, Mateus 11, 1 Tessalonicenses 5
Dia 329: Sl 21, Mateus 12, 2 Timóteo 1
Dia 330: Sl 22, Mateus 13, 2 Timóteo 2
Dia 331: Sl 23, Mateus 14, 2 Timóteo 3
Dia 332: Sl 24, Mateus 15, 2 Timóteo 4
Dia 333: Sl 25, Mateus 16, Hebreus 4
Dia 334: Sl 26, Mateus 17, Hebreus 11
Dia 335: Sl 27, Mateus 18, Hebreus 12
Dia 336: Sl 28, Mateus 19, Tiago 1
Dia 337: Sl 29, Mateus 20, 1 Pedro 1
Dia 338: Sl 30, Mateus 21, Apocalipse 1
Dia 339: Sl 31, Mateus 22, Apocalipse 2
Dia 340: Sl 32, Mateus 23, Apocalipse 3
Dia 341: Sl 33, Mateus 24, Apocalipse 4
Dia 342: Sl 34, Mateus 25, Apocalipse 5
Dia 343: Sl 35, Mateus 26, Apocalipse 19
Dia 344: Sl 36, Mateus 27, Apocalipse 20
Dia 345: Sl 37, Mateus 28, Apocalipse 21
Dia 346: Sl 38, João 1, Apocalipse 22
Dia 347: Sl 39, João 2, Efésios 1
Dia 348: Sl 40, João 3, Efésios 2
Dia 349: Sl 41, João 4, Efésios 3
Dia 350: Sl 42, João 5, Efésios 4
Dia 351: Sl 43, João 6, Efésios 5
Dia 352: Sl 44, João 7, Efésios 6
Dia 353: Sl 45, João 8, Filipenses 1
Dia 354: Sl 46, João 9, Filipenses 2
Dia 355: Sl 47, João 10, Filipenses 3
Dia 356: Sl 48, João 11, Filipenses 4
Dia 357: Sl 49, João 12, Colossenses 1
Dia 358: Sl 50, João 13, Colossenses 2
Dia 359: Sl 51, João 14, Colossenses 3
Dia 360: Sl 52, João 15, Colossenses 4
Dia 361: Sl 53, João 16, 1 João 1
Dia 362: Sl 54, João 17, 1 João 2
Dia 363: Sl 55, João 18, 1 João 3
Dia 364: Sl 56, João 19, 1 João 4
Dia 365: Sl 150, João 20 e 21, 1 João 5
`;

async function main() {
    console.log('Extraindo e preenchendo o plano bíblico Cristocentrico de 365 dias...');

    const dataToInsert = [];
    const lines = rawPlan.split('\n');

    let currentFase = '';
    let currentFoco = '';

    for (const line of lines) {
        if (line.trim() === '') continue;

        if (line.startsWith('FASE')) {
            currentFase = line.trim();
        } else if (line.startsWith('Foco:')) {
            currentFoco = line.trim();
        } else if (line.startsWith('Dia')) {
            // Match pattern "Dia X: Content"
            const match = line.match(/^Dia\s+(\d+):\s+(.*)$/);
            if (match) {
                const dayNumber = parseInt(match[1]);
                const reading = match[2];
                dataToInsert.push({
                    dia: dayNumber,
                    trechosBiblicos: reading,
                    reflexao: \`\${currentFase}\\n\${currentFoco}\\n\\nReflita sobre a leitura de hoje e anote o que Deus falar ao seu coração.\`
                });
            }
        }
    }

    try {
        const result = await prisma.planoLeitura.createMany({
            data: dataToInsert,
            skipDuplicates: true
        });
        console.log(\`\\n✅ Sucesso! Foram cadastrados \${result.count} planos de leitura diários.\`);
    } catch (e) {
        console.error('Erro ao preencher tabela PlanoLeitura:', e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
