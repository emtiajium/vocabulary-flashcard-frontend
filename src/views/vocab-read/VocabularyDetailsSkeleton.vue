<template>
    <ion-row class="display-flex ion-justify-content-center" aria-hidden="true">
        <ion-col sizeXs="12" sizeSm="12" sizeMd="10" sizeLg="8" sizeXl="8">
            <ion-card v-for="index in 2" :key="index">
                <ion-card-header>
                    <skeleton-text width="65%" height="var(--text-xl)" />
                </ion-card-header>

                <ion-card-content class="definition-content">
                    <skeleton-text width="95%" />
                    <skeleton-text width="85%" />
                    <skeleton-text width="60%" />

                    <div class="examples">
                        <skeleton-text width="35%" height="var(--text-md)" />
                        <skeleton-text width="90%" />
                        <skeleton-text width="70%" />
                    </div>
                </ion-card-content>
            </ion-card>
        </ion-col>
    </ion-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonRow, IonCol, IonCard, IonCardHeader, IonCardContent } from '@ionic/vue';
import SkeletonText from '@/views/shared/SkeletonText.vue';

export default defineComponent({
    name: 'VocabularyDetailsSkeleton',
    components: {
        IonRow,
        IonCol,
        IonCard,
        IonCardHeader,
        IonCardContent,
        SkeletonText,
    },
});
</script>

<style scoped>
ion-card:first-of-type {
    margin-top: unset;
}

.definition-content,
.examples {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.examples {
    margin-top: var(--space-md);
}
</style>
