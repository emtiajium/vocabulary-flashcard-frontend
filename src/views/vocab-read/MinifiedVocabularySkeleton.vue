<template>
    <ion-card class="margin-top-bottom-unset" aria-hidden="true">
        <ion-row>
            <div class="contents">
                <ion-card-header>
                    <ion-card-title>
                        <skeleton-text width="65%" height="var(--text-xl)" />
                    </ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <div class="definitions">
                        <skeleton-text width="95%" />
                        <skeleton-text width="75%" />
                    </div>
                </ion-card-content>
            </div>

            <div class="action-buttons">
                <ion-row v-for="row in 2" :key="row">
                    <div v-for="column in 2" :key="column" class="action-button-placeholder">
                        <skeleton-text width="var(--icon-md)" height="var(--icon-md)" />
                    </div>
                </ion-row>
            </div>
        </ion-row>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonRow } from '@ionic/vue';
import SkeletonText from '@/views/shared/SkeletonText.vue';

export default defineComponent({
    name: 'MinifiedVocabularySkeleton',
    components: {
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonRow,
        SkeletonText,
    },
});
</script>

<style scoped>
.contents {
    width: calc(100% - 116px);
}

.definitions {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.action-buttons {
    width: 116px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    gap: var(--space-sm);
    padding: var(--space-sm);
}

.action-buttons ion-row {
    gap: var(--space-2xs);
}

.action-button-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
}
</style>
