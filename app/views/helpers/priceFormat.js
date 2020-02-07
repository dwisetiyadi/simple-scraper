export default (num) => {
  return num.split('').reverse().join('').match(/\d{1,3}/g).join('.').split('').reverse().join('');
};