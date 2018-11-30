
import * as types from './actionTypes';


const initialState = {
    connectionStatus: 'IDLE',
    token: "",
    lastMsgID: "0"
};

export default function pushReducer(state = initialState, action) {
    switch (action.type) {
        case types.PUSH_REGISTER:
            return {
                ...state,
                connectionStatus: 'REGISTERED',
                token: action.payload.token
            };
        case types.PUSH_UNREGISTER:
            return {
                ...state,
                connectionStatus: 'IDLE',
                token: ""
            };
        case types.UPDATE_LAST_MESSAGE_ID:
            return {
                ...state,
                lastMsgID: action.payload
            };
        default:
            return state;
    }
}
