import { CommonModule } from '@angular/common';
import { NgModule, importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TailwindToastIconComponent } from './components/tailwind-toast-icon/tailwind-toast-icon.component';
import { TailwindToastComponent } from './components/tailwind-toast/tailwind-toast.component';

@NgModule({
  declarations: [TailwindToastComponent, TailwindToastIconComponent],
  imports: [
    CommonModule,
    ToastrModule.forRoot({
      toastComponent: TailwindToastComponent,
      toastClass: '',
      maxOpened: 1,
      autoDismiss: true,
    }),
  ],
})
export class TailwindToastsModule {}

//provide the module TailwindToasts to use in angular 15+
export const provideTailwindToasts = () => {
  return importProvidersFrom(TailwindToastsModule);
};
