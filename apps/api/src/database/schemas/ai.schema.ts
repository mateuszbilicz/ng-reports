import {Severity} from "./severity.schema";
import {ApiProperty} from "@nestjs/swagger";

export class AIProcessResponse {
    @ApiProperty()
    reportId: string;
    @ApiProperty()
    severity?: Severity;
    @ApiProperty()
    summary?: string;
}