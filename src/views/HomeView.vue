<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import ExampleApi from '@/api/example';
import FileApi from '@/api/file';
import { fakeDownload } from '@/utils';
import type { IAxiosResponse } from '@/utils/httpRequest';

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

const test_axios = () => {
  console.log('start test_axios');
  const param = {
    content: 'abceeee',
  };
  ExampleApi.exampleRequest(param)
    .then((res) => {
      console.log('example res', res);
    })
    .catch((err: IAxiosResponse) => {
      console.log('example err', err);
    });
};

const download_file = () => {
  // let cid = 'QmcvNpUouVvFFX8GL3xbZMqLZFZnz9yiZVDprnL4EiGXzg';
  // let filename = 'lm1.jpeg';
  let cid = 'QmZigK4HbeA8gLm3vNyA5pEqJeHhyWLX2BGzeS7tttodTXa';
  let filename = 'koishi.jpg';
  // let cid = 'QmcT1st8Jb42q23VZhq9rDKvQp3SNnWCyZBU5xdGeCDQP9';
  // let filename = 'cap.mp4';

  console.log('Download started.');
  ElMessage.info('Download started.');
  // First, axios download file to memory;
  // Then, save file to local disk by fake link.
  FileApi.download(cid, { filename })
    .then((res) => {
      console.log('Test res: ', res);
      console.log('Finish download to memory.', res.data.length);
      fakeDownload(filename, [res.data]);
      console.log('Download success.', res.data.length, res);
      ElMessage.success('Download success.');
    })
    .catch((err: IAxiosResponse) => {
      //TODO: err Type
      console.warn('Download failed, or caught by IDM', err.status, err.data);
      ElMessage.warning('Download failed, or caught by IDM');
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
  <br />
  <el-button type="warning" size="default" @click="test_axios"
    >Test axios</el-button
  >
  <div class="image-example"><WrappedImage></WrappedImage></div>
  <el-button type="primary" size="large" @click="download_file"
    >Download File</el-button
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
