import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const TOGGLE_CONTROL_ACESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TailwindToggleButtonComponent),
  multi: true,
};

@Component({
  styleUrls: ['../../tailwind-forms.css'],
  selector: 'vecholib-tailwind-toggle-button',
  providers: [TOGGLE_CONTROL_ACESSOR],
  standalone: false,
  templateUrl: './tailwind-toggle-button.component.html',
})
export class TailwindToggleButtonComponent implements ControlValueAccessor {
  @Input() showValueLabel: boolean = false;
  @Input() valueLabelTrue: string = 'Default value label true';
  @Input() valueLabelFalse: string = 'Default value label false';

  public value: boolean = false;
  private onTouch!: Function;
  private onModelChange!: Function;

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  toggleValue() {
    this.value = !this.value;
    this.onModelChange(this.value);
    this.onTouch();
  }
}
