import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../shared/api-endpoints'; 
import { Quote } from '../../shared/models/quote';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  constructor(private http: HttpClient) { }

  getRandomQuote(): Observable<Quote> {
    return this.http.get<Quote>(ApiEndpoints.Quotes.Random);
  }
}