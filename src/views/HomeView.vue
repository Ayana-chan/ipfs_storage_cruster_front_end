<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import { fakeDownload } from '@/utils';
import type { AxiosError } from 'axios';
import NodePublicApi from '@/api/nodePublic';
import NodeAdminApi from '@/api/nodeAdmin';

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
  let cid = 'QmamM9uqiR2kqqeRF9UFJ1YXsDRxkebTBqci5Hg55Nr7jP';

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
  let cid = 'QmamM9uqiR2kqqeRF9UFJ1YXsDRxkebTBqci5Hg55Nr7jP';

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
