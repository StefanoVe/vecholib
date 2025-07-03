import { NextFunction, Request, Response } from 'express';
import { LogManager } from '../services';

export const managedLogsMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
	mLog: LogManager['log']
) => {
	const route = `${req.method} ${req.path}`;
	const timestamp = new Date().toISOString();
	mLog(`${timestamp} | ${req.ip} > ${route}`, 'info');

	next();
};

export const provideManagedLogsMiddleware = (lm: LogManager) => {
	return (req: Request, res: Response, next: NextFunction) => {
		managedLogsMiddleware(req, res, next, lm.log);
	};
};
