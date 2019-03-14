import React from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';

function Header(props) {
  // TODO properly handle url of here
  const pathname = props.location.pathname;
  const selectedIndex = ['/create-survey', '/surveys'].findIndex(x => pathname.startsWith(x)).toString();
  return (
    <Layout.Header>
      <Menu theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[selectedIndex]}
        style={{ lineHeight: '64px' }}>
        <Menu.Item key="0">
          <NavLink to='/create-survey'>Create a Survey</NavLink>
        </Menu.Item>
        <Menu.Item key="1">
          <NavLink to='/surveys'>Surveys</NavLink>
        </Menu.Item>
      </Menu>
    </Layout.Header>
  );
}

export default withRouter(Header);
