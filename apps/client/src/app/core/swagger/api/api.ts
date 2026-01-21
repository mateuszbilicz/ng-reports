export * from './auth.service';
import {AuthService} from './auth.service';
import {CommentsService} from './comments.service';
import {EnvironmentsService} from './environments.service';
import {ProjectsService} from './projects.service';
import {ReportsService} from './reports.service';
import {StatisticsService} from './statistics.service';
import {SystemConfigurationService} from './systemConfiguration.service';
import {UsersService} from './users.service';

export * from './comments.service';

export * from './environments.service';

export * from './projects.service';

export * from './reports.service';

export * from './statistics.service';

export * from './systemConfiguration.service';

export * from './users.service';

export const APIS = [AuthService, CommentsService, EnvironmentsService, ProjectsService, ReportsService, StatisticsService, SystemConfigurationService, UsersService];
