import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import axios from "axios";
import { MediaKey } from "app/modules/admin/apps/media/media.types";
@Injectable({
  providedIn: "root",
})
export class FileService {
  /**
   * Constructor
   */
  constructor() {}

  putUrl(mediaKey: MediaKey): Promise<any> {
    const generatePutUrl = `${environment.url}/media/s3/generatePutUrl`;
    const options = {
      params: {
        Key: mediaKey.key,
        ContentType: mediaKey.type,
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

  download(key: string): Promise<any> {
    const generateGetUrl = `${environment.url}/media/s3/generateGetUrl`;
    const options = {
      params: {
        Key: key,
        ContentType: "image/jpeg",
      },
    };
    return axios.get(generateGetUrl, options);
  }
}
