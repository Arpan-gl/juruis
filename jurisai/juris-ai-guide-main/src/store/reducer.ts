import {createSlice} from "@reduxjs/toolkit";

interface User {
    email: string;
    username: string;
    role: 'user' | 'lawyer' | 'admin';
    _id: string;
}

const initialState = {
    user: null as User | null,
    isLogin: false
}

export const isLoginSlice = createSlice({
    name:"isLogin",
    initialState,
    reducers:{
        login(state, action){
            state.user = action.payload.user;
            state.isLogin = true;
        },
        logout(state){
            state.user = null;
            state.isLogin = false;
        },
        updateUser(state, action) {
            state.user = { ...state.user, ...action.payload };
        }
    }
});

export const {login, logout, updateUser} = isLoginSlice.actions;
export default isLoginSlice.reducer;