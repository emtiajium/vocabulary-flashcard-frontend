<template>
    <ion-header :translucent="true">
        <ion-toolbar>
            <ion-title>{{ headerTitle }}</ion-title>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonHeader, IonTitle, IonToolbar } from '@ionic/vue';

export default defineComponent({
    name: 'FirecrackerHeader',
    components: {
        IonHeader,
        IonTitle,
        IonToolbar,
    },
    props: ['headerTitle'],
});
</script>

<style scoped></style>
