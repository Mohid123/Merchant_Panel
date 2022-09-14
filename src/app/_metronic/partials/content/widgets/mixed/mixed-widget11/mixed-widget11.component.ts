import { Component, Input, OnInit } from '@angular/core';
import { getCSSVariableValue } from '../../../../../kt/_utils';
@Component({
  selector: 'app-mixed-widget11',
  templateUrl: './mixed-widget11.component.html',
})
export class MixedWidget11Component implements OnInit {
  @Input() chartColor: string = '';
  @Input() chartHeight: string;
  @Input() chartWidth: string;
  chartOptions: any = {};

  constructor() {}

  ngOnInit(): void {
    this.chartOptions = getChartOptions(this.chartHeight, this.chartColor, this.chartWidth);
  }

  // initializeSalesChart() {
  //   const labelColor = getCSSVariableValue('--bs-gray-400');
  //   const borderColor = getCSSVariableValue('--bs-gray-300');
  //   const secondaryColor = getCSSVariableValue('--bs-gray-800');
  //   const baseColor = getCSSVariableValue('--bs-gray-400');

  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: 'Net Profit',
  //         data:
  //       }
  //     ]
  //   }
  // }
}

function getChartOptions(chartHeight: string, chartColor: string, chartWidth: string) {
  const labelColor =  '#728A9F';
  const borderColor = getCSSVariableValue('--bs-gray-300');
  const secondaryColor = getCSSVariableValue('--bs-gray-800');
  const baseColor = '#0081E9'

  return {
    series: [
      {
        name: 'Net Revenue',
        data: [50, 120, 270, 380, 160, 50, 170, 260, 120, 400, 50, 340],
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
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
          return '$' + val + ' revenue';
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
