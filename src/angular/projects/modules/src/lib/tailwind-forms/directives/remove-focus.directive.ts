import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * This directive removes focus from the selectors after clicking on them
 */
@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[remove-focus]',
})
export class RemoveFocusDirective {
  @Input() elementToFocus?: HTMLElement;
  constructor(private elRef: ElementRef<HTMLButtonElement>) {}

  @HostListener('touchcancel') onTouchCancel() {
    this.elRef.nativeElement.blur();
    return;
  }

  @HostListener('click') onClick() {
    if (this.elementToFocus) {
      this.elementToFocus.focus();
      return;
    }

    this.elRef.nativeElement.blur();
  }
}
