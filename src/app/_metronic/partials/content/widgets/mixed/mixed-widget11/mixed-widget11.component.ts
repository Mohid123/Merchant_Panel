import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { AnalyticsService } from '@pages/services/analytics.service';
import * as moment from 'moment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getMonths } from 'src/app/modules/wizards/models/revenue.model';
import { getCSSVariableValue } from '../../../../../kt/_utils';
import { NetRevenue, revenueVouchers } from './../../../../../../modules/wizards/models/revenue.model';
@Component({
  selector: 'app-mixed-widget11',
  templateUrl: './mixed-widget11.component.html',
})
export class MixedWidget11Component implements OnInit {
  @Input() chartColor: string = '';
  @Input() chartHeight: string;
  @Input() chartWidth: string;
  chartOptions: any = {};
  public netRevenue: Observable<NetRevenue>;
  finalRes: Observable<NetRevenue>;
  public voucherRevenue: Observable<revenueVouchers[]>;
  public data: any = [];
  public categories: any = [];
  private isLoading: BehaviorSubject<any> = new BehaviorSubject(false);
  public isLoading$: Observable<boolean> = this.isLoading.asObservable();


  constructor(private analytics: AnalyticsService, private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoading.next(true);
    this.getStats().then( async() => {
      this.voucherRevenue.subscribe((vouchers: revenueVouchers[]) => {
        this.data = vouchers.map((vocuher: revenueVouchers) => vocuher.netRevenue.toFixed(0)).reverse();
        this.categories = vouchers.map((vocuher: revenueVouchers) => moment(vocuher.month).format('MMM')).reverse();
        this.cf.detectChanges();
        this.chartOptions = this.getChartOptions(this.chartHeight, this.chartColor, this.chartWidth);
        this.cf.detectChanges();
        this.isLoading.next(false);
     })

      this.netRevenue.subscribe((data: NetRevenue) => {
      const from = data.from.substring(0,2);
      const to = data.to.substring(0,2);
      const values = [from, to];
      const res = getMonths(values);
      data.from = res[0] + '' +  data.from.slice(2, 8);
      data.to = res[1] + '' + data.to.slice(2, 8);
      this.finalRes = of(data);
     })
    });

    this.chartOptions = this.getChartOptions(this.chartHeight, this.chartColor, this.chartWidth);
  }

  getStats() {
    return new Promise((resolve) => {
      this.netRevenue = this.analytics.getNetRevenue().pipe(map((res: ApiResponse<NetRevenue>) => res.data));
      this.voucherRevenue = this.netRevenue.pipe(map((res: NetRevenue) => res.vouchers));
      resolve('success');
    })
  }

  getChartOptions(chartHeight: string, chartColor: string, chartWidth: string) {
    const labelColor =  '#728A9F';
    const borderColor = getCSSVariableValue('--bs-gray-300');
    const secondaryColor = getCSSVariableValue('--bs-gray-800');
    const baseColor = '#0081E9'

    return {
      series: [
        {
          name: 'Net Revenue',
          data: this.data,
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: chartHeight,
        width: chartWidth,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          borderRadius: 1,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
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
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
      },
      fill: {
        type: 'solid',
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
      },
      colors: [baseColor, secondaryColor],
      grid: {
        padding: {
          top: 10,
        },
        borderColor: borderColor,
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
    };
  }
}
