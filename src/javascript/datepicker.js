const dateInput = document.querySelector('.datepicker');
const warning = document.querySelector('.warning');
const p = document.querySelector('#calendar > p');
const checkBox = document.querySelector('input[type=checkbox]');
// const submitInput = document.querySelector('input[type=submit]');
const submitInput = document.querySelector('button[type=submit]');
const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
let now, selectedTime, curObj, dateMatch;
const pastDateMsg = "Date must not be in the past";
const formatMsg = "Date field must be in format dd-mm-yyyy";

/**
 * Creating Appointment Object
 */
class Appointment {
    constructor(date) {
        let _date = date;
        this.edit = (message, date = _date) => {
            if (date === _date) this.set(message);
            else {
                this.delete();
                _date = date;
                this.set(message);
            }
        };
        this.get = () => {
            return localStorage.getItem(_date);
        };
        this.getDate = () => {
            return _date;
        };
        this.delete = () => {
            localStorage.removeItem(_date);
        };
        this.set = (message) => {
            localStorage.setItem(_date, message);
        }
    }
}

/**
 * Appointment actions
 * @param date
 * @returns {boolean}
 */
const appointmentExist = date => {
    let check;
    if ((new Appointment(date)).get()) {
        if (curObj) check = date !== curObj.getDate();
        else check = true;
    } else check = false;
    return check;
};

const appoinmentExistsAction = (display, check) => {
    warning.style.display = display;
    checkboxSelect(check);
};

const formatDate = (d, m, y) => {
    let day = d.toString().length < 2 ? '0' + d : d;
    let mth = m.toString().length < 2 ? '0' + m : m;
    return `${day}-${mth}-${y}`;
};

const getMonthYearString = dt => {
    return monthArr[dt.getMonth()] + ' ' + dt.getFullYear();
};

/**
 * Choose date in datepicker
 */
const chooseDate = e => {
    let targ;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) targ = targ.parentNode;

    let div = targ.parentNode.parentNode.parentNode.parentNode.parentNode;
    let idOfTextbox = div.getAttribute('datepickertextbox');
    let textbox = document.getElementById(idOfTextbox);
    if (targ.value == '<' || targ.value == '>') {
        createCalendar(div, new Date(targ.getAttribute('date')));
        return;
    }
    selectedDate = new Date(targ.getAttribute('date'));
    textbox.value = formatDate(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear());
    let today = new Date();
    now = (new Date(today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear())).getTime();
    selectedTime = selectedDate.getTime();

    /**
     * Check if the time is in the past
     */
    dateMatch = true;
    handleError(now > selectedTime, "Date must not be in the past");
    if(now > selectedTime) return;

    /**
     * check if appointment exists for the current date
     */
    if (appointmentExist(textbox.value)) appoinmentExistsAction('block', true);
    else appoinmentExistsAction('none', false);

    div.parentNode.removeChild(div); // Remove the dropdown box
    datepickerD = null;
};

/**
 * Parse a date
 */
const parseMyDate = d => {
    if (d == "") return new Date('NotADate'); // For Safari
    let a = d.split('-');
    if (a.length != 3) return new Date(d);
    let m = -1;
    if (a[1] == 'Jan') m = 0;
    if (a[1] == 'Feb') m = 1;
    if (a[1] == 'Mar') m = 2;
    if (a[1] == 'Apr') m = 3;
    if (a[1] == 'May') m = 4;
    if (a[1] == 'Jun') m = 5;
    if (a[1] == 'Jul') m = 6;
    if (a[1] == 'Aug') m = 7;
    if (a[1] == 'Sep') m = 8;
    if (a[1] == 'Oct') m = 9;
    if (a[1] == 'Nov') m = 10;
    if (a[1] == 'Dec') m = 11;
    if (m < 0) return new Date(d);
    return new Date(a[2], m, a[0], 0, 0, 0, 0);
};

/**
 * creating calendar for a given month
 */
const createCalendar = (div, month) => {
    const idOfTextbox = div.getAttribute('datepickertextbox');
    const textbox = document.getElementById(idOfTextbox);
    const tbl = document.createElement('table');
    const topRow = tbl.insertRow(-1);
    let ttd = topRow.insertCell(-1);
    const lastMonthBn = document.createElement('input');
    lastMonthBn.type = 'button';
    ttd.appendChild(lastMonthBn);
    lastMonthBn.value = '<';
    lastMonthBn.onclick = chooseDate;
    lastMonthBn.setAttribute('date', new Date(month.getFullYear(), month.getMonth() - 1, 1, 0, 0, 0, 0).toString());
    ttd = topRow.insertCell(-1);
    ttd.colSpan = 5;
    const mon = document.createElement('input');
    mon.type = 'text';
    ttd.appendChild(mon);
    mon.value = getMonthYearString(month);
    mon.size = 15;
    mon.disabled = 'disabled';
    ttd = topRow.insertCell(-1);
    const nextMonthBn = document.createElement('input');
    nextMonthBn.type = 'button';
    ttd.appendChild(nextMonthBn);
    nextMonthBn.value = '>';
    nextMonthBn.onclick = chooseDate;
    nextMonthBn.setAttribute('date', new Date(month.getFullYear(), month.getMonth() + 1, 1, 0, 0, 0, 0).toString());
    const daysRow = tbl.insertRow(-1);
    daysRow.insertCell(-1).innerHTML = "Mon";
    daysRow.insertCell(-1).innerHTML = "Tue";
    daysRow.insertCell(-1).innerHTML = "Wed";
    daysRow.insertCell(-1).innerHTML = "Thu";
    daysRow.insertCell(-1).innerHTML = "Fri";
    daysRow.insertCell(-1).innerHTML = "Sat";
    daysRow.insertCell(-1).innerHTML = "Sun";

    /**
     * Make the calender
     */
    let selected = parseMyDate(textbox.value);
    let today = new Date();
    date = new Date(month.getFullYear(), month.getMonth(), 1, 0, 0, 0, 0);
    let extras = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - extras);
    while (1) {
        let tr = tbl.insertRow(-1);
        for (i = 0; i < 7; i++) {
            let td = tr.insertCell(-1);
            let inp = document.createElement('input');
            inp.type = 'button';
            td.appendChild(inp);
            inp.value = date.getDate();
            inp.onclick = chooseDate;
            inp.setAttribute('date', date);
            if (date.getMonth() != month.getMonth()) {
                if (inp.className) inp.className += ' ';
                inp.className += 'othermonth';
            }
            if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) {
                if (inp.className) inp.className += ' ';
                inp.className += 'today';
            }
            if (!isNaN(selected) && date.getDate() == selected.getDate() && date.getMonth() == selected.getMonth() && date.getFullYear() == selected.getFullYear()) {
                if (inp.className) inp.className += ' ';
                inp.className += 'selected';
            }
            date.setDate(date.getDate() + 1);
        }

        if (date.getMonth() != month.getMonth()) {
            break;
        }
    }

    /**
     * Inserting newly made table
     */
    if (div.hasChildNodes()) {
        div.replaceChild(tbl, div.childNodes[0]);
    } else {
        div.appendChild(tbl);
    }
};

/**
 * Show date function
 */
const showDatePicker = idOfTextbox => {
    const textbox = document.getElementById(idOfTextbox);
    x = textbox.parentNode.getElementsByTagName('div');
    for (i = 0; i < x.length; i++) {
        if (x[i].getAttribute('class') == 'datepickerdropdown') {
            textbox.parentNode.removeChild(x[i]);
            return false;
        }
    }

    /**
     * Grab the date, or use the current date if not valid
     */
    let date = parseMyDate(textbox.value);
    if (isNaN(date)) date = new Date();

    /**
     * Create box
     */
    const div = document.createElement('div');
    div.className = 'datepickerdropdown';
    div.setAttribute('datepickertextbox', idOfTextbox);
    createCalendar(div, date);
    insertAfter(div, textbox);
    return false;
};

/**
 * Adds an item after an existing one
 */
const insertAfter = (newItem, existingItem) => {
    if (existingItem.nextSibling) {
        existingItem.parentNode.insertBefore(newItem, existingItem.nextSibling);
    } else {
        existingItem.parentNode.appendChild(newItem);
    }
};

const datePickerInit = () => {
    const allElements = document.getElementsByTagName("*");
    for (i = 0; i < allElements.length; i++) {
        let className = allElements[i].className;
        if (className == 'datepicker' || className.indexOf('datepicker ') != -1 || className.indexOf(' datepicker') != -1) {
            const a = document.createElement('a');
            a.href = '#';
            a.className = "datepickershow";
            a.setAttribute('onclick', 'return showDatePicker("' + allElements[i].id + '")');
            const img = document.createElement('img');
            a.appendChild(img);
            insertAfter(a, allElements[i]);
        }
    }
};

/**
 * Hook into the page load event
 */
if (window.addEventListener) {
    window.addEventListener('load', datePickerInit, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', datePickerInit);
}