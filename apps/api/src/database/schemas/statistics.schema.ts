import {ApiProperty} from "@nestjs/swagger";

export class StatisticsSample {
    @ApiProperty({
        description: 'Parsed date'
    })
    label: string;
    @ApiProperty({
        description: 'Number of reports'
    })
    value: number;
}

export class Statistics {
    @ApiProperty()
    sampling: 'hour' | 'day' | 'week' | 'month';
    @ApiProperty({
        type: () => StatisticsSample,
        isArray: true
    })
    samples: StatisticsSample[];
    @ApiProperty()
    totalReports: number;
    @ApiProperty()
    avgReportsPerSample: number;
}