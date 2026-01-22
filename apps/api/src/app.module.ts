import {Module} from '@nestjs/common';
import {ShutdownObserver} from './shutdown-observer';
import {AuthController} from './resources/auth/auth.controller';
import {AuthService} from './resources/auth/auth.service';
import {UsersService} from './resources/users/users.service';
import {UsersController} from './resources/users/users.controller';
import {JWT_REGISTER_IMPORT} from './global/jwt';
import {AUTH_GUARD_PROVIDER} from './resources/auth/auth.guard';
import {databaseImports} from './database/database-imports';
import {SystemConfigurationService} from './resources/system-configuration/system-configuration.service';
import {CORSController} from './resources/cors-controller';
import {EnvironmentsController} from './resources/environments/environments.controller';
import {EnvironmentsService} from './resources/environments/environments.service';
import {ReportsService} from './resources/reports/reports.service';
import {ReportsController} from './resources/reports/reports.controller';
import {ProjectsService} from './resources/projects/projects.service';
import {ProjectsController} from './resources/projects/projects.controller';
import {CommentsController} from './resources/comments/comments.controller';
import {CommentsService} from './resources/comments/comments.service';
import {StatisticsService} from './resources/statistics/statistics.service';
import {StatisticsController} from './resources/statistics/statistics.controller';
import {SystemConfigurationController} from './resources/system-configuration/system-configuration.controller';
import {AiService} from './resources/ai/ai.service';
import { DevelopersController } from './resources/developers/developers.controller';

@Module({
    imports: [JWT_REGISTER_IMPORT, ...databaseImports],
    controllers: [
        AuthController,
        UsersController,
        EnvironmentsController,
        ReportsController,
        ProjectsController,
        CommentsController,
        StatisticsController,
        SystemConfigurationController,
        DevelopersController,
    ],
    providers: [
        ShutdownObserver,
        UsersService,
        AuthService,
        AUTH_GUARD_PROVIDER,
        SystemConfigurationService,
        CORSController,
        EnvironmentsService,
        AiService,
        ReportsService,
        ProjectsService,
        CommentsService,
        StatisticsService,
    ],
})
export class AppModule {
}
