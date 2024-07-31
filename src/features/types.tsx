export const formatCurrency = (amount: number) => {
    // Assuming amount is a numeric value
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };
  
  export const capitalizeFirstLetter = (input: string): string => {
    if (typeof input !== 'string') {
      throw new TypeError('Input should be a string');
    }
  
    if (input.trim().length === 0) {
      return input; // Return empty string if input is empty or whitespace
    }
    
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  };
  
  export const formatDate = (dateString: string): string => {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(date);
  };

  export const APP_URL = 'http://localhost:8080/api/v1'

  export type MonthyReport = {
    month: number;
    amount: number;
  }

  export const maskAccountNumber = (accountNo: String) => {
    if (accountNo.length <= 4) {
      // If the account number is too short to mask, return it as is
      return accountNo;
    }
  
    const firstTwo = accountNo.slice(0, 2);  // Get the first two digits
    const lastTwo = accountNo.slice(-2);     // Get the last two digits
    const middleLength = accountNo.length - 4;
    const maskedMiddle = '*'.repeat(middleLength);  // Replace middle digits with *
  
    return firstTwo + maskedMiddle + lastTwo;
  }