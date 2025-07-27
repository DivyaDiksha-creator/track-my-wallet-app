import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../shared/services/currency-converter.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';


@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-converter.html',
  styleUrls: ['./currency-converter.scss'],
  providers: [CurrencyPipe]
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  amount: number = 1;
  fromCurrency: string = 'INR';
  toCurrency: string = 'GBP';
  convertedAmount: number | null = null;
  exchangeRate: number | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  supportedCurrencies: string[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR'];

  private amountChanged: Subject<number> = new Subject<number>();
  private fromCurrencyChanged: Subject<string> = new Subject<string>();
  private toCurrencyChanged: Subject<string> = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.loadSupportedCurrencies(); 
    this.initializeCurrencySelection(); 

    this.subscriptions.push(
      this.amountChanged.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => this.convertCurrency())
    );

    this.subscriptions.push(
      this.fromCurrencyChanged.pipe(
        distinctUntilChanged()
      ).subscribe(() => this.convertCurrency())
    );

    this.subscriptions.push(
      this.toCurrencyChanged.pipe(
        distinctUntilChanged()
      ).subscribe(() => this.convertCurrency())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadSupportedCurrencies(): void {
    // Save current loading state from the previous image
    const initialLoading = this.isLoading;
    this.isLoading = true;
    this.error = null;

    this.currencyService.getSupportedCurrencies().subscribe({
      next: (currencies) => {
        // If API call is successful, use the currencies from the backend
        if (currencies && currencies.length > 0) {
          this.supportedCurrencies = currencies.sort(); // Sort for better UX
          this.error = null; // Clear any previous error
        } else {
          // If API returns empty but no error, keep hardcoded and show info
          this.error = 'No currencies returned from backend, using default list.';
        }
        this.isLoading = initialLoading; // Restore previous loading state
        this.initializeCurrencySelection(); // Re-initialize selection based on new list
        this.convertCurrency(); // Attempt conversion with loaded/default currencies
      },
      error: (err) => {
        this.error = 'Failed to load supported currencies from API. Using default list. Please check your backend connection/API key.';
        this.isLoading = initialLoading; // Restore previous loading state
        this.initializeCurrencySelection(); // Ensure selection falls back to defaults
        this.convertCurrency(); // Attempt conversion with default currencies
        console.error('Error loading currencies:', err);
      }
    });
  }

  initializeCurrencySelection(): void {
    // Set initial 'from' currency if it's not in the supported list or if the list is empty
    if (!this.supportedCurrencies.includes(this.fromCurrency) && this.supportedCurrencies.length > 0) {
      this.fromCurrency = 'USD'; // Default to USD if current not found
      if (!this.supportedCurrencies.includes(this.fromCurrency)) {
         this.fromCurrency = this.supportedCurrencies[0]; // Fallback to first available
      }
    }
    // Set initial 'to' currency if it's not in the supported list or if the list is empty
    if (!this.supportedCurrencies.includes(this.toCurrency) && this.supportedCurrencies.length > 0) {
      this.toCurrency = 'GBP'; // Default to GBP
       if (!this.supportedCurrencies.includes(this.toCurrency)) {
         // Fallback to a different currency than fromCurrency, if possible
         this.toCurrency = this.supportedCurrencies.find(c => c !== this.fromCurrency) || this.supportedCurrencies[0];
       }
    }
  }

  convertCurrency(): void {
    this.error = null;
    this.convertedAmount = null;
    this.exchangeRate = null;

    if (this.amount === null || this.amount <= 0 || !this.fromCurrency || !this.toCurrency) {
      return;
    }

    if (this.fromCurrency === this.toCurrency) {
      this.convertedAmount = this.amount;
      this.exchangeRate = 1;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.currencyService.getExchangeRates(this.fromCurrency).subscribe({
      next: (rates) => {
        if (rates && rates[this.toCurrency]) {
          this.exchangeRate = rates[this.toCurrency];
          this.convertedAmount = this.amount * this.exchangeRate;
          this.error = null;
        } else {
          this.convertedAmount = null;
          this.exchangeRate = null;
          this.error = `Exchange rate for ${this.toCurrency} not found from ${this.fromCurrency}. Ensure your API supports this pair.`;
        }
        this.isLoading = false;
      },
      error: (err) => {
        // The previous error messages were 'Failed to fetch exchange rates. Please ensure your backend is running and has a valid API key.'
        this.error = 'Failed to fetch exchange rates. Please ensure your backend is running and has a valid API key.';
        this.isLoading = false;
        this.convertedAmount = null;
        this.exchangeRate = null;
        console.error('Error fetching exchange rates:', err);
      }
    });
  }

  onAmountChange(value: number): void {
    this.amount = value;
    this.amountChanged.next(this.amount);
  }

  onFromCurrencyChange(currency: string): void {
    this.fromCurrency = currency;
    this.fromCurrencyChanged.next(currency);
  }

  onToCurrencyChange(currency: string): void {
    this.toCurrency = currency;
    this.toCurrencyChanged.next(currency);
  }

  swapCurrencies(): void {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.convertCurrency();
  }
}