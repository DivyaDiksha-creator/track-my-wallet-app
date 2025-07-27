
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from '../../../core/auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './navbar.html', 
  styleUrls: ['./navbar.scss'] 
})
export class NavbarComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    
    this.isLoggedIn$ = this.authService.currentUser.pipe(
      map(user => !!user) 
    );
  }

  ngOnInit(): void {
    
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
   }
}