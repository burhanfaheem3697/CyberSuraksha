// Utility for masking various fields in a data object

function maskIncome(value) {
  if (value === undefined || value === null) return value;
  const str = value.toString();
  if (str.length > 2) return str.slice(0, 2) + '*'.repeat(str.length - 2);
  return '**';
}

function maskCreditScore(value) {
  if (value === undefined || value === null) return value;
  return '***';
}

function maskTxnSummary(value) {
  if (!value || typeof value !== 'object') return value;
  // Mask all values in transaction_summary using income masking logic
  const masked = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      const v = value[key];
      const str = v !== undefined && v !== null ? v.toString() : '';
      if (str.length > 2) {
        masked[key] = str.slice(0, 2) + '*'.repeat(str.length - 2);
      } else {
        masked[key] = '**';
      }
    }
  }
  return masked;
}

function maskEmployer(value) {
  if (!value) return value;
  return value[0] + '***';
}

function maskLastUpdated(value) {
  return '****-**-**';
}

function maskAadhaar(value) {
  if (!value) return value;
  return '****-****-****';
}

function maskPan(value) {
  if (!value) return value;
  return '*****';
}

function maskAddress(value) {
  if (!value) return value;
  return '********';
}

function maskAccounts(accounts) {
  if (!accounts || !Array.isArray(accounts)) return accounts;
  
  return accounts.map(account => {
    const maskedAccount = { ...account };
    
    // Mask account number
    if (maskedAccount.account_number) {
      maskedAccount.account_number = 'XXXX' + maskedAccount.account_number.slice(-4);
    }
    
    // Mask balance
    if (maskedAccount.balance) {
      const balanceStr = maskedAccount.balance.toString();
      maskedAccount.balance = balanceStr.slice(0, 2) + '*'.repeat(balanceStr.length - 2);
    }
    
    // Mask transactions
    if (maskedAccount.transactions && Array.isArray(maskedAccount.transactions)) {
      maskedAccount.transactions = maskedAccount.transactions.map(txn => ({
        ...txn,
        amount: txn.amount ? txn.amount.toString().slice(0, 1) + '***' : txn.amount
      }));
    }
    
    return maskedAccount;
  });
}

function maskLoans(loans) {
  if (!loans || !Array.isArray(loans)) return loans;
  
  return loans.map(loan => {
    const maskedLoan = { ...loan };
    
    // Mask sensitive loan information
    if (maskedLoan.amount) {
      const amountStr = maskedLoan.amount.toString();
      maskedLoan.amount = amountStr.slice(0, 2) + '*'.repeat(amountStr.length - 2);
    }
    
    if (maskedLoan.remaining_amount) {
      const remainingStr = maskedLoan.remaining_amount.toString();
      maskedLoan.remaining_amount = remainingStr.slice(0, 2) + '*'.repeat(remainingStr.length - 2);
    }
    
    if (maskedLoan.emi) {
      const emiStr = maskedLoan.emi.toString();
      maskedLoan.emi = emiStr.slice(0, 1) + '*'.repeat(emiStr.length - 1);
    }
    
    return maskedLoan;
  });
}

function maskCards(cards) {
  if (!cards || !Array.isArray(cards)) return cards;
  
  return cards.map(card => {
    const maskedCard = { ...card };
    
    // Always mask card numbers
    if (maskedCard.card_number) {
      maskedCard.card_number = 'XXXX XXXX XXXX ' + maskedCard.card_number.slice(-4);
    }
    
    // Mask credit limit and outstanding
    if (maskedCard.credit_limit) {
      const limitStr = maskedCard.credit_limit.toString();
      maskedCard.credit_limit = limitStr.slice(0, 1) + '*'.repeat(limitStr.length - 1);
    }
    
    if (maskedCard.outstanding) {
      const outstandingStr = maskedCard.outstanding.toString();
      maskedCard.outstanding = outstandingStr.slice(0, 1) + '*'.repeat(outstandingStr.length - 1);
    }
    
    return maskedCard;
  });
}

function maskMonthlyExpenses(expenses) {
  if (!expenses || typeof expenses !== 'object') return expenses;
  
  const maskedExpenses = {};
  for (const category in expenses) {
    if (Object.prototype.hasOwnProperty.call(expenses, category) && category !== '_id') {
      const amount = expenses[category];
      if (amount !== undefined && amount !== null) {
        const amountStr = amount.toString();
        maskedExpenses[category] = amountStr.slice(0, 1) + '*'.repeat(amountStr.length - 1);
      } else {
        maskedExpenses[category] = amount;
      }
    }
  }
  
  // Preserve _id if it exists
  if (expenses._id) {
    maskedExpenses._id = expenses._id;
  }
  
  return maskedExpenses;
}

function maskSavings(savings) {
  if (!savings || typeof savings !== 'object') return savings;
  
  const maskedSavings = {};
  for (const category in savings) {
    if (Object.prototype.hasOwnProperty.call(savings, category) && category !== '_id') {
      const amount = savings[category];
      if (amount !== undefined && amount !== null) {
        const amountStr = amount.toString();
        maskedSavings[category] = amountStr.slice(0, 1) + '*'.repeat(amountStr.length - 1);
      } else {
        maskedSavings[category] = amount;
      }
    }
  }
  
  // Preserve _id if it exists
  if (savings._id) {
    maskedSavings._id = savings._id;
  }
  
  return maskedSavings;
}

function maskEmploymentHistory(history) {
  if (!history || !Array.isArray(history)) return history;
  
  return history.map(job => {
    const maskedJob = { ...job };
    
    // Mask salary
    if (maskedJob.salary) {
      const salaryStr = maskedJob.salary.toString();
      maskedJob.salary = salaryStr.slice(0, 1) + '*'.repeat(salaryStr.length - 1);
    }
    
    // Partially mask company name if it's longer than 3 characters
    if (maskedJob.company && maskedJob.company.length > 3) {
      maskedJob.company = maskedJob.company.slice(0, 2) + '*'.repeat(maskedJob.company.length - 2);
    }
    
    return maskedJob;
  });
}

const fieldMaskers = {
  income: maskIncome,
  credit_score: maskCreditScore,
  transaction_summary: maskTxnSummary,
  employer: maskEmployer,
  last_updated: maskLastUpdated,
  aadhaar: maskAadhaar,
  pan: maskPan,
  address: maskAddress,
  accounts: maskAccounts,
  loans: maskLoans,
  cards: maskCards,
  monthly_expenses: maskMonthlyExpenses,
  savings: maskSavings,
  employment_history: maskEmploymentHistory
};

function maskFields(data, fieldsToMask) {
  const masked = { ...data };
  fieldsToMask.forEach(field => {
    if (masked.hasOwnProperty(field) && fieldMaskers[field]) {
      masked[field] = fieldMaskers[field](masked[field]);
    }
  });
  return masked;
}

module.exports = { maskFields, fieldMaskers };