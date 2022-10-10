let A = [1,2,3,4,5]
let B = [2,3,4,5,7,8]


A.forEach((item,index) => {
  if(B.indexOf(item) === -1) {
    A.splice(index,1)
  }
})

B.forEach(item => {
  if (A.indexOf(item) === -1) {
    A.push(item)
  }
})

console.log(A);