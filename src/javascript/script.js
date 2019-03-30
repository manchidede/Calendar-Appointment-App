const tbody = document.querySelector('tbody');
const alertWrapper = document.querySelector('.alert-wrapper');
const appointmentBtns = document.querySelector('.appointment-btn');
const mark = '&#10003;';
const form = document.querySelector('#calendar');
const appointmentWrapper = document.querySelector('.appointment-wrapper');
let curElement, curDate, isEdit;
const textInput = document.querySelector('.text');


/**
 *Month Function
 */
const getMonth = (n) => {
    return monthArr[parseInt(n)];
};

const fullDate = date => {
    let a = date.split('-');
    return getDay(parseInt(a[0])) + ' ' + getMonth(a[1]) + ', ' + a[2];
};

/**
 *Date Function
 */
const getDay = n => {
    const toText = n.toString();
    if (n === 0) return toText;
    const lastDigit = n % 10;
    let suffix = "th";
    if (lastDigit === 1 || lastDigit === 2 || lastDigit === 3) {
        const last2Char = toText.slice(-2);
        if (last2Char !== "11" && last2Char !== "12" && last2Char !== "13") {
            suffix = (lastDigit === 1) ? "st" : (lastDigit === 2) ? "nd" :
                (lastDigit === 3) ? "rd" : '';
        }
    }
    return toText + suffix;
};

/**
 *Display Days of current Month
 */
let date = new Date();
const month = date.getMonth();
const today = date.getDate();
let days = [];
let newday = 1;
let newTrNode, tdClass;
document.querySelector('.current-date').innerHTML = `${getMonth(month)}, ${date.getFullYear()}`;
while (date.getMonth() === month) {
    if (newday % 5 === 1) {
        var trNode = document.createElement("tr");
        newTrNode = tbody.appendChild(trNode);
    }

    tdClass = today > newday ? "inactive" : "active";
    newTrNode.innerHTML += `<td class="${tdClass}" data-date="${newday}">
                                    <span>${newday}</span>
                                    ${(new Appointment(formatDate(newday, month + 1, date.getFullYear()))).get() ? mark : ''}
                                </td>`;
    days.push(newday);
    newday++;
    date.setDate(newday);
}
/**
 * Take care of remaining empty boxes
 */
let rem = newday % 5;
while (rem <= 5) {
    newTrNode.innerHTML += `<td class="empty"></td>`;
    rem++;
}
const td = document.querySelectorAll('td');
/**
 * function definitions
 */
const closeModal = () => {
    alertWrapper.classList.add('hide');
    setTimeout(() => {
        hideEl(alertWrapper);
        hideEl(form);
        hideEl(appointmentWrapper);
        textInput.value = dateInput.value = '';
        submitInput.disabled = false;
    }, 500);
    curObj = undefined;
    warning.style.display = 'none';
    dateInput.classList.remove('input-error');
    p.style.display = 'none';
};

const showEl = el => {
    el.classList.add('show')
};

const hideEl = el => {
    el.classList.remove('hide');
    el.classList.remove('show');
};

const edit = check => {
    dateInput.disabled = check;
    isEdit = check;
};

const checkboxSelect = (check = !checkBox.checked) => {
    submitInput.disabled = check;
    submitInputToggle(!check);
};

const submitInputToggle = (show = true) => {
    if (show) submitInput.classList.remove('inactive');
    else submitInput.classList.add('inactive');
};


/**
 * Adding eventlistener to calender dates
 */
td.forEach(function (value) {
    value.addEventListener("click", function () {
        curElement = this;
        curDate = curElement.dataset.date;
        if (curElement.className === 'empty') return;
        curObj = new Appointment(formatDate(curDate, month + 1, date.getFullYear()));
        if (curElement.className === 'inactive' && !curObj.get()) return;
        if (curObj.get()) {
            //Disable edit and delete for past appointments
            if (curElement.className === 'inactive') appointmentBtns.style.display = 'none';
            else appointmentBtns.style.display = "block";
            appointmentWrapper.querySelector('p').innerHTML = curObj.get();
            appointmentWrapper.querySelector('h3').innerHTML = fullDate(curObj.getDate());
            showEl(appointmentWrapper);
        } else {
            dateInput.value = curObj.getDate();
            showEl(form);
        }
        edit(true);
        showEl(alertWrapper)
    });
});
/**
 * Creating new Appointment
 */
document.querySelector('.create').addEventListener('click', () => {
    edit(false);
    showEl(form);
    showEl(alertWrapper);
});

/**
 *Saving calendar entry
 */
form.addEventListener('submit', e => {
    e.preventDefault();
    // console.log("Save");
    // return;
    if (now > selectedTime) return;
    if (appointmentExist(dateInput.value) && !checkBox.checked) return;
    submitInput.disabled = true;
    if (curObj) curObj.edit(textInput.value);
    else (new Appointment(dateInput.value)).edit(textInput.value);
    /**
     * Set Current Element and Current Date if form is in creation mode
     */
    let check = true;
    if (!isEdit) {
        let dateArr = dateInput.value.split('-');
        let chosenMonth = parseInt(dateArr[1]);
        let chosenDate = parseInt(dateArr[0]);
        if (chosenMonth === month + 1) {
            curElement = document.querySelector(`td[data-date="${chosenDate}"]`);
            curDate = curElement.dataset.date;
        }else check = false;
    }
    if(check) curElement.innerHTML = `<span>${curDate}</span> ${mark}`;
    textInput.value = '';
    closeModal();
});

/**
 * Editing Calendar Entries
 */
document.querySelector('.appointment-btn > button:first-child').onclick = () => {
    textInput.value = curObj.get();
    dateInput.value = curObj.getDate();
    hideEl(appointmentWrapper);
    showEl(form);
};

/**
 * Deleting Calendar Entries
 */
document.querySelector('.appointment-btn > button:last-child').onclick = () => {
    curObj.delete();
    const curElementSpan = curElement.querySelector('span');
    curElement.innerHTML = curElementSpan.outerHTML;
    closeModal();
};


/**
 * Datepicker functionality
 */
let datepickerD;

dateInput.addEventListener('focus', () => {
    datepickerD = document.querySelector('.datepickerdropdown');
    if (!datepickerD) {
        showDatePicker("start_dt");
        datepickerD = document.querySelector('.datepickerdropdown');
    }
});

/**
 * Date validation
 */
dateInput.addEventListener('focusout', () => {
    if(dateMatch){
        let isError = !parseDate(dateInput.value);
        handleError(isError, formatMsg);
        if(!isError){
            let dateArr = dateInput.value.split('-');
            selectedTime = new Date(`${dateArr[1]}/${dateArr[0]}/${dateArr[2]}`);
            handleError(new Date() > selectedTime, pastDateMsg);
        }
    }
});

dateInput.addEventListener('input', () => {
    dateMatch = true;
});

const handleError = (errorExists, message) => {
    if(errorExists){
        dateInput.classList.add('input-error');
        p.innerHTML = message;
        p.style.display = 'block';
        warning.style.display = 'none';
        submitInputToggle(false);
    } else {
        submitInputToggle();
        dateInput.classList.remove('input-error');
        p.style.display = 'none';
    }
};

function parseDate(str) {
    var m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    return (m) ? new Date(m[3], m[2]-1, m[1]) : null;
}

window.onload = () => {
    document.querySelector('.datepickershow').style.display = 'none';
};

alertWrapper.addEventListener('click', e => {
    if (datepickerD && !datepickerD.contains(e.target) && e.target !== dateInput && e.target.value !== '<' && e.target.value !== '>') {
        datepickerD.outerHTML = '';
        datepickerD = null;
    }
});