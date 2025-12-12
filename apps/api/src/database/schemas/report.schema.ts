import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Severity } from './severity.schema';
import { Comment } from './comment.schema';

/** Position X Y */
class Position {
  /** Position X */
  @ApiProperty()
  @Prop()
  x: number;

  /** Position Y */
  @ApiProperty()
  @Prop()
  y: number;
}

/** Window size W H */
class WindowSize {
  /** Window width */
  @ApiProperty()
  @Prop()
  width: number;

  /** Window height */
  @ApiProperty()
  @Prop()
  height: number;
}

/** Base interface for NgReports Log */
class NgReportsLogBase {
  /** timestamp in seconds */
  @ApiProperty()
  @Prop()
  timestamp: number;
}

/** HTTP Error log interface for NgReports */
class NgReportsHttpError extends NgReportsLogBase {
  @ApiProperty()
  @Prop()
  type: 'http';

  /** http request url */
  @ApiProperty()
  @Prop()
  url: string;

  /** http response status code */
  @ApiProperty()
  @Prop()
  statusCode: number;

  /** http request body JSON if available */
  @ApiProperty({ required: false })
  @Prop()
  body?: string;

  /** http response JSON if available */
  @ApiProperty({ required: false })
  @Prop()
  response?: string;
}

/** Console error log interface for NgReports Log */
class NgReportsConsoleError extends NgReportsLogBase {
  @ApiProperty()
  @Prop()
  type: 'error';

  /** error name */
  @ApiProperty()
  @Prop()
  name: string;

  /** error message */
  @ApiProperty()
  @Prop()
  message: string;

  /** error stack if available, limited to 10 lines */
  @ApiProperty({ required: false })
  @Prop()
  stack?: string;
}

/** Console info log interface for NgReports */
class NgReportsConsoleLog extends NgReportsLogBase {
  @ApiProperty()
  @Prop()
  type: 'log';

  /** message, all console.log arguments joined by \n */
  @ApiProperty()
  @Prop()
  message: string;
}

/** Route change log interface for NgReports */
class NgReportsRouteChange extends NgReportsLogBase {
  @ApiProperty()
  @Prop()
  type: 'route';

  /** only path */
  @ApiProperty()
  @Prop()
  path: string;

  /** fragment if exists */
  @ApiProperty({ required: false })
  @Prop()
  fragment?: string;

  /** query params JSON if exists */
  @ApiProperty({ required: false })
  @Prop()
  queryParams?: string;
}

/** User UI interaction interface for NgReports */
class NgReportsUserInteraction extends NgReportsLogBase {
  @ApiProperty()
  @Prop()
  type: 'click';

  /** `${tagName}${targetId ? (#targetId) : ''}` */
  @ApiProperty()
  @Prop()
  target: string;

  /** click position on page */
  @ApiProperty()
  @Prop()
  pagePos: Position;
}

/** Log type for NgReports */
export type NgReportsLog =
  | NgReportsHttpError
  | NgReportsConsoleError
  | NgReportsConsoleLog
  | NgReportsRouteChange
  | NgReportsUserInteraction;

/** Environment information interface for NgReports */
export class NgReportsEnvironment {
  /** browser user agent */
  @ApiProperty()
  @Prop()
  userAgent: string;

  /** browser or app name */
  @ApiProperty()
  @Prop()
  browserAppName: string;

  /** list of installed extension IDs for supported browsers */
  @ApiProperty({ isArray: true, type: () => [String] })
  @Prop()
  extensions: string[];

  /** application environment from environment.ts */
  @ApiProperty()
  @Prop()
  appEnvironment: string;

  /** application version from package.json */
  @ApiProperty()
  @Prop()
  appVersion: string;

  /** user browser language OR application language if set */
  @ApiProperty()
  @Prop()
  appLanguage: string;

  /** application url */
  @ApiProperty()
  @Prop()
  panelUrl: string;

  /** route where report was sent */
  @ApiProperty()
  @Prop()
  route: string;

  /** user navigator connection type (internet speed) */
  @ApiProperty()
  @Prop()
  connectionType: string;

  /** available memory */
  @ApiProperty()
  @Prop()
  ram: number;

  /** window size */
  @ApiProperty()
  @Prop()
  windowSize: WindowSize;
}

/** Image attachment interface for NgReports */
class NgReportsAttachmentImage {
  /** unique identifier */
  @ApiProperty()
  @Prop()
  uid: string;

  /** attachment name */
  @ApiProperty()
  @Prop()
  name: string;

  /** image */
  @ApiProperty()
  @Prop()
  file: string;
}

/** User partial information interface for NgReports */
class NgReportsAuthUserPartial {
  /** user ID */
  @ApiProperty()
  @Prop()
  id: string;

  /** user First Name */
  @ApiProperty({ required: false })
  @Prop()
  firstName?: string;

  /** user Last Name */
  @ApiProperty({ required: false })
  @Prop()
  lastName?: string;

  /** user Email */
  @ApiProperty({ required: false })
  @Prop()
  email?: string;

  /** user Metadata (any user information that you want to send) */
  @ApiProperty({ required: false })
  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: any;
}

export type ReportDocument = HydratedDocument<Report>;

/** Report form interface for NgReports */
@Schema()
export class Report {
  /** user contact data */
  @ApiProperty()
  @Prop()
  dataIsFromAuthService: boolean;

  /** user partial */
  @ApiProperty({ type: () => NgReportsAuthUserPartial, required: false })
  @Prop()
  user?: NgReportsAuthUserPartial;

  /** report title */
  @ApiProperty()
  @Prop()
  title: string;

  /** problem details */
  @ApiProperty()
  @Prop()
  details: string;

  /** list of logs */
  @ApiProperty({ required: false, type: () => NgReportsLogBase, isArray: true })
  @Prop()
  logs?: NgReportsLog[];

  /** data from form visible on screen where error was reported */
  @ApiProperty({ required: false })
  @Prop({ type: MongooseSchema.Types.Mixed })
  formData?: any;

  /** attachment list */
  @ApiProperty({
    required: false,
    type: () => NgReportsAttachmentImage,
    isArray: true,
  })
  @Prop({
    type: () => [NgReportsAttachmentImage],
  })
  attachments?: NgReportsAttachmentImage[];

  /** environment information for better problem understanding */
  @ApiProperty()
  @Prop()
  environment: NgReportsEnvironment;

  /** when? */
  @ApiProperty()
  @Prop()
  timestamp: number;

  /** how severe? */
  @ApiProperty({
      type: () => String,
      required: false,
      enum: Severity
  })
  @Prop({
      type: String,
      enum: Severity
  })
  severity?: Severity;

  /** in summary... */
  @ApiProperty({ required: false })
  @Prop()
  summary?: string;

  /** in summary... */
  @ApiProperty({ required: false })
  @Prop()
  fixed?: boolean;

  @ApiProperty({ isArray: true, type: () => [Comment] })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
  comments: Types.ObjectId[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);

export const ReportFeature = {
  name: Report.name,
  schema: ReportSchema,
};

// --- Projections ---

/**
 * Projection for report list view.
 * Excludes comments, logs, attachments, formData, and Mongoose internal fields for a lightweight response.
 */
export const REPORT_LIST_PROJECTION = {
  comments: 0,
  logs: 0,
  attachments: 0,
  formData: 0,
  __v: 0,
};

/**
 * Projection for detailed report view.
 * Excludes Mongoose internal fields.
 */
export const REPORT_DETAILS_PROJECTION = {
  __v: 0,
};
