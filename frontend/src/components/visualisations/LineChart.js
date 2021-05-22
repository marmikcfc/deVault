import React, {useEffect} from 'react'
import * as d3 from 'd3';
import stackedArea from 'britecharts/dist/umd/stackedArea.min.js';
import tooltip from 'britecharts/dist/umd/tooltip.min.js';
const colors = require('britecharts/src/charts/helpers/color');
var json = require('./lorengrey.json'); 



function Line(props) {

  
    

    const getDataRow = (date,name,val) => {
            let dataRowEng= {}
            dataRowEng['date'] = new Date(date)
            dataRowEng['name'] = name
            dataRowEng['value'] = parseInt(val)
            return dataRowEng;
    }



    // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    var engagement_datetime_mapping = json['date_engagement_mapping'];
    var edm = [];
    var result = Object.entries(engagement_datetime_mapping);

    result.forEach( (res) => {

      let dataRowEng= {}
      dataRowEng = getDataRow(res[0],"Total Engagement", res[1][0]  + res[1][2] )

      edm.push(dataRowEng);
    })

    createStackedAreaChart(edm);    
  });



  const createStackedAreaChart = (chartDataProcessed) => {
    alert("!@##$$$")
    let stackedAreaChart = new stackedArea(),
        chartTooltip = new tooltip(),
        dataSet = chartDataProcessed,
        container = d3.select(`.js-stacked-area-chart-tooltip-container`),
        containerWidth = container.node() ? container.node().getBoundingClientRect().width : false,
        tooltipContainer;

      stackedAreaChart
        .isAnimated(true)
        .tooltipThreshold(800)
        .grid('horizontal')
      //If keyLabel, dateLabel, valueLabel aren't passed in it does not render?
        .keyLabel('name')
        .colorSchema(colors.colorSchemas.purple)
        .dateLabel('date')
        .valueLabel('value')
        .on('customMouseOver', chartTooltip.show)
        .on('customMouseMove', chartTooltip.update)
        .on('customMouseOut', chartTooltip.hide);

      container.datum(dataSet).call(stackedAreaChart);

      chartTooltip
        .topicLabel('values')
        .title('Returns in %ge')
        .valueFormatter(value => value.toString() )

      tooltipContainer = d3.select(`.js-stacked-area-chart-tooltip-container .metadata-group .vertical-marker-container`);
      tooltipContainer.datum(dataSet).call(chartTooltip);
}


return (

  <section>
    <div className="britechart js-stacked-area-chart-tooltip-container card--chart"></div>
   </section>

)


}

export default Line;

