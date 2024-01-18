const { createCanvas, loadImage } = require('canvas');
const { RewardEnum } = require('../models/quest.model');

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

const convertDateTime = (date) => {
  if (!date) return null;
  const calcDate = new Date(date);
  return `${calcDate.getDate()}/${calcDate.getMonth() + 1}/${calcDate.getFullYear()} - ${calcDate.getHours()}:${calcDate.getMinutes() < 10 ? `0${calcDate.getMinutes()}` : calcDate.getMinutes()}`;
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
  const startDay = 1; 
  const d = currentDate.getDay();
  const weekStart = new Date(currentDate.valueOf() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000); //rewind to start day
  const weekEnd = new Date(weekStart.valueOf() + 7 * 86400000);
  weekEnd.setHours(0, 0, 0, 0);

  const timeRemaining = weekEnd - currentDate;
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
    const findIndex = arr2.findIndex(item => item.roleId === element.roleId && element.valueBuff !== '0');
    if (findIndex !== -1) {
      roles.push(element);
    }
  }
  return roles;
}

const randomBetweenTwoNumber = (min, max) => {
  return Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min);
}

const mergeImages = async(avatar1, avatar2) => {
  let betweenImage = 'https://cdn.discordapp.com/emojis/1174313463368142929.png';
  const image1 = await loadImage(avatar1);
  const image2 = await loadImage(betweenImage);
  const image3 = await loadImage(avatar2);

  const canvasWidth = image1.width + image2.width + image3.width + 45;
  const canvasHeight = Math.max(image1.height, image2.height, image3.height);

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image1, 0, 0);
  ctx.drawImage(image2, image1.width + 15, 0);
  ctx.drawImage(image3, image1.width + image2.width + 30, 0);
  return canvas.toBuffer('image/png');
}

const getRandomGift = (gifts) => {
  const totalWeight = gifts.reduce((acc, gift) => acc + gift.dropRate, 0);
  let randomNumber = Math.random() * totalWeight;

  for (let i = 0; i < gifts.length; i++) {
    if (randomNumber < gifts[i].dropRate) {
      return gifts[i];
    } else {
      randomNumber -= gifts[i].dropRate;
    }
  }

  return null;
}

const combineReward = (gifts) => {
  const hashMap = {}
  const newGift = [];
  for(const item of gifts) {
    if (hashMap[item._id] === undefined) {
      hashMap[item._id] = 1;
      newGift.push(item);
      continue;
    } 
    hashMap[item._id] += 1;
    const findIndex = newGift.findIndex(data => data._id.equals(item._id));
    newGift[findIndex].quantity += 1; 
  }
  return newGift;
}

const randomGiftReward = (gifts, quantity) => {
  const list = [];
  for (let i = 0; i < quantity; i++) {
    const gift = getRandomGift(gifts);
    list.push({
      _id: gift._id,
      name: gift.name,
      description: gift.description,
      rewardType: RewardEnum.GIFT,
      intimacyPoints: gift.intimacyPoints,
      giftEmoji: gift.giftEmoji,
      quantity: 1
    })
  }
  return combineReward(list);
}

const randomSeedReward = (seeds, quantity) => {
  const list = [];
  for (let i = 0; i < quantity; i++) {
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
    list.push({
      _id: randomSeed._id,
      name: randomSeed.name,
      description: randomSeed.description,
      rewardType: RewardEnum.SEED,
      quantity: 1,
      seedInfo: randomSeed
    })
  }
  return combineReward(list);
}

const randomFarmItemReward = (farmItems, quantity) => {
  const list = [];
  for (let i = 0; i < quantity; i++) {
    const farmItem = farmItems[Math.floor(Math.random() * farmItems.length)];
    list.push({
      _id: farmItem._id,
      rewardType: RewardEnum.FARM_ITEM,
      name: farmItem.name,
      description: farmItem.description,
      quantity: 1,
      farmItemInfo: farmItem
    })
  }
  return combineReward(list);
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
  randomBetweenTwoNumber,
  mergeImages,
  convertDateTime,
  randomGiftReward,
  randomSeedReward,
  randomFarmItemReward
};