import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  styleUrls: ['../../tailwind-forms.css'],
  selector: 'vecholib-tailwind-submit-button',
  standalone: false,
  templateUrl: './tailwind-submit-button.component.html',
})
export class TailwindSubmitButtonComponent {
  @Input() label = 'Invia';
  @Input() invalid = true;
  @Input() loading = false;
  @Input() showCancelButton = false;
  @Input() cancelButtonLabel = 'Annulla';

  @Output() cancelButtonClicked = new EventEmitter<void>();
  @Output() submitButtonClicked = new EventEmitter<void>();

  isDisabled() {
    return this.loading || this.invalid;
  }
}
