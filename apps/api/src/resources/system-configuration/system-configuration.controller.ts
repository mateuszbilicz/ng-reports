import {InitializeController} from "../../global/initialize-controller";
import {MinRole} from "../auth/min-role";
import {Role} from "../../database/schemas/roles.schema";
import {Body, Get, Put} from "@nestjs/common";
import {SystemConfigurationService} from "./system-configuration.service";
import {ApiBody, ApiExtraModels, ApiOkResponse} from "@nestjs/swagger";
import {
    ConfigField,
    ConfigFieldUpdate,
    ConfigFieldUpdateMany,
    SystemConfigView
} from "../../database/schemas/system-config.schema";
import {operationSuccessPipe, throwPipe} from "../../global/error-responses";
import {map} from "rxjs";

@InitializeController('system-configuration')
@MinRole(Role.Admin)
@ApiExtraModels(
    ConfigFieldUpdate,
    ConfigField,
    ConfigFieldUpdateMany,
    SystemConfigView
)
export class SystemConfigurationController {
    constructor(private readonly systemConfigurationService: SystemConfigurationService) {
    }

    @Get()
    @ApiOkResponse({
        type: () => SystemConfigView
    })
    getConfig() {
        return this.systemConfigurationService.getConfigRaw();
    }

    @Put('/updateOne')
    @ApiBody({
        type: () => ConfigFieldUpdate
    })
    setConfigValue(@Body() update: ConfigFieldUpdate) {
        return this.systemConfigurationService.setConfigValue(
            update.fieldName,
            update.value
        )
            .pipe(
                map(v => v.acknowledged && v.modifiedCount === 1),
                operationSuccessPipe('SYSTEM_CONFIG_UPDATE_ONE'),
                throwPipe('Failed to update config value')
            );
    }

    @Put('/updateMany')
    @ApiBody({
        type: () => ConfigFieldUpdateMany
    })
    updateManyConfigValues(@Body() update: ConfigFieldUpdateMany) {
        return this.systemConfigurationService.updateManyConfigValues(update)
            .pipe(
                map(v => v.some(r => r.acknowledged && r.modifiedCount === 1)),
                operationSuccessPipe('SYSTEM_CONFIG_UPDATE_MANY'),
                throwPipe('Failed to update many config values')
            );
    }
}
