import { HttpRequest } from '../utils/httpRequest';

const nodeAdminHttpRequest = new HttpRequest({
  baseURL: import.meta.env.VITE_API_NODE_ADMIN,
  timeout: import.meta.env.VITE_API_TIME_OUT,
  interceptors: {
    requestInterceptors(config) {
      // console.log('add token to head');
      const token = 'Bearer ' + window.localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = String(token);
      }
      return config;
    },
  },
});

export default class NodeAdminApi {
  static add_pin(data: { cid: string; filename?: string; async?: boolean }) {
    return nodeAdminHttpRequest.request<any>({
      timeout: 100000,
      url: '/api/pin',
      method: 'POST',
      data,
    });
  }
}
