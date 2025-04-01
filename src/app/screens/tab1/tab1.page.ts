import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UserService } from 'src/app/services/user.service';
import { FacadeService } from 'src/app/services/facade.service';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page  implements OnInit{
  @ViewChild('fileInput') fileInput!: ElementRef;
  public selectedFileName: string = '';
  public token : string = "";
  
  ngOnInit(): void {

    this.token = this.facadeService.getSessionToken();
    console.log("Token obtenido:", this.token);
  
    if (!this.token) {
      console.error("No se encontró un token, redirigiendo a login.");
      this.navCtrl.navigateRoot('/register');
    }
  }

  constructor(
    private userService: UserService,
    private facadeService: FacadeService,
    private navCtrl: NavController       
  ) {}

  

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      console.log('Foto tomada:', image.webPath);
      // Indicar que se tomó una foto desde la cámara
      this.selectedFileName = 'Foto tomada desde cámara';
      
      const file = await this.convertWebPathToFile(image.webPath!);
      const compressedFile = await this.compressImage(file);
      this.uploadImage(compressedFile);
    } catch (error) {
      console.error('Error al tomar foto:', error);
    }
  }

  openFileSelector() {
    this.fileInput.nativeElement.click();
  }

  async handleFileInput(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Actualiza el nombre del archivo seleccionado
      this.selectedFileName = file.name;
      console.log('Archivo seleccionado:', file);
      const compressedFile = await this.compressImage(file);
      this.uploadImage(compressedFile);
    }
  }



  // Método que comprime la imagen utilizando un canvas
  compressImage(file: File): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          // Redimensiona la imagen manteniendo la proporción
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Función recursiva para generar el blob a una calidad dada
          const generateBlob = (quality: number) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // Si el blob supera 1MB y la calidad es mayor a 0.2, intenta reducir la calidad
                  if (blob.size > 1024 * 1024 && quality > 0.2) {
                    generateBlob(quality - 0.1);
                  } else {
                    resolve(new File([blob], file.name, { type: file.type }));
                  }
                } else {
                  reject(new Error('Error al comprimir la imagen.'));
                }
              },
              file.type,
              quality
            );
          };

          generateBlob(0.8);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // Método para convertir un webPath en un objeto File
  async convertWebPathToFile(webPath: string): Promise<File> {
    const response = await fetch(webPath);
    const blob = await response.blob();
    return new File([blob], 'camera_photo.jpg', { type: blob.type });
  }

  // Método para subir la imagen comprimida utilizando el servicio
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file, file.name);

    // Llama al endpoint /food-analysis/ desde el servicio
    this.userService.analyzeFood(formData).subscribe(
      (response) => {
        console.log('Respuesta del backend:', response);
        // Aquí puedes procesar la respuesta, por ejemplo, mostrar los datos filtrados en la UI
      },
      (error) => {
        console.error('Error subiendo imagen:', error);
      }
    );
  }
}
