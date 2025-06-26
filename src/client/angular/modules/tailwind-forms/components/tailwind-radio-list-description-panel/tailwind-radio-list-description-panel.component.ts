import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface TailwindRadioListOption {
  name: string;
  value: string;
  description: string;
}

@Component({
  selector: 'notify-tailwind-radio-list-description-panel',
  templateUrl: './tailwind-radio-list-description-panel.component.html',
})
export class TailwindRadioListDescriptionPanelComponent {
  @Input() parent!: FormGroup;
  @Input() label!: string;
  @Input() name!: string;
  @Input() radioList: TailwindRadioListOption[] = [];
  @Input() validationErrors: { [key: string]: string } = {};

  get hasErrors() {
    return this.parent.get(this.name)?.errors;
  }

  get touched() {
    return this.parent.get(this.name)?.touched;
  }

  get showValidationErrors() {
    return this.hasErrors && this.touched;
  }

  get validationErrorMessage() {
    if (!this.hasErrors) {
      return '';
    }

    return this.validationErrors[Object.keys(this.hasErrors)[0]];
  }
}
