<template>
    <SignIn />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SignIn from '@/views/SignIn.vue';

export default defineComponent({
    name: 'Home',
    components: {
        SignIn,
    },
});
</script>
