const assert = require('assert');
const { calculateRarityDistribution } = require('./rarityUtils');

function approxEqual(a,b,t=0.001){
  return Math.abs(a-b) < t;
}

function run(){
  const dist10 = calculateRarityDistribution(10);
  const total10 = Object.values(dist10).reduce((a,b)=>a+b,0);
  assert(approxEqual(total10,100));
  const dist40 = calculateRarityDistribution(40);
  const total40 = Object.values(dist40).reduce((a,b)=>a+b,0);
  assert(approxEqual(total40,100));
  console.log('Distribution level 10:', dist10);
  console.log('Distribution level 40:', dist40);
  console.log('All tests passed');
}

run();
