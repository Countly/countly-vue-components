<script>
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { ClyComponentsSample } from '@/entry.esm';
import 'element-ui/lib/theme-chalk/index.css';
import '../src/styles/main.scss';
import ListDemo from './list-demo';
import DateDemo from './date-demo';
import TableDemo from './table-demo';
import DialogsDemo from './dialogs-demo';

export default Vue.extend({
    name: 'ServeDev',
    components: {
        ListDemo,
        DateDemo,
        TableDemo,
        DialogsDemo
    }
});
</script>

<style>
.example-cell{
    padding: 20px;
    width: 25%;
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
}

.example-cell section {
    margin-bottom: 20px;
}
.example-cell > span {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
}
</style>

<template>
  <div id="app">
    <div>
      <cly-tabs>
        <el-tab-pane label="Lists">
          <ListDemo />
        </el-tab-pane>
        <el-tab-pane label="Datepickers">
          <DateDemo />
          </el-tab-pane>
        <el-tab-pane label="Tables">
          <TableDemo />
        </el-tab-pane>
        <el-tab-pane label="Dialogs">
          <DialogsDemo />
        </el-tab-pane>
      </cly-tabs>
    </div>
  </div>
</template>
