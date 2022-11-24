<template>
    <view v-for="(item, index) in placeholderItems" :key="item">
        <ion-grid>
            <ion-row>
                <ion-col sizeXs="7" sizeSm="7" sizeMd="10" sizeLg="10" sizeXl="10">
                    <ion-item lines="none">
                        <ion-textarea
                            autoGrow="true"
                            inputmode="text"
                            autocapitalize="sentences"
                            placeholder="Type something"
                            :value="items[index] || ''"
                            @ionChange="insertItem($event.target.value, index)"
                        />
                    </ion-item>
                </ion-col>
                <ion-col sizeXs="5" sizeSm="5" sizeMd="2" sizeLg="2" sizeXl="2">
                    <ion-row class="action-buttons">
                        <ion-item lines="none">
                            <ion-button
                                v-show="
                                    items.length > 0 &&
                                    index === placeholderItems.length - 1 &&
                                    items[index]?.length > 0
                                "
                                color="success"
                                @click="onAddMoreItem"
                            >
                                <span class="material-icons"> plus_one </span>
                            </ion-button>
                            <ion-button
                                v-show="items.length > 0 && items[index]?.length > 0"
                                color="danger"
                                @click="onRemoveLastItem(index)"
                            >
                                <font-awesome-icon :icon="faMinusCircle" />
                            </ion-button>
                        </ion-item>
                    </ion-row>
                </ion-col>
            </ion-row>
        </ion-grid>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTextarea, IonItem, IonButton, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { v4 as uuidV4 } from 'uuid';
import * as _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'AddRemoveMultipleItems',
    components: {
        IonTextarea,
        IonItem,
        IonButton,
        IonGrid,
        IonRow,
        IonCol,
        FontAwesomeIcon,
    },
    props: ['existingItems'],
    data() {
        const isEmpty = _.isEmpty(this.existingItems);
        const placeholderItems = _.fill(_.times(isEmpty ? 1 : this.existingItems.length), uuidV4());
        return {
            faMinusCircle,
            placeholderItems,
            items: (!isEmpty ? this.existingItems : []) as string[],
        };
    },
    methods: {
        insertItem(item: string, index: number): void {
            if (!item) {
                this.removeItem(index);
            } else {
                this.items[index] = item.trim();
            }
        },
        onAddMoreItem(): void {
            this.placeholderItems.push(uuidV4());
        },
        removeItem(removableIndex: number): void {
            this.items = this.items.filter((word, index) => index !== removableIndex);
        },
        onRemoveLastItem(removableIndex: number): void {
            if (removableIndex !== 0) {
                this.placeholderItems.pop();
            }
            this.removeItem(removableIndex);
        },
        getItems(): string[] {
            return this.items.filter((item) => item.length > 0);
        },
        clear(): void {
            this.items = [];
            this.placeholderItems = [uuidV4()];
        },
    },
});
</script>

<style scoped>
.action-buttons {
    display: flex;
    justify-content: flex-end;
}
</style>
