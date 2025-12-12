import {Injectable} from '@nestjs/common';
import {forkJoin, from, map, Observable, of, switchMap} from 'rxjs';
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
import {argon2Verify} from '../../global/rx-argon';
import {InjectModel} from '@nestjs/mongoose';
import {AsFilteredListOf} from '../../database/filtered-list';

export const UserFilteredListClass = AsFilteredListOf(UserMini);

export type UserFilteredList = InstanceType<typeof UserFilteredListClass>;

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    create(userCreate: UserCreate) {
        const newUser: User = {
            ...userCreate,
            createDate: new Date(),
            isActive: true,
        };

        return from(this.userModel.create(newUser)).pipe(
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
            this.userModel.updateOne(
                {username},
                {
                    $set: {password},
                },
            ),
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
        };
        return from(
            this.userModel.find<UserMini>(filters, UserListProjection, {
                skip,
                limit,
            }),
        ).pipe(
            switchMap((list) =>
                from(this.userModel.countDocuments(filters).hint('username')).pipe(
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
            }),
        );
    }
}
