import {MongooseModule} from '@nestjs/mongoose';
import {CommentFeature} from './schemas/comment.schema';
import {ProjectFeature} from './schemas/project.schema';
import {EnvironmentFeature} from './schemas/environment.schema';
import {UserFeature} from './schemas/user.schema';
import {ReportFeature} from './schemas/report.schema';
import {databaseUrl} from '../../ng-reports.config.json';
import {ConfigFieldFeature} from './schemas/system-config.schema';

export const databaseImports = [
    MongooseModule.forRoot(databaseUrl, {
        appName: 'NgReports',
        dbName: 'ng-reports',
    }),
    MongooseModule.forFeature([
        UserFeature,
        ProjectFeature,
        EnvironmentFeature,
        ReportFeature,
        CommentFeature,
        ConfigFieldFeature,
    ]),
];
