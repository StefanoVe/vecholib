import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'highlight',
	standalone: false,
})
export class HighlightSearchPipe implements PipeTransform {
	transform(value: any, ...args: any): unknown {
		if (!args) {
			return value;
		}

		const regex = new RegExp(args, 'gi');
		const match = value?.match(regex);

		if (!match) {
			return value;
		}

		return value.replace(
			regex,
			`<span class='bg-yellow-300 rounded text-black'>${match[0]}</span>`
		);
	}
}
