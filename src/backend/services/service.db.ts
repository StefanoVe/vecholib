import { connect } from 'mongoose';
import { GenericErrorHandlerManager } from '../errors/generic-error-handler';

import { LogManager } from './service.logs';

export const connectToDatabase = async (lm: LogManager, MONGO_URI: string) => {
	const gm = GenericErrorHandlerManager.init(lm);
	// Tenta di connettersi a MongoDB
	const connection = await connect(MONGO_URI).catch(gm.handleError);

	const db = connection.connection.db;

	if (!db) {
		lm.log(
			'Database connection failed: No database found in the connection.',
			'error'
		);
		return;
	}

	// Altrimenti mostra in console un messaggio di avvenuta connessione
	lm.log(
		`MongoDB Connected
  
Available collections:
${(await db.collections()).map((i) => i.collectionName).join('\n')}
`,
		'success'
	);
};
