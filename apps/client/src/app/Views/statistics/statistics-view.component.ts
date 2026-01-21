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
import { ChartComponent } from 'ng-apexcharts';
import { Select } from 'primeng/select';
import { StyleClass } from 'primeng/styleclass';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { DatePicker } from 'primeng/datepicker';
import { Statistics } from '../../core/swagger';

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

    public chartOptions: Partial<ChartOptions> | any = { // Using any to avoid strict type checks for now as ChartOptions type is 'any' alias
        series: [],
        chart: {
            height: 350,
            type: 'bar',
            fontFamily: 'Inter, sans-serif',
            toolbar: {
                show: false
            }
        },
        title: {
            text: 'Reports Statistics'
        },
        xaxis: {
            categories: []
        },
        dataLabels: {
            enabled: false
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

    private processData(data: Statistics) {
        const categories: string[] = [];
        const seriesData: number[] = [];
        const tableItems: any[] = [];

        data.samples.forEach(sample => {
            tableItems.push({
                date: sample.label,
                value: sample.value
            });
            categories.push(sample.label);
            seriesData.push(sample.value);
        });

        // Update chart options triggering change detection
        this.chartOptions = {
            ...this.chartOptions,
            series: [{
                name: 'Reports',
                data: seriesData
            }],
            xaxis: {
                type: 'category',
                categories: categories,
                labels: {
                    style: {
                        colors: '#64748b',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif'
                    }
                }
            }
        };

        this.tableData.set(tableItems);
    }
}
