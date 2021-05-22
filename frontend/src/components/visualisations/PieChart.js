import React, {useState ,useEffect} from 'react'
import * as d3 from 'd3';
import stackedArea from 'britecharts/dist/umd/stackedArea.min.js';
import tooltip from 'britecharts/dist/umd/tooltip.min.js';

import legend from 'britecharts/dist/umd/legend.min.js';
import donut from 'britecharts/dist/umd/donut.min.js';

const colors = require('britecharts/src/charts/helpers/color');


function Pie(props) {

const [pieChartData,setPieChartData] = useState([])

const generatePieChartData = (data) => {

  var keys = Object.entries(data);
  var ds = []
  keys.forEach((key,index)=> {

    let row = {
      quantity: 1,
      percentage:data[key],
      name:key,
      id:index+1
    }

    ds.push(row)

  })

  return ds

}

useEffect(() => {

createSmallDonutChart(generatePieChartData(props.data));

})

const getInlineLegendChart = (dataset) => {
    let legendChart = legend(),
        legendContainer = d3.select('.js-inline-legend-chart-container'),
        containerWidth = legendContainer.node() ? legendContainer.node().getBoundingClientRect().width : false;

    if (containerWidth) {
        d3.select('.js-inline-legend-chart-container .britechart-legend').remove();

        legendChart
            .isHorizontal(true)
            .width(containerWidth*0.6)
            .markerSize(8)
            .height(40)

        
            //legendChart.colorSchema(optionalColorSchema);

        
        legendContainer.datum(dataset).call(legendChart);

        return legendChart;
    }
}

function createSmallDonutChart(pieChartData) {

    let donutChart = donut(),
        donutContainer = d3.select('.js-small-donut-chart-container'),
        containerWidth = donutContainer.node() ? donutContainer.node().getBoundingClientRect().width : false,
        legendChart = getInlineLegendChart(pieChartData);

    if (containerWidth) {
        donutChart
            .width(containerWidth)
            .height(containerWidth/1.8)
            .externalRadius(containerWidth/5)
            .internalRadius(containerWidth/10)
            .on('customMouseOver', function(data) {
                legendChart.highlight(data.data.id);
            })
            .on('customMouseOut', function() {
                legendChart.clearHighlight();
            });

        donutContainer.datum(pieChartData).call(donutChart);
    }
}






return (

    <section>
                    <h2>Small Donut Chart with Inline Legend</h2>
                    <div className="js-small-donut-chart-container card--chart"></div>
                    <div className="js-inline-legend-chart-container legend-chart-container"></div>

         </section>

)


}

export default Pie;

