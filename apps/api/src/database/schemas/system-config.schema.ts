import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ConfigFieldDocument = HydratedDocument<ConfigField>;

@Schema()
export class ConfigField {
  @ApiProperty({
    type: () => String,
  })
  @Prop({
    unique: true,
  })
  fieldName: string;

  @ApiProperty({
    type: () => String,
  })
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  value: any;

  @ApiProperty({
    type: () => String,
  })
  @Prop()
  description: string;

  @ApiProperty({
    type: () => Date,
  })
  @Prop()
  lastUpdate: Date;
}

export const ConfigFieldSchema = SchemaFactory.createForClass(ConfigField);

export const ConfigFieldFeature = {
  name: ConfigField.name,
  schema: ConfigFieldSchema,
};
