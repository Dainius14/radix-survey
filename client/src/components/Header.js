import React from 'react';
import { withRouter, matchPath, NavLink, Link } from 'react-router-dom';
import { Menu, Layout } from 'antd';
const { Header: AntHeader } = Layout;

function Header({ location }) {
  let initialSelectedKey;
  if (matchPath(location.pathname, { path: '/surveys/create', exact: true })) {
    initialSelectedKey = '/surveys/create';
  }
  else if (matchPath(location.pathname, { path: '/statistics', exact: true })
    || matchPath(location.pathname, { path: '/statistics', exact: true })) {
    initialSelectedKey = '/statistics';
  }
  else if (matchPath(location.pathname, { path: '/', exact: true })
    || matchPath(location.pathname, { path: '/surveys', exact: true })
    || matchPath(location.pathname, { path: '/surveys/:surveyId', exact: true })
    || matchPath(location.pathname, { path: '/surveys/:surveyId/responses', exact: true })
    || matchPath(location.pathname, { path: '/surveys/:surveyId/responses/buy', exact: true })) {
    initialSelectedKey = '/surveys';
  }


  return (
    <AntHeader style={{ background: 'white', paddingLeft: 24 }}>
            
      <Menu mode="horizontal" defaultSelectedKeys={[initialSelectedKey]}
            style={{ borderBottom: 'none' }}>

        <Menu.Item style={{ borderBottom: 'none', marginRight: 60, paddingLeft: 0 }}>
          <Link to='/' style={{ fontSize: '1.2rem', fontWeight: 500 }}>RadixDLT Surveys</Link>
        </Menu.Item>

        <Menu.Item key="/surveys">
          <NavLink to='/surveys' style={{ fontSize: '1rem' }}>Surveys</NavLink>
        </Menu.Item>

        <Menu.Item key="/surveys/create">
          <NavLink to='/surveys/create' style={{ fontSize: '1rem' }}>Create a Survey</NavLink>
        </Menu.Item>

        <Menu.Item key="/statistics">
          <NavLink to='/statistics' style={{ fontSize: '1rem' }}>Statistics</NavLink>
        </Menu.Item>

      </Menu>
    </AntHeader>
  );
}

export default withRouter(Header);
