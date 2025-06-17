import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-sign',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <h1>Создание электронной подписи</h1>
        <p class="subtitle">Подпишите документ по ГОСТ Р 34.10-2012</p>
        <a routerLink="/verify" class="nav-link">→ Перейти к проверке подписи</a>
      </div>

      <div class="card">
        <h2>1. Загрузите документ</h2>
        <div class="file-upload">
          <label class="upload-label">
            <input type="file" (change)="onDocumentSelected($event)" class="file-input" accept=".txt,.doc,.docx,.pdf">
            <span class="upload-button">Выбрать файл</span>
            <span class="file-name">{{ documentName || 'Файл не выбран' }}</span>
          </label>
        </div>
      </div>

      <button class="sign-button" (click)="sign()" [disabled]="!documentContent || isSigning">
        {{ isSigning ? 'Создание подписи...' : 'Создать электронную подпись' }}
      </button>

      <div *ngIf="signatureResult" class="result-section">
        <div class="success-message">
          <h2>Документ успешно подписан!</h2>
          <p>Для проверки подписи передайте следующие файлы:</p>
          <ul>
            <li>Исходный документ: {{ documentName }}</li>
            <li>Файл подписи: signature.sig</li>
            <li>Открытый ключ: public_key.pub</li>
          </ul>
        </div>

        <div class="download-buttons">
          <button class="download-button" (click)="downloadSignature()">
            Скачать подпись (.sig)
          </button>
          <button class="download-button" (click)="downloadPublicKey()">
            Скачать открытый ключ (.pub)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Roboto', sans-serif;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    
    h1 {
      color: #2c3e50;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
    
    .nav-link {
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
      margin-top: 1rem;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0e0e0;
    }
    
    h2 {
      color: #34495e;
      font-size: 1.3rem;
      margin-top: 0;
      margin-bottom: 1.2rem;
    }
    
    .file-upload {
      margin-bottom: 1rem;
    }
    
    .upload-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    
    .file-input {
      display: none;
    }
    
    .upload-button {
      background: #3498db;
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    .upload-button:hover {
      background: #2980b9;
    }
    
    .file-name {
      margin-left: 1rem;
      color: #7f8c8d;
    }
    
    .sign-button {
      width: 100%;
      background: #3498db;
      color: white;
      border: none;
      padding: 1rem;
      font-size: 1.1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
      margin-top: 1rem;
    }
    
    .sign-button:hover {
      background: #2980b9;
    }
    
    .sign-button:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }
    
    .result-section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0e0e0;
    }
    
    .success-message {
      margin-bottom: 1.5rem;
    }
    
    .success-message h2 {
      color: #27ae60;
      font-size: 1.5rem;
      margin-top: 0;
    }
    
    .download-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .download-button {
      background: #f8f9fa;
      color: #2c3e50;
      border: 1px solid #e0e0e0;
      padding: 0.8rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      flex: 1;
      min-width: 200px;
    }
    
    .download-button:hover {
      background: #e9ecef;
      border-color: #d0d5d9;
    }
  `]
})
export class SignComponent {
  documentContent: string = '';
  documentName: string = '';
  isSigning: boolean = false;
  signatureResult: boolean = false;
  signature: string = '';
  publicKey: string = '';

  constructor(private http: HttpClient) {}

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.documentName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.documentContent = reader.result as string;
      };
      reader.readAsText(file);
    }
  }

  sign(): void {
    if (!this.documentContent) return;

    this.isSigning = true;
    this.signatureResult = false;

    const payload = {
      document: this.documentContent
    };

    this.http.post<{ signature: string; publicKey: string }>('http://85.235.205.223:8080/api/sign', payload).subscribe({
      next: (response) => {
        this.signature = response.signature;
        this.publicKey = response.publicKey;
        this.signatureResult = true;
      },
      error: (error) => {
        console.error('Ошибка при создании подписи:', error);
        alert('Произошла ошибка при создании подписи');
      },
      complete: () => {
        this.isSigning = false;
      }
    });
  }

  downloadSignature(): void {
    const blob = new Blob([this.signature], { type: 'application/octet-stream' });
    saveAs(blob, 'signature.sig');
  }

  downloadPublicKey(): void {
    const blob = new Blob([this.publicKey], { type: 'application/octet-stream' });
    saveAs(blob, 'public_key.pub');
  }
}
