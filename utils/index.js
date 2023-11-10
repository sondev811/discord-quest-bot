process.env.TZ = 'Asia/Bangkok';

const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}

const checkingLastAttended = (lastLogin) => {
  if(!lastLogin) return false;
  const lastLoginDate = new Date(lastLogin);
  const currentDate = new Date();
  const isAttended =
  lastLoginDate.getDate() === currentDate.getDate() &&
  lastLoginDate.getMonth() === currentDate.getMonth() &&
  lastLoginDate.getFullYear() === currentDate.getFullYear();
  return isAttended;
}

const getLastDayOfPreviousMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(-1);
  return date.getDate();
}

const checkStreak = (lastLogin) => {
  if (!lastLogin) return false;
  const lastLoginDate = new Date(lastLogin);
  const currentDate = new Date();
  if (currentDate.getDate() === 1) {
    if (lastLoginDate.getDate() === getLastDayOfPreviousMonth()) return true;
    return false;
  }
  return currentDate.getDate() - lastLoginDate.getDate() === 1;
}

const getTimeToEndOfDay = () => {
  const nDate = new Date();
  console.log(`${nDate.getHours()}/${nDate.getMinutes()}/${nDate.getSeconds()}`);

  const endOfDay = new Date(nDate);

  endOfDay.setHours(23, 59, 59, 999);

  // Calculate the time remaining until the end of the day
  const timeRemaining = endOfDay - nDate;

  // Convert the time remaining from milliseconds to hours, minutes, and seconds
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return { hoursRemaining, minutesRemaining, secondsRemaining };
}

Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

function isSameWeek(date1, date2) {
  const week1 = new Date(date1).getWeek();
  const week2 = new Date(date2).getWeek();
  return week1 === week2;
}

const getTimeToEndOfWeek = () => {
  const currentDate = new Date();

  // Calculate the end of the current week (Sunday)
  const endOfWeek = new Date(currentDate);
  endOfWeek.setHours(0, 0, 0, 0);
  endOfWeek.setDate(endOfWeek.getDate() + (8 - endOfWeek.getDay()));

  // Calculate the time remaining in milliseconds until the end of the current week
  const timeRemaining = endOfWeek - currentDate;

  // Convert milliseconds to hours and minutes
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining / (1000 * 60)) % 60);
  const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);

  return { hoursRemaining, minutesRemaining, secondsRemaining }
}

const roundAndFormat = (number) => {
  const rounded = number.toFixed(1);
  return rounded === '0.0' ? '0' : rounded;
}

const cloneDeep = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = cloneDeep(obj[i]);
    }
    return arrCopy;
  }

  const objCopy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = cloneDeep(obj[key]);
    }
  }

  return objCopy;
}

const calcDate = (date) => {
  const pastDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - pastDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
  return daysDifference;
}

const handleEmoji = (emoji) => {
  const [prefix, name, id, prefix1] = emoji.split(':');
  return {id: id.substring(0, id.length - 1), name};
}

const findRoleBuff = (arr1, arr2) => {
  const roles = [];

  for (const element of arr1) {
    const findIndex = arr2.findIndex(item => item.roleId === element.roleId);
    if (findIndex !== -1) {
      roles.push(element);
    }
  }
  return roles;
}

const randomBetweenTwoNumber = (min, max) => {
  return Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min);
}

module.exports = { 
  convertTimestamp, 
  checkingLastAttended, 
  checkStreak, 
  getTimeToEndOfDay, 
  getTimeToEndOfWeek, 
  isSameWeek, 
  roundAndFormat,
  cloneDeep,
  calcDate,
  handleEmoji,
  findRoleBuff,
  randomBetweenTwoNumber
};