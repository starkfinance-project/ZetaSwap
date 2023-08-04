import { createStore } from 'redux';
import appReducer from './reducer';

let store = createStore(appReducer);

export default store;
