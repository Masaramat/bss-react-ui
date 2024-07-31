import axios from 'axios';
import { useEffect, useState } from 'react';
import { Account, capitalizeFirstLetter, Customer } from './types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import { APP_URL, maskAccountNumber } from '../types';
import Modal from '../../components/Modal';
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from 'react-hook-form';
import { getCustomerAccounts, makeTransaction } from './api';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/useAuth';
import { sendSms } from '../homeApi';
import { CircularProgress } from '@mui/material';

type TransactionFormInputs = {
  amount: number;
  accountId: number;
  description: string;
};



const validation = Yup.object().shape({
  amount: Yup.number().required("Amount is required"),
  accountId: Yup.number().required("Account is required"),
  description: Yup.string().required("Description is required"),
});

const CustomerDetail = () => {
  const [customer, setCustomer] = useState<Customer>();
  const [accounts, setAccounts] = useState<Account[]>([])
  const [message, setMessage] = useState("");
  const { id: customerId } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxType, setTrxType] = useState<string | null>(null);
  const navigate = useNavigate();
  const {user} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormInputs>({ resolver: yupResolver(validation) });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if(customerId){

        let accountsResponse = await  getCustomerAccounts(Number(customerId), navigate)
        setAccounts(accountsResponse?.data)
        const customerResponse =  await axios.get(`${APP_URL}/customer/${customerId}`)       
        setCustomer(customerResponse?.data);
        setIsLoading(false);

        }   
       
        
      } catch (error) {
        setMessage("Error fetching data: " + error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (customer && accounts) {      
      $(function ($) {
        if (!$.fn.dataTable.isDataTable('#users-table')) {
          $('#users-table').DataTable({
            dom: 't'
          });
        }
      });

    }
  }, [customer, accounts]);

  const handleTransaction = async (form: TransactionFormInputs) => {
    if (!trxType || !user) return;

    await makeTransaction(form.amount, form.accountId, trxType, form.description, user.id, navigate)?.then(res => {
      if (res?.data) {
        const account = accounts.find(account => account.id === form.accountId);

        const maskedAccountNo = maskAccountNumber(String(account?.accountNumber));
        if(form && customer){
          let message =  `Credit: \n Your account: ${maskedAccountNo} has been credited with ${form.amount} Trx Type:${trxType} \n Balance: ${account?.balance || 0 + form.amount}`;
          sendSms(message, "234"+customer?.phoneNumber)
        }
        
        toast.success(trxType === 'credit' ? "Deposit successful" : "Withdrawal successful");
        // window.location.reload();
      }
    });
  };

  let content = <div></div>;
  if(isLoading){
    content = (
      <>
      <div className='flex items-center justify-center'>
      <CircularProgress />
      </div>
      
      
      </>
    )
  }else{
    content = (
      <div className='m-5 rounded-lg border h-fit border-primary'>
        <div className='grid grid-cols-2 bg-secondary p-3 text-white'>
          <div className='col-span-1 text-lg mt-1'><h3>{customer?.name}</h3></div>
          <div className='flex justify-end items-end col-span-1'>
          </div>
        </div>
        <div className='p-3'>
          {message && <p className='text-success text-center font-bold'>{message}</p>}
          {customer && (<>
            <div className="grid grid-cols-2 max-md:grid-cols-1">
              <div className="p-5 font-bold col-span-1">
                <p className="p-2"><span className="text-lg font-bold text-slate-700">BVN : </span> {customer.bvn}</p>
                <p className="p-2"><span className="text-lg font-bold text-primary">Customer Type : </span>{capitalizeFirstLetter(customer.customerType)}</p>
                <p className="p-2"><span className="text-lg font-bold text-primary">Phone Number : </span>{"+234"+customer.phoneNumber}</p>
                <p className="p-2"><span className="text-lg font-bold text-primary">Customer Type: </span>{customer.customerType}</p>
                <Link className='rounded-full bg-secondary text-white p-2' to={`/customer/edit/${customer.id}`} >Edit Customer</Link>
              </div>
              <div className="p-5 font-bold col-span-1 flex justify-end ">
                <ul className='flex-col space-y-3 w-60'>
                  <li className='w-full bg-green-900 text-white text-sm rounded-md p-2'><Link to={`/loan/new/${customerId}`} className=''>Create Loan application</Link></li>
                  <li className='w-full bg-blue-600 text-white text-sm rounded-md p-2'><button onClick={() => { setIsModalOpen(true); setTrxType('credit'); }} className=''>Make savings deposit</button></li>
                  <li className='w-full bg-red-500 text-white text-sm rounded-md p-2'><button onClick={() => { setIsModalOpen(true); setTrxType('debit'); }} className=''>Savings withdrawal</button></li>
                </ul>
              </div>
            </div>
          </>)}
          <div className=''>
            <h3>Accounts</h3>
            <table className='table-auto' id="users-table">
              <thead className='table-header-group'>
                <tr>
                  <th className='w-2'>ID</th>
                  <th>Name</th>
                  <th>Account Number</th>
                  <th>Account Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Loan Cycle</th>
                </tr>
              </thead>
              <tbody>
                {accounts && accounts?.map((account: Account, index: number) => (
                  <tr key={account.id} className="table-row">
                    <td className='w-2'>{index + 1}</td>
                    <td>{account.name}</td>
                    <td>{account.accountNumber}</td>
                    <td>{account.accountType}</td>
                    <td>{account.balance.toFixed(2)}</td>
                    <td>{account.accountStatus}</td>
                    <td>{account.loanCycle ? account.loanCycle : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleSubmit(handleTransaction)}
          title={trxType === 'credit' ? "Savings Deposit" : "Savings Withdrawal"}
        >
          <label className='form-label' htmlFor="amount">Amount</label>
          <input className='form-control' type="number" {...register("amount")} />
          {errors.amount ? (<p className='text-sm text-red-600'>{errors.amount?.message}</p>) : ""}
          <label className='form-label' htmlFor="amount">Account</label>
          <select className='form-control' {...register("accountId")}>
            {accounts && accounts?.map((account: Account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
          {errors.accountId ? (<p className='text-sm text-red-600'>{errors.accountId?.message}</p>) : ""}
          <label className='form-label' htmlFor="amount">Narration</label>
          <textarea className='form-control' rows={2} {...register("description")}></textarea>
          {errors.description ? (<p className='text-sm text-red-600'>{errors.description?.message}</p>) : ""}
        </Modal>
      </div>
    );
  }
 

  return content;
};

export default CustomerDetail;
