import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScanService } from 'src/app/services/scan.service';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  public scan: any = null;
  public loading = true;
  public Object = Object;
  public environment = environment;
  public token : string = "";

  constructor(
    public facadeService: FacadeService,

    private route: ActivatedRoute,
    private scanService: ScanService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadScan(id);
      }
    });
  
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
  }
  /** Invoca al servicio para cargar los datos por ID */
  loadScan(id: number) {
    this.loading = true;
    this.scanService.getScanByID(id).subscribe({
      next: async (res: any) => {
        this.scan = res.data ?? res;
  
        const nutrients = this.scan?.analysis_data?.nutritional_info?.totalNutrients;
        if (nutrients) {
          const importantes = [
            'ENERC_KCAL', // Energy
            'FAT',        // Fat
            'FASAT',      // Saturated fats
            'CHOCDF',     // Carbs
            'SUGAR',      // Sugars
            'PROCNT',     // Protein
            'FIBTG',      // Fiber
            'NA',         // Sodium
            'CHOLE',      // Cholesterol
            'CA'          // Calcium
          ];
          const filtrados: any = {};
          for (const key of importantes) {
            if (nutrients[key]) {
              filtrados[key] = nutrients[key];
            }
          }
          this.scan.analysis_data.nutritional_info.totalNutrients = filtrados;
        }
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error al cargar detalle del escaneo.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getImportantNutrients(): string[] {
    return Object.keys(this.scan?.analysis_data?.nutritional_info?.totalNutrients || {});
  }
  
  

  /** Construye URL completa de la imagen */
  fullImageUrl(path: string): string {
    return path.startsWith('http')
      ? path
      : `${this.environment.url_api}${path}`;
  }
}
