import httpRequest from '.';
import type { StandardResponse } from '@/utils/httpRequest';

export default class PinApi {
  static listPinsInOneNodeActually(nodeId: string) {
    return httpRequest.request<
      StandardResponse<{
        node_id: string;
        pins_cid: string[];
      }>
    >({
      url: '/api/admin/pin/ls_pins_of_node_actually',
      method: 'GET',
      params: {
        nodeId,
      },
    });
  }

  static listPinsInOneNode(nodeId: string) {
    return httpRequest.request<
      StandardResponse<{
        node_id: string;
        pins: Pin[];
      }>
    >({
      url: '/api/admin/pin/ls_pins_of_node',
      method: 'GET',
      params: {
        nodeId,
      },
    });
  }

  static listNodesWithPin(pinId: string) {
    return httpRequest.request<
      StandardResponse<{
        pinId: string;
        nodes: Node[];
      }>
    >({
      url: '/api/admin/pin/ls_nodes_of_pin',
      method: 'GET',
      params: {
        pinId,
      },
    });
  }
}
