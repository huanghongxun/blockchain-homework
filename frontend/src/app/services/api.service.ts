import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {apiUrl} from '../../environments/environment';

interface HttpOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

interface HttpResponseOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {
  }

  get<T>(url: string, options?: HttpOptions): Promise<T> {
    return this.http.get<T>(apiUrl(url), options).toPromise();
  }

  post<T>(url: string, body: any | null, options?: HttpOptions): Promise<T> {
    return this.http.post<T>(apiUrl(url), body, options).toPromise();
  }

  delete<T>(url: string, options?: HttpOptions): Promise<T> {
    return this.http.delete<T>(apiUrl(url), options).toPromise();
  }

  put<T>(url: string, body: any | null, options?: HttpOptions): Promise<T> {
    return this.http.put<T>(apiUrl(url), body, options).toPromise();
  }

  head<T>(url: string, options?: HttpOptions): Promise<T> {
    return this.http.head<T>(apiUrl(url), options).toPromise();
  }

  patch<T>(url: string, body: any | null, options?: HttpOptions): Promise<T> {
    return this.http.patch<T>(apiUrl(url), body, options).toPromise();
  }

  getR<T>(url: string, options?: HttpResponseOptions): Promise<HttpResponse<T>> {
    return this.http.get<T>(apiUrl(url), Object.assign(options || {}, { observe: 'response' as 'response' })).toPromise();
  }

  postR<T>(url: string, body: any | null, options?: HttpResponseOptions): Promise<HttpResponse<T>> {
    return this.http.post<T>(apiUrl(url), body, Object.assign(options || {}, { observe: 'response' as 'response'})).toPromise();
  }

  deleteR<T>(url: string, options?: HttpResponseOptions): Promise<HttpResponse<T>> {
    return this.http.delete<T>(apiUrl(url), Object.assign(options || {}, { observe: 'response' as 'response'})).toPromise();
  }

  putR<T>(url: string, body: any | null, options?: HttpResponseOptions): Promise<HttpResponse<T>> {
    return this.http.put<T>(apiUrl(url), body, Object.assign(options || {}, { observe: 'response' as 'response'})).toPromise();
  }

  headR<T>(url: string, options?: HttpResponseOptions): Promise<HttpResponse<T>> {
    return this.http.head<T>(apiUrl(url), Object.assign(options || {}, { observe: 'response' as 'response'})).toPromise();
  }

  patchR<T>(url: string, body: any | null, options?: HttpResponseOptions): Promise<HttpResponse<T>> {
    return this.http.patch<T>(apiUrl(url), body, Object.assign(options || {}, { observe: 'response' as 'response'})).toPromise();
  }

  request<T>(req: HttpRequest<any>) {
    return this.http.request<T>(new HttpRequest(
      req.method,
      apiUrl(req.url),
      req.body,
      {
        headers: req.headers,
        params: req.params,
        responseType: req.responseType,
        reportProgress: req.reportProgress,
        withCredentials: req.withCredentials
      }
    )).toPromise();
  }
}
