import {configureStore} from '@reduxjs/toolkit';
import loginReducer from './reducer';

export const store = configureStore({
    reducer: loginReducer
});