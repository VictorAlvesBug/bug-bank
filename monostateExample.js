var myMonostateFunction = (() => { let count = 0;
     function addCount() { count += 1;
    
 } return () => { return { addCount: addCount, getCount: () => count } } })();
 const instanceA = myMonostateFunction();
 const instanceB = myMonostateFunction();
 console.log(instanceA.getCount());
 console.log(instanceB.getCount());
 instanceA.addCount();
 const instanceC = myMonostateFunction();
 console.log(instanceA.getCount());
 console.log(instanceB.getCount());
 console.log(instanceC.getCount());
