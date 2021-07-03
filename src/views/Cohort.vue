<template>
    <ion-page>
        <firecracker-header header-title="My Cohort" content-id="cohort" menu-id="cohort-menu" />
        <ion-content id="cohort">
            <ion-card>
                <ion-card-content>
                    <spinner v-if="!isReady" />
                    <empty-container
                        v-if="isReady && cohort.users.length === 1"
                        message="Looks like you are the only member of your group. Please let us know if you would like create your own group."
                    />
                </ion-card-content>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/Spinner.vue';
import Cohort from '@/domains/Cohort';
import EmptyContainer from '@/views/EmptyContainer.vue';
import { IonCard, IonCardContent, IonContent, IonPage } from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import HttpHandler from '../utils/HttpHandler';
import NativeStorage from '../utils/NativeStorage';

export default defineComponent({
    name: 'Cohort',
    components: { FirecrackerHeader, EmptyContainer, Spinner, IonPage, IonContent, IonCard, IonCardContent },
    data() {
        return {
            isReady: false,
            cohort: {} as Cohort,
        };
    },
    async mounted() {
        const cohortId = await NativeStorage.getCohortId();
        this.cohort = (await HttpHandler.get<Cohort>(`/v1/cohorts/${cohortId}`)) as Cohort;
        this.isReady = true;
    },
});
</script>

<style scoped></style>
