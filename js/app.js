const NOW = new Date();  // Get the curent Date
const DAY_NAME_LIST = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];  // Listing the Weekday

/**
 * Check to see if the dates are the same
 * @param {Date} date1
 * @param {Date} date2
 */
function isSameDate(date1, date2) {
  if (date1 == null || date2 == null) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * create the calendar
 * @param {number} year
 * @param {number} month
 * @param {number} offset - start date（Sunday - offset:0、Monday - offset:1）
 * @returns {Array} - 2 dimentional array of calendar list
 */
function createCalendarList(year, month, offset = 0) {
  // put in the previous dates
  const previousFillDays = (() => {
    const firstDay = (new Date(year, month)).getDay();
    // call for the days to fill（start on Sunday - offset:0, if Monday, set the offset to 1）
    const paddingDayCount = (firstDay + 7 - offset) % 7;
    const prevLastDate = (new Date(year, month, 0)).getDate();
    return _.range(prevLastDate - paddingDayCount + 1, prevLastDate + 1).map((day) => ({
      date: new Date(year, month - 1, day),
      day,
      isPrev: true,
      isNext: false,
    }));
  })();

  // generating the days of the month
  const currentDays = (() => {
    const lastDate = new Date(year, month + 1, 0);
    const currentDayCount = lastDate.getDate();
    return _.range(1, currentDayCount + 1).map((day) => ({
      date: new Date(year, month, day),
      day,
      isPrev: false,
      isNext: false,
    }));
  })();

  // generating the days of the folowing month
  const nextPaddingDays = (() => {
    const paddingDayCount = (42 - (previousFillDays.length + currentDays.length)) % 7;
    return _.range(1, paddingDayCount + 1).map((day) => ({
      date: new Date(year, month + 1, day),
      day,
      isPrev: false,
      isNext: true,
    }));
  })();

  // flatten all
  const flatCalendar = [
    ...previousFillDays,
    ...currentDays,
    ...nextPaddingDays,
  ];

  // make a multi-dimensional array, and the return it
  return _.range(0, flatCalendar.length / 7).map((i) => {
    return flatCalendar.slice(i * 7, (i + 1) * 7);
  });
}

const Calendar = Vue.extend({
  props: {
    /** Displaying the Month */
    targetMonth: Date,
    /** Offset of the Weekday（Sun - offset:0, Mon - offset:1） */
    offset: Number,
    /** selected date */
    selectedDate: Date,
  },
  computed: {
    // calculate the calendar list
    _calendarList() {
      const year = this.$props.targetMonth.getFullYear();
      const month = this.$props.targetMonth.getMonth();
      return createCalendarList(year, month, this.$props.offset);
    },
    // calculating the calendar list based on the offset
    _dayNameList() {
      return DAY_NAME_LIST.map((DAY_NAME, index) => DAY_NAME_LIST[(index + this.$props.offset) % DAY_NAME_LIST.length]);
    },
  },
  methods: {
    /**
     * return the class info
     * @param dateInfo
     */
    getClass(dateInfo) {
      return {
        '-other': dateInfo.isPrev || dateInfo.isNext,
        '-selected': isSameDate(dateInfo.date, this.$props.selectedDate),
        '-now': isSameDate(dateInfo.date, NOW),
      };
    },
    /**
     * when clicked on the date
     * @param dateInfo
     */
    onClickCell(dateInfo) {
      // skip on next or previous Month
      if (dateInfo.isPrev || dateInfo.isNext) {
        return;
      }

      this.$emit('selectDate', new Date(dateInfo.date));
    }
  },
  template: `
    <div>
      <div class="date-table">
        <div class="date-table__row">
          <div class="date-row">
            <template v-for="dayName in _dayNameList">
              <div class="date-row__cell -disabled">
                <div class="day">{{ dayName }}</div>
              </div>
            </template>
          </div>
        </div>
        <template v-for="(row, index) in _calendarList">
          <div :key="index" class="date-table__row">
            <div class="date-row">
              <template v-for="(dateInfo, index2) in row">
                <div
                  class="date-row__cell"
                  :class="{ '-disabled': dateInfo.isPrev || dateInfo.isNext }"
                  @click="onClickCell(dateInfo)"
                >
                  <div
                    class="day"
                    :class="getClass(dateInfo)"
                  >
                    {{ dateInfo.day }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  `,
});

new Vue({
  el: '#app',
  components: {
    Calendar,
  },
  data() {
    return {
      DAY_NAME_LIST,
      offset: '1',
      selectedDate: null,
      targetMonth: new Date(),
    };
  },
  computed: {
    _monthLabel() {
      const year = this.$data.targetMonth.getFullYear();
      const month = this.$data.targetMonth.getMonth();
      return `${month + 1}/${year}`;
    },
  },
  methods: {
    /**
     * moving the month
     * @param delta
     */
    moveMonth(delta) {
      const year = this.$data.targetMonth.getFullYear();
      const month = this.$data.targetMonth.getMonth();
      this.$data.targetMonth = new Date(year, month + delta);
    },
  },
  template: `
    <div>
      <div>
        <span>Start Date：</span>
        <select v-model="$data.offset">
          <template v-for="(DAY_NAME, index) in $data.DAY_NAME_LIST">
            <option :value="index">{{ DAY_NAME }}</option>
          </template>
        </select>
      </div>
      <div class="status">
        <div>{{ _monthLabel }}</div>
        <div>
          <button @click="moveMonth(-1)">←</button>
          <button @click="moveMonth(1)">→</button>
        </div>
      </div>
      <Calendar
        :targetMonth="$data.targetMonth"
        :offset="Number($data.offset)"
        :selectedDate="$data.selectedDate"
        @selectDate="$data.selectedDate = $event"
      />
    </div>
  `,
});
