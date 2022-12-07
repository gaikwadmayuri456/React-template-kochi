import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Col,
  DatePicker,
  Row,
  Select,
  Typography,
  Button,
  Table,
  Space,
  Spin,
} from "antd";
import moment from "moment";
import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";
import { CSVLink } from "react-csv";
import useForceUpdate from "use-force-update";

const { RangePicker } = DatePicker;
const { Title } = Typography;
const Option = Select.Option;
const ZoneWiseWiseReport = () => {
  const keyToTime = (key) => {
    var time = moment(key).format(" h:mm:ss a");
    var date = moment(key.substring(0, 10), ["YYYY-MM-DD"]).format("MMM DD");
    return [date, time];
  };
  const forceUpdate = useForceUpdate();
  const date_ = moment(new Date()).format("YYYY-MM-DD");
  const currDate = moment().format("DD-MM-YYYY hh:mm:ss");
  const [currentStation, setCurrentStation] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [deviceData, setDeviceData] = useState([]);
  const [bool, setBool] = useState(true);
  const [data, setData] = useState([]);
  const [edata, setEata] = useState([]);
  const [startDate, setStartDate] = useState(date_);
  const [endDate, setEndDate] = useState(date_);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("23:59:59");
  const [reportData, setReportData] = useState(data);
  const [sheetData, setSheetData] = useState(data);
  const [dates, setDates] = useState(date_);
  const [list, setList] = useState();
  const [listType, setListType] = useState();
  const [faultData, setFaultData] = useState([]);
  const [errorCodes, setErrorCodes] = useState([]);
  const [mystate, setMystate] = useState(false);
  //getting devices list
  useEffect(() => {
    axios({
      method: "GET",
      url: `/devices/network/listDevices`,
    })
      .then((res) => {
        const listData = [];
        res.data.map((kdata) => {
          if (kdata.sub_type.includes("ESCL")) {
            listData.push(kdata);
          }
        });
        setDeviceData(listData);
        setList(res.data[0]?.device_code);
        setListType(res.data[0]?.sub_type);
      })
      .catch((err) => {
        // console.log(err);
      });
  }, []);

  const onSubmit = () => {
    setIsLoading(true);
    setMystate(true);
    axios({
      method: "GET",
      params: {
        start_time: `${startDate + " " + "00:00:00"}`,
        end_time: `${endDate + " " + "23:59:59"}`,
        device_code: `${list}`,
        // device_code: `${devicecode}`,
        zone: `${currentStation}`,
        allzones: `${bool}`,
      },
      url: `/report/statechange`,
    })
      .then((res) => {
        try {
          const listData1 = [];
          let i = 1;
          if (bool == true) {
            res.data.map((idata) => {
              if (idata != null) {
                idata.map((ndata) => {

                  if (listType === 'ESCL485') {
                    ndata.zone = ndata.zone;

                  }
                  else {
                    ndata.zone = getDisplay(ndata.zone);
                  }

                  ndata.receive_time = ndata.receive_time;
                  ndata.sortReceive_time = ndata.receive_time;
                  ndata.resolve_time = ndata.resolve_time;
                  ndata.sortResolve_time = ndata.resolve_time;
                  ndata.alarm_time = getFormat(ndata.alarm_time);
                  // mdata.alarm_time = getFormat(mdata.alarm_time);
                  // listData1.push(ndata);
                });
              }
            });

            res.data.map((kdata) => {
              if (kdata != null) {
                kdata.map((mdata) => {
                  mdata.id = i;
                  // mdata.alarm_time = getFormat(mdata.alarm_time);
                  listData1.push(mdata);
                  i++;
                });
              }
            });
            // console.log(10,listData1)
            listData1.sort(custom_sort);
            let abc = [];
            listData1.map((aa) => {
              abc.push(
                {
                  receive_time: JSON.stringify(moment(aa.receive_time)?.format('yyyy-MM-DD h:mm:ss a')),
                  resolve_time: JSON.stringify(moment(aa.resolve_time)?.format('yyyy-MM-DD h:mm:ss a')),
                  zone: aa.zone,
                  name: aa.name,
                  alarm_time: aa.alarm_time
                }
              )
            })
            setEata(abc)
            setReportData(listData1);
            setIsLoading(false);

            forceUpdate();
          } else {
            res.data.map((ndata) => {
              if (ndata != null) {
                if (listType === 'ESCL485') {
                  ndata.zone = ndata.zone;

                }
                else {
                  ndata.zone = getDisplay(ndata.zone);
                }

                ndata.receive_time = ndata.receive_time;
                ndata.resolve_time = ndata.resolve_time;
                ndata.alarm_time = getFormat(ndata.alarm_time);
              }
            });

            res.data.map((kdata) => {
              if (kdata != null) {
                kdata.id = i;
                listData1.push(kdata);
                i++;
              }
            });
            listData1.sort(custom_sort);
            let abc = [];
            listData1.map((aa) => {
              abc.push(
                {
                  receive_time: JSON.stringify(moment(aa.receive_time).format('yyyy-MM-DD h:mm:ss a')),
                  resolve_time: JSON.stringify(moment(aa.resolve_time).format('yyyy-MM-DD h:mm:ss a')),
                  zone: aa.zone,
                  name: aa.name,
                  alarm_time: aa.alarm_time
                }
              )
            })
            setEata(abc)
            setReportData(listData1);
            setIsLoading(false);
            forceUpdate();
          }
        } catch (e) {
          // console.log("Error");
        }
      })
      .catch((err) => {
        // console.log(err);
      });
  };
  const handleDeviceChange = (value, key) => {
    setList(value);
    if (value == "ESCL8") {
      const arr = [
        { name: "All", zone: "NA" },
        { name: "Power", zone: "IN1" },
        { name: "UP", zone: "IN2" },
        { name: "Down", zone: "IN3" },
        { name: "Speed", zone: "IN4" },
        { name: "Under Fault", zone: "IN5" },
        { name: "Under Maintenance", zone: "IN6" },
        { name: "Emergency", zone: "IN7" },
        { name: "Fire", zone: "IN8" },
      ];
      setFaultData(arr);
    } else {
      axios({
        method: "GET",
        url: `/generic_input/get_list/${value}`,
      })
        .then((res) => {
          const listData4 = [];
          const listErrorCodes = [];
          listData4.push({ name: "All", zone: "NA" });
          for (var i = 0; i < res.data.length; i++) {
            try {
              let name = res.data[i].name;
              let zone = res.data[i].zone;
              listData4.push({ name: name, zone: zone });
              listErrorCodes.push({ [zone]: name });
              setErrorCodes(listErrorCodes);
            } catch (error) {
              console.log("Error " + error);
            }
          }
          setFaultData(listData4);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  function custom_sort(a, b) {
    return (
      new Date(a.sortReceive_time).getTime() -
      new Date(b.sortReceive_time).getTime()
    );
  }
  const onChange1 = (date) => {
    setStartDate(convert(date[0]._d));
    setEndDate(convert(date[1]._d));
    setStartTime(date[0]._d.toTimeString().split(" ")[0]); //temp comment
    setEndTime(date[1]._d.toTimeString().split(" ")[0]);
    setDates(convert(date));
  };

  function getDeviceName(deviceCode) {
    let rValue = "";
    for (let i = 0; i < deviceData.length; i++) {
      if (deviceData[i].device_code == deviceCode) {
        rValue = deviceData[i].name;
      }
    }
    return rValue;
  }

  function convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }
  function onZoneChange(value) {
    // console.log(`selected ${key}`);
    // console.log(`selected ${value}`);
    if (value != "NA" || value != "NA") {
      setBool(false);
    } else {
      setBool(true);
    }
    setCurrentStation(value);
  }

  function getDisplay(a) {
    if (a == "IN1") {
      return "Power";
    } else if (a == "IN2") {
      return "UP";
    } else if (a == "IN3") {
      return "Down";
    } else if (a == "IN4") {
      return "Speed";
    } else if (a == "IN5") {
      return "Under Fault";
    } else if (a == "IN6") {
      return "Under Maintainance";
    } else if (a == "IN7") {
      return "Emergency";
    } else if (a == "IN8") {
      return "Fire";
    } else {
      return "NA";
    }
  }

  function disabledDate(current) {
    // Can not select days before today and today
    return current > moment().endOf("day");
  }

  function getCurrentDate(separator = "") {
    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    return `${year}${separator}${month < 10 ? `0${month}` : `${month}`
      }${separator}${date}`;
  }

  function getFormat(a) {
    if (a < 60) {
      return Math.round(a) + " " + "secs";
    } else if (a > 60 && a < 3600) {
      return Math.round(a / 60) + " " + "mins";

    } else {
      return Math.round(a / 3600) + " " + "hrs";

    }
  }

  const columns1 = [
    {
      title: "Start Date",
      key: "receive_time",
      dataIndex: "receive_time",
      align: "center",
      // sorter: (a, b) =>
      //   moment(a.receive_time).unix() - moment(b.receive_time).unix(),
      sorter: (a, b) => moment(a.resolve_time).unix() - moment(b.resolve_time).unix(),
      render: (record) => (
        <>
          {/* {record} */}
          {keyToTime(record)}
          {/* {moment(record).format('MMMM Do YYYY, h:mm:ss a')} */}
        </>
      ),
    },
    {
      title: "End Date",
      dataIndex: "resolve_time",
      key: "resolve_time",
      align: "center",
      // sorter: (a, b) =>
      //   moment(a.resolve_time).unix() - moment(b.resolve_time).unix(),
      sorter: (a, b) => moment(a.resolve_time).unix() - moment(b.resolve_time).unix(),
      render: (record) => (
        <>
          {/* {record} */}
          {keyToTime(record)}
          {/* {moment(record).format('MMMM Do YYYY, h:mm:ss a')} */}
        </>
      ),
    },
    {
      title: "Zone",
      dataIndex: "zone",
      key: "zone",
      // sorter: true,
      align: "center",
      render: (record) => (
        <>
          {record}
          {/* {getDisplay(record)} */}
        </>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (record) => <>{record}</>,
    },
    {
      title: " Alarm Duration",
      dataIndex: "alarm_time",
      key: "alarm_time",
      align: "center",
      render: (record) => (
        <>
          {record}
          {/* {getFormat(record)} */}
        </>
      ),
    },
  ];
  const headers = [
    // { label: "Escalator", key: "id" },
    { label: "Start Date", key: "receive_time" },
    { label: "End Date", key: "resolve_time" },
    { label: "Zone", key: "zone" },
    { label: "Name", key: "name" },
    { label: "Alarm Duration", key: "alarm_time" },
  ];

  return (
    <>
      <div style={{ height: "100vh", marginTop: "20px" }}>
        <Row
          style={{
            margin: 4,
          }}
        >
          <Col span={7}>
            <div
              style={{
                display: "-webkit-flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: "5px",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 15,
                }}
              >
                Escalator
              </Title>
              <Select
                value={list != undefined ? getDeviceName(list) : ""}
                placeholder="Select"
                onChange={handleDeviceChange}
                showSearch
                style={{ width: 400 }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {deviceData.map((mdata) => {
                  return (
                    <Option key={mdata.name} value={mdata.device_code}>
                      {mdata.name}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>
          <Col span={7}>
            <div
              style={{
                display: "-webkit-flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: "5px",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 15,
                }}
              >
                Zone
              </Title>
              <Select
                showSearch
                style={{ width: 400 }}
                // value="All"
                defaultValue="All"
                optionFilterProp="children"
                onChange={onZoneChange}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {faultData.map((mdata) => {
                  return (
                    <>
                      <Option key={mdata.name} value={mdata.zone}>
                        {mdata.name}
                      </Option>
                    </>
                  );
                })}
              </Select>
            </div>
          </Col>
          <Col span={7}>
            <div
              style={{
                display: "-webkit-flex",
                justifyContent: "flex-end",
                alignItems: "center",
                height: "5px",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 15,
                }}
              >
                Date
              </Title>
              <RangePicker
                //  showTime
                allowClear={false}
                width={400}
                disabledDate={disabledDate}
                defaultValue={[
                  //todo
                  moment(startDate, "YYYY-MM-DD"),
                  moment(endDate, "YYYY-MM-DD"),
                ]}
                // disabled={[false, true]}
                onChange={onChange1}
              />
            </div>
          </Col>
          <Col span={3}>
            <div
              style={{
                display: "-webkit-flex",
                justifyContent: "space-evenly",
                alignItems: "center",
                height: "5px",
              }}
            >
              <Button type="primary" onClick={onSubmit}>
                Submit
              </Button>
              {mystate ? (
                <CSVLink
                  data={edata}
                  headers={headers}
                  separator={","}
                  filename={getDeviceName(list) + "_" + currDate + ".csv"}
                  target="/Desktop"
                >
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    size={"middle"}
                  />
                </CSVLink>
              ) : (
                <h1></h1>
              )}
            </div>
          </Col>
        </Row>
        <br></br>
        <br></br>
        <Row>
          <Col span={24}>
            {!isLoading ? (
              <Table
                size="middle"
                columns={columns1}
                // size={500}
                scroll={{ y: 500 }}
                dataSource={reportData}
                // rowClassName={decideRowColor}
                pagination={true}
                rowClassName={(record, index) => "rowclass"}
                onRow={(record, recordIndex) => ({
                  onClick: (event) => {
                    // console.log(
                    //   "onRow onClick",
                    //   event.target,
                    //   event.target.className,
                    //   record,
                    //   recordIndex
                    // );
                  },
                })}
              />
            ) : (
              <div className="loader">
                <Spin size="large" tip="Loading" />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};
export default ZoneWiseWiseReport;
