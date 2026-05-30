export class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export class Mat3 {
  elements: number[];

  constructor() {
    // prettier-ignore
    this.elements =[
      1,0,0,
      0,1,0,
      0,0,1
    ];
  }

  mul(other: Mat3) {
    const a = this.elements;
    const b = other.elements;
    const m = new Mat3();

    m.elements[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
    m.elements[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
    m.elements[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];

    m.elements[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
    m.elements[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
    m.elements[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];

    m.elements[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
    m.elements[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
    m.elements[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];

    return m;
  }

  mulVec2(v: Vec2) {
    const newX =
      this.elements[0] * v.x + this.elements[1] * v.y + this.elements[2];
    const newY =
      this.elements[3] * v.x + this.elements[4] * v.y + this.elements[5];
    return new Vec2(newX, newY);
  }

  scale(sx: number, sy: number) {
    const m = new Mat3();
    m.elements[0] = sx;
    m.elements[4] = sy;
    return this.mul(m);
  }

  translate(tx: number, ty: number) {
    const m = new Mat3();
    m.elements[2] = tx;
    m.elements[5] = ty;
    return this.mul(m);
  }

  rotate(angle: number) {
    const m = new Mat3();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    m.elements[0] = c;
    m.elements[1] = s;
    m.elements[3] = -s;
    m.elements[4] = c;
    return this.mul(m);
  }
}
