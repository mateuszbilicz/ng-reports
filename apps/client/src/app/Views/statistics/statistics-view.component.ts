import {Component, inject, signal} from '@angular/core';
import {CommonModule, formatDate} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TableModule} from 'primeng/table';
import {StatisticsService} from '../../core/Services/StatisticsService/StatisticsService';
import {ChartComponent} from 'ng-apexcharts';
import {Select} from 'primeng/select';
import {StyleClass} from 'primeng/styleclass';
import {InputIcon} from 'primeng/inputicon';
import {IconField} from 'primeng/iconfield';
import {DatePicker} from 'primeng/datepicker';
import {Statistics} from '../../core/swagger';
import {Severity} from '../../core/Models/Severity';
import {downloadFile} from '../../core/Utils/download-file';

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
    {label: 'Chart', value: 'chart', icon: 'pi pi-chart-bar'},
    {label: 'Table', value: 'table', icon: 'pi pi-table'}
  ];
  viewControl = new FormControl('chart', {nonNullable: true});

  filterForm: FormGroup = this.fb.group({
    sampling: ['day'],
    dateRange: [[new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]],
    severity: [null],
    textFilter: [''],
    fixed: [null]
  });

  samplingOptions = [
    {label: 'Hour', value: 'hour'},
    {label: 'Day', value: 'day'},
    {label: 'Week', value: 'week'},
    {label: 'Month', value: 'month'}
  ];

  severityOptions = [
    {label: 'Any', value: null},
    {label: 'Info', value: 0},
    {label: 'Warning', value: 1},
    {label: 'Error', value: 2},
    {label: 'Critical', value: 3}
  ];

  public chartOptions: Partial<ChartOptions> | any = { // Using any to avoid strict type checks for now as ChartOptions type is 'any' alias
    series: [],
    chart: {
      height: 350,
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      stroke: {
        curve: 'smooth',
        color: '#ff0000'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: ['#ff0000', '#ffaa00', '#ffaa00'], // optional, if not defined - uses the shades of same color in series
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0,
          stops: [0, 75, 100],
          colorStops: []
        }
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

  updateChartOptionsDependingOnSeverity() {
    this.chartOptions.chart.fill.gradient.gradientToColors = [
      (() => {
        switch (+(this.filterForm.get('severity')!.value)) {
          case Severity.Info:
            return '#558dae';
          case Severity.Warning:
            return '#ffae00';
          case Severity.Error:
            return '#ff5500';
          case Severity.Critical:
            return '#ff0000';
          default:
            return '#0994dd';
        }
      })()
    ];
  }

  loadStatistics() {
    this.isLoading.set(true);
    const {sampling, dateRange, severity, textFilter, fixed} = this.filterForm.value;
    const dateFrom = dateRange && dateRange[0] ? dateRange[0] : new Date();
    const rawDateTo = dateRange && dateRange[1] ? dateRange[1] : new Date();
    const dateTo = new Date(rawDateTo);
    dateTo.setHours(23, 59, 59, 999);

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
        this.updateChartOptionsDependingOnSeverity();
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

    if (data?.samples) {
      data.samples.forEach(sample => {
        tableItems.push({
          date: sample.label,
          value: sample.value
        });
        categories.push(sample.label);
        seriesData.push(sample.value);
      });
    }

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

  exportToCSV() {
    const data = this.tableData() as unknown as {date: string, value: string}[];
    let csv = `"NG Reports Statistics data"\nTime,"${formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss', 'en-US')}"\n`;
    csv += `"Filters:"\n"Sampling","${this.filterForm.get('sampling')?.value}"\n"Date Range","${formatDate(this.filterForm.get('dateRange')?.value[0], 'yyyy/MM/dd HH:mm:ss', 'en-US')}","${formatDate(this.filterForm.get('dateRange')?.value[1], 'yyyy/MM/dd HH:mm:ss', 'en-US')}"\n`
    csv += `"Severity","${this.filterForm.get('severity')?.value}"\n"Text filter","${this.filterForm.get('textFilter')?.value}"\n`;
    csv += `"Fixed","${this.filterForm.get('fixed')?.value}"\n`;
    csv += `\n"Data:"\n`;
    csv += `"Date","Value"\n`;
    data.forEach(item => {
      csv += `"${item.date}","${item.value}"\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    downloadFile(blob, `ng-reports-stats-${formatDate(new Date(), 'yyyyMMddHHmmss', 'en-US')}.csv`);
  }
}
