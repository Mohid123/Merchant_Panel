import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { AnalyticsService } from '@pages/services/analytics.service';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { soldVouchers, SoldVouchers } from 'src/app/modules/wizards/models/revenue.model';
import { getCSSVariableValue } from '../../../../../kt/_utils';
@Component({
  selector: 'app-mixed-widget10',
  templateUrl: './mixed-widget10.component.html',
})
export class MixedWidget10Component implements OnInit, OnDestroy {
  @Input() chartColor: string = '';
  @Input() chartHeight: string;
  @Input() chartWidth: string;
  chartOptions: any = {};
  destroy$ = new Subject();
  voucherRevenue: Observable<any>;
  data: any = [];
  categories: any = [];
  max: number;
  private isLoading: BehaviorSubject<any> = new BehaviorSubject(false);
  public isLoading$: Observable<boolean> = this.isLoading.asObservable();


  constructor(private analytics: AnalyticsService, private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoading.next(true);
    this.getVoucherStats().then(async() => {
      this.voucherRevenue.subscribe((voucher: soldVouchers[]) => {
        this.data = voucher.map((data: soldVouchers) => data.count);
        this.categories = voucher.map((data: soldVouchers) => moment(data.createdAt).format('YYYY-MM-DD'));
        this.cf.detectChanges();
        this.chartOptions = this.getChartOptions(this.chartHeight, this.chartColor, this.chartWidth);
        this.cf.detectChanges();
        this.isLoading.next(false);
      });
    });

    this.chartOptions = this.getChartOptions(this.chartHeight, this.chartColor, this.chartWidth);
  }

  getVoucherStats() {
    return new Promise((resolve) => {
      this.voucherRevenue = this.analytics.getVoucherSoldPerDay(30).pipe(map((res: ApiResponse<SoldVouchers[]>) => res.data));
      resolve('success')
    })
  }

  getChartOptions(chartHeight: string, chartColor: string, chartWidth: string) {
    const labelColor = getCSSVariableValue('--bs-gray-800');
    const strokeColor = getCSSVariableValue('--bs-gray-200');
    const baseColor = '#E4721C';
    const lightColor = getCSSVariableValue('--bs-light-' + chartColor);

    return {
      series: [
        {
          name: 'Vouchers sold',
          data: this.data,
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: chartHeight,
        width: chartWidth,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        sparkline: {
          enabled: true,
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
        opacity: 0.2,
        colors:[baseColor]
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 3,
        colors: [baseColor],
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
            color: strokeColor,
            width: 1,
            dashArray: 3,
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        min: 0,
        max: 500,
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
          background: 'white'
        },
        y: {
          formatter: function (val: number) {
            return val;
          },
        },
      },
      colors: [lightColor],
      markers: {
        colors: [lightColor],
        strokeColors: [baseColor],
        strokeWidth: 3,
      },
    };
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
