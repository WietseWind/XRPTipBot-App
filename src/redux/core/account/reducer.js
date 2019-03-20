import * as types from './actionTypes';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

const initialState = Immutable({
    uid: '',
    uuidv4: '',
    network: '',
    slug: '',
    contacts: [],
    mustTip: [],
    balance: 0,
});

export default function AccountStateReducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.RESET:
            return initialState;
        case types.USER_REPLACE:
            return state.merge(action.payload);
        case types.ADD_MUST_TIP_AMOUNT:
            if (typeof state.mustTip === 'undefined') {
                state = state.merge({ mustTip: [] });
            }
            let index = _.findIndex(state.mustTip, o => {
                return o.amount == action.payload;
            });
            if (index > -1) {
                let mutable = state.mustTip.asMutable({ deep: true });
                mutable[index].last_use = new Date().getTime();
                return state.merge({ mustTip: mutable });
            } else {
                return state.merge({
                    mustTip: [...state.mustTip, { amount: action.payload, last_use: new Date().getTime() }],
                });
            }
        default:
            return state;
    }
}
