export const littleEndian = () => {
  var b = new ArrayBuffer(4);
  var a = new Uint32Array(b);
  var c = new Uint8Array(b);
  a[0] = 0xdeadbeef;
  return c[0] == 0xef;
};
