import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Role} from './roles.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @ApiProperty({
        uniqueItems: true,
        type: () => String,
    })
    @Prop({unique: true})
    username: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    name: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    description: string;

    @ApiProperty({
        type: () => String,
        enum: Role,
    })
    @Prop({
        type: String,
        enum: Role,
    })
    role: Role;

    @ApiProperty({
        type: () => Date,
    })
    @Prop()
    createDate: Date;

    @ApiProperty({
        type: () => Boolean,
    })
    @Prop()
    isActive: boolean;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserFeature = {
    name: User.name,
    schema: UserSchema,
};

export const USER_DEFAULT_PROJECTION = {
    username: 1,
    name: 1,
    description: 1,
    role: 1,
    createDate: 1,
    isActive: 1,
};

export class UserCreate {
    @ApiProperty({
        uniqueItems: true,
        type: () => String,
    })
    @Prop({unique: true})
    username: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    name: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    description: string;

    @ApiProperty({
        type: () => String,
        enum: Role,
    })
    @Prop({
        type: String,
        enum: Role,
    })
    role: Role;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    password: string;
}

export class UserView {
    @ApiProperty({
        uniqueItems: true,
        type: () => String,
    })
    @Prop({unique: true})
    username: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    name: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    description: string;

    @ApiProperty({
        type: () => String,
        enum: Role,
    })
    @Prop({
        type: String,
        enum: Role,
    })
    role: Role;

    @ApiProperty({
        type: () => Date,
    })
    @Prop()
    createDate: Date;

    @ApiProperty({
        type: () => Boolean,
    })
    @Prop()
    isActive: boolean;
}

export class UserUpdateInformation {
    @ApiProperty({
        type: () => String,
    })
    @Prop()
    name?: string;

    @ApiProperty({
        type: () => String,
    })
    @Prop()
    description?: string;

    @ApiProperty({
        type: () => String,
        enum: Role,
    })
    @Prop({
        type: String,
        enum: Role,
    })
    role?: Role;
}

export class Login {
    @ApiProperty({
        type: () => String,
    })
    username: string;

    @ApiProperty({
        type: () => String,
    })
    password: string;
}

export const UserListProjection = {
    username: 1,
    name: 1,
    role: 1,
    createDate: 1,
    isActive: 1,
};

export class UserMini {
    @ApiProperty({
        type: () => String,
    })
    username: string;

    @ApiProperty({
        type: () => String,
    })
    name: string;

    @ApiProperty({
        type: () => String,
        enum: Role,
    })
    @Prop({
        type: String,
        enum: Role,
    })
    role?: Role;

    @ApiProperty({
        type: () => Date,
    })
    @Prop()
    createDate: Date;

    @ApiProperty({
        type: () => Boolean,
    })
    @Prop()
    isActive: boolean;
}
