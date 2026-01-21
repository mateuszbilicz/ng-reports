import {getSchemaPath} from '@nestjs/swagger';

export function schemaOf(cl: any) {
    return {
        schema: {
            allOf: [{$ref: getSchemaPath(cl)}],
        },
    };
}
