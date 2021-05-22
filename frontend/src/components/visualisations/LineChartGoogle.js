import React from "react";
import Chart from "react-google-charts";


export default function Line(props) {

  return (
    <Chart
  width={'100%'}
  height='auto'
  chartType="LineChart"
  loader={<div>Loading Chart</div>}
  data={props.data}
  options={{
    hAxis: {
      title: 'Date',
    },
    vAxis: {
      title: 'Price',
    },
    series: {
      1: { curveType: 'function' },
    },
  }}
  rootProps={{ 'data-testid': '2' }}
/>

)
}


