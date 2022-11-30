const formatDate = date =>{
  const Y=date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  return Y+"年"+M+"月"+D+"日"
  // return [Y,M,D].map(formatNumber).join('-')
}
const formatNumber = n=>{
  n=n.toString()
  return n[1] ? n : '0' + n
}
// let formatDate;
module.exports={
  formatDate:formatDate
}