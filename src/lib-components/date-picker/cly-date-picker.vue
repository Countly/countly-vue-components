<script>

import moment from 'moment';
import ELEMENT from 'element-ui';
import countlyVue from '../../compat/vue-core';
import countlyCommon from '../../compat/countly.common.js';
import _ from 'underscore';
import ClyDropdown from '../dropdown/cly-dropdown.vue';
import ClyInputDropdownTrigger from '../dropdown/cly-input-dropdown-trigger.vue';
import AbstractTableComponent from './abstract-table.vue';

const availableShortcuts = {
    yesterday: {
        label: countlyVue.i18n('common.yesterday'),
        value: 'yesterday',
        getRange() {
            return [moment().startOf('day').subtract(1, 'd'), moment().endOf('day').subtract(1, 'd')];
        },
    },
    hour: {
        label: countlyVue.i18n('common.today'),
        value: 'hour',
        getRange() {
            return [moment().startOf('day'), moment().endOf('day')];
        },
    },
    '7days': {
        label: countlyVue.i18n('taskmanager.last-7days'),
        value: '7days',
        getRange() {
            return [moment().startOf('day').subtract(7, 'd'), moment().endOf('day')];
        },
    },
    '30days': {
        label: countlyVue.i18n('taskmanager.last-30days'),
        value: '30days',
        getRange() {
            return [moment().startOf('day').subtract(30, 'd'), moment().endOf('day')];
        },
    },
    '60days': {
        label: countlyVue.i18n('taskmanager.last-60days'),
        value: '60days',
        getRange() {
            return [moment().startOf('day').subtract(60, 'd'), moment().endOf('day')];
        },
    },
    day: {
        label: moment().format('MMMM, YYYY'),
        value: 'day',
        getRange() {
            return [moment().startOf('month'), moment().endOf('month')];
        },
    },
    month: {
        label: moment().year(),
        value: 'month',
        getRange() {
            return [moment().startOf('year'), moment().endOf('year')];
        },
    },
    '0days': {
        label: countlyVue.i18n('common.all-time'),
        value: '0days',
        getRange() {
            return [moment([2010, 0, 1]), moment().endOf('year')];
        },
    },
};

/**
    * Returns the range label for a given state object
    * @param {Object} state Current state of datepicker
    * @param {String} type Datepicker type
    * @returns {String} Range label
    */
function getRangeLabel(state, type) {
    if (state.selectedShortcut === '0days') {
        return countlyVue.i18n('common.all-time');
    }

    type = type || 'date';
    const level = type.replace('range', '');

    if (!state.rangeMode || state.rangeMode === 'inBetween') {
        const effectiveRange = [moment(state.minDate), moment(state.maxDate)];
        switch (level) {
        case 'date':
            if (effectiveRange[0].isSame(effectiveRange[1])) { // single point
                return effectiveRange[0].format('lll');
            }
            if (effectiveRange[1] - effectiveRange[0] > 86400000) {
                return `${effectiveRange[0].format('ll')} - ${effectiveRange[1].format('ll')}`;
            }

            return `${effectiveRange[0].format('lll')} - ${effectiveRange[1].format('lll')}`;

        // case "week":
        //     return;
        case 'month':
            if (effectiveRange[0].isSame(effectiveRange[1])) { // single point
                return effectiveRange[0].format('MMM YYYY');
            }
            return `${effectiveRange[0].format('MMM YYYY')} - ${effectiveRange[1].format('MMM YYYY')}`;
        }
    }
    else if (state.rangeMode === 'since') {
        return countlyVue.i18n('common.time-period-name.since', moment(state.minDate).format('ll'));
    }
    else if (state.rangeMode === 'onm') {
        return countlyVue.i18n('common.time-period-name.on', moment(state.minDate).format('ll'));
    }
    else if (state.rangeMode === 'inTheLast') {
        const num = parseInt(state.inTheLastInput.raw.text, 10);
        let suffix = '';

        if (num > 1) {
            suffix = '-plural';
        }
        return countlyVue.i18n(`common.in-last-${state.inTheLastInput.raw.level}${suffix}`, num);
    }
}

/**
    * Provides picker with the default input state
    * @param {String} formatter Formatter string e.g. MM/DD/YYYY
    * @returns {Object} State object, can be merged to component data
    */
function getDefaultInputState(formatter, instance) {
    const now = moment();
    const minDateMM = moment().subtract(1, 'month');
    const minDateText = minDateMM.format(formatter);
    const minDate = minDateMM.toDate();
    const maxDateMM = now;
    const maxDate = maxDateMM.toDate();

    const state = {
    // User input
        now,
        selectedShortcut: null,
        customRangeSelection: true,
        rangeMode: 'inBetween',
        minDate,
        maxDate,
        minTime: new Date(minDate.getTime()),
        inBetweenInput: {
            raw: {
                textStart: minDateText,
                textEnd: maxDateMM.format(formatter),
            },
            parsed: [minDate, maxDate],
        },
        sinceInput: {
            raw: {
                text: minDateText,
            },
            parsed: [minDate, maxDate],
        },
        onmInput: {
            raw: {
                text: minDateText,
            },
            parsed: [minDate, minDate],
        },
        inTheLastInput: {
            raw: {
                text: '1',
                level: 'months',
            },
            parsed: [minDate, maxDate],
        },
    };
    state.label = getRangeLabel(state, instance.type);
    return state;
}

const globalDaysRange = [];
const globalMonthsRange = [];
const globalFutureDaysRange = [];
const globalFutureMonthsRange = [];
const globalMin = moment([2010, 0, 1]);
const globalMax = moment().endOf('day');
const globalFutureMin = moment().startOf('day');
const globalFutureMax = moment().startOf('day').add(10, 'y');
let daysCursor = moment(globalMin.toDate());
let monthsCursor = moment(globalMin.toDate());

while (daysCursor < globalMax) {
    globalDaysRange.push({
        date: daysCursor.toDate(),
        title: daysCursor.format('MMMM YYYY'),
        key: daysCursor.unix(),
        anchorClass: `anchor-${daysCursor.unix()}`,
    });
    daysCursor = daysCursor.add(1, 'M');
}

globalFutureDaysRange.push(globalDaysRange[globalDaysRange.length - 1]);

while (daysCursor < globalFutureMax) {
    globalFutureDaysRange.push({
        date: daysCursor.toDate(),
        title: daysCursor.format('MMMM YYYY'),
        key: daysCursor.unix(),
        anchorClass: `anchor-${daysCursor.unix()}`,
    });
    daysCursor = daysCursor.add(1, 'M');
}

while (monthsCursor < globalMax) {
    globalMonthsRange.push({
        date: monthsCursor.toDate(),
        title: monthsCursor.format('YYYY'),
        key: monthsCursor.unix(),
        anchorClass: `anchor-${monthsCursor.unix()}`,
    });
    monthsCursor = monthsCursor.add(1, 'Y');
}

globalFutureMonthsRange.push(globalMonthsRange[globalMonthsRange.length - 1]);

while (monthsCursor < globalFutureMax) {
    globalFutureMonthsRange.push({
        date: monthsCursor.toDate(),
        title: monthsCursor.format('YYYY'),
        key: monthsCursor.unix(),
        anchorClass: `anchor-${monthsCursor.unix()}`,
    });
    monthsCursor = monthsCursor.add(1, 'Y');
}

Object.freeze(globalDaysRange);
Object.freeze(globalMonthsRange);
Object.freeze(globalFutureDaysRange);
Object.freeze(globalFutureMonthsRange);

/**
    * Creates an initial state object
    * @param {Object} instance Instance configuration
    * @returns {Object} Initial state object for datepicker
    */
function getInitialState(instance) {
    let formatter = null;
    let tableType = '';
    let globalRange = null;

    if (instance.type.includes('month')) {
        formatter = 'YYYY-MM';
        tableType = 'month';
        globalRange = instance.isFuture ? globalFutureMonthsRange : globalMonthsRange;
    }
    else {
        formatter = 'YYYY-MM-DD';
        tableType = 'date';
        globalRange = instance.isFuture ? globalFutureDaysRange : globalDaysRange;
    }

    const state = {
    // Calendar state
        rangeState: {
            endDate: null,
            selecting: false,
            row: null,
            column: null,
            focusOn: null,
        },

        rangeBackup: {
            minDate: null,
            maxDate: null,
        },

        scrollOps: {
            scrollPanel: { scrollingX: false },
            bar: { minSize: 0.2, background: 'rgba(129,134,141,.3)' },
        },

        // Constants
        formatter,
        globalRange,
        tableType,
        globalMin: instance.isFuture ? globalFutureMin : globalMin,
        globalMax: instance.isFuture ? globalFutureMax : globalMax,
    };

    return _.extend(state, getDefaultInputState(formatter, instance));
}

const dateTableComponent = {
    components: {
        'table-component': ELEMENT.DateTable,
    },
    mixins: [AbstractTableComponent],
};

const monthTableComponent = {
    components: {
        'table-component': ELEMENT.MonthTable,
    },
    mixins: [AbstractTableComponent],
};

const InputControlsMixin = {
    methods: {
        tryParsing(newVal, target, sourceIndex, targetIndexes) {
            const parsedRange = target.parsed;
            let handleUpdate = false;
            const self = this;

            targetIndexes = targetIndexes || [sourceIndex];
            // if no target specified, then it is just a self-update

            const parsed = moment(newVal);
            targetIndexes.forEach((targetIndex) => {
                const needsSync = newVal !== moment(parsedRange[targetIndex]).format(self.formatter);
                if (needsSync) {
                    if (parsed && parsed.isValid() && (parsed >= self.globalMin) && (parsed <= self.globalMax)) {
                        target.raw[`invalid${targetIndex}`] = false;
                        parsedRange[targetIndex] = parsed.toDate();
                        if (targetIndex === sourceIndex) {
                            handleUpdate = true;
                        }
                    }
                    else {
                        target.raw[`invalid${targetIndex}`] = true;
                    }
                }
            });
            if (handleUpdate) {
                this.handleUserInputUpdate(parsedRange[sourceIndex]);
            }
        },
        handleTextStartFocus() {
            this.scrollTo(this.inBetweenInput.parsed[0]);
        },
        handleTextEndFocus() {
            this.scrollTo(this.inBetweenInput.parsed[1]);
        },
        handleTextStartBlur() {
            if (this.inBetweenInput.raw.invalid0 && this.inBetweenInput.parsed[0]) {
                this.inBetweenInput.raw.textStart = moment(this.inBetweenInput.parsed[0]).format(this.formatter);
                this.inBetweenInput.raw.invalid0 = false;
            }
        },
        handleTextEndBlur() {
            if (this.inBetweenInput.raw.invalid1 && this.inBetweenInput.parsed[1]) {
                this.inBetweenInput.raw.textEnd = moment(this.inBetweenInput.parsed[1]).format(this.formatter);
                this.inBetweenInput.raw.invalid1 = false;
            }
        },
        handleSinceBlur() {
            if (this.sinceInput.raw.invalid0 && this.sinceInput.parsed[0]) {
                this.sinceInput.raw.text = moment(this.sinceInput.parsed[0]).format(this.formatter);
                this.sinceInput.raw.invalid0 = false;
            }
        },
        handleOnmBlur() {
            if (this.onmInput.raw.invalid0 && this.onmInput.parsed[0]) {
                this.onmInput.raw.text = moment(this.onmInput.parsed[0]).format(this.formatter);
                this.onmInput.raw.invalid0 = false;
            }
        },
        handleUserInputUpdate(scrollToDate) {
            let inputObj = null;

            switch (this.rangeMode) {
            case 'inBetween':
                inputObj = this.inBetweenInput.parsed;
                break;
            case 'since':
                inputObj = this.sinceInput.parsed;
                break;
            case 'onm':
                inputObj = this.onmInput.parsed;
                break;
            case 'inTheLast':
                inputObj = this.inTheLastInput.parsed;
                break;
            default:
                return;
            }

            if (scrollToDate) {
                this.scrollTo(scrollToDate);
            }
            else if (inputObj[0]) {
                this.scrollTo(inputObj[0]);
            }

            if (inputObj && inputObj[0] && inputObj[1] && inputObj[0] <= inputObj[1]) {
                this.minDate = inputObj[0];
                this.maxDate = inputObj[1];
            }
        },
        setCurrentInBetween(minDate, maxDate) {
            this.inBetweenInput = {
                raw: {
                    textStart: moment(minDate).format(this.formatter),
                    textEnd: moment(maxDate).format(this.formatter),
                },
                parsed: [minDate, maxDate],
            };
        },
        setCurrentSince(minDate, maxDate) {
            this.sinceInput = {
                raw: {
                    text: moment(minDate).format(this.formatter),
                },
                parsed: [minDate, maxDate],
            };
        },
        setCurrentOnm(minDate, maxDate) {
            this.onmInput = {
                raw: {
                    text: moment(minDate).format(this.formatter),
                },
                parsed: [minDate, maxDate],
            };
        },
    },
    watch: {
        'inBetweenInput.raw.textStart': function(newVal) {
            if (this.isRange) {
                this.tryParsing(newVal, this.inBetweenInput, 0);
            }
            else {
                this.tryParsing(newVal, this.inBetweenInput, 0, [0, 1]);
            }
        },
        'inBetweenInput.raw.textEnd': function(newVal) {
            this.tryParsing(newVal, this.inBetweenInput, 1);
        },
        'sinceInput.raw.text': function(newVal) {
            this.tryParsing(newVal, this.sinceInput, 0);
        },
        'onmInput.raw.text': function(newVal) {
            this.tryParsing(newVal, this.onmInput, 0, [0, 1]);
        },
        'inTheLastInput.raw': {
            deep: true,
            handler(newVal) {
                const parsed = moment().subtract(newVal.text, newVal.level).startOf('day');
                if (!parsed.isSame(moment(this.inTheLastInput.parsed[0]))) {
                    if (parsed && parsed.isValid()) {
                        this.inTheLastInput.parsed[0] = parsed.toDate();
                        this.handleUserInputUpdate(this.inTheLastInput.parsed[0]);
                    }
                }
            },
        },
    },
};

const CalendarsMixin = {
    methods: {
        disabledDateFn(date) {
            return date > this.globalMax || date < this.globalMin;
        },
        handleRangePick(val) {
            const firstClick = !this.rangeState.selecting;
            const singleSelectRange = this.rangeMode === 'since' || this.rangeMode === 'onm';

            if (!singleSelectRange) {
                this.rangeMode = 'inBetween';
            }
            if (firstClick) {
                this.rangeBackup = {
                    minDate: this.minDate,
                    maxDate: this.maxDate,
                };
            }
            let minDate; let
                maxDate;
            if (firstClick) {
                if (this.tableType === 'date') {
                    minDate = moment(val.minDate).startOf('day').toDate();
                    maxDate = moment(val.minDate).endOf('day').toDate();
                }
                else {
                    minDate = moment(val.minDate).startOf('month').toDate();
                    maxDate = moment(val.minDate).endOf('month').toDate();
                }

                if (!this.isRange || singleSelectRange) {
                    this.resetRangeState();
                }

                if (this.rangeMode === 'since') {
                    maxDate = moment().toDate();
                    this.setCurrentSince(minDate, maxDate);
                }
                else if (this.rangeMode === 'onm') {
                    maxDate = minDate;
                    this.setCurrentOnm(minDate, maxDate);
                }

                this.setCurrentInBetween(minDate, maxDate);
            }
            else if (this.tableType === 'date') {
                minDate = moment(val.minDate).startOf('day').toDate();
                maxDate = moment(val.maxDate).endOf('day').toDate();
            }
            else {
                minDate = moment(val.minDate).startOf('month').toDate();
                maxDate = moment(val.maxDate).endOf('month').toDate();
            }

            if (this.maxDate === maxDate && this.minDate === minDate) {
                return;
            }
            this.onPick && this.onPick(val);
            this.minDate = minDate;
            this.maxDate = maxDate;
        },
        handleChangeRange(val) {
            this.minDate = val.minDate;
            this.maxDate = val.maxDate;
            this.rangeState = val.rangeState;

            let startsAt; let
                endsAt;

            if (this.minDate <= this.rangeState.endDate) {
                startsAt = this.minDate;
                endsAt = this.rangeState.endDate;
                this.rangeState.focusOn = 'end';
            }
            else {
                startsAt = this.rangeState.endDate;
                endsAt = this.minDate;
                this.rangeState.focusOn = 'start';
            }

            this.setCurrentInBetween(startsAt, endsAt);
        },
        scrollTo(date) {
            if (!this.customRangeSelection) {
                return;
            }
            let anchorClass = null;
            if (this.tableType === 'month') {
                anchorClass = `.anchor-${moment(date).startOf('year').unix()}`;
            }
            else {
                anchorClass = `.anchor-${moment(date).startOf('month').unix()}`;
            }
            this.$refs.vs.scrollIntoView(anchorClass);
        },
        resetRangeState() {
            this.rangeState = {
                endDate: null,
                selecting: false,
                row: null,
                column: null,
                focusOn: null,
            };
        },
        abortPicking() {
            if (this.rangeState.selecting) {
                this.resetRangeState();
                this.minDate = this.rangeBackup.minDate;
                this.maxDate = this.rangeBackup.maxDate;
                this.rangeBackup = {
                    minDate: null,
                    maxDate: null,
                };
                this.setCurrentInBetween(this.minDate, this.maxDate);
            }
        },
    },
};

export default countlyVue.components.BaseComponent.extend({
    name: 'ClyDatePicker',
    mixins: [
        countlyVue.mixins.i18n,
        InputControlsMixin,
        CalendarsMixin,
        ELEMENT.utils.Emitter,
    ],
    components: {
        'date-table': dateTableComponent,
        'month-table': monthTableComponent,
        'cly-dropdown': ClyDropdown,
        'cly-input-dropdown': ClyInputDropdownTrigger
    },
    computed: {
        isStartFocused() {
            return this.rangeState.selecting && this.rangeState.focusOn === 'start';
        },
        isEndFocused() {
            return this.rangeState.selecting && this.rangeState.focusOn === 'end';
        },
        shortcuts() {
            if (this.type === 'daterange' && this.displayShortcuts) {
                const self = this;
                return Object.keys(availableShortcuts).reduce((acc, shortcutKey) => {
                    if (self.enabledShortcuts === false && self.disabledShortcuts === false) {
                        acc.push(availableShortcuts[shortcutKey]);
                    }
                    else if (self.enabledShortcuts !== false) {
                        if (self.enabledShortcuts.indexOf(shortcutKey) !== -1) {
                            acc.push(availableShortcuts[shortcutKey]);
                        }
                    }
                    else if (self.disabledShortcuts !== false) {
                        if (self.disabledShortcuts.indexOf(shortcutKey) === -1) {
                            acc.push(availableShortcuts[shortcutKey]);
                        }
                    }
                    return acc;
                }, []);
            }
            return [];
        },
        isRange() {
            return this.type.includes('range');
        },
        isTimePickerEnabled() {
            return this.type === 'date' && this.selectTime;
        },
        weekdays() {
            return moment.weekdaysMin();
        },
        warnings() {
            if (this.isRange && this.rangeLimits.maxLength && this.rangeLimits.maxLength.length === 2) {
                const lengthStr = `${this.rangeLimits.maxLength[0]} ${countlyVue.i18n(`common.buckets.${this.rangeLimits.maxLength[1]}`)}`;
                return { maxLength: countlyVue.i18n('common.range-length-limit', lengthStr) };
            }
            return {};
        },
    },
    props: {
        value: [Object, String, Array, Number],
        isFuture: {
            type: Boolean,
            default: false,
            required: false,
        },
        type: {
            type: String,
            default: 'daterange',
            validator(value) {
                return ['date', 'daterange', 'month', 'monthrange'].includes(value);
            },
        },
        displayShortcuts: {
            type: Boolean,
            default: true,
        },
        disabledShortcuts: {
            type: [Array, Boolean],
            default: false,
        },
        enabledShortcuts: {
            type: [Array, Boolean],
            default: false,
        },
        placeholder: { type: String, default: 'Select' },
        disabled: { type: Boolean, default: false },
        size: { type: String, default: 'small' },
        showRelativeModes: { type: Boolean, default: true },
        offsetCorrection: { type: Boolean, default: true },
        modelMode: {
            type: String,
            default: 'mixed',
            validator(value) {
                return ['mixed', 'absolute'].includes(value);
            },
        },
        timestampFormat: {
            type: String,
            default: 's',
            validator(value) {
                return ['s', 'ms'].includes(value);
            },
        },
        placement: {
            type: String,
            default: 'bottom-start',
        },
        selectTime: {
            type: Boolean,
            default: false,
        },
        allowOnSelection: {
            type: Boolean,
            default: false,
            required: false,
        },
        minInputWidth: {
            type: Number,
            default: -1,
            required: false,
        },
        maxInputWidth: {
            type: Number,
            default: -1,
            required: false,
        },
        allowCustomRange: {
            type: Boolean,
            default: true,
            required: false,
        },
        rangeLimits: {
            type: Object,
            default() {
                return {};
            },
            required: false,
        },
    },
    data() {
        const data = getInitialState(this);
        data.isVisible = false;
        data.commitTooltip = {};
        return data;
    },
    watch: {
        value: {
            immediate: true,
            handler(newVal) {
                this.loadValue(newVal);
            },
        },
        type() {
            /*
                Type change causes almost everything to change.
                So we simply reinitialize the component.
            */
            Object.assign(this.$data, getInitialState(this));
            this.loadValue(this.value);
        },
        isFuture() {
            Object.assign(this.$data, getInitialState(this));
            this.loadValue(this.value);
        },
    },
    methods: {
        loadValue(value) {
            const changes = this.valueToInputState(value);
            const self = this;

            changes.label = getRangeLabel(changes, this.type);

            Object.keys(changes).forEach((fieldKey) => {
                self[fieldKey] = changes[fieldKey];
            });
        },
        valueToInputState(value) {
            const isShortcut = this.shortcuts && this.shortcuts.some((shortcut) => shortcut.value === value);

            if (isShortcut) {
                const shortcutRange = availableShortcuts[value].getRange();
                return {
                    minDate: shortcutRange[0].toDate(),
                    maxDate: shortcutRange[1].toDate(),
                    selectedShortcut: value,
                    customRangeSelection: false,
                };
            }

            if (Number.isFinite(value) || !this.isRange) {
                value = [value, value];
            }

            const meta = countlyCommon.convertToTimePeriodObj(value);
            const now = moment().toDate();
            const state = {
                selectedShortcut: null,
                customRangeSelection: true,
            };

            if (meta.type === 'range') {
                state.rangeMode = 'inBetween';
                state.minDate = new Date(this.fixTimestamp(meta.value[0], 'input'));
                state.maxDate = new Date(this.fixTimestamp(meta.value[1], 'input'));
                state.inBetweenInput = {
                    raw: {
                        textStart: moment(state.minDate).format(this.formatter),
                        textEnd: moment(state.maxDate).format(this.formatter),
                    },
                    parsed: [state.minDate, state.maxDate],
                };
            }
            else if (meta.type === 'since') {
                state.rangeMode = 'since';
                state.minDate = new Date(this.fixTimestamp(meta.value.since, 'input'));
                state.maxDate = now;
                state.sinceInput = {
                    raw: {
                        text: moment(state.minDate).format(this.formatter),
                    },
                    parsed: [state.minDate, state.maxDate],
                };
            }
            else if (meta.type === 'on') {
                state.rangeMode = 'onm';
                state.minDate = new Date(this.fixTimestamp(meta.value.on, 'input'));
                state.maxDate = state.minDate;
                state.onmInput = {
                    raw: {
                        text: moment(state.minDate).format(this.formatter),
                    },
                    parsed: [state.minDate, state.maxDate],
                };
            }
            else if (meta.type === 'last-n') {
                state.rangeMode = 'inTheLast';
                state.minDate = moment().subtract(meta.value, meta.level).startOf('day').toDate();
                state.maxDate = now;
                state.inTheLastInput = {
                    raw: {
                        text: `${meta.value}`,
                        level: meta.level,
                    },
                    parsed: [state.minDate, state.maxDate],
                };
            }
            else if (availableShortcuts[value]) {
                /*
                    Shortcuts values should be mapped to a real date range for the cases shortcuts are disabled.
                */
                const effectiveShortcutRange = availableShortcuts[value].getRange();
                state.rangeMode = 'inBetween';
                state.minDate = effectiveShortcutRange[0].toDate();
                state.maxDate = effectiveShortcutRange[1].toDate();
                state.inBetweenInput = {
                    raw: {
                        textStart: effectiveShortcutRange[0].format(this.formatter),
                        textEnd: effectiveShortcutRange[1].format(this.formatter),
                    },
                    parsed: [state.minDate, state.maxDate],
                };
            }
            state.minTime = new Date(state.minDate.getTime());
            return state;
        },
        handleDropdownHide(aborted) {
            this.abortPicking();
            this.clearCommitWarning(true);
            if (aborted) {
                this.loadValue(this.value);
            }
            this.isVisible = false;
        },
        refreshCalendarDOM() {
            if (this.customRangeSelection) {
                const self = this;
                this.$nextTick(() => {
                    self.broadcast('ElSelectDropdown', 'updatePopper');
                    self.$forceUpdate();
                    self.scrollTo(self.minDate);
                });
            }
        },
        handleDropdownShow() {
            this.isVisible = true;
            this.refreshCalendarDOM();
        },
        handleCustomRangeClick() {
            if (this.allowCustomRange) {
                this.customRangeSelection = true;
                this.refreshCalendarDOM();
            }
        },
        handleShortcutClick(value) {
            this.selectedShortcut = value;
            if (value) {
                this.doCommit(value, true);
            }
        },
        handleTabChange() {
            this.abortPicking();
            this.handleUserInputUpdate();
        },
        fixTimestamp(value, mode) {
            if (!this.offsetCorrection && this.timestampFormat === 'ms') {
                return value;
            }

            let newValue = value;

            if (this.timestampFormat === 's') {
                if (mode === 'output') {
                    newValue = Math.floor(value / 1000);
                }
                else { // mode === "input"
                    newValue = value * 1000;
                }
            }

            if (this.offsetCorrection) {
                if (mode === 'output') {
                    newValue -= countlyCommon.getOffsetCorrectionForTimestamp(newValue);
                }
                else { // mode === "input"
                    newValue += countlyCommon.getOffsetCorrectionForTimestamp(newValue);
                }
            }
            return newValue;
        },
        mergeDateTime(oDate, oTime) {
            return new Date(
                oDate.getFullYear(),
                oDate.getMonth(),
                oDate.getDate(),
                oTime.getHours(),
                oTime.getMinutes(),
                oTime.getSeconds(),
            );
        },
        handleConfirmClick() {
            if (this.rangeMode === 'inBetween' || this.modelMode === 'absolute') {
                const effectiveMinDate = this.isTimePickerEnabled ? this.mergeDateTime(this.minDate, this.minTime) : this.minDate;
                this.doCommit([
                    this.fixTimestamp(effectiveMinDate.valueOf(), 'output'),
                    this.fixTimestamp(this.maxDate.valueOf(), 'output'),
                ], false);
            }
            else if (this.rangeMode === 'since') {
                this.doCommit({ since: this.fixTimestamp(this.minDate.valueOf(), 'output') }, false);
            }
            else if (this.rangeMode === 'inTheLast') {
                this.doCommit(this.inTheLastInput.raw.text + this.inTheLastInput.raw.level, false);
            }
            else if (this.rangeMode === 'onm') {
                this.doCommit({ on: this.fixTimestamp(this.minDate.valueOf(), 'output') }, false);
            }
        },
        handleDiscardClick() {
            this.doDiscard();
        },
        triggerCommitWarning(errorType) {
            const self = this;
            clearTimeout(self.commitTooltip._timeout);
            self.commitTooltip = {
                show: true,
                content: this.warnings[errorType],
                trigger: 'manual',
            };
            self.commitTooltip._timeout = setTimeout(() => {
                self.clearCommitWarning();
            }, 3000);
        },
        clearCommitWarning(destroyTimeout) {
            if (destroyTimeout) {
                clearTimeout(this.commitTooltip._timeout);
            }
            this.commitTooltip = {};
        },
        doClose() {
            this.$refs.dropdown.handleClose();
            this.clearCommitWarning(true);
        },
        doDiscard() {
            this.handleDropdownHide(true);
            this.doClose();
        },
        doCommit(value, isShortcut) {
            if (value) {
                if (this.isRange && this.rangeLimits.maxLength && this.rangeLimits.maxLength.length === 2) {
                    const allowedMax = moment(this.minDate).add(this.rangeLimits.maxLength[0], this.rangeLimits.maxLength[1]);
                    if (allowedMax < moment(this.maxDate)) {
                        return this.triggerCommitWarning('maxLength');
                    }
                }
                const submittedVal = this.isRange ? value : value[0];
                const effectiveMinDate = this.isTimePickerEnabled ? this.mergeDateTime(this.minDate, this.minTime) : this.minDate;
                this.$emit('input', submittedVal);
                this.$emit('change', {
                    effectiveRange: [
                        this.fixTimestamp(effectiveMinDate.valueOf(), 'output'),
                        this.fixTimestamp(this.maxDate.valueOf(), 'output'),
                    ],
                    isShortcut,
                    value: submittedVal,
                });
                this.doClose();
            }
        },
    },
    beforeDestroy() {
        this.clearCommitWarning(true);
    },
});
</script>

<template>
    <cly-dropdown
        v-tooltip="label"
        ref="dropdown"
        @hide="handleDropdownHide"
        @show="handleDropdownShow"
        :placement="placement"
        :placeholder="placeholder"
        :disabled="disabled">
        <template v-slot:trigger="dropdown">
            <slot name="trigger">
                <cly-input-dropdown-trigger
                    ref="trigger"
                    :adaptive-length="true"
                    :min-width="minInputWidth"
                    :max-width="maxInputWidth"
                    :arrow="true"
                    :prefix-icon="'cly-icon-date cly-icon-prefix-icon'"
                    :disabled="disabled"
                    :selected-options="label"
                    :focused="dropdown.focused"
                    :opened="dropdown.visible"
                    :size="size"
                    :placeholder="placeholder">
                </cly-input-dropdown-trigger>
            </slot>
        </template>
        <div class="cly-vue-daterp">
            <div class="cly-vue-daterp__shortcuts-col" v-if="shortcuts && shortcuts.length > 0">
                <div v-if="allowCustomRange" class="text-medium font-weight-bold cly-vue-daterp__shortcut cly-vue-daterp__shortcut--custom"
                    @click="handleCustomRangeClick">
                    {{i18n('common.time-period-select.custom-range')}}<i class="el-icon-caret-right"></i>
                </div>
                <div class="text-medium font-weight-bold cly-vue-daterp__shortcut"
                    :class="{'cly-vue-daterp__shortcut--active': selectedShortcut == shortcut.value}"
                    v-for="shortcut in shortcuts"
                    @click="handleShortcutClick(shortcut.value)">
                    {{shortcut.label}}
                </div>
            </div>
            <div class="cly-vue-daterp__calendars-col" v-if="isVisible && customRangeSelection">
                <div class="cly-vue-daterp__input-methods" :class="{'cly-vue-daterp__hidden-tabs': !showRelativeModes || !isRange}">
                    <el-tabs v-model="rangeMode" @tab-click="handleTabChange">
                        <el-tab-pane name="inBetween">
                            <template slot="label">
                                <span class="text-medium font-weight-bold">{{i18n('common.time-period-select.range')}}</span>
                            </template>
                            <div class="cly-vue-daterp__input-wrapper">
                                <template v-if="isRange">
                                    <el-input size="small" :class="{'is-active': isStartFocused, 'is-error': inBetweenInput.raw.invalid0}" @focus="handleTextStartFocus" @blur="handleTextStartBlur" v-model="inBetweenInput.raw.textStart"></el-input>
                                    <span class="text-medium cly-vue-daterp__in-between-conj">{{i18n('common.and')}}</span>
                                    <el-input size="small" :class="{'is-active': isEndFocused, 'is-error': inBetweenInput.raw.invalid1}" @focus="handleTextEndFocus" @blur="handleTextEndBlur" v-model="inBetweenInput.raw.textEnd"></el-input>
                                </template>
                                <template v-else>
                                    <div class="bu-is-flex bu-is-justify-content-space-between bu-is-align-items-baseline" style="width:100%">
                                        <div>
                                            <span class="text-medium">{{i18n('common.' + type)}}</span>
                                        </div>
                                        <div>
                                            <el-input size="small" :class="{'is-active': isStartFocused, 'is-error': inBetweenInput.raw.invalid0}" @focus="handleTextStartFocus" @blur="handleTextStartBlur" v-model="inBetweenInput.raw.textStart"></el-input>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="since">
                            <template slot="label">
                                <span class="text-medium font-weight-bold">{{i18n('common.time-period-select.since')}}</span>
                            </template>
                            <div class="cly-vue-daterp__input-wrapper">
                                <el-input size="small" :class="{'is-error': sinceInput.raw.invalid0}" v-model="sinceInput.raw.text" @blur="handleSinceBlur"></el-input>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="inTheLast">
                            <template slot="label">
                                <span class="text-medium font-weight-bold">{{i18n('common.time-period-select.last-n')}}</span>
                            </template>
                            <div class="cly-vue-daterp__input-wrapper">
                                <el-input size="small" v-model.number="inTheLastInput.raw.text"></el-input>
                                <el-select size="small" v-model="inTheLastInput.raw.level">
                                    <el-option v-if="tableType === 'date'" :label="i18n('common.buckets.days')" value="days"></el-option>
                                    <el-option v-if="tableType === 'date'" :label="i18n('common.buckets.weeks')" value="weeks"></el-option>
                                    <el-option :label="i18n('common.buckets.months')" value="months"></el-option>
                                </el-select>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="onm" v-if="allowOnSelection">
                            <template slot="label"><span class="text-medium font-weight-bold">{{i18n('common.time-period-select.on')}}</span></template>
                            <div class="cly-vue-daterp__input-wrapper">
                                <el-input size="small" :class="{'is-error': onmInput.raw.invalid0}" v-model="onmInput.raw.text" @blur="handleOnmBlur"></el-input>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <div class="cly-vue-daterp__day-names-wrapper" v-if="tableType === 'date'">
                        <table class="cly-vue-daterp__day-names">
                            <tr>
                                <th v-for="dayName in weekdays">{{ dayName }}</th>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="cly-vue-daterp__calendars-wrapper">
                    <div class="cly-vue-daterp__table-wrap" :class="{'is-point': !isRange, 'is-start-focused': isStartFocused, 'is-end-focused': isEndFocused}" style="height: 238px" ref="calendarsViewport">
                        <vue-scroll ref="vs" :ops="scrollOps">
                            <div class="cly-vue-daterp__table-view" v-if="tableType === 'month'">
                                <month-table
                                    v-for="item in globalRange"
                                    :key="item.key"
                                    :date-meta="item"
                                    :in-viewport-requires-root="true"
                                    :in-viewport-root="$refs.calendarsViewport"
                                    selection-mode="range"
                                    :date="item.date"
                                    :min-date="minDate"
                                    :max-date="maxDate"
                                    :disabled-date="disabledDateFn"
                                    :rangeState="rangeState"
                                    @pick="handleRangePick"
                                    @changerange="handleChangeRange">
                                </month-table>
                            </div>
                            <div class="cly-vue-daterp__table-view" v-else>
                                <date-table
                                    v-for="item in globalRange"
                                    :key="item.key"
                                    :date-meta="item"
                                    :in-viewport-requires-root="true"
                                    :in-viewport-root="$refs.calendarsViewport"
                                    selection-mode="range"
                                    :date="item.date"
                                    :min-date="minDate"
                                    :max-date="maxDate"
                                    :disabled-date="disabledDateFn"
                                    :rangeState="rangeState"
                                    @pick="handleRangePick"
                                    @changerange="handleChangeRange">
                                </date-table>
                            </div>
                        </vue-scroll>
                    </div>
                </div>
                <div v-if="isTimePickerEnabled" class="cly-vue-daterp__time-picker-section">
                    <div class="bu-is-flex bu-is-justify-content-space-between bu-is-align-items-baseline" style="width:100%">
                        <div>
                            <span class="text-medium">{{i18n('common.time')}}</span>
                        </div>
                        <div>
                            <cly-time-picker align="right" :width="100" v-model="minTime"></cly-time-picker>
                        </div>
                    </div>
                </div>
                <div v-if="warnings" class="bu-mt-4 bu-mx-4" style="text-align: right;">
                    <span class="text-medium" v-for="warning in warnings">{{warning}}</span>
                </div>
                <div class="cly-vue-daterp__commit-section">
                    <el-button @click="handleDiscardClick" class="cly-vue-daterp__cancel-button color-cool-gray-100 bg-warm-gray-20" size="small">{{ i18n("common.cancel") }}</el-button>
                    <el-button @click="handleConfirmClick" v-tooltip="commitTooltip" class="cly-vue-daterp__confirm-button" type="success" size="small">{{ !isRange ? i18n("common.apply") : i18n("common.apply-range") }}</el-button>
                </div>
            </div>
        </div>
    </cly-dropdown>
</template>

<style lang="scss">
    @use "../../styles/base/typography-variables" as t;
    @use "../../styles/base/colors" as c;
    @use "sass:map";
    @use "sass:math";

    .cly-vue-daterp {
        background: #FFFFFF;
        border-radius: 4px;
        color: map.get(c.$colors, "text-custom-1-active");
        display: inline-block;

        &__shortcuts-col {
            width: 144px;
            padding: 8px;
            vertical-align: top;
        }

        &__calendars-col {
            width: 341px;
        }

        &__shortcuts-col {
            + .cly-vue-daterp__calendars-col {
                border-left: 1px #EBEBEF solid;
                margin-left:-5px;
            }
        }

        &__calendars-wrapper {
            background-color: #f9f9f9;
            position: relative;
            &::before {
                // shadow
                content: "";
                position: absolute;
                width: 100%;
                height: 12px;
                background: linear-gradient(180deg, rgba(51, 60, 72, 0.8) 0%, rgba(51, 60, 72, 8e-05) 100%);
                mix-blend-mode: normal;
                opacity: 0.1;
                top: 0px;
                z-index: 2000;
            }
            &::after {
                // shadow
                content: "";
                position: absolute;
                width: 100%;
                height: 12px;
                background: linear-gradient(180deg, rgba(51, 60, 72, 0.6) 0%, rgba(51, 60, 72, 6e-05) 100%);
                mix-blend-mode: normal;
                opacity: 0.1;
                transform: rotate(-180deg);
                bottom: 0px;
            }
        }

        &__date-table-wrapper {
            margin: 0 14px 4px 14px;
            padding-top: 12px;
        }

        &__shortcuts-col, &__calendars-col {
            display: inline-block;

            .el-tabs {
                &__active-bar {
                    background-color: #0166D6;
                }
            }
        }

        &__shortcut {
            padding: 8px;
            cursor: pointer;
            line-height: 16px;

            &--active {
                background: #F9F9F9;
                border-radius: 4px;
                color: map.get(c.$colors, "primary");
            }

            &--custom {
                margin-bottom: 24px;
            }
            i {
                color: #808081;
                float: right;
                margin-top: 1px;
                margin-right: -2px;
            }
        }

        &__input-wrapper,
        &__time-picker-section {
            width: 308px;
            display: flex;
            margin: 0;
            padding: 16px;
            align-items: center;
        }

        &__time-picker-section {
            border-bottom: 1px solid #ECECEC;
        }

        &__in-between-conj {
            padding: 0 11px;
        }

        &__commit-section {
            float: right;
            margin: 16px;
        }

        &__cancel-button{
            padding: 8px 12px;
            border: none;
            font-weight: 500;
        }

        &__confirm-button {
            margin-left: 8px;
            border: none;
        }

        &__day-names-wrapper {
            margin: 0 14px 9px 14px;
        }

        &__day-names {
            text-align: center;
            th {
                font-size: 13px;
                line-height: 13px;
                font-weight: 500;
                color: #858A91;
                width: 42px;
            }
        }

        .el-tabs {
            &__nav-scroll {
                justify-content: center;
                display: flex;
            }
            &__header {
                margin: 0;
            }
            &__item {
                height: 44px;
                line-height: 44px;
            }
        }

        &__hidden-tabs {
            .el-tabs__header {
                display: none;
            }
        }

        .el-date-table {
            margin-top: 2px;
            tr:first-of-type {
                display: none; // hide day names
            }
            td {
                width: 44px;
                height: 36px;
                padding: 0;
                > div {
                    padding: 0px;
                    height: 32px;
                    span {
                        width: 40px;
                        height: 32px;
                        background: #FFFFFF;
                        border-radius: 4px;
                        -webkit-box-sizing:border-box;
                        -moz-box-sizing:border-box;
                        -ms-box-sizing:border-box;
                        box-sizing:border-box;
                        border: 2px solid transparent;
                        padding: 5px 0 0 15px;
                    }
                }
                &.in-range{
                    > div span {
                        background: #ccdbf2;
                        mix-blend-mode: normal;
                    }
                }
                &.start-date, &.end-date {
                    > div span {
                        background: #1967D2
                    }
                }
                &.prev-month, &.next-month {
                    visibility: hidden;
                    height: 0px;
                    div, span {
                        display: none;
                        height: 0px;
                    }
                }
            }
        }

        .el-month-table {
            margin-top: 2px;
            margin-bottom: 14px;
            td {
                width: 78px;
                height: 66px;
                padding: 0;
                > div {
                    padding: 0px;
                    a {
                        width: 68px;
                        height: 46px;
                        background: #fff;
                        border-radius: 4px;
                        font-size: 14px;
                        padding-top: 10px;
                        border: 2px solid transparent;
                    }
                }
                &.in-range{
                    > div a {
                        background: #ccdbf2;
                        mix-blend-mode: normal;
                    }
                }
                &.start-date, &.end-date {
                    > div a {
                        background: #1967D2
                    }
                }
            }
        }

        @mixin cell-hover() {
            background: #FFFFFF;
            border: 2px solid #0166D6;
            color: map.get(c.$colors, "text-custom-1-active");
        }

        &__table-wrap.is-start-focused {
            .el-date-table .start-date {
                > div span {
                    @include cell-hover()
                }
            }
            .el-month-table .start-date {
                > div a {
                    @include cell-hover()
                }
            }
        }

        &__table-wrap.is-end-focused {
            .el-date-table .end-date {
                > div span {
                    @include cell-hover()
                }
            }
            .el-month-table .end-date {
                > div a {
                    @include cell-hover()
                }
            }
        }
        &__table-wrap.is-point {
            .el-date-table .available:not(.in-range) {
                 > div:hover span {
                    @include cell-hover()
                }
            }
            .el-month-table td:not(.in-range) {
                > div:hover a {
                    @include cell-hover()
               }
           }
        }
    }
</style>
