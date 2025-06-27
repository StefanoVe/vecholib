import {
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, tap } from 'rxjs';

@Directive({
  standalone: true,
  selector: '[notifyGestures]',
})
export class GesturesDirective implements OnDestroy {
  @Output() horizontalSwipe = new EventEmitter<number>();
  @Output() verticalSwipe = new EventEmitter<number>();
  @Output() touchEnd = new EventEmitter<{
    x: number;
    y: number;
  }>();

  public touchStatus = {
    isTouching: false,
    startX: 0,
    startY: 0,
  };

  public horizontalSwipe$ = new BehaviorSubject<number>(0);
  public verticalSwipe$ = new BehaviorSubject<number>(0);
  private _destroyed$ = new Subject<void>();

  constructor() {
    this.horizontalSwipe$
      .pipe(
        takeUntil(this._destroyed$),
        tap((v) => {
          if (!this.touchStatus.isTouching) {
            return;
          }
          this.horizontalSwipe.emit(v);
        })
      )
      .subscribe();

    this.verticalSwipe$
      .pipe(
        takeUntil(this._destroyed$),
        tap((v) => {
          if (!this.touchStatus.isTouching) {
            return;
          }
          this.verticalSwipe.emit(v);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  @HostListener('touchstart', ['$event'])
  private _handleTouchStart($event: TouchEvent) {
    const touch = $event.touches[0];

    if (!touch) {
      return;
    }

    this.touchStatus = {
      isTouching: true,
      startX: touch.clientX,
      startY: touch.clientY,
    };
  }

  @HostListener('touchend', ['$event'])
  private _handleTouchEnd($event: TouchEvent) {
    const touch = $event.changedTouches[0];

    if (!touch) {
      return;
    }

    this.touchStatus = {
      isTouching: false,
      startX: touch.clientX,
      startY: touch.clientY,
    };

    this.touchEnd.emit({
      x: (touch.clientX / window.innerWidth) * 100,
      y: (touch.clientY / window.innerHeight) * 100,
    });
  }

  @HostListener('touchmove', ['$event'])
  private _handleTouchMove($event: TouchEvent) {
    const touch = $event.touches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this.touchStatus.startX;
    const deltaY = touch.clientY - this.touchStatus.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX < absY) {
      this.verticalSwipe$.next((deltaY / window.innerHeight) * 100);
      return;
    }

    $event.preventDefault();
    this.horizontalSwipe$.next((deltaX / window.innerWidth) * 100);
  }
}
