<template>
    <ion-page>
        <firecracker-header header-title="Goodbye!" content-id="deletion" menu-id="deletion-menu" />
        <ion-content :fullscreen="true" id="deletion">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                    <view v-if="isReady">
                        <ion-card-subtitle>
                            <ion-row class="ion-justify-content-center ion-padding">
                                <ion-text class="ion-text-center"> We are sorry to say goodbye, honestly. </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding">
                                <ion-text class="ion-text-center">
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
                                    You belong to the "{{ cohort.name }}" cohort. We will not delete any vocabularies as
                                    these are necessary to serve other members.
                                </ion-text>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding" v-if="isAuthenticated">
                                <ion-button @click="assertDeletion"> Delete Myself </ion-button>
                            </ion-row>

                            <ion-row class="ion-justify-content-center ion-padding">
                                <ion-text class="ion-text-center">
                                    If you want us to keep the account but keep all or partial data, do not hesitate to
                                    contact the app admin via
                                    <a href="mailto:271emtiaj@gmail.com?subject=Data Deletion Request!">email</a> with
                                    your specific deletion request.
                                </ion-text>
                            </ion-row>
                        </ion-card-subtitle>
                    </view>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonCardSubtitle, IonCol, IonContent, IonPage, IonRow, IonText, IonButton } from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import Cohort from '@/domains/Cohort';
import HttpHandler from '@/utils/HttpHandler';
import MessageDB from '@/utils/MessageDB';
import NativeStorage from '@/utils/NativeStorage';
import Alert from '@/utils/Alert';

export default defineComponent({
    name: 'Deletion',
    components: {
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
            isAuthenticated: true,
            cohort: {} as Cohort,
        };
    },
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
    },
    methods: {
        async init(): Promise<void> {
            try {
                this.cohort = (await HttpHandler.get<Cohort>(`/v1/cohorts/self`)) as Cohort;
                this.isAuthenticated = true;
            } catch (error) {
                if (error.message === MessageDB.forbiddenError) {
                    this.isAuthenticated = false;
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
            await Alert.presentAlertConfirm(
                '',
                `You are about to delete your account. All associated data will have lost permanently. There is no undo. Are you confident to proceed?`,
                async () => {
                    return this.deleteSelf();
                },
            );
        },
        async deleteSelf(): Promise<void> {
            try {
                await HttpHandler.delete(`/v1/users/self`);
                await NativeStorage.removeGoodBye();
                await NativeStorage.removeAuthorizedUser();
                await NativeStorage.removeJwToken();
                await this.$router.replace('/sign-in');
            } catch (error) {
                if (error.message === MessageDB.forbiddenError) {
                    this.clean();
                    await this.$router.replace('/goodbye');
                }
            }
        },
        clean(): void {
            this.isReady = false;
            this.isAuthenticated = true;
            this.cohort = {} as Cohort;
        },
    },
});
</script>

<style scoped></style>
