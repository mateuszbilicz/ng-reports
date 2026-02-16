import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {from, map, Observable, switchMap} from 'rxjs';
import {AsFilteredListOf} from '../../database/filtered-list';
import {
    CreateProject,
    Project,
    PROJECT_DETAILS_PROJECTION,
    PROJECT_LIST_PROJECTION,
    ProjectDocument,
    UpdateProject,
} from '../../database/schemas/project.schema';
import {throwIfNoValuePipe} from '../../global/error-responses';

export const ProjectFilteredListClass = AsFilteredListOf(Project);
export type ProjectFilteredList = InstanceType<typeof ProjectFilteredListClass>;

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name)
        private projectModel: Model<ProjectDocument>,
    ) {
    }

    /**
     * Finds a paginated list of projects using skip/limit.
     */
    findAll(
        skip: number,
        limit: number,
        filter: string,
    ): Observable<ProjectFilteredList> {
        const query = filter
            ? {name: {$regex: `(.*)${filter}(.*)`, $options: 'i'}}
            : {};

        return from(
            this.projectModel
                .find<Project>(query, PROJECT_LIST_PROJECTION, {skip, limit})
                .exec(),
        ).pipe(
            switchMap((projects) =>
                from(this.projectModel.countDocuments(query).exec()).pipe(
                    map((count) => ({
                        projects,
                        count,
                    })),
                ),
            ),
            map(({projects, count}) => {
                return {
                    items: projects,
                    totalItemsCount: count,
                } as ProjectFilteredList;
            }),
        );
    }

    /**
     * Finds a single project by its unique projectId and populates its environments.
     */
    findOne(projectId: string): Observable<Project> {
        return from(
            this.projectModel
                .findOne<Project>({projectId}, PROJECT_DETAILS_PROJECTION)
                .populate('environments')
                .exec(),
        ).pipe(throwIfNoValuePipe('Project not found')) as Observable<Project>;
    }

    /**
     * Creates a new project.
     */
    create(createProject: CreateProject): Observable<Project> {
        const newProject = new this.projectModel({
            ...createProject,
            createDate: new Date(),
        });
        return from(newProject.save());
    }

    /**
     * Updates an existing project.
     */
    update(projectId: string, updateProject: UpdateProject): Observable<Project> {
        return from(
            this.projectModel
                .findOneAndUpdate<Project>({projectId}, {$set: updateProject}, {new: true})
                .exec(),
        ).pipe(throwIfNoValuePipe('Project not found')) as Observable<Project>;
    }

    /**
     * Deletes a project.
     */
    remove(projectId: string): Observable<Project> {
        return from(
            this.projectModel.findOneAndDelete<Project>({projectId}).exec(),
        ).pipe(throwIfNoValuePipe('Project not found')) as Observable<Project>;
    }
}
