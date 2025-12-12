/** Base interface for NgReports Log */
export interface NgReportsLogBase {
  /** timestamp in seconds */
  timestamp: number;
}

/** HTTP Error log interface for NgReports */
export interface NgReportsHttpError
  extends NgReportsLogBase {
  type: 'http';
  /** http request url */
  url: string;
  /** http response status code */
  statusCode: number;
  /** http request body JSON if available */
  body?: string;
  /** http response JSON if available */
  response?: string;
}

/** Console error log interface for NgReports Log */
export interface NgReportsConsoleError
  extends NgReportsLogBase {
  type: 'error';
  /** error name */
  name: string;
  /** error message */
  message: string;
  /** error stack if available, limited to 10 lines */
  stack?: string;
}

/** Console info log interface for NgReports */
export interface NgReportsConsoleLog
  extends NgReportsLogBase {
  type: 'log';
  /** message, all console.log arguments joined by \n */
  message: string;
}

/** Route change log interface for NgReports */
export interface NgReportsRouteChange
  extends NgReportsLogBase {
  type: 'route';
  /** only path */
  path: string;
  /** fragment if exists */
  fragment?: string;
  /** query params JSON if exists */
  queryParams?: string;
}

/** User UI interaction interface for NgReports */
export interface NgReportsUserInteraction
  extends NgReportsLogBase {
  type: 'click';
  /** `${tagName}${targetId ? (#targetId) : ''}` */
  target: string;
  /** click position on page */
  pagePos: {
    /** LEFT coordinate */
    x: number;
    /** TOP coorinate */
    y: number;
  }
}

/** Log type for NgReports */
export type NgReportsLog = NgReportsHttpError | NgReportsConsoleError | NgReportsConsoleLog | NgReportsRouteChange | NgReportsUserInteraction;

/** Environment information interface for NgReports */
export interface NgReportsEnvironment {
  /** browser user agent */
  userAgent: string;
  /** browser or app name */
  browserAppName: string;
  /** list of installed extension IDs for supported browsers */
  extensions: string[];
  /** application environment from environment.ts */
  appEnvironment: string;
  /** application version from package.json */
  appVersion: string;
  /** user browser language OR application language if set */
  appLanguage: string;
  /** application url */
  panelUrl: string;
  /** route where report was sent */
  route: string;
  /** user navigator connection type (internet speed) */
  connectionType: string;
  /** available memory */
  ram: number;
  /** window size */
  windowSize: {
    /** window width */
    width: number;
    /** window height */
    height: number;
  }
}

/** Image attachment interface for NgReports */
export interface NgReportsAttachmentImage {
  /** unique identifier */
  uid: string;
  /** attachment name */
  name: string;
  /** image */
  file: Blob;
}

/** Report form interface for NgReports */
export interface NgReportsReport {
  /** project identifier */
  projectId: string;
  /** user contact data */
  dataIsFromAuthService: boolean;
  /** user partial */
  user?: NgReportsAuthUserPartial;
  /** report title */
  title: string;
  /** problem details */
  details: string;
  /** flag if logs should be attached to the report */
  attachLogs?: boolean;
  /** list of logs */
  logs?: NgReportsLog[];
  /** data from form visible on screen where error was reported */
  formData?: any;
  /** flag if user has attached screenshots */
  attachScreenshots?: boolean;
  /** attachment list */
  attachments?: NgReportsAttachmentImage[];
  /** environment information for better problem understanding */
  environment: NgReportsEnvironment;
  /** when? */
  timestamp: number;
}

/** User partial information interface for NgReports */
export interface NgReportsAuthUserPartial {
  /** user ID */
  id: number | string;
  /** user First Name */
  firstName?: string;
  /** user Last Name */
  lastName?: string;
  /** user Email */
  email?: string;
  /** user Metadata (any user information that you want to send) */
  metadata?: any;
}
