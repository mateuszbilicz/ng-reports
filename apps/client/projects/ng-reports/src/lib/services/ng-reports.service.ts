import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  NgReportsAuthUserPartial, NgReportsConsoleError, NgReportsConsoleLog,
  NgReportsEnvironment,
  NgReportsHttpError,
  NgReportsLog,
  NgReportsRouteChange, NgReportsUserInteraction
} from '../api/api';
import { NG_REPORTS_CONFIG_DEFAULT, NgReportsConfig } from '../api/config';
import { BehaviorSubject, fromEvent, Subscription, takeUntil, throttleTime } from 'rxjs';
import { ResolveEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class NgReportsService {
  protected readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);
  // list of all logs that will be sent to the server
  private _logs: NgReportsLog[] = [];
  // if true, freeze all logs collectors
  isCreatingReport: boolean = false;
  // config as constant to prevent changes
  config = signal<NgReportsConfig>(NG_REPORTS_CONFIG_DEFAULT);
  // controls visibility of the report dialog
  isOpen = signal<boolean>(false);

  // default console.log function
  private defaultConsoleLog = console.log;
  // for tracking invalid forms
  private _formGroupPipe: Subscription | null = null;
  _formData: any = null;
  _authUserPartial = new BehaviorSubject<NgReportsAuthUserPartial | null>(null);

  constructor() {

    // @ts-ignore
    window.console.log = (...args) => {
      this.addConsoleLog(args);
      this.defaultConsoleLog(...args);
    }

    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        if (event instanceof ResolveEnd) {
          if (this._formGroupPipe) this._formGroupPipe.unsubscribe();
          this._formData = null;
          this._formGroupPipe = null;
          this.addRouteChange(
            event.url,
            event.state.root.fragment,
            event.state.root.queryParams
              ? JSON.stringify(event.state.root.queryParams)
              : null
          );
        }
      });

    fromEvent<MouseEvent>(
      window.document,
      'click'
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        throttleTime(30)
      )
      .subscribe(event => {
        let target: string = '';
        if (event.target) {
          const targetElem = event.target as HTMLElement;
          target = `${targetElem.tagName}${targetElem.id ? `#${targetElem.id}` : ''}`;
        }
        this.addUserInteraction(
          target,
          event.pageX,
          event.pageY
        );
      });
  }

  private getBrowserData() {
    let extensions: string[] = [];
    // currently only chrome, mozilla somehow have other extensions import method
    document.head.querySelectorAll('script')
      .forEach(script => {
        if (script.src.includes('chrome-extension://')) {
          extensions.push(
            script.src.split('chrome-extension://')[1]
              .split('/')[0]
          );
        }
      });
    return {
      userAgent: navigator.userAgent,
      // all of them are deprecated, but in some browsers it will work
      browserAppName: `${navigator.appName ?? 'N/A'
        } | ${navigator.appVersion ?? 'N/A'
        } | ${navigator.platform ?? 'N/A'
        } | ${navigator.appVersion ?? 'N/A'
        }`,
      extensions: extensions,
      // @ts-ignore
      connectionType: navigator['connection']?.effectiveType ?? '0',
      // @ts-ignore
      ram: navigator['deviceMemory'] ?? 0,
      appLanguage: navigator.language,
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  }

  private getApplicationData() {
    return {
      appEnvironment: this.config().environment,
      route: location.pathname,
      panelUrl: location.hostname,
      appVersion: this.config().appVersion
    }
  }

  public getReportEnvironment() {
    return {
      ...this.getBrowserData(),
      ...this.getApplicationData(),
      language: this.config().language
    } as NgReportsEnvironment;
  }

  public getLogs() {
    return [...this._logs];
  }

  // reduce logs amount to logsLimit
  private reduceLogs() {
    if (this._logs.length > this.config().logsLimit) {
      this._logs = this._logs.slice(-this.config().logsLimit);
    }
  }

  public addLog(log: NgReportsLog) {
    const last3 = this._logs.slice(-this.config().logSpamPrevention.checkForSpamLast);
    if (!last3.some(last =>
      (last.timestamp + this.config().logSpamPrevention.lastSameOccurrenceSeconds) > log.timestamp
      && this.isSameError(last, log)
    )) {
      this._logs.push(log);
      this.reduceLogs();
    }
  }

  private isSameError(
    log1: NgReportsLog,
    log2: NgReportsLog
  ) {
    if (log1.type != log2.type) return false;
    switch (log1.type) {
      case 'http':
        return (
          (<NgReportsHttpError>log1).url == (<NgReportsHttpError>log2).url
          && (<NgReportsHttpError>log1).statusCode == (<NgReportsHttpError>log2).statusCode
          && (<NgReportsHttpError>log1).body == (<NgReportsHttpError>log2).body
          && (<NgReportsHttpError>log1).response == (<NgReportsHttpError>log2).response
        );
      case 'error':
        return (
          (<NgReportsConsoleError>log1).name == (<NgReportsConsoleError>log2).name
          && (<NgReportsConsoleError>log1).message == (<NgReportsConsoleError>log2).message
          && (<NgReportsConsoleError>log1).stack == (<NgReportsConsoleError>log2).stack
        );
      case 'log':
        return (
          (<NgReportsConsoleLog>log1).message == (<NgReportsConsoleLog>log2).message
        );
      case 'route':
        return (
          (<NgReportsRouteChange>log1).path == (<NgReportsRouteChange>log2).path
          && (<NgReportsRouteChange>log1).fragment == (<NgReportsRouteChange>log2).fragment
          && (<NgReportsRouteChange>log1).queryParams == (<NgReportsRouteChange>log2).queryParams
        );
      case 'click': {
        const diffX = Math.abs((<NgReportsUserInteraction>log1).pagePos.x - (<NgReportsUserInteraction>log2).pagePos.x),
          diffY = Math.abs((<NgReportsUserInteraction>log1).pagePos.y - (<NgReportsUserInteraction>log2).pagePos.y),
          sameClickDiffDistance = this.config().logSpamPrevention.sameClickDiffDistance;
        return (
          (<NgReportsUserInteraction>log1).target == (<NgReportsUserInteraction>log2).target
          && diffX < sameClickDiffDistance
          && diffY < sameClickDiffDistance
        );
      }
      default:
        return false;
    }
  }

  // returns current time in seconds
  public get timestamp() {
    return Math.floor(Date.now() / 1000);
  }

  public addHttpError(
    url: string,
    statusCode: number,
    body?: string,
    response?: string
  ) {
    if (
      !this.config().collectHttpErrors
      || this.isCreatingReport
    ) return;
    this.addLog({
      type: 'http',
      url,
      statusCode,
      body,
      response,
      timestamp: this.timestamp
    });
  }

  public addConsoleError(
    name: string,
    message: string,
    stack?: string
  ) {
    if (
      !this.config().collectConsoleErrors
      || this.isCreatingReport
    ) return;
    this.addLog({
      type: 'error',
      name,
      message,
      stack,
      timestamp: this.timestamp
    });
  }

  public addConsoleLog(args: any[]) {
    if (
      !this.config().collectConsoleLogs
      || this.isCreatingReport
    ) return;
    this.addLog({
      type: 'log',
      message: args.join('\n'),
      timestamp: this.timestamp
    });
  }

  public addRouteChange(
    path: string,
    fragment: string | null,
    queryParams: string | null
  ) {
    if (
      !this.config().collectRouteChanges
      || this.isCreatingReport
    ) return;
    this.addLog({
      type: 'route',
      path,
      ...(fragment ? { fragment } : {}),
      ...(queryParams ? { queryParams } : {}),
      timestamp: this.timestamp
    });
  }

  public addUserInteraction(
    target: string,
    x: number,
    y: number
  ) {
    if (
      !this.config().collectUserInteractions
      || this.isCreatingReport
      || target.includes('#t2t-logger-no-log')
    ) return;
    this.addLog({
      type: 'click',
      target,
      pagePos: { x, y },
      timestamp: this.timestamp
    });
  }

  public setFormData(data?: any) {
    this._formData = data;
  }

  public setFormGroupPipe(pipe: BehaviorSubject<any>) {
    this._formGroupPipe = pipe.subscribe(data => {
      this._formData = data;
    });
  }

  public setAuthUser(user: NgReportsAuthUserPartial | null) {
    this._authUserPartial.next(user);
  }

  public updateConfig(config: Partial<NgReportsConfig>) {
    this.config.update(previousConfig => ({
      ...previousConfig,
      ...config
    }));
  }

  public open() {
    this.isOpen.set(true);
  }

  public close() {
    this.isOpen.set(false);
  }
}
