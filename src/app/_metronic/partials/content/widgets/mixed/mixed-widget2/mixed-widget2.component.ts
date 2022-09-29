import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { AnalyticsService } from '@pages/services/analytics.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { NetRevenue, revenueVouchers } from 'src/app/modules/wizards/models/revenue.model';
import { getCSSVariableValue } from '../../../../../kt/_utils';
@Component({
  selector: 'app-mixed-widget2',
  templateUrl: './mixed-widget2.component.html',
})
export class MixedWidget2Component implements OnInit {
  @Input() chartColor: string = '';
  @Input() strokeColor: string = '';
  @Input() chartHeight: string = '';
  chartOptions: any = {};
  destroy$ = new Subject();
  public netRevenue: Observable<NetRevenue>;
  public voucherRevenue: Observable<revenueVouchers[]>;
  public data: any = [];
  public categories: any = [];
  private isLoading: BehaviorSubject<any> = new BehaviorSubject(false);
  public isLoading$: Observable<boolean> = this.isLoading.asObservable();

  constructor(private analytics: AnalyticsService, private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoading.next(true);
    // this.netRevenue.subscribe((data: NetRevenue) => data.)
    this.getStats().then( async() => {
      this.voucherRevenue.subscribe((vouchers: revenueVouchers[]) => {
        this.data = vouchers.map((vocuher: revenueVouchers) => vocuher.netRevenue.toFixed(0)).reverse();
        this.categories = vouchers.map((vocuher: revenueVouchers) => vocuher.month).reverse();
        this.cf.detectChanges();
        this.chartOptions = this.getChartOptions(
          this.chartHeight,
          this.chartColor,
          this.strokeColor
        );
        this.cf.detectChanges();
        this.isLoading.next(false);
     })
    });

    this.chartOptions = this.getChartOptions(
      this.chartHeight,
      this.chartColor,
      this.strokeColor
    );
  }

  getChartOptions(
    chartHeight: string,
    chartColor: string,
    strokeColor: string
  ) {
    const labelColor = getCSSVariableValue('--bs-gray-500');
    const borderColor = getCSSVariableValue('--bs-gray-200');
    const color = getCSSVariableValue('--bs-' + chartColor);

    return {
      series: [
        {
          name: 'Net Profit',
          data: this.data
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: chartHeight,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        sparkline: {
          enabled: true,
        },
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 5,
          left: 0,
          blur: 3,
          color: strokeColor,
          opacity: 0.2,
        },
      },
      plotOptions: {},
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'solid',
        opacity: 0,
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 3,
        colors: ['#003C6D'],
      },
      xaxis: {
        categories: this.categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
        crosshairs: {
          show: false,
          position: 'front',
          stroke: {
            color: borderColor,
            width: 1,
            dashArray: 3,
          },
        },
      },
      yaxis: {
        min: 0,
        max: 800000,
        labels: {
          show: false,
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
      },
      states: {
        normal: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
        hover: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'none',
            value: 0,
          },
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        y: {
          formatter: function (val: number) {
            return val + ' €';
          },
        },
        marker: {
          show: false,
        },
      },
      colors: ['transparent'],
      markers: {
        colors: [color],
        strokeColors: [strokeColor],
        strokeWidth: 3,
      },
    };
  }

  getStats() {
    return new Promise((resolve) => {
      this.netRevenue = this.analytics.getNetRevenue().pipe(map((res: ApiResponse<NetRevenue>) => res.data));
      this.voucherRevenue = this.netRevenue.pipe(map((res: NetRevenue) => res.vouchers));
      resolve('success')
    })
  }

}
