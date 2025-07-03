import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { NgxDropzoneChangeEvent, NgxDropzoneModule } from 'ngx-dropzone';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'vecholib-upload',
  standalone: true,
  imports: [NgxDropzoneModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss', '../../../../../styles.css'],
})
export class UploadComponent implements OnChanges, OnDestroy, OnInit {
  private _toastr = inject(ToastrService);

  @Input() disabled = false;
  @Input() acceptedFiles = '*';
  @Input()
  uploadLabel = `Fai click per caricare un file, oppure trascinalo in questo riquadro`;
  @Input() file: File | null = null;

  @Input() removeFile$ = new Observable<void>();

  @Output() fileChanged = new EventEmitter<{
    file: File | null;
    blob: string | ArrayBuffer | null;
  }>();

  public blob?: string | ArrayBuffer | null;
  private _destroy$ = new Subject<void>();

  ngOnChanges() {
    if (!this.file?.size) {
      this.blob = null;
      this.file = null;
    }
  }

  ngOnInit() {
    this.removeFile$
      .pipe(
        takeUntil(this._destroy$),
        tap(() => this.handleRemoveFile())
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public async onSelectFile(event: NgxDropzoneChangeEvent) {
    if (event.rejectedFiles.length) {
      this._toastr.error('Formato file non valido');
      return;
    }

    const file = event.addedFiles[0];
    this.file = file;

    const buffer = await this.file.arrayBuffer();
    const srcBlob = await this._arrayBufferToBase64(buffer);
    this.blob = srcBlob;

    this.fileChanged.emit({
      file: this.file,
      blob: this.blob,
    });
  }

  public handleRemoveFile() {
    this.file = null;
    this.blob = null;

    this.fileChanged.emit({
      file: this.file,
      blob: this.blob,
    });
  }

  private async _arrayBufferToBase64(buffer: ArrayBuffer) {
    //arraybuffer to blob
    const blob = new Blob([buffer]);

    const result = new Promise<string | ArrayBuffer | null>((resolve) => {
      //blob to base64 without using FileReader
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        return resolve(reader.result);
      };
    });

    return result;
  }
}
