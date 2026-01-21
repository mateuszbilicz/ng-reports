import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea';
import {SelectModule} from 'primeng/select';
import {CheckboxModule} from 'primeng/checkbox';
import {TagModule} from 'primeng/tag';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ReportsService} from '../../../core/Services/ReportsService/ReportsService';
import {CommentsService} from '../../../core/Services/CommentsService/CommentsService';
import {Report} from '../../../core/swagger/model/report';
import {Comment} from '../../../core/swagger/model/comment';
import {Severity} from '../../../core/Models/Severity';
import {CreateComment} from '../../../core/swagger/model/createComment';
import {UpdateComment} from '../../../core/swagger/model/updateComment';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {Tooltip} from 'primeng/tooltip';
import {getSeverityText} from '../../../core/Utils/severity-to-text';
import {filter, tap} from 'rxjs';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Tooltip
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './report-details.component.html'
})
export class ReportDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  reportsService = inject(ReportsService);
  commentsService = inject(CommentsService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  reportId = '';
  report = signal<Report | any>(null); // Use any for loose typing flexibility if models drift
  comments = signal<Comment[]>([]);
  environment = computed(() => JSON.parse(this.report()?.environment ?? '{}'));
  logs = computed(() => JSON.parse(this.report()?.logs?.[0] ?? '[]').map((log: any) => ({
    ...log,
    _uid: `${log.type}-${log.timestamp}-${Math.floor(Math.random() * Date.now()).toString(36)}`,
    timestamp: new Date(log.timestamp * 1000)
  })));
  date = computed(() => new Date((this.report()?.timestamp ?? 0) * 1000));
  user = computed(() => JSON.parse(this.report()?.user ?? '{}'));
  formData = computed(() => this.report()?.formData);
  attachments = computed(() => this.report()?.attachments);
  expandedLogs = new Map<string, boolean>();
  allExpanded = signal<boolean>(false);
  isGeneratingAiSummary = signal<boolean>(false);

  getSeverityText = getSeverityText;

  // Report Edit
  reportDialog = false;
  severities = [
    {label: 'Info', value: Severity.Info},
    {label: 'Warning', value: Severity.Warning},
    {label: 'Error', value: Severity.Error},
    {label: 'Critical', value: Severity.Critical}
  ];
  reportForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    severity: [Severity.Info, Validators.required],
    fixed: [false]
  });

  // Comments
  newCommentText = '';
  commentEditDialog = false;
  editingCommentText = '';
  editingCommentId = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.reportId = params.get('id') || '';
      if (this.reportId) {
        this.loadData();
      }
    });
  }

  toggleLogExpand(_uid: string) {
    this.expandedLogs.has(_uid)
      ? this.expandedLogs.delete(_uid)
      : this.expandedLogs.set(_uid, true);
  }

  expandAllLogs() {
    this.allExpanded.set(true);
    this.expandedLogs = new Map(this.logs().map((log: any) => [log._uid, true]));
  }

  collapseAllLogs() {
    this.allExpanded.set(false);
    this.expandedLogs = new Map();
  }

  loadData() {
    this.reportsService.getReport(this.reportId).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loadComments();
      },
      error: () => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load report'})
    });
  }

  requestAiSummary() {
    this.isGeneratingAiSummary.set(true);
    this.commentsService.requestAiSummary(this.reportId)
      .pipe(
        filter(res => !!res),
        tap(() => this.loadComments())
      )
      .subscribe({
        complete: () => this.isGeneratingAiSummary.set(false)
      });
  }

  loadComments() {
    this.commentsService.getComments(this.reportId).subscribe({
      next: (data) => {
        const items = data.items || data.comments || (Array.isArray(data) ? data : []);
        this.comments.set(items);
      },
      error: () => console.error('Failed to load comments')
    });
  }

  goBack() {
    this.router.navigate(['/reports']);
  }

  // Report Actions
  editReport() {
    const r = this.report();
    if (!r) return;
    this.reportForm.patchValue({
      title: r.title,
      description: r.details,
      severity: r.severity,
      fixed: r.fixed
    });
    this.reportDialog = true;
  }

  saveReport() {
    if (this.reportForm.invalid) return;
    const val = this.reportForm.value;
    const update: Partial<Report> = {
      title: val.title!,
      details: val.description || '',
      severity: val.severity!,
      fixed: val.fixed!
    };

    this.reportsService.updateReport(this.reportId, update).subscribe(() => {
      this.loadData();
      this.reportDialog = false;
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Report updated'});
    });
  }

  getSeverityColor(severity: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const sev = Number(severity);
    switch (sev) {
      case Severity.Critical:
        return 'danger';
      case Severity.Error:
        return 'danger';
      case Severity.Warning:
        return 'warn';
      case Severity.Info:
        return 'info';
      default:
        return 'info';
    }
  }

  // Comment Actions
  postComment() {
    if (!this.newCommentText.trim()) return;

    const create: CreateComment = {
      reportId: this.reportId,
      content: this.newCommentText,
      // user, timestamp handled by backend mainly, but minimal reqs:
      // user and timestamp might be required in model but backend fills?
      // Checking createComment.ts: required: reportId, content. Optional: user, timestamp.
      timestamp: new Date().getTime()
    } as any;

    this.commentsService.createComment(create).subscribe({
      next: () => {
        this.newCommentText = '';
        this.loadComments();
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Comment posted'});
      },
      error: (e) => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to post comment'})
    });
  }

  deleteComment(comment: Comment) {
    this.confirmationService.confirm({
      header: 'Delete comment?',
      accept: () => {
        this.commentsService.deleteComment(comment.commentId!).subscribe(() => {
          this.loadComments();
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Comment deleted'});
        });
      }
    });
  }

  editComment(comment: Comment) {
    this.editingCommentText = comment.content!;
    this.editingCommentId = comment.commentId!;
    this.commentEditDialog = true;
  }

  saveCommentUpdate() {
    if (!this.editingCommentText.trim()) return;
    const update: UpdateComment = {
      content: this.editingCommentText
    };
    this.commentsService.updateComment(this.editingCommentId, update).subscribe(() => {
      this.loadComments();
      this.commentEditDialog = false;
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Comment updated'});
    });
  }
}
