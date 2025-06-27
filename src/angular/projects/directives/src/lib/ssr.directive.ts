import { isPlatformServer } from '@angular/common';
import {
  Component,
  Directive,
  inject,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[SSR]',
  standalone: true,
})
export class SSRDirective implements OnInit {
  private platformId = inject(PLATFORM_ID);
  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<Component>
  ) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.viewContainer.clear();
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
