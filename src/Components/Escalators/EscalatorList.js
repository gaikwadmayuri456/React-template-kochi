import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Image, message, Modal, Row, Space, Table, Tag, Tooltip, Typography, Spin, Divider } from "antd";
import axios from "axios";
import { MinusOutlined } from "@ant-design/icons";
import UseAnimations from "react-useanimations";
import arrowDown from "react-useanimations/lib/arrowDown";
import arrowUp from "react-useanimations/lib/arrowUp";
import activity from "react-useanimations/lib/activity";
import useForceUpdate from "use-force-update";
import useInterval from "../../useInterval";
import { useDispatch, useSelector } from "react-redux";
import { setBuzzerStatus, setFaultData, setAlarmAck, setShowAlarm } from "../../Redux/Actions/FaultDetails";
import moment from "moment";
import { CameraOutlined } from "@ant-design/icons"
const { Title } = Typography;
const EscalatorlList = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const forceUpdate = useForceUpdate();
    const [edata, setEdata] = useState([]);
    const previousfaultdata = useSelector(state => state.FaultDataReducer.faultdata)
    const buzzer_status = useSelector(state => state.FaultDataReducer.buzzer_status);
    const show_alarm = useSelector(state => state.FaultDataReducer.show_alarm);
    const current_alarm_ack = useSelector(state => state.FaultDataReducer.alarm_ack);
    //Showing speed on Devices list
    useEffect(() => {

    }, [edata]);
    useEffect(() => {
        onGetDeviceList();
    }, []);
    //  ##############  useInterval for faultdata alert ###########################
    useInterval(() => {
        onDeviceDataChange()
        onDeviceUptimeChange()
        getLastfault()
    }, 5000)
    useInterval(() => {
        getEnergyData()
    }, 10000)
    async function onGetDeviceList() {
        if (edata.length === 0) {
            axios({
                method: "GET",
                url: `/devices/network/listDevices`,
            })
                .then(res => {
                    const listData = [];
                    res.data.map(kdata => {
                        if (kdata.sub_type.includes("ESCL")) {
                            listData.push({
                                index_id: kdata.name.split('-')[1],
                                device_code: kdata.device_code,
                                name: kdata.name,
                                sub_type: kdata.sub_type,
                                add_: "",
                                status: "",
                                status_code: "1000",
                                zone: "",
                                totalruntime: "00:00:00",
                                totalidletime: "00:00:00",
                                totalfaulttime: "00:00:00",
                                speed: "",
                                alaram: "",
                                lasterrortime: "",
                                last_error_code: "",
                                error_message: "",
                                voltage_data: "",
                                current_data: "",
                                load_data: ""
                            });
                        }
                    });
                    setEdata(listData.sort((a, b) => a.index_id - b.index_id));
                    setLoading(false)
                })
                .catch(err => {
                    try {
                        message.error("Network Error");
                    } catch (error1) {
                        message.error("Backend server not responding");
                    }
                });
        }
    }

    async function onDeviceDataChange() {
        let preData = edata;
        for (let i = 0; i < preData.length; i++) {
            const res = await axios.get(`/custom/escalator?device_code=${preData[i].device_code}`);
            preData[i].status = res.data.status; // res.data.status; // "UP", "DWN", "UM", "FAULT", "POWER OFF", "IDLE"
            // preData[i].status = "UP"; // res.data.status; // "UP", "DWN", "UM", "FAULT", "POWER OFF", "IDLE"
            preData[i].status_code = res.data.status_code;
            preData[i].speed = res.data.speed;
            preData[i].add_ = res.data.add_;
            if (res.data.zone === "IN5") {
                preData[i].zone = "";
            } else {
                preData[i].zone = res.data.zone;
            }
            if (res.data.status === "FAULT") {
                preData[i].alaram = true;
            } else {

            }
        }
        let fdata = {};
        edata.map((mm) => {
            fdata[mm.device_code] = mm.status
        })
        setEdata(preData);
        setLoading(false)
        let i

        var shouldIPlayAlarm = false;
        /**If any one of the station fault status is true then for loop will be break and update the shouldIPlayAlarm to true  */
        for (i = 0; i < edata.length; i++) {
            if (edata[i].status == "FAULT") {
                // dispatch(setBuzzerStatus(true));
                // dispatch(setAlarmAck(true));
                // break;
                shouldIPlayAlarm = true;
                break;
            }
        }

        if (edata.length === i) {
            // dispatch(setBuzzerStatus(false));
            dispatch(setAlarmAck(false));
            // dispatch(setShowAlarm(true));//to continue buzzer(will show continue) till user acknowldge it
        }
        else {
            // Check if prev state data is same as new api data
            for (i = 0; i < edata.length; i++) {
                // If any one is different then we will  break
                //  and the value of i will not be equal to  edata.lenght
                if (edata[i].status === "FAULT" && previousfaultdata[edata[i].device_code] !== "FAULT") {
                    break;
                }
            }
            // 

            // If edata.length === i :=> which means all the data is same as previous
            // We will not do any changes to the state
            if (edata.length === i) {
                shouldIPlayAlarm = false;
            }
        }

        if (shouldIPlayAlarm === true) {
            dispatch(setBuzzerStatus(true));
            dispatch(setAlarmAck(false));
            dispatch(setShowAlarm(true))
        }
        else {
            // Nothing to do because let the alarm be as it was
        }

        dispatch(setFaultData(fdata))
        forceUpdate();
    }


    async function onDeviceUptimeChange() {
        let preData = edata;
        for (let i = 0; i < preData.length; i++) {
            const res = await axios.get(`/daily/statereport?device_code=${preData[i].device_code}`);
            preData[i].totalruntime = res.data.UP + res.data.DOWN + " mins"; // res.data.status; // "UP", "DWN", "UM", "FAULT", "POWER OFF", "IDLE"
            preData[i].totalidletime = res.data.RTS + " mins";
            preData[i].totalfaulttime = res.data.FAULT + " mins";
        }
        setEdata(preData);
        // forceUpdate();
    }

    async function getEnergyData() {
        let preData = [...edata];

        for (let i = 0; i < preData.length; i++) {
            let abcd;
            if (preData[i].device_code === 'NET02') {
                abcd = 'MOD02';
            }
            else if (preData[i].device_code === 'NET04') {
                abcd = 'MOD04';
            }
            else {
                continue;
            }
            const res = await axios.get(`/devices/modbus/status?device_code=${abcd}`);
            let abc = {};
            res.data?.inputs?.map((aa) => {
                abc[aa.tags.zone] = aa.fields.value

            })
            preData[i].voltage_data = abc?.['AVLN']
            preData[i].current_data = parseInt((abc?.['I1'] + abc?.['I2'] + abc?.['I3']) / 3)
            preData[i].load_data = abc?.['TKW']
        }
        setEdata(preData);
    }
    // To get last fault
    async function getLastfault() {
        let preData = edata;
        for (let i = 0; i < preData.length; i++) {
            const res = await axios.get(`/networkd/reports?device_code=${preData[i].device_code}`);
            preData[i].lasterrortime = res.data[0]?.start_time;
            preData[i].last_error_code = res.data[0]?.zone;
            preData[i].error_message = res.data[0]?.add_

        }
        setEdata(preData.sort((a, b) => a.id - b.id));//to get last fault
        forceUpdate();
    }
    function getFormat(a) {
        var sec_num = parseInt(a.record, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ":" + minutes + ":" + seconds;
    }

    function getStatuspreview(record, index) {
        return (
            <>
                {

                    localStorage.getItem(index.device_code) === ' (System Overridden)' ?
                        // <Image style={{padding: 45}} width={"100%"} height={"100%"} src="fire-element.png"
                        //     preview={false}/>
                        <Tag color="#f50" style={{ width: "70%", fontSize: "20px" }}>Third party
                            <br></br>start override
                            <br></br>switch On</Tag>

                        :
                        parseInt(index.status_code) >= 2000 ? (
                            <tag>
                                {" "}
                                <Image width={100} height={100} src="power.png" preview={false} />
                            </tag>
                        )
                            : record === "NOPOLL" ? (
                                <tag>
                                    {" "}
                                    <Image width={100} height={100} src="power.png" preview={false} />
                                </tag>
                            )
                                : record === "UP" ? (
                                    <tag>
                                        {" "}
                                        <Image width={100} height={100} src="Escalator_Up.gif" preview={false} />
                                    </tag>
                                ) : record === "DOWN" ? (
                                    <tag>
                                        {" "}
                                        <Image width={100} height={100} src="Escalator_Down.gif" preview={false} />
                                    </tag>
                                ) : record === "UM" || index.zone === "E57" ? (
                                    <tag>
                                        <Image width={100} height={100} src="um.png" preview={false} />
                                    </tag>
                                ) : record === "FAULT" ? (
                                    index.zone === "E14" ? (
                                        <tag>
                                            <Image width={100} height={100} src="emergency_stop.png" preview={false} />
                                        </tag>
                                    ) :
                                        index.zone === "E107" ? (
                                            <tag>
                                                <>
                                                    <h1>Customer Fire Switch On</h1>
                                                    <Image width={100} height={100} src="fire-element.png" preview={false} />

                                                </>
                                            </tag>
                                        )

                                            : index.zone === "ED1" || index.zone === "E1A" ? (
                                                <tag>

                                                    <Image width={100} height={100} src="fire-element.png" preview={false} />


                                                </tag>
                                            ) : index.zone === "E53" ? (
                                                <>
                                                    <tag>
                                                        <Image width={100} height={100} src="seismic_zone.png" preview={false} />

                                                    </tag>
                                                    <h1>hhh</h1>
                                                </>
                                            ) : (
                                                <tag>
                                                    <Image width={100} height={100} src="fault.png" preview={false} />
                                                </tag>
                                            )
                                ) : record === "RTS" ? (
                                    <tag>
                                        <Image width={100} height={100} src="rts.png" preview={false} />
                                    </tag>
                                ) : (
                                    <tag>{"N/A"}</tag>
                                )}

            </>
        )

    }
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            align: "center",
            render: record => <Title level={5}>{record}</Title>,
        },
        {
            title: "Status Preview",
            key: "status",
            width: 225,
            dataIndex: "status",
            align: "center",
            render: (record, index) => (
                <>
                    {getStatuspreview(record, index)}

                </>
            ),
        },
        {
            title: "Power",
            key: "status_code",
            dataIndex: "status_code",
            align: "center",
            render: (record, index) => (
                <>
                    <Tag color=
                        {parseInt(record) >= 2000 ? "Red" : parseInt(record) < 2000 && index.status === "NOPOLL" ?

                            "Red"
                            :
                            "Green"}
                    >
                        {parseInt(record) >= 2000 ? "OFF" :
                            parseInt(record) < 2000 && index.status === "NOPOLL" ? "OFF"
                                :
                                "ON"}
                    </Tag>
                </>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 115,
            key: "status",
            align: "center",
            render: (record, index) => (
                <>
                    <Space>
                        <Tag>{!(parseInt(index.status_code) >= 2000) ? record : "N/A"} </Tag>
                        {record === "UP" ? (
                            <>
                                {
                                    index.speed === 1
                                        ?
                                        <UseAnimations animation={arrowUp} size={80} strokeColor="green" />
                                        : index.speed === 0
                                            ?
                                            <UseAnimations animation={arrowUp} size={60} strokeColor="orange" />
                                            :
                                            <UseAnimations animation={arrowUp} size={80} strokeColor="green" />
                                }

                            </>
                        ) : record === "DOWN" ? (
                            <>
                                {
                                    index.speed === 1
                                        ?
                                        <UseAnimations animation={arrowDown} size={60} strokeColor="green" />
                                        : index.speed === 0
                                            ?
                                            <UseAnimations animation={arrowDown} size={60} strokeColor="orange" />
                                            :
                                            <UseAnimations animation={arrowDown} size={60} />
                                }

                            </>
                        ) : (
                            <MinusOutlined />
                        )}
                    </Space>
                </>
            ),
        },
        {

            title: "Speed",
            dataIndex: "speed",
            width: 115,
            key: "speed",
            align: "center",
            render: (record, index, edata) => (
                <>
                    {
                        <b>
                            <Space>
                                {
                                    index.speed === 1 && (index.status === "UP" || index.status === "DOWN") ? (
                                        <tag>{"0.5 m/s"}</tag>
                                    ) : index.speed === 0 && (index.status === "UP" || index.status === "DOWN") ? (
                                        <tag>{"0.25 m/s"}</tag>
                                    ) : (
                                        <tag>{"0.00 m/s"}</tag>
                                    )
                                }
                            </Space>
                        </b>
                    }
                </>
            ),
        },
        {
            title: "Today's Run Time",
            dataIndex: "totalruntime",
            key: "totalruntime",
            align: "center",
            render: record => <>
                <b> {getFormat({ record })}</b>
            </>,
        },
        {
            title: "Today's Down Time",
            dataIndex: "totalfaulttime",
            key: "totalfaulttime",
            align: "center",
            render: record => <>
                <b>
                    {getFormat({ record })}
                </b>
            </>,
        },
        // {
        //     title: "Today's Idle Time",
        //     dataIndex: "totalidletime",
        //     key: "totalidletime",
        //     align: "center",
        //     render: record => <>{getFormat(record)}</>,
        // },
        {
            title: "Communication",
            dataIndex: "status",
            width: 130,
            key: "status",
            align: "center",
            render: (record, index) => (
                <>
                    <Space>

                        <Tag>

                            {
                                record.length > 0 && (parseInt(index.status_code) >= 2000) ?
                                    (

                                        <>NA</>
                                    ) :
                                    record.length > 0 && (parseInt(index.status_code) < 2000) && index.status === "NOPOLL"
                                        ? (
                                            <>NA</>
                                        ) :
                                        (
                                            <UseAnimations animation={activity} strokeColor="green" />

                                        )

                            }

                        </Tag>
                    </Space>
                </>
            ),
        },
        {
            title: "Last Error Code",
            dataIndex: ["error_message", "last_error_code"],
            // "last_error_code",
            key: "last_error_code",
            align: "center",
            render: (record, text, row) => (
                <>
                    <Tooltip placement="topLeft"
                        title={text.error_message}
                    >
                        <Tag>{text.last_error_code}</Tag>
                    </Tooltip>
                </>
            ),
        },
        {
            title: "Last Error Detail",
            dataIndex: "lasterrortime",
            key: "lasterrortime",
            align: "center",
            render: (record, index) => (
                <>
                    <b> {moment(record).format("yyyy-MM-DD hh:mm:ss A")}</b>
                </>
            ),
        },
        {
            title: "Voltage",
            dataIndex: "voltage_data",
            align: "center",

        },
        {
            title: "Current",
            align: "center",
            dataIndex: "current_data",

        },
        {
            title: "Load",
            align: "center",
            dataIndex: "load_data",

        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <Space size="middle">
                    <Link
                        to={{
                            pathname: `/escalatorview`,
                            state: { record },
                        }}
                    >

                        <Space direction="vertical">
                            <Tooltip title="Show Top Camera"><CameraOutlined style={{ fontSize: '25px', color: 'black' }} /></Tooltip>
                            <Button type="primary" size="small">
                                View
                            </Button>
                            <Tooltip title="Show Bottom Camera"><CameraOutlined style={{ fontSize: '25px', color: 'black' }} /></Tooltip>
                        </Space>

                    </Link>
                </Space>
            ),
        },
    ];
    function playaudio() {
        var x = document.getElementById("abc");
        x.play();
    }
    useEffect(() => {
        if (buzzer_status === true && current_alarm_ack === false && show_alarm === true) {
            playaudio();
        }
        else {
            stopaudio()
        }
    }, [buzzer_status, current_alarm_ack, show_alarm])
    function stopaudio() {
        var x = document.getElementById("abc");
        x.pause();
    }
    return (
        <>
            <div style={{ height: "100vh" }}>
                <Row
                    style={{
                        margin: 4,
                    }}
                ><Col span={12}>

                        <Title
                            level={4}
                            style={{
                                margin: 15,
                            }}
                        >
                            <Space>  <Title level={3}>{process.env.REACT_APP_STATION_NAME}</Title><Title level={3}>Escalator  Monitoring System</Title> </Space>
                        </Title>
                    </Col>
                </Row>
                {
                    loading ? <>
                        <div style={{ marginTop: "80px", marginLeft: "80px" }}><Spin size="large" tip="Loading Data..." /></div></>
                        : <Row>
                            <Col span={24}>
                                <Table
                                    size="middle"
                                    bordered={true}
                                    columns={columns}
                                    dataSource={[...edata]}
                                    display="block"
                                    scroll={{ y: 600 }}
                                    pagination={false}
                                    rowClassName={(record, index) => "rowclass"}
                                    // rowClassName={decideRowColor}
                                    onRow={(record, recordIndex) => ({
                                        onClick: event => {
                                        },
                                    })}
                                />
                            </Col>
                        </Row>
                }
            </div></>
    );
};
export default EscalatorlList;
