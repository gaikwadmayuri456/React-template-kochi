import { Layout, Menu, Spin } from "antd";
import React from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Outlet, Route, Routes } from "react-router-dom";
// import OrgSelector from "../Components/OrgSelector";
import { Image } from "antd";
import { useSelector } from "react-redux";
import GlobalSearch from "./GlobalSearch";
const { Footer } = Layout;


export default function MyNavbar({ collapsed, setCollapse, globalSearchItems }) {

    return (
        <Layout>
            <Layout.Header>
                <div className="navbar-component">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: '0px' }}>
                        <span style={{ cursor: "pointer", fontSize: "22px", marginLeft: '5px' }} onClick={() => setCollapse(!collapsed)}>
                            {collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )}
                        </span>
                        <img
                            alt="logo"
                            src="https://images.smart-iam.com/logo.png"
                            style={{ height: "30px", marginLeft: '10px' }}
                        />
                    </span>
                    <div id="navbar-portal">

                    </div>
                </div>
            </Layout.Header>
            <div style={{
                // backgroundColor:"grey",
                position: 'sticky',
                top: 0,
                zIndex: 1,
                width: '100%',
                height:"10%",justifyContent:"center",display:"flex"
            }}>
                 <Image
    width={100}
    height={100}
    preview={false}
    src="warning.gif"
  />
                </div>
            <Layout.Content className="main-content-div">
                {/* {globalReducer?.orgLoading || !globalReducer?.selectedOrg?.orgId ? (
                    <div className="App" style={{textAlign: 'center'}}>
                        <Spin size="large" style={{marginTop: '50px'}} />
                    </div>
                ) : ( */}
                <Outlet />
                {/* )} */}
            </Layout.Content>
            <Footer style={{ display: "flex", width: "100%", justifyContent: "center", height: "5%", backgroundColor: "grey", position: "fixed", bottom: "0px" }}>Integreted Active Monitoring</Footer>
        </Layout>
    );
}


