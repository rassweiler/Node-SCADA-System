var chart = c3.generate({
    bindto: '#chart',
    size: {
        height: 250,
    },
    padding: {
        right: 110
    },
    data: {
      x:'xc',
      columns: [
        xc,
        positive,
        negative
      ],
      type: 'area-step',
      colors: {
            'positive': '#0000ff',
            'negative': '#ff0000'
        }
    },
    axis:{
      x:{
        type:'timeseries',
        tick:{
          format:'%H:%M'
        }
      },
      y:{
        max:60,
        min:-60
      }
    },
    legend: {
        show: false
    },
    tooltip: {
        show: false
    }
});