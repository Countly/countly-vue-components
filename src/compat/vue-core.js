import Vue from 'vue';
import countlyCommon from './countly.common'

var _i18n = function(key) {
    return key;
};

var _i18nM = function(key) {
    return key;
};

var i18nMixin = {
    methods: {
        i18n: _i18n,
        i18nM: _i18nM
    }
}


var _uniqueComponentId = 0;

var countlyBaseComponent = Vue.extend({
    computed: {
        componentId: function() {
            return "cly-cmpl-" + _uniqueComponentId;
        }
    },
    beforeCreate: function() {
        this.ucid = _uniqueComponentId.toString();
        _uniqueComponentId += 1;
    }
});

var _components = {
    BaseComponent: countlyBaseComponent
};

var BaseContentMixin = countlyBaseComponent.extend(
    // @vue/component
    {
        inheritAttrs: false,
        mixins: [
            i18nMixin
        ],
        props: {
            name: { type: String, default: null},
            id: { type: String, default: null },
            alwaysMounted: { type: Boolean, default: true },
            alwaysActive: { type: Boolean, default: false },
            role: { type: String, default: "default" }
        },
        data: function() {
            return {
                isContent: true
            };
        },
        computed: {
            isActive: function() {
                return this.alwaysActive || (this.role === "default" && this.$parent.activeContentId === this.id);
            },
            tName: function() {
                return this.name;
            },
            tId: function() {
                return this.id;
            },
            elementId: function() {
                return this.componentId + "-" + this.id;
            }
        }
    }
);


// TODO: Replace with better logic
var _ModalManager = new Vue({
    el: "#vue-modal-manager",
    template: '<div><div :class="{\'is-active\': nClients>0}" id="vue-common-overlay"></div></div>',
    data: function() {
        return {
            clients: {}
        };
    },
    computed: {
        nClients: function() {
            return Object.keys(this.clients).length;
        }
    },
    watch: {
        nClients: function(newVal) {
            if (newVal > 0) {
                $("body").addClass("has-active-modal");
            }
            else {
                $("body").removeClass("has-active-modal");
            }
        }
    },
    methods: {
        setState: function(clientId, state) {
            if (state) {
                Vue.set(this.clients, clientId, true);
            }
            else {
                Vue.delete(this.clients, clientId);
            }
        }
    }
});

export default {
    i18n: _i18n,
    i18nM: _i18nM,
    components: _components,
    mixins: {
        commonFormatters: {
            methods: {
                parseTimeAgo: countlyCommon.formatTimeAgoText,
                formatTimeAgo: countlyCommon.formatTimeAgo,
                formatNumber: countlyCommon.formatNumber,
                formatNumberSafe: countlyCommon.formatNumberSafe,
                getShortNumber: countlyCommon.getShortNumber
            }
        },
        Modal: {
            methods: {
                setModalState: function(state) {
                    _ModalManager.setState(this.componentId, state);
                }
            },
            beforeDestroy: function() {
                _ModalManager.setState(this.componentId, false);
            }
        },
        BaseContent: BaseContentMixin,
        i18n: i18nMixin
    }
};
