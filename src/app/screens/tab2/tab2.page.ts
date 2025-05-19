import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements AfterViewInit {
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  capturedImage: string | null = null;
  showFlash = false;
  private stream!: MediaStream;
  private loadingOverlay: HTMLIonLoadingElement | null = null;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private loadingCtrl: LoadingController
  ) {}

  ngAfterViewInit() {
    //this.startCamera();
  }

  ionViewWillEnter() {
    this.startCamera();
  }
  
  ionViewWillLeave() {
    // Detener cámara y limpiar el fotograma
    this.stopCamera();
    this.capturedImage = null;
  }

  private async startCamera() {
    try {
      this.stopCamera(); // Detén cualquier stream anterior
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    } catch (e) {
      console.error('Error al iniciar cámara:', e);
    }
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = undefined as any;
    }
  }

  async takePhoto() {
    const video = this.videoRef.nativeElement;
    // Capturar fotograma
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    // Mostrar imagen congelada y flash
    this.capturedImage = canvas.toDataURL('image/jpeg');
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 200);
    // Pausar cámara
    this.stream.getTracks().forEach(t => t.enabled = false);

    // Convertir y comprimir
    canvas.toBlob(async blob => {
      if (!blob) return;
      const originalSize = blob.size;
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const compressed = await this.compressImage(file);
      console.log(`Original: ${originalSize} bytes, Comprimido: ${compressed.size} bytes`);
      this.uploadAndNavigate(compressed);
    }, 'image/jpeg', 0.9);
  }

  openFileSelector() {
    this.fileInput.nativeElement.click();
  }

  async handleFileInput(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.capturedImage = URL.createObjectURL(file);
    this.stream.getTracks().forEach(t => t.enabled = false);
    const compressed = await this.compressImage(file);
    console.log(`Galería original: ${file.size} bytes, Comprimado: ${compressed.size} bytes`);
    this.uploadAndNavigate(compressed);
  }

  private async compressImage(file: File): Promise<File> {
    return new Promise<File>(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.src = (e.target as any).result;
        img.onload = () => {
          const max = 1024;
          let w = img.width, h = img.height;
          if (w > h && w > max) { h *= max / w; w = max; }
          else if (h > max) { w *= max / h; h = max; }

          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          canvas.toBlob(b => resolve(new File([b!], file.name, { type: file.type })), file.type, 0.8);
        };
      };
      reader.readAsDataURL(file);
    });
  }

  private async uploadAndNavigate(file: File) {
    // Mostrar loading overlay
    this.loadingOverlay = await this.loadingCtrl.create({
      message: 'Analizando...',
      spinner: 'crescent',
      translucent: true,
      cssClass: 'custom-loading'
    });
    await this.loadingOverlay.present();

    const form = new FormData();
    form.append('image', file);
    this.userService.analyzeFood(form).subscribe({
      next: (res: any) => {
        console.log('Respuesta del backend:', res);
        const id = res?.data?.id ?? res?.id;
    
        if (id) {
          this.navCtrl.navigateForward(['/tabs/detalle-scan', id]);
        } else {
          console.error('No se pudo extraer el ID del escaneo desde la respuesta:', res);
        }
      },
      error: err => {
        console.error('Error al analizar:', err);
      },
      complete: () => {
        this.loadingOverlay?.dismiss();
      }
    });
  }
}
