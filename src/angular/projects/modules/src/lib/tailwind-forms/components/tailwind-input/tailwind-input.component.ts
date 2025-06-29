import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TailwindFormsService } from '../../services/tailwind-forms.service';

@Component({
  selector: 'vecholib-tailwind-input',
  standalone: false,
  templateUrl: './tailwind-input.component.html',
  styleUrls: ['./tailwind-input.component.scss'],
})
export class TailwindInputComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() parent!: FormGroup;
  @Input() label!: string;
  @Input() name!: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'url' = 'text';
  @Input() helpText!: string;
  @Input() showToggleEye = false;
  @Input() showClearInput = true;
  @Input() compact = false;
  @Input() placeholder = '';
  @Input() validationErrors!: { [key: string]: string };
  @Input() disableAutocomplete = false;
  @Input() showSpinButtons = false;
  @Input() mask?: string | undefined;
  @Input() thousandSeparator!: string;
  @Input() maxLength!: number;
  @Input() titlecaseLabel = true;
  @Input() cssClass =
    'w-full backdrop-blur lg:text-auto input input-style input-bordered';
  @Input() patterns!: {
    [character: string]: {
      pattern: RegExp;
      optional?: boolean;
      symbol?: string;
    };
  };

  @Input() readOnly = false;

  @Input() prefix? = '';
  @Input() suffix = '';

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

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

  ngAfterViewInit(): void {
    if (this.disableAutocomplete) {
      this.inputRef.nativeElement.setAttribute('autocomplete', 'off');
      this.inputRef.nativeElement.setAttribute('autocorrect', 'off');
      this.inputRef.nativeElement.setAttribute('autocapitalize', 'none');
      this.inputRef.nativeElement.setAttribute('spellcheck', 'false');
    }
  }

  togglePasswordVisibility() {
    if (this.inputRef.nativeElement.type === 'text') {
      return (this.inputRef.nativeElement.type = 'password');
    }

    return (this.inputRef.nativeElement.type = 'text');
  }

  public clearInputValue() {
    this.parent.get(this.name)?.setValue('');
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

    if (
      !this.validationErrors ||
      !this.validationErrors[Object.keys(this.hasErrors)[0]]
    ) {
      return 'Errore di validazione';
    }

    return this.validationErrors[Object.keys(this.hasErrors)[0]];
  }

  public incrementValue() {
    if (this.inputRef.nativeElement.value === '') {
      this.inputRef.nativeElement.value = '0';
    }

    this.inputRef.nativeElement.stepUp();
    this.parent.get(this.name)?.setValue(this.inputRef.nativeElement.value);
  }

  public decrementValue() {
    if (this.inputRef.nativeElement.value === '') {
      this.inputRef.nativeElement.value = '0';
    }

    this.inputRef.nativeElement.stepDown();
    this.parent.get(this.name)?.setValue(this.inputRef.nativeElement.value);
  }
}
