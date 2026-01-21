import {Injectable} from '@nestjs/common';
import {catchError, filter, forkJoin, from, map, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {
    User,
    USER_DEFAULT_PROJECTION,
    UserCreate,
    UserListProjection,
    UserMini,
    UserUpdateInformation,
    UserView,
} from '../../database/schemas/user.schema';
import {DeleteResult, Model, UpdateWriteOpResult} from 'mongoose';
import {argon2Hash, argon2Verify} from '../../global/rx-argon';
import {InjectModel} from '@nestjs/mongoose';
import {AsFilteredListOf} from '../../database/filtered-list';
import {defaultAdmin} from '../../../ng-reports.config.json';
import {Role} from "../../database/schemas/roles.schema";

export const UserFilteredListClass = AsFilteredListOf(UserMini);

export type UserFilteredList = InstanceType<typeof UserFilteredListClass>;

@Injectable()
export class UsersService {
    _aiAccountId: string = '';

    constructor(@InjectModel(User.name) private userModel: Model<User>) {
        this.checkForAdmin();
        this.checkForAI();
    }

    private checkForAdmin() {
        from(
            this.userModel.findOne({
                username: defaultAdmin.username
            })
        )
            .pipe(
                filter(user => !user),
                switchMap(() =>
                    argon2Hash(defaultAdmin.password)
                ),
                switchMap(hashedPassword =>
                    from(
                        this.userModel.create({
                            username: defaultAdmin.username,
                            password: hashedPassword,
                            name: 'Admin',
                            description: 'Default admin account',
                            role: Role.Admin,
                            createDate: new Date(),
                            isActive: true
                        })
                    )
                ),
                tap(() => console.log('Default admin account created!')),
                catchError(err => {
                    console.error('An error occurred while creating default admin account!', err);
                    return throwError(() => err);
                })
            )
            .subscribe();
    }

    private checkForAI() {
        from(
            this.userModel.findOne({
                username: 'system-ai'
            })
        )
            .pipe(
                tap(user => {
                    if (user) {
                        this._aiAccountId = (user.hasOwnProperty('_doc') ? (user as any)._doc._id : user._id) + '';
                    }
                }),
                filter(user => !user),
                switchMap(() =>
                    argon2Hash(`${Date.now()}-${Math.floor(Math.random() * Date.now()).toString(36)}_${Math.floor(Math.random() * 9999).toString(36)}`)
                ),
                switchMap(hashedPassword =>
                    from(
                        this.userModel.create({
                            username: 'system-ai',
                            password: hashedPassword,
                            name: 'System AI',
                            description: 'Default system AI account. Don\'t delete this account, cause it might generate problems with AI',
                            role: Role.Admin,
                            createDate: new Date(),
                            isActive: true
                        })
                    )
                ),
                tap((user) => {
                    console.log('Default AI account created!');
                    this._aiAccountId = user._id + '';
                }),
                catchError(err => {
                    console.error('An error occurred while creating default AI account!', err);
                    return throwError(() => err);
                })
            )
            .subscribe();
    }

    create(userCreate: UserCreate) {
        const newUser: User = {
            ...userCreate,
            createDate: new Date(),
            isActive: true,
        };
        return from(
            argon2Hash(userCreate.password)
        )
            .pipe(
                switchMap(hashedPassword =>
                    from(this.userModel.create({
                        ...newUser,
                        password: hashedPassword
                    }))
                ),
                map(
                    ({
                         username,
                         name,
                         description,
                         role,
                         createDate,
                         isActive,
                     }): UserView => {
                        return {
                            username,
                            name,
                            description,
                            role,
                            createDate,
                            isActive,
                        };
                    },
                ),
            );
    }

    get(username: string) {
        return from(this.userModel.findOne({username}, USER_DEFAULT_PROJECTION));
    }

    updateInformation(
        username: string,
        update: UserUpdateInformation,
    ): Observable<UpdateWriteOpResult> {
        return from(
            this.userModel.updateOne(
                {username},
                {
                    $set: update,
                },
            ),
        );
    }

    updatePassword(username: string, password: string) {
        return from(
            argon2Hash(password)
        )
            .pipe(
                switchMap(hashedPassword =>
                    from(
                        this.userModel.updateOne(
                            {username},
                            {
                                $set: {password},
                            },
                        ),
                    )
                )
            );
    }

    getAuth(username: string, password: string): Observable<UserView> {
        return from(this.userModel.findOne({username})).pipe(
            switchMap((user) => {
                if (!user) {
                    throw new Error(`User not found`);
                }
                if (!user.isActive) {
                    throw new Error('User is deleted');
                }
                return forkJoin({
                    isValid: argon2Verify(user.password, password),
                    user: of(user),
                });
            }),
            map(({user, isValid}) => {
                if (!isValid) {
                    throw new Error(`Invalid password`);
                }
                return {
                    username,
                    name: user.name,
                    description: user.description,
                    role: user.role,
                    createDate: user.createDate,
                    isActive: user.isActive,
                };
            }),
        );
    }

    setActive(
        username: string,
        isActive: boolean,
    ): Observable<UpdateWriteOpResult> {
        return from(this.userModel.updateOne({username}, {$set: {isActive}}));
    }

    deleteUser(username: string): Observable<DeleteResult> {
        return from(this.userModel.deleteOne({username}));
    }

    listUsers(
        filter: string,
        skip: number,
        limit: number,
    ): Observable<UserFilteredList> {
        const filters = {
            ...(
                filter ? {
                        $or: [
                            {
                                username: {
                                    $regex: `.*${filter}.*`,
                                },
                            },
                            {
                                name: {
                                    $regex: `.*${filter}.*`,
                                },
                            },
                            {
                                description: {
                                    $regex: `.*${filter}.*`,
                                },
                            },
                        ],
                    }
                    : {}
            )
        };
        return from(
            this.userModel.find<UserMini>(filters, UserListProjection, {
                skip,
                limit,
            }),
        ).pipe(
            switchMap((list) =>
                from(this.userModel.countDocuments(filters)).pipe(
                    map((count) => {
                        return {
                            list: list as UserMini[],
                            count,
                        };
                    }),
                ),
            ),
            map(({list, count}) => {
                return {
                    items: list,
                    totalItemsCount: count,
                } as UserFilteredList;
            })
        );
    }
}
