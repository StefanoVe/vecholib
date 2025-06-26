import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { UtilsService } from '../../../../services';
import {
  DropzoneConfigInterface,
  DropzoneDirective,
} from '../../../../standalones/dropzone/public-api';
import { TailwindFormsService } from '../../services/tailwind-forms.service';
export interface INotifyTailwindDropzoneCdnConfig {
  postEndpoint: string;
  deleteEndpoint: string;
  authorization: { [key: string]: string };
  body: { [key: string]: string };
  deleteSchema: {
    name: string;
  };
  deleteExtraParams: {
    [key: string]: string;
  };
  responseSchema: {
    value: string;
  };
}

type DropzoneFile = Dropzone.DropzoneFile;

export const TAILWIND_DROPZONE_DEFAULT_LABELS = {
  defaultMessage: 'Trascina i file o fai click/tap qui per caricarli',
  invalidFileType: 'Tipo di file non valido',
  cancelUpload: 'Annulla caricamento',
  uploadCanceled: 'Caricamento annullato',
  maxFilesExceeded: 'Hai raggiunto il numero massimo di file',
  removeFileConfirmation: 'Sei sicuro di voler rimuovere questo file?',
  cancelUploadConfirmation: 'Sei sicuro di voler annullare il caricamento?',
};

@Component({
  selector: 'notify-tailwind-dropzone',
  templateUrl: './tailwind-dropzone.component.html',
  providers: [UtilsService],
  styleUrls: ['./tailwind-dropzone.component.scss'],
})
export class TailwindDropzoneComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  private _utilsService = inject(UtilsService);
  private _httpService = inject(HttpClient);

  @Input() parent!: FormGroup;
  @Input() labels: {
    defaultMessage: string;
    invalidFileType: string;
    cancelUpload: string;
    uploadCanceled: string;
    maxFilesExceeded: string;
    removeFileConfirmation: string;
    cancelUploadConfirmation: string;
  } = TAILWIND_DROPZONE_DEFAULT_LABELS;
  @Input() centerPreview = false;
  @Input() name!: string;
  @Input() schema = {
    value: 'url',
    name: 'name',
    size: 'size',
    type: 'type',
  };
  @Input() height = '20rem';
  @Input() acceptedFiles!: string;
  @Input() maxFileSize = 15;
  @Input() cdnConfig!: INotifyTailwindDropzoneCdnConfig;
  /**
   * Delegate actions to this component instead of manually handling them
   */
  @Input() delegateActions = {
    deleteFromForm: true,
    addToForm: true,
  };

  @Input() validationErrors!: { [key: string]: string };
  @Input() maxFiles = 10;

  @Output() itemDeleted = new EventEmitter<Record<string, unknown>>();
  @Output() itemAdded = new EventEmitter<Record<string, unknown>[]>();

  @ViewChild(DropzoneDirective) dropzoneDirective!: DropzoneDirective;

  public dropzoneConfig?: DropzoneConfigInterface;
  public destroy$ = new Subject<void>();

  public dzApi!: Dropzone;

  constructor(private tailwindFormService: TailwindFormsService) {}

  ngOnInit(): void {
    this._setDropzoneConfig();

    this.parent
      .get(this.name)
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.dzApi.options.maxFiles = this.maxFiles - value.length;
      });
  }

  ngAfterViewInit() {
    this.dzApi = this.dropzoneDirective.dropzone();
    this.appendStoredFiles();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  public async appendStoredFiles() {
    const currentFiles: Dropzone.DropzoneFile[] = this.parent.controls[
      this.name
    ].value.map((v: Record<string, unknown>) => ({
      status: 'success',
      dataURL: v[this.schema.value],
      name: v[this.schema.name],
      size: v[this.schema.size],
      type: v[this.schema.type],
    }));

    await this._utilsService.asyncForEach(currentFiles, async (file, index) => {
      this.dzApi.files.push(file);
      this.dzApi.emit('addedfile', file);
      this._appendDownloadButton(this.dzApi.files[index], file.dataURL || '');
      if (!file.type?.includes('image')) {
        this.dzApi.emit('complete', file);
        return;
      }

      const dataURL = (await fetch(file.dataURL || '')
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        )) as string;

      file.dataURL = dataURL;

      this.dzApi.createThumbnailFromUrl(
        file,
        this.dzApi.options.thumbnailWidth,
        this.dzApi.options.thumbnailHeight,
        this.dzApi.options.thumbnailMethod,
        true,
        (thumbnail: Event) => {
          this.dzApi.emit('thumbnail', file, thumbnail);
          this.dzApi.emit('complete', file);
        }
      );
    });

    this.dzApi.on('queuecomplete', () => {
      this.dzApi.options.maxFiles = this.maxFiles - currentFiles.length;
    });

    this.dzApi.on('maxfilesexceeded', (file) => {
      console.log('maxfilesexceeded', file);
      this.dzApi.removeFile(file);
    });
  }

  public onFileAdded(
    event: [
      DropzoneFile,
      {
        [key: string]: string;
      },
      Event
    ]
  ) {
    const currentFiles = this.parent.controls[this.name].value;

    if (this.delegateActions.addToForm) {
      this.parent.controls[this.name].setValue(
        currentFiles.concat({
          [this.schema.value]: event[1][this.cdnConfig.responseSchema.value],
          [this.schema.name]: event[0].name,
          [this.schema.size]: event[0].size,
          [this.schema.type]: event[0].type,
        })
      );
    }

    this.itemAdded.emit(
      currentFiles.concat({
        [this.schema.value]: event[1][this.cdnConfig.responseSchema.value],
        [this.schema.name]: event[0].name,
        [this.schema.size]: event[0].size,
        [this.schema.type]: event[0].type,
      })
    );

    this._appendDownloadButton(
      event[0],
      event[1][this.cdnConfig.responseSchema.value]
    );
  }

  public onFileRemoved(event: File) {
    console.warn(
      `File with name ${event.name} has been removed from the dropzone.`
    );

    const currentControl = this.parent.controls[this.name].value;

    if (
      !currentControl.filter(
        (f: Record<string, unknown>) => f[this.schema.name] === event.name
      ).length
    ) {
      return;
    }

    const currentFiles = this.parent.controls[this.name].value;

    this._httpService
      .delete(this.cdnConfig.deleteEndpoint, {
        params: {
          [this.cdnConfig.deleteSchema.name]: event.name,
          ...this.cdnConfig.deleteExtraParams,
        },
        headers: this.cdnConfig.authorization,
      })
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          if (this.delegateActions.deleteFromForm) {
            this.parent.controls[this.name].setValue(
              currentFiles.filter(
                (file: Record<string, unknown>) =>
                  file[this.schema.name] !== event.name
              )
            );
          }

          this.itemDeleted.emit(
            currentFiles.filter(
              (file: Record<string, unknown>) =>
                file[this.schema.name] === event.name
            )[0]
          );
        })
      )
      .subscribe();
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

  private _setDropzoneConfig() {
    this.dropzoneConfig = {
      url: this.cdnConfig.postEndpoint,
      maxFiles: this.maxFiles,
      acceptedFiles: this.acceptedFiles,
      autoReset: null,
      errorReset: null,
      cancelReset: null,
      maxFilesize: this.maxFileSize,
      headers: this.cdnConfig.authorization,
      dictDefaultMessage: this.labels.defaultMessage,
      dictInvalidFileType: this.labels.invalidFileType,
      dictCancelUpload: this.labels.cancelUpload,
      dictUploadCanceled: this.labels.uploadCanceled,
      dictMaxFilesExceeded: this.labels.maxFilesExceeded,
      dictRemoveFileConfirmation: this.labels.removeFileConfirmation,
      dictCancelUploadConfirmation: this.labels.cancelUploadConfirmation,
      dictResponseError: 'Errore durante il caricamento',
      dictFileTooBig: 'Il file è troppo pesante',
      dictRemoveFile: 'Rimuovi',
      addRemoveLinks: true,
      clickable: true,
      params: this.cdnConfig.body,
    } as DropzoneConfigInterface;
  }

  private _appendDownloadButton(file: DropzoneFile, url: string) {
    const a = document.createElement('a');

    a.setAttribute('href', url);
    a.setAttribute('class', 'dz-remove');
    a.setAttribute('target', '_blank');
    a.innerHTML = 'Scarica';
    file.previewTemplate.appendChild(a);
  }
}
