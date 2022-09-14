import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  totalStats: any;

  constructor(private dealService: DealService, private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chartOptions = getChartOptions(
      this.chartHeight,
      this.chartColor,
      this.strokeColor
    );

    this.getStats()
  }

  getStats() {
    this.dealService.getSalesStats().pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.totalStats = res.data.totalStats;
        this.cf.detectChanges();
      }
    })
  }

}

function getChartOptions(
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
        data: [30, 45, 32, 70, 40, 60, 40, 89, 45, 38, 32, 56],
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
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
      max: 100,
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
          return '$' + val + ' thousand';
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
