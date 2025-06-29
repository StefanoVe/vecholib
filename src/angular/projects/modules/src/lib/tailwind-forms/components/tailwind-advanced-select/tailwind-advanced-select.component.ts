import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TailwindFormsService } from '../../services/tailwind-forms.service';

export type TailwindAdvancedSelectOption = string;

@Component({
  styleUrls: [
    '../../tailwind-forms.css',
    './tailwind-advanced-select.component.scss',
  ],
  selector: 'vecholib-tailwind-advanced-select',
  standalone: false,
  templateUrl: './tailwind-advanced-select.component.html',
})
export class TailwindAdvancedSelectComponent implements OnInit, OnChanges {
  @Input() parent!: FormGroup;
  @Input() label!: string;
  @Input() name!: string;
  @Input() placeholder = '';
  @Input() validationErrors!: { [key: string]: string };
  @Input() options!: TailwindAdvancedSelectOption[];
  @Input() allowRemove = true;

  @Output() removeOption = new EventEmitter<TailwindAdvancedSelectOption>();

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

  set value(value: string) {
    this.parent.get(this.name)?.setValue(value);
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

  get filteredOptions(): TailwindAdvancedSelectOption[] {
    return this.options
      ?.filter((option) =>
        option?.toLowerCase().includes(this.value?.toLowerCase())
      )
      .slice(0, 10);
  }

  get dropdownVisible() {
    if (
      this.filteredOptions.length === 1 &&
      this.filteredOptions[0] === this.value
    ) {
      return false;
    }

    return this.filteredOptions.length;
  }
}
