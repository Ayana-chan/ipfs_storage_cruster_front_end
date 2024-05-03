import type { StandardResponse } from '@/utils/httpRequest';
import httpRequest from '.';

export default class FileApi {
  static downloadFileAdvice(cid: string) {
    return httpRequest.request<
      StandardResponse<{
        url: string;
      }>
    >({
      url: '/api/file/advice',
      method: 'GET',
      params: {
        cid,
      },
    });
  }
}
