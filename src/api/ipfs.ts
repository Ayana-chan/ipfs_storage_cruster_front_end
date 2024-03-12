import type { StandardResponse } from '@/utils/httpRequest';
import httpRequest from '.';

export default class IpfsApi {
  static listIpfsNodes() {
    return httpRequest.request<
      StandardResponse<{
        list: IpfsNode[];
      }>
    >({
      url: '/api/admin/ipfs',
      method: 'GET',
    });
  }

  static addIpfsNode(data: {
    rpcIp: string;
    rpcPort: string;
    wrapperPublicAddress: string;
    wrapperAdminAddress: string;
  }) {
    return httpRequest.request<StandardResponse<null>>({
      url: '/api/admin/ipfs',
      method: 'POST',
      data,
    });
  }
}
