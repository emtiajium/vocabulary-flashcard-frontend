<template>
    <ion-page>
        <firecracker-header header-title="Goodbye" content-id="deletion" menu-id="deletion-menu" />
        <ion-content :fullscreen="true" id="deletion">
            <div class="visually-hidden" role="status" aria-atomic="true">{{ loadingStatus }}</div>
            <ion-row class="display-flex ion-justify-content-center" :aria-busy="!isReady">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                    <div v-if="isReady && isNetworkError">
                        <network-error />
                        <ion-row class="ion-justify-content-center">
                            <ion-button @click="init">Retry</ion-button>
                        </ion-row>
                    </div>
                    <view v-else-if="isReady">
                        <ion-card-subtitle>
                            <ion-row class="ion-justify-content-center ion-padding">
                                <ion-text class="ion-text-center"> We are sorry to say goodbye, honestly. </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding">
                                <ion-text class="ion-text-center link-container">
                                    We hope you enjoyed
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.emtiajium.firecracker.collaborative.vocab.practice"
                                        target="_blank"
                                        >Vocabulary Flashcards</a
                                    >
                                    and would love to have you back someday.
                                </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding" v-if="!isAuthenticated">
                                <ion-text class="ion-text-center">
                                    Before we delete your account, we must ensure you are not a bot behind the screen.
                                    Can you please sign in for the last time?
                                </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding" v-if="!isAuthenticated">
                                <ion-button @click="signIn"> Sign In </ion-button>
                            </ion-row>

                            <ion-row
                                class="ion-justify-content-center ion-padding"
                                v-if="isAuthenticated && !isTheUserAlone()"
                            >
                                <ion-text class="ion-text-center">
                                    You belong to the "{{ cohort.name }}" cohort. Therefore, we will not delete any
                                    vocabularies as these are necessary to serve other members. However, you will be
                                    removed from the cohort.
                                </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding" v-if="isAuthenticated">
                                <ion-text class="ion-text-center">
                                    By clicking the below button, we will initiate the deletion of all vocabularies,
                                    your flashcards, and the account detail. After the successful deletion, you will be
                                    navigated to the home page.
                                </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding" v-if="isAuthenticated">
                                <ion-button @click="assertDeletion"> Delete Myself </ion-button>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding">
                                <ion-text class="ion-text-center email-container">
                                    If you want us to keep the account but remove all or partial data, do not hesitate
                                    to contact the app admin via
                                    <a href="mailto:271emtiaj@gmail.com?subject=Data Deletion Request!">email</a> with
                                    your specific deletion request.
                                </ion-text>
                            </ion-row>
                        </ion-card-subtitle>
                    </view>
                    <div v-else aria-hidden="true">
                        <ion-row
                            v-for="(lines, index) in [1, 2, 3]"
                            :key="index"
                            class="ion-justify-content-center ion-padding deletion-skeleton-row"
                        >
                            <skeleton-text
                                v-for="line in lines"
                                :key="line"
                                :width="line === lines ? '75%' : '100%'"
                                height="var(--text-sm)"
                            />
                        </ion-row>
                        <ion-row class="ion-justify-content-center ion-padding">
                            <skeleton-text width="125px" height="36px" border-radius="var(--radius-md)" />
                        </ion-row>
                        <ion-row class="ion-justify-content-center ion-padding deletion-skeleton-row">
                            <skeleton-text v-for="line in 3" :key="line" :width="line === 3 ? '60%' : '95%'" />
                        </ion-row>
                    </div>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle, IonCol, IonContent, IonPage, IonRow, IonText, IonButton } from '@ionic/vue';
import NetworkError from '@/views/shared/NetworkError.vue';
import SkeletonText from '@/views/shared/SkeletonText.vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import Cohort from '@/domains/Cohort';
import HttpHandler from '@/utils/HttpHandler';
import MessageDB from '@/utils/MessageDB';
import NativeStorage from '@/utils/NativeStorage';
import Alert from '@/utils/Alert';
import { FirecrackerError } from '@/domains/FirecrackerError';

export default defineComponent({
    name: 'Deletion',
    components: {
        SkeletonText,
        NetworkError,
        IonText,
        IonCardSubtitle,
        IonCol,
        IonRow,
        IonContent,
        FirecrackerHeader,
        IonPage,
        IonButton,
    },
    data() {
        return {
            isReady: false,
            isAuthenticated: false,
            isNetworkError: false,
            cohort: {} as Cohort,
        };
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
    },
    computed: {
        loadingStatus(): string {
            if (!this.isReady) {
                return 'Loading account deletion information';
            }
            if (this.isNetworkError) {
                return 'Unable to load account deletion information';
            }
            return 'Account deletion information ready';
        },
    },
    methods: {
        async init(): Promise<void> {
            this.isReady = false;
            this.isNetworkError = false;
            this.isAuthenticated = false;
            try {
                this.cohort = (await HttpHandler.get<Cohort>(`/v1/cohorts/self`)) as Cohort;
                this.isAuthenticated = true;
            } catch (error) {
                if (
                    (error as FirecrackerError).message === MessageDB.forbiddenError ||
                    (error as Error & { status?: number }).status === 401
                ) {
                    this.isAuthenticated = false;
                } else {
                    this.isNetworkError = true;
                }
            } finally {
                this.isReady = true;
            }
        },
        isTheUserAlone(): boolean {
            return this.cohort?.users?.length === 1;
        },
        async signIn(): Promise<void> {
            await NativeStorage.setGoodBye();
            await this.$router.replace('/sign-in');
        },
        async assertDeletion(): Promise<void> {
            await Alert.presentConfirm({
                message: `You are about to delete your account. All associated data will have been lost permanently. There is no undo. Are you sure you want to proceed?`,
                destructive: true,
                onConfirm: async () => {
                    return this.deleteSelf();
                },
            });
        },
        async deleteSelf(): Promise<void> {
            try {
                await HttpHandler.delete(`/v1/users/self`);
                await NativeStorage.removeGoodBye();
                await NativeStorage.setIsAuthenticated(false);
                await this.$router.replace('/sign-in');
            } catch (error) {
                if ((error as FirecrackerError).message === MessageDB.forbiddenError) {
                    this.clean();
                    await this.$router.replace('/goodbye');
                }
            }
        },
        clean(): void {
            this.isReady = false;
            this.isAuthenticated = false;
            this.isNetworkError = false;
            this.cohort = {} as Cohort;
        },
    },
});
</script>

<style scoped>
.deletion-skeleton-row {
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
}
</style>
