import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component } from '@angular/core';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'notify-tailwind-toast',
  templateUrl: './tailwind-toast.component.html',
  standalone: false,
  styleUrl: '../../../../../../../styles.css',
  animations: [
    trigger('flyInOut', [
      state(
        'inactive',
        style({
          opacity: 0,
        })
      ),
      transition(
        'inactive => active',
        animate(
          '400ms ease-out',
          keyframes([
            style({
              transform: 'translate3d(100%, 0, 0) skewX(-30deg)',
              opacity: 0,
            }),
            style({
              transform: 'skewX(20deg)',
              opacity: 1,
            }),
            style({
              transform: 'skewX(-5deg)',
              opacity: 1,
            }),
            style({
              transform: 'none',
              opacity: 1,
            }),
          ])
        )
      ),
      transition(
        'active => removed',
        animate(
          '400ms ease-out',
          keyframes([
            style({
              opacity: 1,
            }),
            style({
              transform: 'translate3d(100%, 0, 0) skewX(30deg)',
              opacity: 0,
            }),
          ])
        )
      ),
    ]),
  ],
  preserveWhitespaces: false,
})
export class TailwindToastComponent extends Toast {
  // constructor is only necessary when not using AoT
  constructor(
    protected override toastrService: ToastrService,
    public override toastPackage: ToastPackage
  ) {
    super(toastrService, toastPackage);
  }
}
