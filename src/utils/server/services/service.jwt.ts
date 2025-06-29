import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken/index';
import { BadRequestError } from '../errors';
import { declareEnvs } from './service.envs';

export const INVALID_JWT_TOKEN =
	'Errore durante la validazione del token. Riprova.';

export class JWTManager {
	static get INVALID_JWT_TOKEN() {
		return INVALID_JWT_TOKEN;
	}

	public get jwtKey() {
		return Bun.env[this.jwtEnvKey] || '';
	}

	constructor(private jwtEnvKey: string) {
		declareEnvs([jwtEnvKey]);
	}

	signToken(
		data: string | object | Buffer,
		expiresIn: SignOptions['expiresIn'] = '1d'
	) {
		return jwt.sign(data, this.jwtKey, {
			expiresIn: expiresIn,
		});
	}

	verifyToken<T>(token: string, throwError = true): T {
		const verified = jwt.verify(token, this.jwtKey);

		if (!verified && throwError) {
			throw new BadRequestError(INVALID_JWT_TOKEN);
		}

		return jwt.decode(token) as T;
	}
}
