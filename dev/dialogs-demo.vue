<script>
import Vue from 'vue';
import {useGlobalDialogsStore} from '@/entry.esm';


export default {
  computed: {
    confirmDialogs() {
        return useGlobalDialogsStore().confirmDialogs;
    },
  },

  methods: {
    increment() {
      useGlobalDialogsStore().increment();
    },
  },
};
</script>
<template>
  <div>
    sadfas
    {{confirmDialogs}}
  </div>
</template>