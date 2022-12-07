const intialState = {
    faultdata: {},
    buzzer_status: false,
    alarm_ack:false,
    show_alarm:false,
    stationid:process.env.REACT_APP_STATION_GROUP_ID
  };
  export const FaultDataReducer = (state = intialState, { type, payload }) => {
    switch (type) {
      case 'SET_FAULTDATA':
        return { ...state, faultdata: payload };
        case 'SET_STATIONID':
        return { ...state, stationid: payload };
      case 'SET_BUZZER_STATUS':
        return { ...state, buzzer_status: payload };
        case 'SET_ALARM_ACK':
        return { ...state, alarm_ack: payload };
        case 'SET_SHOW_ALARM':
        return { ...state, show_alarm: payload };
      default:
        return state;
    }
  };
  export default FaultDataReducer;