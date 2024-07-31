import { CircularProgress } from '@mui/material';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Account, Customer, capitalizeFirstLetter } from '../customer/types';
import { LoanProduct } from '../admin/loan_product/types';
import { APP_URL } from '../types';
import { useAuth } from '../../Context/useAuth';
import { Group } from '../group/types';
import { getGroups } from '../group/groupApi';
import { handleError } from '../../Helpers/ErrorHandler';

const NewLoanApplication = () => {
  const userRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [amountInWords, setAmountInWords] = useState('');
  const [formFee, setFormFee] = useState(0);
  const [searchFee, setSearchFee] = useState(0);
  const [collateralDeposit, setCollateralDeposit] = useState(0);
  const [tenor, setTenor] = useState(0);
  const [selectedLoanProduct, setSelectedLoanProduct] = useState<LoanProduct>();
  const [groupId, setGroupId] = useState(0);
  const [customer, setCustomer] = useState<Customer>();
  const [groups, setGroups] = useState<Group[]>([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);  
  const { customerId } = useParams<{ customerId: string }>();
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>();
  const { user } = useAuth();

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrorMsg('');
  }, [amount]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerResponse = await axios.get(`${APP_URL}/customer/${customerId}`);
        setCustomer(customerResponse.data);

        await getGroups(navigate)?.then(res=>{
          if(res.data){
            setGroups(res.data);
          }
        })

        const productsResponse = await axios.get(`${APP_URL}/admin/loan-product`);
        setLoanProducts(productsResponse.data);
      } catch (error) {
        handleError(error, navigate);
      }
    };

    fetchData();
  }, [customerId]);

  const checkCollateral = () => {
    if (amount) {
      let expectedCd = 0.10 * Number(amount);
      let actualCd
      if(customer?.accounts){
        actualCd = customer?.accounts.find((account: Account) => account.accountType === 'COLLATERAL_DEPOSIT');
        if (actualCd) {
          let balance = expectedCd - actualCd?.balance;
          if (balance > 0) {
            setErrorMsg("Please ensure you have deposited " + balance + " along with the application.");
          } else {
            setErrorMsg("");
          }
        } else {
          setErrorMsg("Please ensure you have deposited " + expectedCd + " along with the application.");
        }
      }
      }
      

     
  }

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    checkCollateral();
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedProduct = loanProducts?.find(product => product.id === selectedId);
    

    if (selectedProduct) {
      setSelectedLoanProduct(selectedProduct);
      setTenor(selectedProduct.tenor);
      checkCollateral();
    }
  };

  const handleGroupSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupId(Number(e.target.value));
  }

  const handleAmountInWordsInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => setAmountInWords(e.target.value);
  const handleFormFeeInput = (e: React.ChangeEvent<HTMLInputElement>) => setFormFee(Number(e.target.value));
  const handleSearchFeeInput = (e: React.ChangeEvent<HTMLInputElement>) => setSearchFee(Number(e.target.value));
  const handleTenorInput = (e: React.ChangeEvent<HTMLInputElement>) => setTenor(Number(e.target.value));
  const handleCollateralDepositInput = (e: React.ChangeEvent<HTMLInputElement>) => setCollateralDeposit(Number(e.target.value));

  const handleSubmit = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      const response = await axios.post(
        `${APP_URL}/loan-application`,
        {
          amount: amount,
          amountInWords: amountInWords,
          status: "PENDING",
          tenor: tenor,
          collateralDeposit: collateralDeposit,
          searchFee: searchFee,
          formsFee: formFee,
          appliedById: user?.id,
          customerId: customerId,
          loanProductId: selectedLoanProduct?.id,
          groupId: groupId
        }
      );

      if (response.data) {
        let message = "Loan application successful for: " + customer?.name;
        navigate(`/group`, { state: { message } });
      }
    } catch (error) {
      setErrorMsg("Error submitting application: " + error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border border-primary rounded-lg m-5 dark:bg-transparent">
      <h3 className="bg-secondary rounded-lg p-5 text-white font-sans text-lg">Loan Application</h3>
      <form onSubmit={handleSubmit} className="p-6">
        <p className="text-center text-red-600">{errorMsg && errorMsg}</p>

        <div className="grid grid-cols-2">
          <div className="col-span-1">
            <p className='text-primary font-bold'>Customer Details</p>
            <p className='text-gray-700'>Customer: {customer?.name}</p>
          </div>
          <div className="col-span-1">
            <p className='text-primary font-bold'>Account Details: </p>
            <ul className='text-gray-700'>
              {customer?.accounts && customer?.accounts.map((account: Account) => (
                <li key={account.id}>{account.accountType.toLocaleLowerCase()} - {account.balance.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className='form-group'>
            <label htmlFor="name" className="form-label">Amount</label>
            <input type="text" className="form-control" onChange={handleNameInput} />
          </div>
          <div className='form-group'>
            <label htmlFor="amount-in-words" className='form-label'>Amount in Words</label>
            <textarea value={amountInWords} onChange={handleAmountInWordsInput} rows={1} className="form-control" placeholder='Amount in Words' />
          </div>
          <div className='form-group'>
            <label htmlFor="name" className="form-label">Loan Product</label>
            <select onChange={handleProductSelect} className="form-control">
              <option value="0">Select Loan Product</option>
              {loanProducts && loanProducts.map((prod: LoanProduct) => (
                <option key={prod.id} value={prod.id}>{prod.name ? capitalizeFirstLetter(prod.name) : ''}</option>
              ))}
            </select>
          </div>
          <div className='form-group'>
            <label htmlFor="cd" className="form-label">Collateral Deposit</label>
            <input onChange={handleCollateralDepositInput} type="text" className="form-control" />
          </div>
          <div className='form-group'>
            <label htmlFor="tenor" className="form-label">Tenor (In Months)</label>
            <input onChange={handleTenorInput} type="text" value={tenor} className="form-control" />
          </div>
          <div className='form-group'>
            <label htmlFor="form-fee" className="form-label">Form Fee</label>
            <input onChange={handleFormFeeInput} type="text" className="form-control" />
          </div>
          <div className='form-group'>
            <label htmlFor="search-fee" className="form-label">Search Fee</label>
            <input onChange={handleSearchFeeInput} type="text" className="form-control" />
          </div>
          <div className='form-group'>
            <label htmlFor="search-fee" className="form-label">Group</label>
            <select onChange={handleGroupSelect} name="" id="" className='form-control'>
              <option value="">Select Group</option>
              {groups.map(group => (
                <option value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button className='bg-primary-blue text-white-400 w-60 rounded-full text-lg p-2 mt-4 font-bold' >
            {isLoading ? <CircularProgress color="inherit" /> : 'Create Loan Application'}
        </button>
      </form>
    </div>
  );
}

export default NewLoanApplication;
