export const setFaultData = (faultdata) => {
  return {
    type:'SET_FAULTDATA',
    payload: faultdata,
  };
};
export const setStationid = (stationid) => {
  return {
    type:'SET_STATIONID',
    payload: stationid,
  };
};
export const setBuzzerStatus = (buzzer_status) => {
  return {
    type:'SET_BUZZER_STATUS',
    payload: buzzer_status,
  };
};
export const setAlarmAck = (alarm_ack) => {
  return {
    type:'SET_ALARM_ACK',
    payload: alarm_ack,
  };
};
export const setShowAlarm = (show_alarm) => {
  return {
    type:'SET_SHOW_ALARM',
    payload: show_alarm,
  };
};


 