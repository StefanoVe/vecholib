import { Component, Input } from '@angular/core';

@Component({
  selector: 'golden-tailwind-toast-icon',
  standalone: false,
  styles: [
    `
      @reference "tailwindcss";
      svg {
        @apply w-6 h-6 my-auto;
      }
    `,
  ],
  styleUrl: '../../../../../../../styles.css',
  templateUrl: './tailwind-toast-icon.component.html',
})
export class TailwindToastIconComponent {
  @Input() type: string = '';
}
