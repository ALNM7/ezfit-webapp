import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { ScanService } from 'src/app/services/scan.service';
import { FacadeService } from 'src/app/services/facade.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,  
})
export class Tab1Page implements OnInit {
  scans: any[] = [];
  currentPage = 1;
  totalPages = 1;
  loading = false;
  public environment = environment;

  constructor(
    private facadeService: FacadeService,
    private scanService: ScanService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.facadeService.getSessionToken();
    if (!token) {
      this.router.navigate(['']);
      return;
    }
    this.loadScans(1);
  }
  pageSize = 10;
  loadScans(page: number = 1, append = false, event?: any) {
    this.loading = true;
    this.scanService.getScans(page).subscribe({
      next: (res) => {
        const newScans = Array.isArray(res)
          ? res
          : res.results || res.data || [];
  
        this.totalPages = Math.ceil((res.count ?? newScans.length) / this.pageSize);
  
        if (append) {
          this.scans = [...this.scans, ...newScans];
        } else {
          this.scans = newScans;
        }
  
        this.currentPage = page;
  
        if (event) event.target.complete();
      },
      error: async () => {
        if (event) event.target.complete();
        const toast = await this.toastCtrl.create({
          message: 'Error al cargar historial.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  
  loadMore(event: any) {
    if (this.currentPage < this.totalPages) {
      this.loadScans(this.currentPage + 1, true, event);
    } else {
      event.target.disabled = true;
    }
  }

  /** Construye la URL completa de la imagen */
  fullImageUrl(path: string): string {
    return path.startsWith('http')
      ? path
      : `${this.environment.url_api}${path}`;
  }

  /** Abre la imagen en nueva pestaña */
  openImage(url: string) {
    window.open(url, '_blank');
  }

  goToDetail(scan: any) {
    this.navCtrl.navigateForward(['/tabs/detalle-scan', scan.id]);

  }

  /** Maneja el refresher pull-to-refresh */
  handleRefresh(event: any) {
    this.currentPage = 1;
    this.loadScans(1, false, event);
    this.scanService.getScans(this.currentPage).subscribe({
      next: (res) => {
        this.scans = Array.isArray(res)
          ? res
          : res.results || res.data || [];
        event.target.complete();
      },
      error: async () => {
        event.target.complete();
        const toast = await this.toastCtrl.create({
          message: 'Error al refrescar.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }


  goVerDetalle(scan: any) {
    this.router.navigate(['/tabs/detalle-scan', scan.id]);
  }
  
}
