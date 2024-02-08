<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import ExampleApi from '@/api/example';
import FileApi from '@/api/file';
import { fakeDownload } from '@/utils';

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
    .catch((err) => {
      console.log('example err', err);
    });
};

const download_file = () => {
  // let cid = 'QmWeoysRLxatACwJQNmZLbBefTrFfdJoYcCQb3FoAZ2kt4';
  // let filename = 'mfbbb.jpg';
  let cid = 'QmcT1st8Jb42q23VZhq9rDKvQp3SNnWCyZBU5xdGeCDQP9';
  let filename = 'cap.mp4';

  console.log('Download started.');
  ElMessage('Download started.');
  // First, axios download file to memory;
  // Then, save file to local disk by fake link.
  FileApi.download({ cid, filename })
    .then((res) => {
      console.log('Finish download to memory.', res.data.length);
      fakeDownload(filename, [res.data])
      console.log('Download success.', res.data.length, res);
      ElMessage.info('Download success.');
    })
    .catch((err) => {
      console.warn('Download failed, or caught by IDM', err);
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
