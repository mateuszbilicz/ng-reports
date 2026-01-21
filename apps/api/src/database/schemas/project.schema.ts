import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Types} from 'mongoose';
import {ApiProperty, PartialType} from '@nestjs/swagger';
import {Environment} from './environment.schema';

// --- DTO Classes ---

/**
 * Class used for creating a new project.
 */
export class CreateProject {
    @ApiProperty({
        description: 'The unique identifier for the project (e.g., a slug).',
    })
    projectId: string;

    @ApiProperty({description: 'The name of the project.'})
    name: string;

    @ApiProperty({description: 'A description of the project.'})
    description: string;
}

/**
 * Class used for updating an existing project.
 * All fields are optional.
 */
export class UpdateProject extends PartialType(CreateProject) {
}

// --- Mongoose Schema Class ---

@Schema()
export class Project {
    @ApiProperty()
    @Prop({unique: true})
    projectId: string;

    @ApiProperty()
    @Prop()
    name: string;

    @ApiProperty()
    @Prop()
    description: string;

    @ApiProperty()
    @Prop()
    createDate: Date;

    @ApiProperty({isArray: true, type: () => Environment})
    @Prop({type: [Types.ObjectId], ref: 'Environment'})
    environments: Environment[];
}

export type ProjectDocument = HydratedDocument<Project>;
export const ProjectSchema = SchemaFactory.createForClass(Project);
export const ProjectFeature = {
    name: Project.name,
    schema: ProjectSchema,
};

// --- Projections ---

/**
 * Projection for project list view.
 * Excludes environments for a lightweight response.
 */
export const PROJECT_LIST_PROJECTION = {
    environments: 0,
    __v: 0,
};

/**
 * Projection for detailed project view.
 * Currently includes all fields, excluding __v.
 */
export const PROJECT_DETAILS_PROJECTION = {
    __v: 0,
};
