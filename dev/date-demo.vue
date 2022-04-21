<script>
import moment from 'moment';

export default {
    data: function() {
        return {
            selectedDateRange: '10weeks',
            selectedDateRangeWithoutOffsetCorr: '10weeks',
            selectedMonthRange: '10months',
            selectedDynamicRange: '10weeks',
            selectedDynamicType: 'daterange',
            selectedDate: moment.now(),
            selectedDateWTime: moment.now(),
            selectedDateWTimeFuture: moment.now(),
            selectedMonth: moment().startOf("month").valueOf(),
            selectedTime: new Date(2016, 9, 10, 18, 40),
        };
    }
};
</script>
<template>
<div>
    <div type="cly-section" title="Date range">
        <cly-date-picker v-model="selectedDateRange" timestampFormat="ms"></cly-date-picker>
        <pre>{{selectedDateRange}}</pre>
    </div>
    <div type="cly-section" title="Date range">
        <cly-date-picker v-model="selectedDateRangeWithoutOffsetCorr" :offset-correction="false" timestampFormat="ms"></cly-date-picker>
        <pre>{{selectedDateRangeWithoutOffsetCorr}}</pre>
    </div>
    <div type="cly-section" title="Month range">
        <cly-date-picker v-model="selectedMonthRange" timestampFormat="ms" type="monthrange"></cly-date-picker>
        <pre>{{selectedMonthRange}}</pre>
    </div>
    <div type="cly-section" title="Date range (no shortcuts)">
        <cly-date-picker v-model="selectedDateRange" timestampFormat="ms" :display-shortcuts="false"></cly-date-picker>
        <pre>{{selectedDateRange}}</pre>
    </div>
    <div type="cly-section" title="Date">
        <cly-date-picker v-model="selectedDate" timestampFormat="ms" type="date"></cly-date-picker>
        <pre>{{selectedDate}}</pre>
    </div>
    <div type="cly-section" title="Date with Time">
        <cly-date-picker v-model="selectedDateWTime" timestampFormat="ms" type="date" :select-time="true"></cly-date-picker>
        <pre>{{selectedDateWTime}}</pre>
    </div>
    <div type="cly-section" title="Month">
        <cly-date-picker v-model="selectedMonth" timestampFormat="ms" type="month"></cly-date-picker>
        <pre>{{selectedMonth}}</pre>
    </div>
    <div type="cly-section" title="Time">
        <cly-time-picker
            v-model="selectedTime"
            placeholder="Arbitrary time">
        </cly-time-picker>
        <pre>{{selectedTime}}</pre>
    </div>
    <div type="cly-section" title="Dynamic type">
        <el-select size="small" v-model="selectedDynamicType">
            <el-option label="Date range" value="daterange"></el-option>
            <el-option label="Month range" value="monthrange"></el-option>
        </el-select>
        <cly-date-picker v-model="selectedDynamicRange" :type="selectedDynamicType"></cly-date-picker>
        <pre>{{selectedDynamicRange}}</pre>
    </div>
    <div type="cly-section" title="Date with Time (Future)">
        <cly-date-picker v-model="selectedDateWTimeFuture" :is-future="true" timestampFormat="ms" type="date" :select-time="true"></cly-date-picker>
        <pre>{{selectedDateWTimeFuture}}</pre>
    </div>
</div>
</template>