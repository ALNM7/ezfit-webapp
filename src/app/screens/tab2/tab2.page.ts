import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import {
  CameraPreview,
  CameraPreviewOptions,
  CameraPreviewPictureOptions
} from '@capacitor-community/camera-preview';

import {ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements AfterViewInit{
  @ViewChild('video', { static: false }) videoRef!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLoading = false;
  private stream!: MediaStream;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private facadeService: FacadeService,


  ) { }
  

  ngAfterViewInit() {
    this.startCamera();
  }

  ionViewWillLeave() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
  
  async startCamera() {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.videoRef.nativeElement;
      video.srcObject = stream;
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  }

  takePhoto() {
    const video = this.videoRef.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const compressedFile = await this.compressImage(file);
        this.uploadImage(compressedFile);
      }
    }, 'image/jpeg', 0.9);
  }

  openFileSelector() {
    this.fileInput.nativeElement.click();
  }

  async handleFileInput(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const compressedFile = await this.compressImage(file);
      this.uploadImage(compressedFile);
    }
  }

  async compressImage(file: File): Promise<File> {
    const reader = new FileReader();
    return new Promise<File>((resolve, reject) => {
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width;
          let height = img.height;

          const max = 1024;
          if (width > height && width > max) {
            height = height * (max / width);
            width = max;
          } else if (height > max) {
            width = width * (max / height);
            height = max;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Error al comprimir.'));
            }
          }, file.type, 0.8);
        };
      };
      reader.readAsDataURL(file);
    });
  }

  uploadImage(file: File) {
    this.isLoading = true;

    const formData = new FormData();
    formData.append('image', file);

    this.userService.analyzeFood(formData).subscribe(
      (response) => {
        console.log('Respuesta del backend:', response);
        this.isLoading = false;

        // Redirige a la Tab 3 con los datos recibidos
        this.navCtrl.navigateForward('/tabs/tab3', { state: { data: response } });
      },
      (error) => {
        console.error('Error subiendo imagen:', error);
        this.isLoading = false;
      }
    );
  }

}





