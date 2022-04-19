<script>
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { ClyComponentsSample } from '@/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  // components: {
  //  ClyComponentsSample,
  // }
  data: function() {
    return {
      selectedDate: ''
    }
  }
});
</script>

<template>
  <div id="app">
    <cly-date-picker v-model="selectedDate" timestampFormat="ms" type="date"></cly-date-picker>
    <el-button>Hello</el-button>
  </div>
</template>
