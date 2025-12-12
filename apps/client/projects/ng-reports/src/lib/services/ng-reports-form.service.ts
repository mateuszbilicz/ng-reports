import {DestroyRef, inject, Injectable} from '@angular/core';
import {NgReportsService} from './ng-reports.service';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {IForm} from '../utils/form';
import {NgReportsAttachmentImage, NgReportsAuthUserPartial, NgReportsReport} from '../api/api';
import {from, switchMap, tap} from 'rxjs';
import {Jimp, JimpMime} from 'jimp';
import {readFile} from '../utils/file-reader';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/** Service for report form functionality */
@Injectable({
  providedIn: 'root'
})
export class NgReportsFormService {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly ngReportsService = inject(NgReportsService);
  private imageUrls = new Map<string, string>();
  formGroup = new FormGroup<IForm<NgReportsReport>>({
    projectId: new FormControl('', [Validators.required]),
    environment: new FormControl({}, [Validators.required]),
    timestamp: new FormControl(0, [Validators.required]),
    dataIsFromAuthService: new FormControl(false, [Validators.required]),
    user: new FormGroup<IForm<NgReportsAuthUserPartial>>({
      id: new FormControl('', []),
      firstName: new FormControl('', []),
      lastName: new FormControl('', []),
      email: new FormControl('', []),
      metadata: new FormControl({}, []),
    }),
    title: new FormControl('', [Validators.required]),
    details: new FormControl('', [Validators.required]),
    attachLogs: new FormControl(false, [Validators.required]),
    logs: new FormArray([]),
    formData: new FormControl({}, [Validators.required]),
    attachScreenshots: new FormControl(false, [Validators.required]),
    attachments: new FormArray([]),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.flushImageUrls();
    });
  }

  /** Loads all form data needed to fill report by user */
  loadData() {
    const userPartial = this.ngReportsService._authUserPartial.getValue();
    this.formGroup.reset({
      projectId: this.ngReportsService.config().projectId,
      environment: this.ngReportsService.getReportEnvironment(),
      timestamp: this.ngReportsService.timestamp,
      ...(
        userPartial
          ? {
            dataIsFromAuthService: true,
            user: userPartial
          }
          : {
            dataIsFromAuthService: false,
            user: {}
          }
      ),
      title: '',
      details: '',
      attachLogs: true,
      logs: new FormArray([]),
      formData: this.ngReportsService._formData
        ? JSON.stringify(this.ngReportsService._formData)
        : null,
      attachScreenshots: true,
      attachments: new FormArray([])
    });
    this.formGroup.get('projectId')!.disable();
    this.formGroup.get('environment')!.disable();
    this.formGroup.get('timestamp')!.disable();
    this.formGroup.get('logs')!.disable();
    this.formGroup.get('formData')!.disable();
    this.formGroup.get('dataIsFromAuthService')!.disable();
    if (userPartial) {
      this.formGroup.get('user')!.disable();
    }
    this.flushImageUrls();
  }

  /** Prepares image attachment and adds it to the attachments field */
  attachImage(name: string, file: File) {
    return readFile(file, 'array-buffer')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(buff =>
          from(
            Jimp.read(buff)
          )
        ),
        tap(img => {
          if (img.width > img.height) {
            if (img.width > this.ngReportsService.config().attachmentMaxSize) {
              img.resize({
                w: this.ngReportsService.config().attachmentMaxSize
              });
            }
          } else {
            if (img.height > this.ngReportsService.config().attachmentMaxSize) {
              img.resize({
                h: this.ngReportsService.config().attachmentMaxSize
              });
            }
          }
        }),
        switchMap(img =>
          from(
            img.getBuffer(JimpMime.png)
          )
        ),
        tap(buff => {
          let fg = new FormGroup({
            uid: new FormControl('', [Validators.required]),
            name: new FormControl('', [Validators.required]),
            file: new FormControl<Blob | null>(null, [Validators.required])
          });
          const blob = new Blob(
            [buff],
            {
              type: 'image/png'
            }
          );
          const uid = Date.now().toString(36);
          fg.reset({
            uid,
            name,
            file: blob
          });
          fg.get('file')!.disable();
          (this.formGroup.get('attachments')! as FormArray)
            .push(fg);
          this.imageUrls.set(
            uid,
            URL.createObjectURL(blob)
          );
        })
      );
  }

  /** Removes attachment from attachments field */
  removeAttachment(index: number) {
    (this.formGroup.get('attachments')! as FormArray)
      .removeAt(index);
  }

  /** Returns trackBy function for attachments */
  attachmentTrackBy = (
    _: any,
    attachmentFormGroup: FormGroup<IForm<NgReportsAttachmentImage>>
  ): string => {
    return attachmentFormGroup.get('uid')!.value as string;
  }

  /** Returns list of attachment form groups */
  get attachmentFormGroups() {
    return (this.formGroup.get('attachments') as FormArray)
      .controls as FormGroup<IForm<NgReportsAttachmentImage>>[];
  }

  /** Returns user form group */
  get userFormGroup() {
    return this.formGroup.get('user') as FormGroup<IForm<NgReportsAuthUserPartial>>;
  }

  /** Returns complete report value with logs and attachments depending on selected options */
  getUploadValue(): NgReportsReport {
    let val = this.formGroup.getRawValue() as NgReportsReport;
    if (!val.attachScreenshots) delete val.attachments;
    if (val.attachLogs) {
      val.logs = this.ngReportsService.getLogs();
    } else {
      delete val.logs;
    }
    return val;
  }

  /** Removes all URLs of images - called automatically on destroy and in loadData fn. Call manually if needed. */
  flushImageUrls() {
    this.imageUrls.forEach((url: string) => {
      URL.revokeObjectURL(url);
    });
    this.imageUrls = new Map();
  }

  /** Returns URL of the image inside attachment */
  getImage(assetUid: string) {
    return this.imageUrls.get(assetUid);
  }
}
