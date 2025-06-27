import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable()
export class TailwindFormsService {
  /**
   * Verifica se nei messaggi di validazione passati al componente
   * sono presenti tutti i messaggi necessari sulla base dei Validators
   * configurati nel FormControl. Qualora non fossero tutti aggiunge quelli
   * mancanti con un messaggio di default.
   *
   * @param {(AbstractControl | null)} control - il FormControl su cui effettuare il controllo dei messaggi di validazione
   * @param {Object} validationErrors - i messaggi di validazione da mostrare
   * @returns {Object}
   *
   * @example
   *  fillValidationErrorsWithMissing(this.parent.get(this.name), this.validationErrors)
   */
  fillValidationErrorsWithMissing(
    control: AbstractControl | null,
    validationErrors: { [key: string]: string }
  ) {
    const validatorsList = this._getValidatorsList(control);

    return validatorsList.reduce(
      (validationErrors: { [key: string]: string }, validator: string) => {
        if (validationErrors[validator]) {
          return validationErrors;
        }

        return {
          ...validationErrors,
          [validator]: `Errore ${validator}`,
        };
      },
      validationErrors
    );
  }

  /**
   * Privates
   */

  /**
   * Estra i Validators configurati per il FormControl fornito.
   * I Validators possono essere specificati in fase di configurazione
   * sia come Array (es. [Validators.required, Validators.minLength(3)])
   * che come singolo Validator (es. Validators.required).
   * Quindi la funzione può ritornare o un Array o una funzione.
   *
   * @param {(AbstracControl | null)} control - il FormControl su cui effettuare l'estrazione
   * @returns { (function | Array<{ name: string }> | null)}
   */
  private _extractValidators(control: AbstractControl | null) {
    if (!control) {
      return [];
    }

    return (control as any)?._rawValidators;
  }

  /**
   * La funzione crea un Array di stringhe contenenti i nomi dei Validators
   * configurati per il FormControl fornito.
   *
   * @param {(AbstractControl | null)} control - il FormControl per cui creare la lista dei Validators
   * @returns { Array<string> }
   */
  private _getValidatorsList(control: AbstractControl | null) {
    const validators = this._extractValidators(control);
    // console.log('validators', validators);

    let validatorsList: string[] = [];

    if (typeof validators === 'function') {
      // console.log('funzione!', validators.name);
      validatorsList = [validators.name];
    }

    if (Array.isArray(validators)) {
      validatorsList = validators.map(
        (validator: { name: string }) => validator.name
      );
    }

    return validatorsList;
  }
}
