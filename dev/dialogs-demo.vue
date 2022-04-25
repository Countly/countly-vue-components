<script>
import Vue from 'vue';
import {useGlobalDialogsStore} from '@/entry.esm';

export default {
  computed: {
    confirmDialogs() {
        return useGlobalDialogsStore().confirmDialogs;
    },
  }
};
</script>
<template>
  <div>
    {{confirmDialogs}}
  </div>
</template>