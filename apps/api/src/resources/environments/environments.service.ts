import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {from, map, Observable, of, switchMap} from 'rxjs';
import {AsFilteredListOf} from '../../database/filtered-list';
import {
    CreateEnvironment,
    Environment,
    ENVIRONMENT_DETAILS_PROJECTION,
    ENVIRONMENT_LIST_PROJECTION,
    EnvironmentDocument,
    UpdateEnvironment,
} from '../../database/schemas/environment.schema';
import {Project, ProjectDocument,} from '../../database/schemas/project.schema';
import {throwIfNoValuePipe} from '../../global/error-responses';

export const EnvironmentFilteredListClass = AsFilteredListOf(Environment);
export type EnvironmentFilteredList = InstanceType<
    typeof EnvironmentFilteredListClass
>;

@Injectable()
export class EnvironmentsService {
    constructor(
        @InjectModel(Environment.name)
        private readonly environmentModel: Model<EnvironmentDocument>,
        @InjectModel(Project.name)
        private readonly projectModel: Model<ProjectDocument>,
    ) {
    }

    findAll(
        projectId: string,
        skip: number,
        limit: number,
        filter: string,
    ): Observable<EnvironmentFilteredList> {
        return from(this.projectModel.findOne({projectId}).exec()).pipe(
            switchMap((project) => {
                if (!project) {
                    throw new NotFoundException('Project not found');
                }

                const textFilter = filter
                    ? {name: {$regex: `(.*)${filter}(.*)`, $options: 'i'}}
                    : {};

                const query: any = {
                    _id: {$in: project.environments},
                    ...textFilter,
                };

                return from(
                    this.environmentModel
                        .find<Environment>(query, ENVIRONMENT_LIST_PROJECTION, {
                            skip,
                            limit,
                        })
                        .exec(),
                ).pipe(
                    switchMap((environments) =>
                        from(this.environmentModel.countDocuments(query).exec()).pipe(
                            map((count) => ({
                                environments,
                                count,
                            })),
                        ),
                    ),
                );
            }),
            map(({environments, count}) => {
                return {
                    items: environments,
                    totalItemsCount: count,
                } as EnvironmentFilteredList;
            }),
        );
    }

    findOne(environmentId: string): Observable<Environment> {
        return from(
            this.environmentModel
                .findOne<Environment>({environmentId}, ENVIRONMENT_DETAILS_PROJECTION)
                .exec(),
        ).pipe(
            throwIfNoValuePipe('Cannot find environment'),
        ) as Observable<Environment>;
    }

    create(createEnvironment: CreateEnvironment): Observable<Environment> {
        const newEnvironment = new this.environmentModel(createEnvironment);

        return from(newEnvironment.save()).pipe(
            switchMap((savedEnvironment) => {
                // Chain the project update as a required step in the stream
                return from(
                    this.projectModel
                        .updateOne(
                            {projectId: createEnvironment.projectId},
                            {$push: {environments: savedEnvironment._id}},
                        )
                        .exec(),
                ).pipe(map(() => savedEnvironment)); // Return the original savedEnvironment
            }),
        );
    }

    update(
        environmentId: string,
        updateEnvironment: UpdateEnvironment,
    ): Observable<Environment> {
        return from(
            this.environmentModel
                .findOneAndUpdate<Environment>({environmentId}, {$set: updateEnvironment}, {
                    new: true,
                })
                .exec(),
        ).pipe(
            throwIfNoValuePipe('Cannot find environment'),
        ) as Observable<Environment>;
    }

    remove(environmentId: string): Observable<Environment> {
        return from(
            this.environmentModel.findOneAndDelete({environmentId}).exec(),
        ).pipe(
            throwIfNoValuePipe('Cannot find environment'),
            switchMap((deletedEnvironment) => {
                if (!deletedEnvironment) {
                    return of(null); // Or throw NotFoundException if preferred
                }
                // Chain the project update as a required step in the stream
                return from(
                    this.projectModel
                        .updateOne(
                            {environments: (deletedEnvironment as any)._id},
                            {$pull: {environments: (deletedEnvironment as any)._id}},
                        )
                        .exec(),
                ).pipe(map(() => deletedEnvironment)); // Return the original deletedEnvironment
            }),
        ) as Observable<Environment>;
    }
}
