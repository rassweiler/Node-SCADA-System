function myData() {
    return [
        {
            key: "Cycle time Variance",
            values: ctvv,
            color:'#0000ff',
            area: true
        },
        {
            key: "Cycle time Variance2",
            values: ctvv2,
            color:'#ff0000',
            area: true
        }
    ];
}

nv.addGraph(function() {
    var height = 400;
    var chart = nv.models.lineChart().showLegend(false).height(height);

    chart.xAxis.axisLabel("Time").tickFormat(function(d) {
          return d3.time.format('%H:%M')(new Date(d));
      });
    chart.lines.scatter.xScale(d3.time.scale());
    chart.yAxis.axisLabel("Seconds").tickFormat(d3.format("d")).ticks(5);
    chart.yDomain([-60,60]);
    chart.lines.interactive(false);
    d3.select("svg").datum(myData()).transition().duration(0).call(chart).style({ 'height': height });

    nv.utils.windowResize(
            function() {
                chart.update();
            }
        );
    return chart;
});