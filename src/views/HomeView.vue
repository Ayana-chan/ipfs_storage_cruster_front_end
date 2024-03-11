<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import { fakeDownload } from '@/utils';
import type { AxiosError } from 'axios';
import NodePublicApi from '@/api/nodePublic';
import NodeAdminApi from '@/api/nodeAdmin';
import axios from 'axios';

const counterStore = useCounterStore();
const { count } = storeToRefs(counterStore);
const increment = counterStore.increment;

const test_env = () => {
  console.log(
    'import.meta.env.VITE_API_DOMAIN',
    import.meta.env.VITE_API_DOMAIN
  );
  console.debug('import.meta.env.BASE_URL', import.meta.env.BASE_URL);
};

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
  NodePublicApi.download(cid, { filename })
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

const check_pin = () => {
  // let cid = 'QmWeoysRLxatACwJQNmZLbBefTrFfdJoYcCQb3FoAZ2kt4';
  // let cid = 'QmamM9uqiR2kqqeRF9UFJ1YXsDRxkebTBqci5Hg55Nr7jP';
  let cid = 'QmZigK4HbeA8gLm3vNyA5pEqJeHhyWLX2BGzeS7tttodTX';

  NodeAdminApi.check_pin(cid)
    .then((res) => {
      console.log('Check pin result', res.data.data.status);
      ElMessage.success('Check pin result: ' + res.data.data.status);
    })
    .catch((err) => {
      console.error('Check Pin fail', err);
      ElMessage.error('Check Pin fail');
    });
};

const add_pin = () => {
  // let cid = 'QmWeoysRLxatACwJQNmZLbBefTrFfdJoYcCQb3FoAZ2kt4';
  // let cid = 'QmamM9uqiR2kqqeRF9UFJ1YXsDRxkebTBqci5Hg55Nr7jP';
  let cid = 'QmZigK4HbeA8gLm3vNyA5pEqJeHhyWLX2BGzeS7tttodTX';

  NodeAdminApi.add_pin({ cid })
    .then((res) => {
      console.log('Add pin sent', res);
      ElMessage.success('Add pin sent');
    })
    .catch((err) => {
      console.error('Add Pin fail', err);
      ElMessage.error('Add Pin fail');
    });
};

const response = ref(null);

const uploadFile = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

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

type NodeStatus = 'Online' | 'Unhealthy' | 'Offline';
interface IpfsNode {
  peerId: string;
  rpcAddress: string;
  wrapperAddress: string;
  status: NodeStatus;
}

const ipfsNodeData = ref<IpfsNode[]>([
  {
    peerId: 'node1',
    rpcAddress: 'http://localhost:5001',
    wrapperAddress: 'http://localhost:8080',
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
  <div>{{ count }}</div>
  <el-button type="primary" size="default" @click="increment"
    >Increment</el-button
  >
  <br />
  <el-button type="info" size="default" @click="test_env">Test env</el-button>
  <div class="image-example"><WrappedImage></WrappedImage></div>
  <el-button type="primary" size="large" @click="download_file"
    >Download File</el-button
  >
  <el-button type="primary" size="large" @click="add_pin">Add Pin</el-button>
  <el-button type="primary" size="large" @click="check_pin"
    >Check Pin</el-button
  >
  <br />
  <div>
    <input type="file" @change="uploadFile" />
    <div v-if="response">{{ response }}</div>
  </div>

  <br /><br />

  <el-table :data="ipfsNodeData" style="width: 100%" max-height="250">
    <el-table-column fixed prop="peerId" label="Peer Id" width="150" />
    <el-table-column prop="rpcAddress" label="RPC Address" width="120" />
    <el-table-column
      prop="wrapperAddress"
      label="Wrapper Address"
      width="120"
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
