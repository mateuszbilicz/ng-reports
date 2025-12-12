import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Report } from './report.schema';

// --- DTO Classes ---

export class EnvironmentUrl {
  @ApiProperty()
  url: string;

  @ApiProperty()
  name: string;
}

/**
 * Class used for creating a new environment.
 */
export class CreateEnvironment {
  @ApiProperty({
    description: 'The unique ID of the project this environment belongs to.',
  })
  projectId: string;

  @ApiProperty({ description: 'A unique identifier for the environment.' })
  environmentId: string;

  @ApiProperty({ description: 'The name of the environment.' })
  name: string;

  @ApiProperty({ description: 'A description of the environment.' })
  description: string;

  @ApiProperty({
    isArray: true,
    type: () => EnvironmentUrl,
    description: 'List of URLs associated with this environment.',
  })
  urls: EnvironmentUrl[];
}

/**
 * Class used for updating an existing environment.
 * All fields are optional.
 */
export class UpdateEnvironment extends PartialType(CreateEnvironment) {}

// --- Mongoose Schema Class ---

@Schema()
export class Environment {
  @ApiProperty()
  @Prop({ unique: true })
  environmentId: string;

  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty({ isArray: true, type: () => EnvironmentUrl })
  @Prop()
  urls: EnvironmentUrl[];

  @ApiProperty({ isArray: true, type: () => Report })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Report' }] })
  reports: Types.ObjectId[];
}

export type EnvironmentDocument = HydratedDocument<Environment>;
export const EnvironmentSchema = SchemaFactory.createForClass(Environment);

// --- Projections ---

/**
 * Projection for environment list view.
 * Excludes reports and Mongoose internal fields.
 */
export const ENVIRONMENT_LIST_PROJECTION = {
  reports: 0,
  __v: 0,
};

/**
 * Projection for detailed environment view.
 * Excludes Mongoose internal fields.
 */
export const ENVIRONMENT_DETAILS_PROJECTION = {
  __v: 0,
};

export const EnvironmentFeature = {
  name: Environment.name,
  schema: EnvironmentSchema,
};
