interface CurrencyRates {
  base: string;
  rates: { [key: string]: number };
}

interface CurrencyCodesDto {
  codes: string[];
}