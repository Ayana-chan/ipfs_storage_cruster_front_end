<script setup lang="ts">
import { fakeDownload } from '@/utils';
import type { AxiosError } from 'axios';
import NodePublicApi from '@/api/nodePublic';
import axios from 'axios';

const download_file = () => {
  // let cid = 'QmTYLjg9feXGKm5zpkZ9eqraEN9LnUmgipWSoeXguFdwWb';
  // let filename = 'pa4.txt';
  // let cid = 'QmamM9uqiR2kqqeRF9UFJ1YXsDRxkebTBqci5Hg55Nr7jP';
  // let filename = 'abc.txt';
  // let cid = 'QmcvNpUouVvFFX8GL3xbZMqLZFZnz9yiZVDprnL4EiGXzg';
  // let filename = 'lm1.jpeg';
  let cid = 'QmZigK4HbeA8gLm3vNyA5pEqJeHhyWLX2BGzeS7tttodTX';
  let filename = 'koishi.jpg';
  // let cid = 'QmWeoysRLxatACwJQNmZLbBefTrFfdJoYcCQb3FoAZ2kt4';
  // let filename = 'mfb.png';
  // let cid = 'QmcT1st8Jb42q23VZhq9rDKvQp3SNnWCyZBU5xdGeCDQP9';
  // let filename = 'cap.mp4';

  // First, axios download file to memory;
  // Then, save file to local disk by fake link.
  console.log('Download request');
  NodePublicApi.download('127.0.0.1:3000', cid, { filename })
    .then((res) => {
      console.log('Finish download to memory.', res);
      fakeDownload(filename, [res.data]);
      console.log('Download success');
      ElMessage.success('Download success');
    })
    .catch((err: AxiosError) => {
      console.warn('Download failed, or caught by browser plugin', err);
      ElMessageBox.alert(
        'Download failed, or caught by browser plugin',
        'Warning'
      );
      // ElMessage.warning('Download failed, or caught by browser plugin');
    });
};

const response = ref<string | null>(null);

const uploadFile = async (event: Event) => {
  const files = (event?.target as HTMLInputElement)?.files;
  if (!files) return;
  const file = files[0];

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post('http://localhost:5000/api/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    response.value = JSON.stringify(res.data, null, 2);
  } catch (error) {
    console.error('Upload failed:', error);
    response.value = 'Upload failed';
  }
};

const ipfsNodeData = ref<IpfsNode[]>([
  {
    peerId: 'node1',
    rpcAddress: 'http://127.100.100.100:5001',
    wrapperPublicAddress: 'http://127.100.100.100:3000',
    wrapperAdminAddress: 'http://127.100.100.100:4000',
    status: 'Online',
  },
]);

const statusStyle = (status: NodeStatus): any => {
  switch (status) {
    case 'Online':
      return { color: 'green' };
    case 'Unhealthy':
      return { color: 'red' };
    case 'Offline':
      return { color: 'grey' };
    default:
      return { color: 'yello' };
  }
};

const downloadFile = (row: IpfsNode): void => {
  console.log('下载文件：', row);
  // 实现文件下载逻辑
};
</script>

<template>
  <div>
    <input type="file" @change="uploadFile" />
    <div v-if="response">{{ response }}</div>
  </div>

  <br />

  <el-table :data="ipfsNodeData" style="width: 100%" max-height="250">
    <el-table-column fixed prop="peerId" label="Peer Id" width="200" />
    <el-table-column prop="rpcAddress" label="RPC Address" width="250" />
    <el-table-column
      prop="wrapperPublicAddress"
      label="Wrapper Public Address"
      width="250"
    />
    <el-table-column
      prop="wrapperAdminAddress"
      label="Wrapper Admin Address"
      width="250"
    />
    <el-table-column label="Status">
      <template #default="scope">
        <span :style="statusStyle(scope.row.status)">{{
          scope.row.status
        }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Operations">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="downloadFile(row)"
          >Download</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.image-example {
  border: 0.2rem solid #a459c7;
  width: 15rem;
  height: 10rem;
  display: flex;
  flex-wrap: wrap;
}
</style>
