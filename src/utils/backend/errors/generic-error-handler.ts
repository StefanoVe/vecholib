//aggiungere funzione che manda email di conferma operazione all'email che ha richiesto il servizio.

import { LogManager } from '../services/service.logs';
import { BadRequestError } from './bad-request-error';

export const genericErrorHandler = async (
  error: Error,
  LogManager: LogManager
) => {
  LogManager.log(JSON.stringify(error), 'error');

  const message =
    error && error.message
      ? error.message
      : `Errore generico ${JSON.stringify(error)}`;

  throw new BadRequestError(message);
};

/**
 * Usage:
 *
 * const gem = GenericErrorHandlerManager.init(LogManager);
 *
 * await FailableFunction(...args).catch(gem.handleError);
 */
export class GenericErrorHandlerManager {
  constructor(public lm: LogManager) {}

  public static init(LogManager: LogManager) {
    return new GenericErrorHandlerManager(LogManager);
  }

  public handleError = async (error: Error) => {
    return genericErrorHandler(error, this.lm);
  };
}
