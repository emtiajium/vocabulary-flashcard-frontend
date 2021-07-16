<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <ion-content>
            <div class="profile ion-padding-bottom">
                <img :src="profilePictureUrl" alt="Avatar" class="rounded-circle ion-padding" width="100" />
                <div class="ion-padding-start">
                    <strong class="item-text ion-text-capitalize"> {{ name }} </strong>
                    <br />
                    <span class="ion-padding-top item-text"> {{ username }} </span>
                </div>
            </div>
            <ion-list>
                <ion-item button @click="navigate('/vocabularies')">
                    <font-awesome-icon :icon="faBook" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Vocabularies </ion-label>
                </ion-item>
                <ion-item button @click="navigate('/cohort/read')">
                    <font-awesome-icon :icon="faUsers" class="menu-icon" />
                    <ion-label class="ion-padding-start"> My Cohort </ion-label>
                </ion-item>
                <ion-item button @click="signOut">
                    <font-awesome-icon :icon="faSignOutAlt" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Sign Out </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonItem, IonList, IonMenu, menuController, IonLabel } from '@ionic/vue';
import NativeStorage from '@/utils/NativeStorage';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faUsers, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        IonContent,
        IonItem,
        IonList,
        IonMenu,
        IonLabel,
        FontAwesomeIcon,
    },
    props: ['contentId', 'menuId'],
    data() {
        return {
            profilePictureUrl: '',
            username: '',
            name: '',
            faBook,
            faUsers,
            faSignOutAlt,
        };
    },
    async mounted() {
        const user = await NativeStorage.getAuthorizedUser();
        this.profilePictureUrl =
            user.profilePictureUrl || `https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y`;
        this.username = user.username as string;
        this.name = user.name as string;
    },
    methods: {
        async openMenu(): Promise<void> {
            await menuController.enable(true, this.menuId);
            await menuController.open(this.menuId);
        },
        async closeMenu(): Promise<void> {
            if (await menuController.isOpen()) {
                await menuController.close(this.menuId);
            }
        },
        async navigate(url: string): Promise<void> {
            await this.closeMenu();
            await this.$router.push(url);
        },
        async signOut(): Promise<void> {
            await NativeStorage.removeAuthorizedUser();
            await menuController.close();
            await this.$router.push('/sign-in');
        },
    },
});
</script>

<style scoped>
.profile {
    background-color: var(--ion-color-primary);
}
.item-text {
    color: #ffffff;
}
.menu-icon {
    color: var(--ion-color-primary);
}
</style>
