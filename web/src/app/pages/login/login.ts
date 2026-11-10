import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  onSubmit(event: Event): void {
    // Evita recarregar a página; a autenticação será ligada à API depois.
    event.preventDefault();
  }
}
