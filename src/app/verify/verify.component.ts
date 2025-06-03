import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-verify',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <h1>Проверка электронной подписи</h1>
        <p class="subtitle">Проверьте подлинность документа по ГОСТ Р 34.10-2012</p>
        <a routerLink="/sign" class="nav-link">→ Перейти к созданию подписи</a>
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

      <div class="card">
        <h2>2. Загрузите подпись</h2>
        <div class="file-upload">
          <label class="upload-label">
            <input type="file" (change)="onSignatureSelected($event)" class="file-input" accept=".sig">
            <span class="upload-button">Выбрать файл</span>
            <span class="file-name">{{ signatureName || 'Файл не выбран' }}</span>
          </label>
        </div>
      </div>

      <div class="card">
        <h2>3. Укажите открытый ключ</h2>
        <div class="key-input">
          <textarea [(ngModel)]="publicKey" placeholder="Вставьте открытый ключ в формате BASE64"></textarea>
          <div class="or-divider">ИЛИ</div>
          <label class="upload-label">
            <input type="file" (change)="onPublicKeySelected($event)" class="file-input" accept=".pub,.key">
            <span class="upload-button">Загрузить из файла</span>
          </label>
        </div>
      </div>

      <button class="verify-button" (click)="verify()" [disabled]="!canVerify()">
        {{ isVerifying ? 'Проверка...' : 'Проверить подлинность' }}
      </button>

      <div *ngIf="verificationResult !== null" class="result-card">
        <div class="result-icon" [class.valid]="verificationResult" [class.invalid]="!verificationResult">
          {{ verificationResult ? '✓' : '✗' }}
        </div>
        <div class="result-content">
          <h3>{{ verificationResult ? 'Подпись действительна' : 'Подпись недействительна' }}</h3>
          <p *ngIf="verificationResult">Документ не был изменен после подписания</p>
          <div *ngIf="!verificationResult" class="error-details">
            <p>Возможные причины:</p>
            <ul>
              <li>Документ был изменен после подписания</li>
              <li>Неверная подпись или ключ</li>
              <li>Поврежденные данные</li>
            </ul>
          </div>
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
    
    .key-input textarea {
      width: 100%;
      min-height: 120px;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      resize: vertical;
      margin-bottom: 1rem;
    }
    
    .or-divider {
      text-align: center;
      color: #7f8c8d;
      margin: 1rem 0;
      position: relative;
    }
    
    .or-divider:before,
    .or-divider:after {
      content: "";
      flex: 1;
      border-bottom: 1px solid #e0e0e0;
      margin: auto;
    }
    
    .or-divider:before {
      margin-right: 1rem;
    }
    
    .or-divider:after {
      margin-left: 1rem;
    }
    
    .verify-button {
      width: 100%;
      background: #27ae60;
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
    
    .verify-button:hover {
      background: #219653;
    }
    
    .verify-button:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }
    
    .result-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
    }
    
    .result-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-right: 1.5rem;
      flex-shrink: 0;
    }
    
    .result-icon.valid {
      background: #e3f9e5;
      color: #27ae60;
    }
    
    .result-icon.invalid {
      background: #fdecea;
      color: #e74c3c;
    }
    
    .result-content {
      flex: 1;
    }
    
    .result-content h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.3rem;
    }
    
    .error-details {
      margin-top: 1rem;
      color: #7f8c8d;
    }
    
    .error-details ul {
      padding-left: 1.2rem;
      margin-top: 0.5rem;
    }
  `]
})
export class VerifyComponent {
  documentContent: string = '';
  documentName: string = '';
  signatureContent: string = '';
  signatureName: string = '';
  publicKey: string = '';
  isVerifying: boolean = false;
  verificationResult: boolean | null = null;

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

  onSignatureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.signatureName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.signatureContent = reader.result as string;
      };
      reader.readAsText(file);
    }
  }

  onPublicKeySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.publicKey = reader.result as string;
      };
      reader.readAsText(file);
    }
  }

  canVerify(): boolean {
    return !!this.documentContent && !!this.signatureContent && !!this.publicKey && !this.isVerifying;
  }

 verify(): void {
    if (!this.canVerify()) return;

    this.isVerifying = true;
    this.verificationResult = null;

    const payload = {
      document: this.documentContent,
      signature: this.signatureContent,
      publicKey: this.publicKey
    };

    // Использование environment.apiUrl
    this.http.post<{ isValid: boolean }>(`${environment.apiUrl}/verify`, payload).subscribe({
      next: (response) => {
        this.verificationResult = response.isValid;
      },
      error: (error) => {
        console.error('Ошибка при проверке подписи:', error);
        this.verificationResult = false;
      },
      complete: () => {
        this.isVerifying = false;
      }
    });
  }
}