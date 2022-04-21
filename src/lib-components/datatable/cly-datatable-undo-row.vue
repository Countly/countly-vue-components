<script>
export default {
    props: {
        delayedAction: {
            type: Object
        }
    }
};
</script>
<template>
    <div @click.stop v-if="delayedAction" class="undo-row">
        <slot></slot>
        <a @click.stop="delayedAction.abort()">Undo.</a>
    </div>
</template>