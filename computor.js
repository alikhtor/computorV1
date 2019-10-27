const process = require('process');

const pl = process.argv.length;

function error(msg) {
  process.on('exit', () => {
    console.log(msg);
  });
  process.exit();
}

if (pl != 3) {
  error('Usage: node computor.js "[expression] = [expression]"');
}

const arr = process.argv[2].toUpperCase().split(' ').join('').split('=');
// console.log(arr);

const parseSide = function(part) {
  return part.split("-")
            .map((elem, index) => (index > 0 ? '-' : '') + elem)
            .filter(elem => elem != '')
            .map(item => item['split'].apply(item, ['+']))
            .reduce((a,b) => a.concat(b), [])
            .map(item => item['split'].apply(item, ['X']))
            .map(elem => {
              if (elem.length === 1)
                elem = [parseFloat(elem), 0];
              else if (elem.length === 2)
              {
                elem[0] = elem[0] == '-' ? '-1' : elem[0];
                elem[0] = elem[0] == '' ? 1 : parseFloat(elem[0]);
                elem[1] = elem[1] == '' ? 1 : parseInt(elem[1].substr(1));
              }
              return elem;
            });
}

const makeSimple = function(part) {
  return part.reduce((prev, curr) => {
        if (prev[curr[1]] == null)
          prev[curr[1]] = curr[0];
        else
          prev[curr[1]] += curr[0];
        return prev;
        }, [])
     .map((elem, index) => [elem, index])
     .reduce((prev, curr) => {
       if (Array.isArray(curr))
         prev.push(curr);
       return prev;
     }, []);
}

const leftTemp = makeSimple(parseSide(arr[0]));
const right = makeSimple(parseSide(arr[1]));

right.forEach(val => {
  if (val[0] === 0)
    return '';
  let position = leftTemp.findIndex(elem => elem[1] === val[1]);
  if (position < 0)
    leftTemp.push([-val[0],val[1]]);
  else
    leftTemp[position][0] -= val[0];
});

const left = leftTemp.filter(x => x[0] !== 0);

const startString = function(part) {
  if (part.length == 0)
    return '0 * X^0';
  return part[0][0] + ' * X^' + part[0][1];
}

const continueString = function(part) {
  let str = '';
  part.forEach((val, index) => {
    if (index == 0)
      return '';
    str += val[0] < 0 ? ' - ' : ' + ';
    str += val[0] < 0 ? -val[0] : val[0];
    str += ' * X^';
    str += val[1];
  });
  return str;
}

const makeString = function(part) {
  const str1 = startString(part);
  const str2 = continueString(part);
  return str1 + str2;
}


const reduced = makeString(left);

if (reduced == '0 * X^0') {
  console.log('Reduced form: 0 = 0');
  console.log('Polynomial degree: 0');
  error('The expression is equal!');
}

console.log(`Reduced form: ${reduced} = 0`);

let degree = left.reduce((prev, curr) => {
  if (curr[1] < prev)
    return prev;
  else
    return curr[1];
}, 0);

console.log(`Polynomial degree: ${degree}`);

if (degree > 2) {
  error('The polynomial degree is stricly greater than 2, I can\'t solve.');
}

const findABC = function(expression, degree) {
  const i = expression.indexOf(`X^${degree}`);
  const result = +expression[i - 2].match(/[\.0-9]+/g)[0];
  if (expression[i - 3] && expression[i - 3] === '-')
    return result * -1;
  return result;
}

const pow = function(x) {
  return x * x;
}

const sqr = function(number) {
  let sqrt = number / 2;
  let temp = 0;
  while(sqrt != temp){
      temp = sqrt;
      sqrt = ( number/temp + temp) / 2;
  }
  return sqrt;
}

const oneWay = function(ea) {
  const b = findABC(ea, 1);
  const c = findABC(ea, 0);

  process.on('exit', () => {
    console.log('The solution is:');
    console.log('' + c / b);
  });
  process.exit();
}

const twoWays = function(a, b, d) {
  result = {
    x1: 0,
    x2: 0
  }

  const tempA = a * 2;
  const tempB = b * -1;
  const tempD = sqr(d);
  const tempPlus = tempB + tempD;
  const tempMinus = tempB - tempD;
  result.x1 = tempMinus / tempA;
  result.x2 = tempPlus / tempA;
  return result;
}

function resolveDescriminant(ea) {
  const a = findABC(ea, 2);
  const b = findABC(ea, 1);
  const c = findABC(ea, 0);

  const decriminant = pow(b) - 4 * a * c;
  if (decriminant < 0) {
    error('ERROR -> Decriminant is less than zero! Expression cann\'t be solved!');
  } else if (decriminant === 0) {
    const result1 = twoWays(a, b, decriminant);
    process.on('exit', () => {
      console.log('Discriminant equals to zero, the only solution is:');
      console.log('' + result1.x1);
    });
    process.exit();
  } else {
    const result2 = twoWays(a, b, decriminant);
    process.on('exit', () => {
      console.log('Discriminant is strictly positive, the two solutions are:');
      console.log('' + result2.x1);
      console.log('' + result2.x2);
    });
    process.exit();
  }
}

const expressionArray = reduced.split(' ');

let result = null;

switch (degree) {
  case 2:
    resolveDescriminant(expressionArray);
    break;
  case 1:
    oneWay(expressionArray);
    break;
}
