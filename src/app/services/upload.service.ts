import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import axios from "axios";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UploadService {
  /**
   * Constructor
   */
  constructor() {}

  putUrl(file: File): Promise<any> {
    const generatePutUrl = `${environment.url}/media/s3/generatePutUrl`;
    const options = {
      params: {
        Key: file.name,
        ContentType: file.type,
      },
      headers: {
        "Content-Type": "multipart/form-data;",
      },
    };
    return axios.get(generatePutUrl, options);
  }

  upLoad(putURL: string, file: File): Promise<any> {
    return axios.put(putURL, file);
  }
}
