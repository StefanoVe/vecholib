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
import { Subject, takeUntil } from 'rxjs';

import { TailwindFormsService } from '../../services/tailwind-forms.service';

@Component({
  styleUrls: ['../../tailwind-forms.css'],
  selector: 'vecholib-tailwind-slider',
  standalone: false,
  templateUrl: './tailwind-slider.component.html',
  styles: `
  @reference "tailwindcss";
  .bubble {
  @apply absolute transform rounded-xl text-white p-1  text-xs shrink-0 -mt-7 w-fit;
  left: 0; 
  right: 0; 
  margin-left: auto; 
  margin-right: auto; 
}



`,
})
export class TailwindSliderComponent implements OnInit, OnChanges, OnDestroy {
  // private _capacitorService = inject(CapacitorService);

  @Input() parent!: FormGroup;
  @Input() label!: string;
  @Input() name!: string;
  @Input() helpText!: string;
  @Input() validationErrors!: { [key: string]: string };
  @Input() readOnly = false;
  @Input() min = 0;
  @Input() max = 100;
  @Input() steps = 10;
  @Input() compact = false;
  @Input() stepsLabels?: {
    startLabel?: string;
    endLabel?: string;
    showCurrentStepWhileDragging?: boolean;
    stepPosition?: 'top' | 'bottom';
    showCurrentStep?: boolean;
    stepSuffix?: string;
    stepUsesPercentage?: boolean;
  };

  @ViewChild('RangeInput') inputRef!: ElementRef<HTMLInputElement>;

  private _destroy$ = new Subject<void>();

  public infinity = Infinity;

  public get stepsIterable() {
    return Array.from({ length: this.steps + 1 }, (_, i) => i);
  }

  public get step() {
    return (this.max - this.min) / this.steps;
  }

  public get currentValue() {
    return this.parent.get(this.name)?.value;
  }

  public get currentPercentage() {
    return ((this.currentValue - this.min) / (this.max - this.min)) * 100;
  }

  public get bubbleTransform() {
    const sliderWidth =
      this.inputRef?.nativeElement?.getBoundingClientRect()?.width;

    if (!sliderWidth) {
      return '';
    }

    //* that division by 110 is a deliberate choice to make the bubble have a shorter range than the slider itself
    return `translateX(${
      (sliderWidth * (this.currentPercentage - 50)) / 110
    }px)`;
  }

  constructor(private tailwindFormService: TailwindFormsService) {}

  ngOnInit(): void {
    if (!this.label) {
      this.label = this.name;
    }

    this.parent.controls[this.name].valueChanges
      .pipe(
        takeUntil(this._destroy$)
        // tap(() => this._capacitorService.itemClickedHapticFeedback())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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

    if (
      !this.validationErrors ||
      !this.validationErrors[Object.keys(this.hasErrors)[0]]
    ) {
      return 'Errore di validazione';
    }

    return this.validationErrors[Object.keys(this.hasErrors)[0]];
  }
}
