<template>
    <spinner />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/Spinner.vue';
import NativeStorage from '@/utils/NativeStorage';

export default defineComponent({
    name: 'Home',
    components: {
        Spinner,
    },
    async mounted() {
        const user = await NativeStorage.getAuthorizedUser();
        if (user) {
            await this.$router.push('/authenticated-home');
        } else {
            await this.$router.push('/sign-in');
        }
    },
});
</script>
