import { ApiProperty } from '@nestjs/swagger';
import { mixin, Type } from '@nestjs/common';

export function AsFilteredListOf<T extends Type>(of: T) {
  class FilteredList {
    @ApiProperty({
      type: () => of,
      isArray: true,
    })
    items: InstanceType<T>[];

    @ApiProperty({
      type: Number,
    })
    totalItemsCount: number;
  }
  return mixin(FilteredList);
}
