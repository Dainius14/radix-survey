import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom'
import '../App.css';
import 'antd/dist/antd.css';
import CreateSurvey from './NewSurvey';
import SurveyList from './SurveyList';
import NotFound404 from './NotFound404';
import { Layout, Menu } from 'antd';
const { Header, Content, Footer } = Layout;



class App extends Component {
  render() {
    return (
      <Layout className="layout" style={{ minHeight: '100%' }}>
        <Header>
          <Menu theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}>
            <Menu.Item key="1">
              <Link to='/create-survey'>Create a Survey</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to='/survey-list'>Survey List</Link>
            </Menu.Item>
          </Menu>
        </Header>


        <Content style={{ padding: '0 0px', margin: '16px auto', width: 600, }}>
          <div style={{ backgroundColor: 'white', padding: 24 }}>

            <Switch>
              <Route exact path='/(|create-survey)'
                     component={CreateSurvey} />
              <Route exact path='/survey-list'
                     component={SurveyList} />
              <Route exact path='*'
                     component={NotFound404} />
            </Switch>


          </div>

        </Content>


        <Footer style={{ textAlign: 'center' }}>
          Dainelio bakis ©2019
        </Footer>
      </Layout>
    );
  }
}

export default App;
