import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { addDays, getDate } from 'date-fns';
import { TailwindFormsService } from '../../services/tailwind-forms.service';
import { TailwindDatepickerComponent } from './tailwind-datepicker.component';

describe('TailwindDatepickerComponent', () => {
  let component: TailwindDatepickerComponent;
  let fixture: ComponentFixture<TailwindDatepickerComponent>;
  let el: DebugElement;

  let tailwindFormsServiceSpy: jasmine.SpyObj<TailwindFormsService>;

  let form = new FormBuilder().group({
    formItem: [new Date(), Validators.requiredTrue],
  });

  beforeEach(async () => {
    tailwindFormsServiceSpy = jasmine.createSpyObj('TailwindFormsService', [
      'fillValidationErrorsWithMissing',
    ]);

    await TestBed.configureTestingModule({
      declarations: [TailwindDatepickerComponent],
      providers: [
        { provide: TailwindFormsService, useValue: tailwindFormsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TailwindDatepickerComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;

    component.parent = form;

    component.name = 'formItem';
    component.placeholder = '19/01/2015';
    component.validationErrors = { required: 'This is required' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get errors', () => {
    expect(component.validationErrors).toEqual({
      required: 'This is required',
    });
  });

  it('isToday should return true', () => {
    const todayDate = getDate(new Date());
    expect(component.isToday(todayDate)).toBeTrue();
  });

  it('isToday should return false', () => {
    expect(component.isToday(43)).toBeFalse();
  });
  it('isTouched should return false', () => {
    expect(component.touched).toBeFalse();
  });

  it('should check whetever the component has been errors', () => {
    expect(component.hasErrors).toEqual({
      required: true,
    });
  });

  it('should not show validation errors', () => {
    expect(component.showValidationErrors).toBeTrue();
  });

  it('should get a required validation error message', () => {
    expect(component.validationErrorMessage).toEqual('This is required');
  });

  it('should get date value', () => {
    const dateInput = el.nativeElement.querySelector('#formItem');
    dateInput.value = addDays(new Date(), 200).toISOString();

    component.getDateValue(10);

    expect(dateInput.getAttribute('value')).toEqual('2022-01-10');
  });

  it('should decrement month and get the number of days', () => {
    const preMonth = component.month;

    spyOn(component, 'getNoOfDays').and.callThrough();
    spyOn(component, 'checkDisableBackwards').and.callThrough();
    spyOn(component, 'checkDisableForwards').and.callThrough();

    component.decrementMonthAndGetNoOfDays();

    fixture.detectChanges();
    // expect(component.month).toEqual(preMonth - 1);
    expect(component.getNoOfDays).toHaveBeenCalled();
    expect(component.checkDisableBackwards()).toHaveBeenCalled();
    expect(component.checkDisableForwards()).toHaveBeenCalled();

    expect(component.blankdays).toEqual(component.getNoOfDays().blankDaysArray);
    expect(component.no_of_days).toEqual(component.getNoOfDays().daysArray);
  });

  it('should fillValidationErrorsWithMissing on change', () => {
    component.ngOnChanges({
      validationErrors: {
        previousValue: false,
        currentValue: true,
        firstChange: true,
      },
    } as any);

    expect(
      tailwindFormsServiceSpy.fillValidationErrorsWithMissing
    ).toHaveBeenCalled();
  });
});
