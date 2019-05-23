import React, { useEffect, useState } from 'react';
import { Spin, Row, Col, Statistic } from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { request } from '../utilities';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || window.location.origin;

const chartOptions = {
  chart: {
    height: 300,
    type: 'pie'
  },
  title: {
    text: null,
  },
  credits: {
    enabled: false
  },
  legend: {
    enabled: false,
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle'
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: true,
        distance: -30,
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
      }
    }
  }
};

function Stats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    async function getData() {
      try {
        const response = await request(`${API_ENDPOINT}/api/statistics`, {
          method: 'GET'
        });
        setStats(response);
      }
      catch (error) {
        console.error('woops', error);
      }
    }
    getData();
  }, []);

  if (!stats) {
    return (
      <div>
        <Spin style={{ width: '100%' }} spinning={true}/>
      </div>
    )
  }

  const surveyTypeOptions = {
    title: {
      text: `In total ${stats.totalSurveys} surveys created`
    },
    series: [
      {
        name: 'Surveys',
        data: [
          {
            name: 'Free',
            y: stats.freeSurveyCount
          },
          {
            name: 'Paid',
            y: stats.paidSurveyCount
          }
        ]
      }
    ]
  };
  const surveyVisibilityOptions = {
    title: {
      text: `Survey visibility`
    },
    series: [
      {
        name: 'Surveys',
        data: [
          {
            name: 'Public',
            y: stats.publicSurveyCount
          },
          {
            name: 'Private',
            y: stats.privateSurveyCount
          }
        ]
      }
    ]
  };

  return <>
    <Row>
      <Col span={12}>
        <HighchartsReact
          highcharts={Highcharts}
          options={{ ...chartOptions, ...surveyTypeOptions }}
        />
      </Col>
      <Col span={12}>
        <HighchartsReact
          highcharts={Highcharts}
          options={{ ...chartOptions, ...surveyVisibilityOptions }}
        />
      </Col>
    </Row>
    <Row>
      <Col span={8}>
        <Statistic title="Total questions asked" value={stats.totalQuestions} />
      </Col>
      <Col span={8}>
        <Statistic title="Total responses received" value={stats.totalResponses} />
      </Col>
      <Col span={8}>
        <Statistic title="Average response count per survey" value={stats.avgResponses} precision={1}/>
      </Col>
    </Row>
    <Row>
      <Col span={8}>
        <Statistic title="Tokens given out" value={stats.totalReward} suffix="Rads" />
      </Col>
      <Col span={8}>
        <Statistic title="Average reward for user" value={stats.avgReward} precision={1} suffix="Rads" />
      </Col>
    </Row>

  </>;
}

export default Stats;
