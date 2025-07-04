import cors from 'cors';
import express, { RequestHandler } from 'express';
import { RouteParameters } from 'express-serve-static-core';
import http from 'http';
import { NotFoundError } from '../errors';

export const initializeExpressApplication = (
	api?: express.Router,
	middlewares: Array<RequestHandler<RouteParameters<any>>>[] = []
) => {
	const app = express();

	app.use(express.json({ limit: '50mb' }));

	middlewares.forEach((middleware) => {
		app.use(middleware);
	});

	app.use(
		cors({
			origin: '*',
		})
	);

	if (api) {
		app.use('/api', api);
	}

	// Deve sempre essere in fondo a tutte le altre routes perché serve a mostrare un errore qualora
	// si cercasse di accedere ad una route che non esiste
	app.all('/{*splat}', () => {
		throw new NotFoundError();
	});

	return http.createServer(app);
};
