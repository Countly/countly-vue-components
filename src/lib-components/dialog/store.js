import { defineStore } from 'pinia';

export default defineStore('globalDialogs', {
    state: () => {
        return {
            dialogs: [],
            id: 0
        };
    },
    getters: {
        messageDialogs: function(state) {
            return state.dialogs.filter(function(item) {
                return item.intent === "message";
            });
        },
        confirmDialogs: function(state) {
            return state.dialogs.filter(function(item) {
                return item.intent === "confirm";
            });
        }
    },
    actions: {
        addDialog(payload) {
            payload.id = this.id++;
            this.dialogs.unshift(payload);
        },
        removeDialog(id) {
            this.dialogs = this.dialogs.filter(function(item) {
                return item.id !== id;
            });
        }
    },
});