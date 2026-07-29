(function (app) {
  "use strict";

  class Fraction {
    constructor(numerator, denominator = 1n) {
      let n = BigInt(numerator);
      let d = BigInt(denominator);
      if (d === 0n) throw new Error("A fraction cannot have denominator zero.");
      if (d < 0n) { n = -n; d = -d; }
      const g = Fraction.gcd(Fraction.absBigInt(n), d);
      this.numerator = n / g;
      this.denominator = d / g;
    }

    static absBigInt(v) { return v < 0n ? -v : v; }
    static gcd(a, b) {
      while (b !== 0n) [a, b] = [b, a % b];
      return a === 0n ? 1n : a;
    }
    static zero() { return new Fraction(0n); }
    static one() { return new Fraction(1n); }

    static parse(raw) {
      let value = String(raw ?? "").trim().replace(/\s+/g, "");
      if (value === "") return Fraction.zero();
      if (/^[+-]?\d+\/[+-]?\d+$/.test(value)) {
        const [n, d] = value.split("/");
        return new Fraction(BigInt(n), BigInt(d));
      }
      if (/^[+-]?\d+$/.test(value)) return new Fraction(BigInt(value));
      if (/^[+-]?(\d+\.\d*|\d*\.\d+)$/.test(value)) {
        let sign = 1n;
        if (value.startsWith("-")) { sign = -1n; value = value.slice(1); }
        else if (value.startsWith("+")) value = value.slice(1);
        const [whole = "0", decimal = ""] = value.split(".");
        const d = 10n ** BigInt(decimal.length);
        const n = BigInt(whole || "0") * d + BigInt(decimal || "0");
        return new Fraction(sign * n, d);
      }
      throw new Error(`Invalid entry "${raw}". Use an integer, decimal, or fraction.`);
    }

    add(o) { return new Fraction(this.numerator * o.denominator + o.numerator * this.denominator, this.denominator * o.denominator); }
    subtract(o) { return new Fraction(this.numerator * o.denominator - o.numerator * this.denominator, this.denominator * o.denominator); }
    multiply(o) { return new Fraction(this.numerator * o.numerator, this.denominator * o.denominator); }
    divide(o) {
      if (o.isZero()) throw new Error("Division by zero occurred.");
      return new Fraction(this.numerator * o.denominator, this.denominator * o.numerator);
    }
    negate() { return new Fraction(-this.numerator, this.denominator); }
    absoluteValue() { return new Fraction(Fraction.absBigInt(this.numerator), this.denominator); }
    isZero() { return this.numerator === 0n; }
    isOne() { return this.numerator === 1n && this.denominator === 1n; }
    isNegative() { return this.numerator < 0n; }
    toString() { return this.denominator === 1n ? String(this.numerator) : `${this.numerator}/${this.denominator}`; }
  }

  app.Fraction = Fraction;
})(window.MatrixCalculatorApp = window.MatrixCalculatorApp || {});
