<template>
    <div v-for="(item, index) in placeholderItems" :key="item" class="container">
        <div class="contents">
            <ion-item lines="none" :class="itemClass">
                <ion-textarea
                    autoGrow="true"
                    inputmode="text"
                    autocapitalize="sentences"
                    placeholder="Type something"
                    :value="items[index] || ''"
                    @ionChange="insertItem($event.target.value, index)"
                />
            </ion-item>
        </div>
        <div class="action-buttons">
            <ion-button
                v-show="items.length > 0 && index === placeholderItems.length - 1 && items[index]?.length > 0"
                aria-label="Add one more"
                color="success"
                size="small"
                shape="round"
                fill="clear"
                :strong="true"
                @click="onAddMoreItem"
            >
                <span class="material-icons"> plus_one </span>
            </ion-button>
            <ion-button
                v-show="items.length > 0 && items[index]?.length > 0"
                aria-label="Remove"
                color="warning"
                size="small"
                shape="round"
                fill="clear"
                :strong="true"
                @click="onRemoveLastItem(index)"
            >
                <font-awesome-icon :icon="faMinusCircle" />
            </ion-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTextarea, IonItem, IonButton } from '@ionic/vue';
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
        FontAwesomeIcon,
    },
    props: ['existingItems', 'itemClass'],
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
.container {
    display: flex;
}
.contents {
    width: 100%;
}
.action-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding-top: 8px;
}
.action-buttons > ion-button {
    width: 28px;
    margin-left: 5px;
}
ion-item {
    --min-height: unset;
}
</style>
