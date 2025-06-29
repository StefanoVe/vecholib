import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TailwindFormsService } from '../../services/tailwind-forms.service';

export interface ITailwindSelectOption {
  name: string;
  value: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'vecholib-tailwind-select',
  standalone: false,
  templateUrl: './tailwind-select.component.html',
})
export class TailwindSelectComponent implements OnInit, OnChanges {
  @Input() parent!: FormGroup;
  @Input() label!: string;
  @Input() name!: string;
  @Input() compact = false;
  @Input() placeholder = '';
  @Input() validationErrors!: { [key: string]: string };
  @Input() options!: ITailwindSelectOption[];

  constructor(private tailwindFormService: TailwindFormsService) {}

  ngOnInit(): void {
    if (!this.label) {
      this.label = this.name;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['validationErrors']) {
      this.validationErrors =
        this.tailwindFormService.fillValidationErrorsWithMissing(
          this.parent.get(this.name),
          this.validationErrors
        );
    }
  }

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

  get value() {
    return this.parent.get(this.name)?.value;
  }
}
