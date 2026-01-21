import {Injectable} from '@nestjs/common';
import {SystemConfigurationService} from './system-configuration/system-configuration.service';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Environment} from '../database/schemas/environment.schema';
import {panelUrl} from '../../ng-reports.config.json';

@Injectable()
export class CORSController {
    private allowReportsIncomeFromUnknownSources: boolean = true;
    private dynamicCorsOptions: any = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: false,
    };

    constructor(
        private systemConfigurationService: SystemConfigurationService,
        @InjectModel(Environment.name) private environmentModel: Model<Environment>,
    ) {
        this.systemConfigurationService.config.subscribe((config) => {
            if (
                this.allowReportsIncomeFromUnknownSources !==
                config.allowReportsIncomeFromUnknownSources
            ) {
                this.allowReportsIncomeFromUnknownSources =
                    config.allowReportsIncomeFromUnknownSources;
                this.updateCors(config.allowReportsIncomeFromUnknownSources);
            }
        });
    }

    public dynamicCorsController(req: any, callback: any) {
        callback(null, this.dynamicCorsOptions);
    }

    private async updateCors(enableAny: boolean) {
        if (enableAny) {
            this.dynamicCorsOptions = {
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                credentials: false,
            };
        } else {
            const origins = (
                await this.environmentModel.find<Environment>({}, {urls: 1})
            )
                .map((env: Environment) => env.urls)
                .flat()
                .map((envUrl) => envUrl.url);
            this.dynamicCorsOptions = {
                origin: [...origins, panelUrl],
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                credentials: false,
            };
        }
    }
}
