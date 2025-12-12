import { Injectable } from '@nestjs/common';
import { BehaviorSubject, forkJoin, from, tap } from 'rxjs';
import {
  CONFIG_FIELD_DESCRIPTIONS,
  DEFAULT_SYSTEM_CONFIG,
  SystemConfig,
} from './system-config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigField } from '../../database/schemas/system-config.schema';

@Injectable()
export class SystemConfigurationService {
  config = new BehaviorSubject<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  constructor(
    @InjectModel(ConfigField.name) private configFieldModel: Model<ConfigField>,
  ) {
    this.init();
  }

  private async init() {
    try {
      await this.verifyConfig();
      await this.loadConfig();
    } catch (err) {
      console.error('Cannot load system configuration', err);
    }
  }

  private async verifyConfig() {
    const allFieldsFromDatabase = (
        await this.configFieldModel.find<ConfigField>()
      ).map((field) => field.fieldName),
      allDefaultFields = [...Object.keys(DEFAULT_SYSTEM_CONFIG)],
      missingFieldsInDatabase = allDefaultFields.filter((field) =>
        allFieldsFromDatabase.includes(field),
      );
    await this.configFieldModel.insertMany(
      missingFieldsInDatabase.map((fieldName) => ({
        fieldName,
        value: DEFAULT_SYSTEM_CONFIG[fieldName],
        description: CONFIG_FIELD_DESCRIPTIONS[fieldName],
        lastUpdate: new Date(),
      })),
    );
  }

  private async loadConfig() {
    const fields = await this.configFieldModel.find<ConfigField>(),
      newConfig: SystemConfig = fields.reduce((acc, field) => {
        acc[field.fieldName] = field.value;
        return acc;
      }, {} as SystemConfig);
    this.config.next(newConfig);
  }

  setConfigValue(fieldName: string, value: any) {
    return from(
      this.configFieldModel.updateOne(
        {
          fieldName,
        },
        {
          $set: {
            value,
          },
        },
      ),
    ).pipe(
      tap(() => {
        this.config.next({
          ...this.config.getValue(),
          [fieldName]: value,
        });
      }),
    );
  }

  updateManyConfigValues(values: Partial<SystemConfig>) {
    return forkJoin(
      [...Object.keys(values)].map((fieldName) => {
        if (
          typeof values[fieldName] !== typeof DEFAULT_SYSTEM_CONFIG[fieldName]
        )
          throw new Error(`Invalid config field value type of "${fieldName}"`);
        return from(
          this.configFieldModel.updateOne(
            {
              fieldName,
            },
            {
              $set: {
                value: values[fieldName],
              },
            },
          ),
        );
      }),
    ).pipe(
      tap(() => {
        this.config.next({
          ...this.config.getValue(),
          ...values,
        });
      }),
    );
  }

  getConfigRaw() {
    return this.config.getValue();
  }
}
