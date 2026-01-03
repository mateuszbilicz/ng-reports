import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { StatisticsService } from '../../core/Services/StatisticsService/StatisticsService';

@Component({
    selector: 'app-statistics-view',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        DatePickerModule,
        SelectModule,
        ButtonModule
    ],
    providers: [MessageService],
    templateUrl: './statistics-view.component.html'
})
export class StatisticsViewComponent implements OnInit {
    statsService = inject(StatisticsService);
    messageService = inject(MessageService);

    stats = signal<any>(null);
    chartData: any;
    chartOptions: any;

    dateRange: Date[] = [];
    selectedSampling = 'day';
    samplingOptions = [
        { label: 'Hour', value: 'hour' },
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
    ];

    ngOnInit() {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7); // Default last 7 days
        this.dateRange = [start, end];

        this.initChartOptions();
        this.loadStats();
    }

    loadStats() {
        if (!this.dateRange || this.dateRange.length < 2 || !this.dateRange[1]) {
            if (!this.dateRange[0]) return;
            if (!this.dateRange[1]) return;
        }

        const from = this.dateRange[0];
        const to = this.dateRange[1];

        this.statsService.getStatistics(this.selectedSampling, from, to).subscribe({
            next: (data) => {
                this.stats.set(data);
                this.updateChart(data);
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load statistics' })
        });
    }

    updateChart(data: any) {
        if (!data || !data.samples) return;

        const labels = data.samples.map((s: any) => s.label);
        const values = data.samples.map((s: any) => s.value);

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Reports',
                    data: values,
                    backgroundColor: '#42A5F5',
                    borderColor: '#1E88E5',
                    borderWidth: 1
                }
            ]
        };
    }

    initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }
}
