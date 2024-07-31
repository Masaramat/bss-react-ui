import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler"
import { APP_URL } from "./types";
import { NavigateFunction } from "react-router-dom";
import { ChangePasswordRequest } from "./admin/user/types";

export const getPaidMonthlyRepayments = (navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/repayment/paid`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }
}

export const getAllMonthlyRepayments = (navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/repayment/all`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }
}

export const getMonthlyYearFees = (navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/report/fees`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }

}

export const getMonthlyYearInterest = (navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/report/interest`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }

}

export const getMonthlyYearCommission = (navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/report/commission`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }

}

export const getTopCircleCustomers = (count: number, navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/loan-application/top/${count}`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }

}

export const getRecentLoanApplications = (count: number, navigate: NavigateFunction) => {
    try{
        const data = axios.get(`${APP_URL}/loan-application/recent/${count}`)
        return data;
    }catch(error){
        handleError(error, navigate);
    }

}

export const changePassword = (request: ChangePasswordRequest, navigate: NavigateFunction) => {
    try{
        const data = axios.put(`${APP_URL}/user/password/change`, request)
        return data;
    }catch(error){
        handleError(error, navigate);
    }

}


export const sendSms = async (message: string, recipient: string) => {
    const token = 'sling_l23wsmwyfrbi78wjtqfjufmw7e7ykkpdc4oekgve7dv6qnkzvrun3s';
    const url = `https://app.sling.com.ng/api/v1/send-sms?api_token=${token}&to=${recipient}&message=${message}&sender=BorrowSS`;
    
  
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    };

  
    try {
      const response = await axios.post(url, { headers });
      console.log('SMS sent successfully:', response.data);
    } catch (error: any) {
      console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    }
  };