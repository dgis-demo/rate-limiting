let Highcharts = require('highcharts');  
require('highcharts/modules/exporting')(Highcharts);  

export let chartSettings = {
    title: {
        text: ''
    },

    yAxis: {
        title: {
            text: ''
        }
    },

    xAxis: {
        type: 'datetime'
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    series: [{
        name: '',
        data: [[1,2], [2,3], [3,4]]
    }],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }
};

export function setChart(container='', settings={}, title='', yAxisTitle='', series=[]){
    settings.title.text = title;
    settings.yAxis.title.text = yAxisTitle;
    settings.series = series;
    return Highcharts.chart(container, settings)
}

export let hourlyChart = Highcharts.chart('hourlyChart', chartSettings);

export let dailyChart = Highcharts.chart('dailyChart', chartSettings);