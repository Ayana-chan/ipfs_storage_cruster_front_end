import { HttpRequest, type StandardResponse } from '../utils/httpRequest';

const nodeAdminHttpRequest = new HttpRequest({
  baseURL: import.meta.env.VITE_API_WRAPPER_ADMIN_ADDR,
  timeout: import.meta.env.VITE_API_TIME_OUT,
  interceptors: {
    requestInterceptors(config) {
      // console.log('add token to head');
      const token = window.localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    },
  },
});

export default class NodeAdminApi {
  static check_pin(cid: string) {
    type PinStatus = 'pinning' | 'pinned' | 'failed' | 'not_found';
    return nodeAdminHttpRequest.request<
      StandardResponse<{ status: PinStatus }>
    >({
      url: '/api/pin/' + cid,
      method: 'GET',
    });
  }

  static add_pin(data: { cid: string; filename?: string; async?: boolean }) {
    return nodeAdminHttpRequest.request<any>({
      url: '/api/pin',
      method: 'POST',
      data,
    });
  }
}
