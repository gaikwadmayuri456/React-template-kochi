import react, { useEffect, useState } from "react";
import { Table, message, Modal, Button, Form, Input, Space } from "antd";
import axios from "axios";
import useForceUpdate from "use-force-update";
import React from "react";

const Mydata = myd => {
    const forceUpdate = useForceUpdate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };
    function refreshPage() {
        window.location.reload();
        forceUpdate();
    }
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const onFinish = values => {
        if (values.password === "888888") {
            axios
                .put("/gateway/config/edit", {
                    config_key: values.config_key,
                    value: values.value,
                })
                .then(res => {
                    res.status === 200
                        ? message.success("Contact No Updated Successfully") && refreshPage() && setIsModalVisible(false)
                        : message.error("Opps! Something went wrong");
                })
                .catch(function (error) {
                    console.log(error);
                    message.error("Backed Server not responding");
                });
        } else {
            message.error("Password is incorrect");
        }
    };

    const onFinishFailed = errorInfo => {
        console.log("Failed:", errorInfo);
        message.error("Opps! Something went wrong");
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Edit
            </Button>
            <Modal title="Edit Mobile Number" visible={isModalVisible} closable={false} footer={null}>
                <Form
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    initialValues={myd.myd}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Mobile No"
                        name="value"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Phone No!",
                            },
                        ]}
                    >
                        <Input maxLength={10} />
                    </Form.Item>
                    <Form.Item
                        // label="Config Key"
                        name="config_key"
                    >
                        {/* <Input disabled={true}/> */}
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password maxLength={6} />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ align: "center" }}>
                            <Button type="primary"
                                // onClick={refreshPage} 
                                htmlType="submit" style={{ backgroundColor: "green" }}>
                                Submit
                            </Button>
                            <Button onClick={handleCancel} type="primary" style={{ backgroundColor: "red" }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const ContactList = () => {
    const [data, setData] = useState([]);
    const columns = [
        // {
        //     title: "ID",
        //     dataIndex: "id",
        //     key: "id",
        //     columnWidth: "10%",
        //     align: "center",
        // },
        {
            title: "Config Key",
            dataIndex: "config_key",
            key: "config_key",
            render: text => text.split("_").join(" "),
            columnWidth: "40%",
            align: "center",
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
            columnWidth: "20%",
            align: "center",
        },
        {
            title: "Action",
            dataIndex: "",
            key: "x",
            columnWidth: "20%",
            align: "center",
            render: (record, index) => <Mydata myd={record} />,
        },
    ];
    useEffect(() => {
        axios({
            method: "GET",
            url: `/gateway/config/show`,
        })
            .then(res => {
                const listData = [];
                res.data.map(kdata => {
                    if (kdata.config_key.includes("METRO_SMS_NUMBER")) {
                        listData.push({
                            id: kdata.id,
                            value: kdata.value,
                            config_key: kdata.config_key,
                            value2: kdata.value2,
                            type: kdata.type,
                        });
                    }
                });
                setData(listData);
            })
            .catch(err => {
                try {
                    message.error("Network Error");
                } catch (error1) {
                    message.error("Backend server not responding");
                }
            });
    }, []);
    return (
        <>
            <div style={{ height: "100vh",marginTop:"20px"}}>
               <Table  bordered={true} columns={columns} dataSource={data} />
            </div>
        </>
    );
};
export default ContactList;
