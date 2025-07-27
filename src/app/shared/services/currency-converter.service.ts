import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpoints } from '../api-endpoints';

interface CurrencyRatesDto {
  base: string;
  rates: { [key: string]: number };
}

interface CurrencyCodesDto {
  codes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor(private http: HttpClient) { }

  getSupportedCurrencies(): Observable<string[]> {
    return this.http.get<CurrencyCodesDto>(ApiEndpoints.Currency.Codes)
      .pipe(
        map(response => response.codes)
      );
  }

  getExchangeRates(baseCurrency: string): Observable<{ [key: string]: number }> {
    return this.http.get<CurrencyRatesDto>(ApiEndpoints.Currency.Rates(baseCurrency))
      .pipe(
        map(response => response.rates)
      );
  }
}