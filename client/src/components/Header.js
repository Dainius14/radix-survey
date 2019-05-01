import React from 'react';
import { withRouter, matchPath, NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';
const { Header: AntHeader } = Layout;

function Header({ location }) {
  let initialSelectedKey;
  if (matchPath(location.pathname, { path: '/surveys/create', exact: true })) {
    initialSelectedKey = '/surveys/create';
  }
  else if (matchPath(location.pathname, { path: '/', exact: true })
    || matchPath(location.pathname, { path: '/surveys', exact: true })
    || matchPath(location.pathname, { path: '/surveys/:surveyId', exact: true })
    || matchPath(location.pathname, { path: '/surveys/:surveyId/results', exact: true })) {
    initialSelectedKey = '/surveys';
  }
  return (
    <AntHeader style={{ background: 'white' }}>
      <Menu mode="horizontal" defaultSelectedKeys={[initialSelectedKey]}
            style={{ borderBottom: 'none', display: 'flex', justifyContent: 'center' }}>

        <Menu.Item key="/surveys">
          <NavLink to='/surveys'>Surveys</NavLink>
        </Menu.Item>

        <Menu.Item key="/surveys/create">
          <NavLink to='/surveys/create'>Create a Survey</NavLink>
        </Menu.Item>

      </Menu>
    </AntHeader>
  );
}

export default withRouter(Header);
