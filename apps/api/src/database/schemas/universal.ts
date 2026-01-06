import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class ObjStr {
    @ApiProperty({
        type: () => String,
        description: "String property"
    })
    @Prop()
    string: string;
}

export class ObjNum {
    @ApiProperty({
        type: () => Number,
        description: "Number property"
    })
    @Prop()
    number: number;
}

export class ObjBool {
    @ApiProperty({
        type: () => Boolean,
        description: "Boolean property"
    })
    @Prop()
    boolean: boolean;
}

export class ObjDate {
    @ApiProperty({
        type: () => Date,
        description: "Date property"
    })
    @Prop()
    date: Date;
}