import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../errors/custom-error';
import { LogManager } from '../services';

// Per come funzionano i middleware in Express, si veda:
// http://expressjs.com/en/guide/using-middleware.html#using-middleware
// la funzione next come ultimo parametro è obbligatoria, altrimenti Express non riesce
// a capire che si tratta di un middleware per gestire gli errori
/* eslint-disable @typescript-eslint/no-unused-vars */
const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
	mLog: LogManager['log']
) => {
	// Se ci sono errori e se sono di tipo CustomError
	if (err instanceof CustomError) {
		// Leggo la statusCode dell'errore e lo imposto come statusCode della risposta
		// poi restituisco gli errori serializzati
		return res.status(err.statusCode).send({ errors: err.serializeErrors() });
	}

	// Logger.error(err);

	// Se l'errore non è di tipo CustomError non sono in grado di sapere come è strutturato
	// perché potrebbe essere un qualunque errore generato dalla nostra app, quindi in questo
	// caso restituisco uno statusCode 400 ed un messaggio di errore generico

	mLog(err.message, 'error');
	return res.status(400).send({ errors: [{ message: 'Errore non gestito' }] });
};

export const provideErrorHandler = (lm: LogManager) => {
	return (err: Error, req: Request, res: Response, next: NextFunction) => {
		errorHandler(err, req, res, next, lm.log.bind(lm));
	};
};
