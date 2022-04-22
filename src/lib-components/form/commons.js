import countlyVue from '../../compat/vue-core';

const BufferedObjectMixin = {
    props: {
        initialEditedObject: {
            type: Object,
            default: function() {
                return {};
            }
        },
        beforeCopyFn: {type: Function}
    },
    data: function() {
        return {
            editedObject: this.copyOfEdited()
        };
    },
    watch: {
        initialEditedObject: function() {
            this.reload();
        }
    },
    methods: {
        reload: function() {
            this.editedObject = this.copyOfEdited();
            this.reset();
            this.$emit("copy", this.editedObject);
        },
        copyOfEdited: function() {
            var copied = JSON.parse(JSON.stringify(this.initialEditedObject));
            if (this.beforeCopyFn) {
                return this.beforeCopyFn(copied);
            }
            else {
                return copied;
            }
        }
    }
};

const MultiStepFormMixin = {
    mixins: [BufferedObjectMixin],
    props: {
        requiresAsyncSubmit: {type: Boolean, default: false, required: false},
        setStepCallbackFn: {type: Function, default: null, required: false}
    },
    data: function() {
        return {
            currentStepIndex: 0,
            stepContents: [],
            isMounted: false,
            isSubmissionAllowed: true,
            isSubmitPending: false
        };
    },
    computed: {
        lastValidIndex: function() {
            if (!this.isMounted) {
                return -1;
            }
            for (var i = 0; i < this.stepContents.length; i++) {
                if (this.stepContents[i].isStep && !this.stepContents[i].isValid) {
                    return i;
                }
            }
            return i;
        },
        activeContentId: function() {
            if (this.activeContent) {
                return this.activeContent.tId;
            }
            return null;
        },
        currentScreenMode: function() {
            if (this.activeContent && this.activeContent.screen) {
                return this.activeContent.screen;
            }
            return "half";
        },
        currentStepId: function() {
            return this.activeContentId;
        },
        isCurrentStepValid: function() {
            if (this.activeContent.isStep) {
                return this.activeContent.isValid;
            }
            return true;
        },
        isLastStep: function() {
            return this.stepContents.length > 1 && this.currentStepIndex === this.stepContents.length - 1;
        },
        activeContent: function() {
            if (this.currentStepIndex > this.stepContents.length - 1) {
                return null;
            }
            return this.stepContents[this.currentStepIndex];
        },
        isMultiStep: function() {
            return this.stepContents.length > 1;
        },
        isValid: function() {
            if (!this.isMounted) {
                return true;
            }
            return this.stepContents.reduce(function(item, current) {
                if (current.isStep) {
                    return item && current.isValid;
                }
                return item;
            }, true);
        },
        passedScope: function() {
            var defaultKeys = ["editedObject", "currentStepId", "isSubmissionAllowed", "submit", "reset", "validate"],
                self = this;

            var passed = defaultKeys.reduce(function(acc, val) {
                acc[val] = self[val];
                return acc;
            }, {});

            return passed;
        }
    },
    watch: {
        isValid: function(newValue) {
            var self = this;
            this.$nextTick(function() {
                self.isSubmissionAllowed = newValue;
            });
        }
    },
    mounted: function() {
        this.stepContents = this.$children.filter(function(child) {
            return child.isContent && child.role === "default";
        });
        this.isMounted = true;
    },
    methods: {
        setStep: function(newIndex, originator, internalValidationFailed) {
            var self = this;
            var defaultAction = function() {
                if (!internalValidationFailed && newIndex >= 0 && newIndex < self.stepContents.length) {
                    self.currentStepIndex = newIndex;
                }
            };
            if (this.setStepCallbackFn) {
                // .resolve() handles non-Promise return values as well
                Promise.resolve(this.setStepCallbackFn(newIndex, self.currentStepIndex, originator))
                    .then(function(value) {
                        if (value) {
                            defaultAction();
                        }
                    })
                    .catch(function() { //err
                        // TODO: handle error
                    });
            }
            else {
                defaultAction();
            }
        },
        setStepSafe: function(newIndex, originator) {
            this.beforeLeavingStep(newIndex < this.currentStepIndex ? "skip" : "onlyCurrent");
            this.setStep(newIndex, originator, newIndex > this.lastValidIndex);
        },
        prevStep: function() {
            this.setStep(this.currentStepIndex - 1, 'prev');
        },
        nextStep: function() {
            this.beforeLeavingStep("onlyCurrent");
            this.setStep(this.currentStepIndex + 1, 'next', !this.isCurrentStepValid);
        },
        reset: function() {
            var self = this;
            // this.callValidators("reset");
            this.setStep(0, 'reset');
            this.$nextTick(function() {
                self.callValidators("reset");
            });
        },
        submit: function(force) {
            this.beforeLeavingStep();
            if (this.isSubmissionAllowed || force === true) {
                if (this.requiresAsyncSubmit) {
                    this.isSubmitPending = true;
                    var self = this;
                    var callback = function(err) {
                        self.isSubmitPending = false;
                        if (!err && self.doClose) {
                            self.doClose();
                        }
                    };
                    this.$emit("submit", JSON.parse(JSON.stringify(this.editedObject)), callback);
                }
                else {
                    this.$emit("submit", JSON.parse(JSON.stringify(this.editedObject)));
                    if (this.doClose) {
                        this.doClose();
                    }
                }
            }
        },
        validate: function() {
            this.callValidators("touch");
        },
        beforeLeavingStep: function(touchPolicy) {
            if (touchPolicy === "onlyCurrent") {
                this.callValidators("touch", true);
            }
            else if (touchPolicy !== "skip") {
                this.callValidators("touch");
            }
            this.$emit("before-leaving-step");
        },
        callValidators: function(command, onlyCurrent) {
            if (onlyCurrent) {
                var target = this.stepContents[this.currentStepIndex];
                if (target && target[command]) {
                    target[command]();
                }
            }
            else {
                this.stepContents.forEach(function(current) {
                    if (current[command]) {
                        current[command]();
                    }
                });
            }
        }
    }
};
const BaseStep = countlyVue.mixins.BaseContent.extend({
    data: function() {
        return {
            isValid: true,
            isStep: true
        };
    }
});

export default {
    BufferedObjectMixin,
    MultiStepFormMixin,
    BaseStep
};
