import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TailwindFormsService } from '../../services/tailwind-forms.service';

@Component({
	selector: 'notify-tailwind-textarea',
	standalone: false,
	templateUrl: './tailwind-textarea.component.html',
	styleUrls: ['./tailwind-textarea.component.scss'],
})
export class TailwindTextareaComponent
	implements OnInit, OnChanges, AfterViewInit
{
	@Input() parent!: FormGroup;
	@Input() label!: string;
	@Input() name!: string;
	@Input() helpText!: string;
	@Input() rows?: number;
	@Input() cols?: number;
	@Input() placeholder = '';
	@Input() allowResize?: {
		horizontal?: boolean;
		vertical?: boolean;
	} = {
		horizontal: false,
		vertical: false,
	};
	@Input() titlecaseLabel = true;
	@Input() compact = false;
	@Input() validationErrors!: { [key: string]: string };
	@Input() disableAutocomplete = false;
	@Input() mask!: string;
	@Input() thousandSeparator!: string;
	@Input() patterns!: {
		[character: string]: {
			pattern: RegExp;
			optional?: boolean;
			symbol?: string;
		};
	};

	@Input() prefix = '';
	@Input() suffix = '';
	@Input() cssClass =
		'textarea w-full textarea-bordered backdrop-blur input-style resize-none';

	@ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

	constructor(private tailwindFormService: TailwindFormsService) {}

	ngOnInit(): void {
		if (!this.label) {
			this.label = this.name;
		}
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

	ngAfterViewInit(): void {
		if (this.disableAutocomplete) {
			this.inputRef.nativeElement.setAttribute('autocomplete', 'off');
			this.inputRef.nativeElement.setAttribute('autocorrect', 'off');
			this.inputRef.nativeElement.setAttribute('autocapitalize', 'none');
			this.inputRef.nativeElement.setAttribute('spellcheck', 'false');
		}
	}

	togglePasswordVisibility() {
		if (this.inputRef.nativeElement.type === 'text') {
			return (this.inputRef.nativeElement.type = 'password');
		}

		return (this.inputRef.nativeElement.type = 'text');
	}

	public clearInputValue() {
		this.parent.get(this.name)?.setValue('');
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
