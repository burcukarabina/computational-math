(function (app) {
  "use strict";

  const F = () => app.Fraction;
  const clone = (m) => m.map((r) => r.slice());
  const swap = (m, i, j) => [m[i], m[j]] = [m[j], m[i]];
  const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? F().one() : F().zero()));
  const requireSquare = (m, operation) => {
    if (m.length !== m[0].length) throw new Error(`${operation} requires a square matrix.`);
  };

  function formatReplacement(target, pivot, multiplier) {
    const t = `R${target + 1}`;
    const p = `R${pivot + 1}`;
    const v = multiplier.toString();
    if (v === "1") return `${t} ← ${t} − ${p}`;
    if (v === "-1") return `${t} ← ${t} + ${p}`;
    if (v.startsWith("-")) return `${t} ← ${t} + (${v.slice(1)})${p}`;
    return `${t} ← ${t} − (${v})${p}`;
  }

  function rref(original) {
    const matrix = clone(original);
    const steps = [];
    let pivotRow = 0;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const record = (operation) => steps.push({ operation, matrix: clone(matrix) });

    for (let pivotCol = 0; pivotCol < cols && pivotRow < rows; pivotCol++) {
      let selected = pivotRow;
      while (selected < rows && matrix[selected][pivotCol].isZero()) selected++;
      if (selected === rows) continue;
      if (selected !== pivotRow) { swap(matrix, selected, pivotRow); record(`R${pivotRow + 1} ↔ R${selected + 1}`); }

      const pivot = matrix[pivotRow][pivotCol];
      if (!pivot.isOne()) {
        for (let c = 0; c < cols; c++) matrix[pivotRow][c] = matrix[pivotRow][c].divide(pivot);
        record(`R${pivotRow + 1} ← R${pivotRow + 1} / (${pivot})`);
      }

      for (let r = 0; r < rows; r++) {
        if (r === pivotRow) continue;
        const multiplier = matrix[r][pivotCol];
        if (multiplier.isZero()) continue;
        for (let c = 0; c < cols; c++) matrix[r][c] = matrix[r][c].subtract(multiplier.multiply(matrix[pivotRow][c]));
        record(formatReplacement(r, pivotRow, multiplier));
      }
      pivotRow++;
    }
    return { matrix, steps };
  }

  function determinant(original) {
    requireSquare(original, "The determinant");
    const matrix = clone(original);
    let result = F().one();
    let swaps = 0;
    for (let c = 0; c < matrix.length; c++) {
      let selected = c;
      while (selected < matrix.length && matrix[selected][c].isZero()) selected++;
      if (selected === matrix.length) return F().zero();
      if (selected !== c) { swap(matrix, selected, c); swaps++; }
      const pivot = matrix[c][c];
      result = result.multiply(pivot);
      for (let r = c + 1; r < matrix.length; r++) {
        if (matrix[r][c].isZero()) continue;
        const multiplier = matrix[r][c].divide(pivot);
        for (let k = c; k < matrix.length; k++) matrix[r][k] = matrix[r][k].subtract(multiplier.multiply(matrix[c][k]));
      }
    }
    return swaps % 2 ? result.negate() : result;
  }

  function inverse(original) {
    requireSquare(original, "Finding an inverse");
    const n = original.length;
    const left = clone(original);
    const right = identity(n);
    for (let c = 0; c < n; c++) {
      let selected = c;
      while (selected < n && left[selected][c].isZero()) selected++;
      if (selected === n) throw new Error("This matrix is singular, so it does not have an inverse.");
      if (selected !== c) { swap(left, selected, c); swap(right, selected, c); }
      const pivot = left[c][c];
      for (let k = 0; k < n; k++) { left[c][k] = left[c][k].divide(pivot); right[c][k] = right[c][k].divide(pivot); }
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const multiplier = left[r][c];
        if (multiplier.isZero()) continue;
        for (let k = 0; k < n; k++) {
          left[r][k] = left[r][k].subtract(multiplier.multiply(left[c][k]));
          right[r][k] = right[r][k].subtract(multiplier.multiply(right[c][k]));
        }
      }
    }
    return right;
  }

  function characteristicCoefficients(m) {
    requireSquare(m, "The characteristic polynomial");
    const n = m.length;
    if (n > 3) throw new Error("Characteristic polynomial is currently supported for matrices up to 3 × 3.");
    if (n === 1) return [F().one(), m[0][0].negate()];
    if (n === 2) {
      const [a, b] = m[0], [c, d] = m[1];
      return [F().one(), a.add(d).negate(), a.multiply(d).subtract(b.multiply(c))];
    }
    const a=m[0][0], b=m[0][1], c=m[0][2], d=m[1][0], e=m[1][1], f=m[1][2], g=m[2][0], h=m[2][1], i=m[2][2];
    const trace = a.add(e).add(i);
    const second = a.multiply(e).subtract(b.multiply(d)).add(a.multiply(i).subtract(c.multiply(g))).add(e.multiply(i).subtract(f.multiply(h)));
    return [F().one(), trace.negate(), second, determinant(m).negate()];
  }

  const evaluate = (coeffs, x) => coeffs.reduce((acc, c) => acc.multiply(x).add(c), F().zero());
  function syntheticDivide(coeffs, root) {
    const q = [coeffs[0]];
    for (let i = 1; i < coeffs.length - 1; i++) q.push(coeffs[i].add(q[i - 1].multiply(root)));
    const rem = coeffs.at(-1).add(q.at(-1).multiply(root));
    if (!rem.isZero()) throw new Error("Polynomial division produced a nonzero remainder.");
    return q;
  }
  const gcd = (a,b) => { a=a<0n?-a:a; b=b<0n?-b:b; while(b!==0n)[a,b]=[b,a%b]; return a; };
  const lcm = (a,b) => a===0n||b===0n ? 0n : (a/gcd(a,b))*b;
  function divisors(v) {
    const n=v<0n?-v:v; if(n===0n)return[0n]; const out=[];
    for(let d=1n;d*d<=n;d++) if(n%d===0n){out.push(d);if(n/d!==d)out.push(n/d);} return out;
  }
  function findRoot(coeffs) {
    let common=1n; coeffs.forEach(c=>common=lcm(common,c.denominator));
    const ints=coeffs.map(c=>c.numerator*(common/c.denominator));
    if(ints.at(-1)===0n)return F().zero();
    for(const p of divisors(ints.at(-1))) for(const q of divisors(ints[0])) {
      const r=new (F())(p,q); if(evaluate(coeffs,r).isZero())return r; if(evaluate(coeffs,r.negate()).isZero())return r.negate();
    }
    return null;
  }
  function factor(coeffs) {
    let work=coeffs.slice(); const roots=[];
    while(work.length>2){const r=findRoot(work);if(r===null)break;roots.push(r);work=syntheticDivide(work,r);}
    return { roots, remainder: work };
  }

  app.core = { requireSquare, rref, determinant, inverse, characteristicCoefficients, factor };
})(window.MatrixCalculatorApp = window.MatrixCalculatorApp || {});
