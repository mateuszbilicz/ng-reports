import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsService as ApiStatisticsService } from '../../swagger/api/statistics.service';

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {
    protected readonly apiStatisticsService = inject(ApiStatisticsService);

    getStatistics(sampling: string, dateFrom: Date, dateTo: Date, projectId?: string, environmentId?: string, textFilter?: string, severity?: number, fixed?: boolean): Observable<any> {
        return this.apiStatisticsService.statisticsControllerGetStatistics(
            sampling,
            dateFrom,
            dateTo,
            projectId,
            environmentId,
            textFilter,
            severity,
            fixed
        );
    }
}
