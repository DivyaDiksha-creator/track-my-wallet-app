import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../../shared/services/quote.service';
import { Quote } from '../../../shared/models/quote'; 

@Component({
  selector: 'app-quote-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-display.component.html',
  styleUrls: ['./quote-display.component.scss']
})
export class QuoteDisplayComponent implements OnInit {
  quote: Quote | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private quoteService: QuoteService) { }

  ngOnInit(): void {
    this.fetchQuote();
  }

  fetchQuote(): void {
    this.isLoading = true;
    this.error = null;
    this.quoteService.getRandomQuote().subscribe({
      next: (data) => {
        this.quote = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quote. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching quote:', err);
      }
    });
  }
}