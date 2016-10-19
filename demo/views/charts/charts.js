import React from 'react';
import 'react-highcharts/dist/bundle/highcharts';
import RainbowDemo from './rainbow-demo';

class Charts extends React.Component {
  /**
   * @method render
   */
  render() {
    return (
      <div>
        <h1>Charts</h1>
        <RainbowDemo />
      </div>
    );
  }
}

export default Charts;
