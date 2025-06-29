import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, startWith, takeUntil } from 'rxjs';
import { TailwindFormsService } from '../../services/tailwind-forms.service';

@Component({
  styleUrls: [
    '../../tailwind-forms.css',
    './tailwind-color-picker.component.scss',
  ],
  selector: 'vecholib-tailwind-color-picker',
  standalone: false,
  templateUrl: './tailwind-color-picker.component.html',
})
export class TailwindColorPickerComponent
  implements OnInit, OnChanges, OnDestroy
{
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;
  @Input() parent!: FormGroup;
  @Input() name!: string;
  @Input() validationErrors!: { [key: string]: string };
  //an array colors to be used as default colors
  @Input() colors: string[] = AVAILABLE_COLORS;
  @Input() label = '';
  @Input() compact = false;

  public color = '';
  public defaultColor = '#ffffff';

  private destroy$ = new Subject<void>();

  constructor(private tailwindFormService: TailwindFormsService) {}

  handleColorPickerChange(color: string) {
    this.color = color;

    if (!this.compact) {
      return;
    }

    this.parent.controls[this.name].setValue(this.color);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngOnInit(): void {
    const formColor = this.parent.controls[this.name].value;

    this.color = formColor.length ? formColor : this.defaultColor;

    this.parent.controls[this.name].valueChanges
      .pipe(startWith(this.color), takeUntil(this.destroy$))
      .subscribe((value) => (this.color = value));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['validationErrors']) {
      this.validationErrors =
        this.tailwindFormService.fillValidationErrorsWithMissing(
          this.parent.get(this.name),
          this.validationErrors
        );
    }

    this.color = this.parent.controls[this.name]?.value;
  }

  togglePasswordVisibility() {
    if (this.inputRef.nativeElement.type === 'text') {
      return (this.inputRef.nativeElement.type = 'password');
    }

    return (this.inputRef.nativeElement.type = 'text');
  }

  focusColorPicker(e: HTMLInputElement) {
    e.focus();
    e.click();
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
}

const AVAILABLE_COLORS = [
  // 'red',
  '#F9B5B5',
  '#F58F8F',
  '#F26A6A',
  '#EF4444',
  '#E71414',
  '#B30F0F',

  // 'yewllow',
  '#FBDCA8',
  '#FACD81',
  '#F8BD59',
  '#F7AE32',
  '#F59E0B',
  '#C07C08',

  // 'green',
  '#79F3CB',
  '#53F0BC',
  '#2EEDAE',
  '#13DF9B',
  '#10B981',
  '#0C855D',

  // 'blue',
  '#D7E6FD',
  '#B0CDFB',
  '#89B4FA',
  '#629BF8',
  '#3B82F6',
  '#0B61EE',

  // 'purple',
  '#DED0FC',
  '#C2A9FA',
  '#A783F8',
  '#8B5CF6',
  '#6527F3',
  '#4D0FDB',

  // 'pink',
  '#FBDCEB',
  '#F8B7D7',
  '#F492C2',
  '#F06DAE',
  '#EC4899',
  '#E4187D',

  // 'gray',
  '#F9F9F9',
  '#ECECEC',
  '#E0E0E0',
  '#C4C4C4',
  '#A7A7A7',
  '#8B8B8B',

  // 'black',
  '#555555',
  '#444444',
  '#333333',
  '#222222',
  '#111111',
  '#000000',

  //brown
  '#B7947F',
  '#A87E65',
  '#926A52',
  '#785744',
  '#5E4435',
  '#3A2A21',

  //brand
  '#0A2859',
  '#041127',
];
