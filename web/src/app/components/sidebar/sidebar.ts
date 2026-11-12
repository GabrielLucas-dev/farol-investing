import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  /** Rota de destino; sem rota, o item aparece como "Em breve" e fica desabilitado. */
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly menu: MenuItem[] = [
    { label: 'Home', icon: 'icons/home.svg', route: '/home' },
    { label: 'Ações', icon: 'icons/trending.svg' },
    { label: 'Carteira', icon: 'icons/wallet.svg' },
    { label: 'Notícias', icon: 'icons/news.svg' },
  ];
}
