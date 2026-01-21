import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { StatisticsService } from '../../core/Services/StatisticsService/StatisticsService';
import { Role } from '../../core/Models/Role';
import { Severity } from '../../core/Models/Severity';
import {ChartComponent} from 'ng-apexcharts';
import {Select} from 'primeng/select';
import {StyleClass} from 'primeng/styleclass';
import {InputIcon} from 'primeng/inputicon';
import {IconField} from 'primeng/iconfield';
import {DatePicker} from 'primeng/datepicker';

export type ChartOptions = any;

@Component({
    selector: 'app-statistics-view',
    standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectButtonModule,
    TableModule,
    ChartComponent,
    Select,
    StyleClass,
    InputIcon,
    IconField,
    DatePicker,
  ],
    templateUrl: './statistics-view.component.html'
})
export class StatisticsViewComponent {
    protected readonly statisticsService = inject(StatisticsService);
    private fb = inject(FormBuilder);

    isLoading = signal(false);
    tableData = signal<any[]>([]);

    viewOptions = [
        { label: 'Chart', value: 'chart', icon: 'pi pi-chart-bar' },
        { label: 'Table', value: 'table', icon: 'pi pi-table' }
    ];
    viewControl = new FormControl('chart', { nonNullable: true });

    filterForm: FormGroup = this.fb.group({
        sampling: ['day'],
        dateRange: [[new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]],
        severity: [null],
        textFilter: [''],
        fixed: [null]
    });

    samplingOptions = [
        { label: 'Hour', value: 'hour' },
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
    ];

    severityOptions = [
        { label: 'Debug', value: 0 },
        { label: 'Info', value: 1 },
        { label: 'Warning', value: 2 },
        { label: 'Error', value: 3 },
        { label: 'Critical', value: 4 }
    ];

    public chartOptions: any = {
        series: [],
        chart: {
            height: 350,
            type: 'bar'
        },
        title: {
            text: 'Reports Statistics'
        },
        xaxis: {
            categories: []
        }
    };

    loadStatistics() {
        this.isLoading.set(true);
        const { sampling, dateRange, severity, textFilter, fixed } = this.filterForm.value;
        const dateFrom = dateRange && dateRange[0] ? dateRange[0] : new Date();
        const dateTo = dateRange && dateRange[1] ? dateRange[1] : new Date();

        this.statisticsService.getStatistics(
            sampling,
            dateFrom,
            dateTo,
            undefined,
            undefined,
            textFilter || undefined,
            severity ?? undefined,
            fixed ?? undefined
        ).subscribe({
            next: (data) => {
                this.processData(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load statistics', err);
                this.isLoading.set(false);
            }
        });
    }

    private processData(data: any) {
        const categories: string[] = [];
        const seriesData: number[] = [];
        const tableItems: any[] = [];

        if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach(key => {
                categories.push(key);
                const val = data[key];
                seriesData.push(val);
                tableItems.push({ date: key, count: val });
            });
        }

        this.chartOptions.series = [{
            name: 'Reports',
            data: seriesData
        }];
        this.chartOptions.xaxis = {
            categories: categories
        };

        this.tableData.set(tableItems);
    }
}
