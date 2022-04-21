<script>
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { ClyComponentsSample } from '@/entry.esm';
import 'element-ui/lib/theme-chalk/index.css';
import '../src/styles/main.scss';
import ListDemo from './list-demo';
import DateDemo from './date-demo';
import TableDemo from './table-demo';

export default Vue.extend({
    name: 'ServeDev',
    components: {
        ListDemo,
        DateDemo,
        TableDemo
    }
});
</script>

<template>
  <div id="app">
    <div>
        <ListDemo />
        <DateDemo />
        <TableDemo />
    </div>
  </div>
</template>
