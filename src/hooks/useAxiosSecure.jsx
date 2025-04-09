import axios from "axios";

import useAuth from "./useAuth";
import { useEffect } from "react";

export const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

const useAxiosSecure = () => {
    const { logOut } = useAuth();
    
    useEffect(() => {
        axiosSecure.interceptors.response.use(res => {
            return res
        }, async error => {
            console.log('error caught ->>>', error.response);
            if (error.response.status === 401 || error.response.status === 403) {
                logOut()
            }
        })
    }, [logOut])
    return axiosSecure
}


export default useAxiosSecure;