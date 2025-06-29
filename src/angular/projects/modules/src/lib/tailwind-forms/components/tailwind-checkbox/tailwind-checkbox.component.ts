import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, tap } from 'rxjs';

export interface ITailwindCheckboxToggleIcon {
  checked: string;
  unchecked: string;
  button?: string;
}

export const CHECKBOX_TOGGLE_EYE: ITailwindCheckboxToggleIcon = {
  checked: `<svg class="size-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.82 9-5.391 0-9.877-3.88-10.818-9C2.12 6.88 6.608 3 12 3Zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19Zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
</svg>`,
  unchecked: `<svg class="size-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="m9.342 18.781-1.931-.518.787-2.939a10.99 10.99 0 0 1-3.237-1.872l-2.153 2.154-1.415-1.415 2.154-2.153a10.957 10.957 0 0 1-2.371-5.07l1.968-.359C3.903 10.811 7.579 14 12 14c4.42 0 8.097-3.188 8.856-7.39l1.968.358a10.958 10.958 0 0 1-2.37 5.071l2.153 2.153-1.415 1.415-2.153-2.154a10.99 10.99 0 0 1-3.237 1.872l.787 2.94-1.931.517-.788-2.94a11.07 11.07 0 0 1-3.74 0l-.788 2.94Z"></path>
</svg>`,
};

export const CHECKBOX_PADLOCK_CLOSED: ITailwindCheckboxToggleIcon = {
  checked: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>
`,
  unchecked: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>
`,
};

@Component({
  selector: 'vecholib-tailwind-checkbox',
  standalone: false,
  templateUrl: './tailwind-checkbox.component.html',
})
export class TailwindCheckboxComponent implements OnInit, OnChanges, OnDestroy {
  private _domSanitizer = inject(DomSanitizer);
  // private _capacitorService = inject(CapacitorService);
  private _platformId = inject(PLATFORM_ID);

  @Input() parent!: FormGroup;
  @Input() label!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() compact = false;
  @Input() disabled = false;
  @Input() toggleColorClass = 'toggle-success';

  @Input() validationErrors!: { [key: string]: string };
  /**
   * Override the default toggle icon, accepts HTML elements
   */
  @Input() overrideToggleIcon?: ITailwindCheckboxToggleIcon;

  private _destroy$ = new Subject<void>();

  public toggleIcon?: SafeHtml = '';

  public get safeCheckboxLabel() {
    return this._sanitizeDom(this.label);
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
  ngOnInit(): void {
    if (!this.label) {
      this.label = this.name;
    }

    this.parent.controls[this.name].valueChanges
      .pipe(
        takeUntil(this._destroy$),
        tap(this._updateToggleIcon.bind(this))
        // tap(() => this._capacitorService.itemClickedHapticFeedback())
      )
      .subscribe();

    this._updateToggleIcon();
  }

  ngOnChanges(): void {
    this._updateToggleIcon();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  toggleCheckbox() {
    this.parent.get(this.name)?.setValue(!this.parent.get(this.name)?.value);
  }

  private _sanitizeDom(html: string) {
    if (!isPlatformBrowser(this._platformId)) {
      return '';
    }
    return this._domSanitizer.bypassSecurityTrustHtml(html);
  }

  private _updateToggleIcon() {
    this.toggleIcon = this._sanitizeDom(
      this.parent.get(this.name)?.value
        ? this.overrideToggleIcon?.checked || '<svg></svg>'
        : this.overrideToggleIcon?.unchecked || '<svg></svg>'
    );
  }
}
