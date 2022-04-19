import Vue from 'vue';

var _i18n = function(key) {
    return key;
};

var _i18nM = function(key) {
    return key;
};


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

export default {
    i18n: _i18n,
    i18nM: _i18nM,
    components: _components,
    mixins: {
        i18n: {
            methods: {
                i18n: _i18n,
                i18nM: _i18nM
            }
        }
    }
};
