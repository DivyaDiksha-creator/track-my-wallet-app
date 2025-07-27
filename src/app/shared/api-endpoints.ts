const baseUrl = 'https://localhost:7237/api'; 

export const ApiEndpoints = {
  Auth: {
    Login: `${baseUrl}/Users/login`,
    Register: `${baseUrl}/Users/register`,
  },
  Dashboard: {
    Summary: `${baseUrl}/Dashboard/Summary`,
    SpendingLimit: `${baseUrl}/Dashboard/spending-limit`,
  },
  Categories: {
    Base: `${baseUrl}/Categories`, 
    ById: (id: number) => `${baseUrl}/Categories/${id}` 
  },
  Expenses: {
    Base: `${baseUrl}/Expenses`, 
    ById: (id: number) => `${baseUrl}/Expenses/${id}` 
  },
  Currency: {
    Rates: (baseCurrency: string) => `${baseUrl}/Currency/rates?base=${baseCurrency}`,
    Codes: `${baseUrl}/Currency/codes`
  },
  Quotes: {
    Random: `${baseUrl}/Quotes/random`
  }
  // Add other feature endpoints here as you create them
};