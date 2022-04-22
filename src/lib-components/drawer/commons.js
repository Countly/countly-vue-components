function hasDrawersMethodsMixin() {
    return {
        methods: {
            openDrawer: function(name, initialEditedObject) {
                /**
                 * Delete the hover key as its set by the data table on hovering a row
                 * and we don't want to pass it to the drawer.
                 */
                delete initialEditedObject.hover;
                if (this.drawers[name].isOpened) {
                    return;
                }
                this.loadDrawer(name, initialEditedObject);
                this.drawers[name].isOpened = true;
            },
            loadDrawer: function(name, initialEditedObject) {
                /**
                 * Delete the hover key as its set by the data table on hovering a row
                 * and we don't want to pass it to the drawer.
                 */
                delete initialEditedObject.hover;
                this.drawers[name].initialEditedObject = initialEditedObject || {};
            },
            closeDrawer: function(name) {
                this.drawers[name].isOpened = false;
            }
        }
    };
}

function hasDrawersMixin(names) {
    if (!Array.isArray(names)) {
        names = [names];
    }

    var result = {
        data: function() {
            return {
                drawers: names.reduce(function(acc, val) {
                    acc[val] = {
                        name: val,
                        isOpened: false,
                        initialEditedObject: {},
                    };

                    acc[val].closeFn = function() {
                        acc[val].isOpened = false;
                    };

                    return acc;
                }, {})
            };
        },
    };
    Object.assign(result, hasDrawersMethodsMixin());
    return result;
}

export default {
    hasDrawersMethodsMixin,
    hasDrawersMixin
};
