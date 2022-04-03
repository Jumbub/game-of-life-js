# Game of Life (JS)

[![deploy](https://github.com/Jumbub/game-of-life-js/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jumbub/game-of-life-js/actions/workflows/deploy.yml)

Conway's Game of Life, as fast as possible _without hashing_.

This repository documents transpiling (by hand) a [C++ application](https://github.com/Jumbub/game-of-speed) into TypeScript, and comparing its performance.

> At this point the C++ and TypeScript is largely very similar (compare [next.ts](https://github.com/Jumbub/game-of-life-js/blob/main/src/logic/next.ts) with [next.cpp](https://github.com/Jumbub/game-of-speed/blob/main/src/logic/next.cpp))

- [Demo app - https://gameoflife.jamiebray.me](https://gameoflife.jamiebray.me/index.html)
- [Run the benchmark - https://gameoflife.jamiebray.me/benchmark/index.html](https://gameoflife.jamiebray.me/benchmark/index.html)
- [Log of benchmark improvements](#log-of-benchmark-improvements)
- [Interesting findings](#interesting-findings)

<br/>

## Gettings started

`npm install`

`npm run build`

`npm run serve`

### Run demo [(live)](https://gameoflife.jamiebray.me/index.html)

http://localhost:8080/

### Run benchmark [(live)](https://gameoflife.jamiebray.me/benchmark/index.html)

http://localhost:8080/benchmark/

### Run tests [(live)](https://gameoflife.jamiebray.me/test/index.html)

http://localhost:8080/test/

### Run benchmark flag permutation testing [(live)](https://gameoflife.jamiebray.me/benchmark/all/index.html)

http://localhost:8080/benchmark/all

<br/>

## Log of benchmark improvements

### First working benchmark (75s)

Naive and simple manual transpilation of the [C++ implementation](https://github.com/Jumbub/game-of-speed) to Typescript, without any advanced Javascript (typed arrays, workers, etc).

[c15cae4d00beb59f5e6e50f495a323eca3f24eb5](https://github.com/Jumbub/game-of-life-js/commit/9227c6a55ede200a1b6fe827c93010963e704f3d)

### Use smaller typed arrays for skip cells (53s)

First attempt at using typed arrays, using Uint8Arrays to store the skip data.

[01c5c850ccef4075d01441983a55cae6aa127c2a](https://github.com/Jumbub/game-of-life-js/commit/01c5c850ccef4075d01441983a55cae6aa127c2a)

### Use smaller typed arrays for data cells (37s)

Use Uint8Array's for storing state of a cell, then create the Uint32Array required for rendering at render time.

This benchmark also adds a requirement that the renders per second never drops below 29.97.

[1263580a75a6ac861616411fddc1a9605e995292](https://github.com/Jumbub/game-of-life-js/commit/1263580a75a6ac861616411fddc1a9605e995292)

### Moving the computation into a worker (28s)

Create a single worker which listens for computation requests from the primary thread.

[13ce69fd81bf3b28271993629645bef6896d78b4](https://github.com/Jumbub/game-of-life-js/commit/13ce69fd81bf3b28271993629645bef6896d78b4)

### Move the computation loop into a dedicated worker (19s)

Create a dedicated worker for running the loop.

Allowing the computation scheduling to run synchronously (removed `setTimeout(job, 0)`).

[e67e46a797115aca4bd168210c0201507baa9c41](https://github.com/Jumbub/game-of-life-js/commit/e67e46a797115aca4bd168210c0201507baa9c41)

### Mutiple workers computing simultaneously (12s)

Currently most optimal with 16 workers, but I suspect that number will come back down* to 4 once I've optimised more operations.

4 threads: 12.70s
8 threads: 11.74s
16 threads: 11.45s

[97067de019fc6045240d157da1ca130c77dd27dd](https://github.com/Jumbub/game-of-life-js/commit/97067de019fc6045240d157da1ca130c77dd27dd)

> *it did come back down; performance is optimal with 4 workers [now](36896e15343ad3bfb2e582ce7549a70e8b032056)

### Mutiple workers computing simultaneously (11.8s)

Wait for workers to mark themselves as "ready" before starting computations.

[e19df8b319c81b59b05933bd3a60cf74d3b0b9fb](https://github.com/Jumbub/game-of-life-js/commit/e19df8b319c81b59b05933bd3a60cf74d3b0b9fb)

### Using Atomics to communicate, rather than messages (13.5s)

~The improvement is quite small, but is consistently faster than messaging.~

For some reason I thought this was running faster than the previous commit, but when re-running these benchmarks it is clearly much slower.

[301c1fb959d2d438fc6d6c8dfe0111e11821b39c](https://github.com/Jumbub/game-of-life-js/commit/301c1fb959d2d438fc6d6c8dfe0111e11821b39c)

### Re-use ImageData between frames (12s)

Unecessary memory allocation every render

[79ff8a0d170bc0e54ef6ce16f08267560fbf1180](https://github.com/Jumbub/game-of-life-js/commit/79ff8a0d170bc0e54ef6ce16f08267560fbf1180)

### Blocking while loop in worker (9.2s)

Replace timers with blocking while loop

[1f72fc965fcce195282dc0b99bc171401eb7f877](https://github.com/Jumbub/game-of-life-js/commit/1f72fc965fcce195282dc0b99bc171401eb7f877)

### Skip faster (8.3s)

Increase skip multiplyer from 2 to 8

[ce1c2e532af3341120efb258419cae4cde97a198](https://github.com/Jumbub/game-of-life-js/commit/ce1c2e532af3341120efb258419cae4cde97a198)

### Mess of changes un-tidily committed (6.4s)

Don't bother calling `requestAnimationFrame`, more atomic communication, modifying thread & job counts, remove sleeps, do work on primary thread.

### Multi threaded array fill (5s)

Perform the `.fill` operation simultaneously on multiple threads for the skip array.

[e3d355ea2669daf6adfad30a582df510346a0adf](https://github.com/Jumbub/game-of-life-js/commit/e3d355ea2669daf6adfad30a582df510346a0adf)

### Bundler (3.8s)

Move to the Parcel bundler.

I'm not exactly sure what's making this so much faster. Building with `--no-optimizations` is the same performance.

Could it be that there are less files to download?

Could it be that the way Parcel handles modules is faster?

Could it be that the JS optimization engine handles bundled JS better?

[e082d72212f74a69f742b2344681b6c174016e00](https://github.com/Jumbub/game-of-life-js/commit/e082d72212f74a69f742b2344681b6c174016e00)

### Changing the title is slow (3.7s)

Consistently getting a 2-3% increase in performance by not modifying the title on every render.

I noticed this because there was a linear increase in "Node" memory usage, which dissapeared after changing the title.

[824092fba80eed0546fde1f77142580844adc340](https://github.com/Jumbub/game-of-life-js/commit/824092fba80eed0546fde1f77142580844adc340)

### Delete duplicate operations (3.4s)

Free performance by removing 3 lines which were doing unecessary, duplicate writes.

[09a1a0a2d68ba6bb7f7915fcbb57f482900f1069](https://github.com/Jumbub/game-of-life-js/commit/09a1a0a2d68ba6bb7f7915fcbb57f482900f1069)

### Batch non-skippables (3.2s)

First real deviation from the original C++ algorithm, we are batching non-skippable operations because unlike C++ we cannot do a `reinterpret_cast` to bitshift over our reads.

[b6f8ba9b099f1b75d5bd7f54d9e508246e05be42](https://github.com/Jumbub/game-of-life-js/commit/b6f8ba9b099f1b75d5bd7f54d9e508246e05be42)

### Branch removal (3.05s)

Do some pre-processing until our iterator `i` lines up with a value which supports less branching code.

[efd5de3597d30e6a6fd7334597b45d60b698600b](https://github.com/Jumbub/game-of-life-js/commit/efd5de3597d30e6a6fd7334597b45d60b698600b)

### Mod operator removal (2.95s)

```
-   do {
-     ...
-   } while (i % SKIP_MULTIPLYER !== 0 && i < endI);

+   for (let r = 0; r < SKIP_MULTIPLYER && i < endI; r++) {
+     ...
+   }
```

[cbf13e3a6ac330f8174d52bca7f5ddb5a51e6da8](https://github.com/Jumbub/game-of-life-js/commit/cbf13e3a6ac330f8174d52bca7f5ddb5a51e6da8)

### Simplify non-skippable batching (2.85s)

```
-    for (let r = 0; r < SKIP_MULTIPLYER && i < endI; r++) {
+    const tilI = Math.min(i + SKIP_MULTIPLYER, endI);
+    while (i < tilI) {
```

[575ebd26e88d22902e9c4c509fc8a76b52fcc1b5](https://github.com/Jumbub/game-of-life-js/commit/575ebd26e88d22902e9c4c509fc8a76b52fcc1b5)

### Remove now unecessary floor operation (2.75s)

```
-    while (inSkip[~~(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;
+    while (inSkip[i / SKIP_MULTIPLYER]) i += SKIP_MULTIPLYER;
```

[e37da62550e34ac0c425ef78647db95345c73d03](https://github.com/Jumbub/game-of-life-js/commit/e37da62550e34ac0c425ef78647db95345c73d03)

### Local reference to Math.min (2.65s)

A simple `const min = Math.min` outside the scope of the board operator was a great performance improvement.

[545195cc7f058f7e577207ac6783e2b3d215ecde](https://github.com/Jumbub/game-of-life-js/commit/545195cc7f058f7e577207ac6783e2b3d215ecde)

### Assignment as an expression ain't bad after all (2.55s)

```
-      output[i] = isAlive(i, input, width);
-      if (input[i] !== output[i]) revokeSkipForNeighbours(i, outSkip, width);
+      if (input[i] !== (output[i] = isAlive(i, input, width))) revokeSkipForNeighbours(i, outSkip, width);
```

[1f1d08cd5bea5a08e1150e298ad6a912289cba9b](https://github.com/Jumbub/game-of-life-js/commit/1f1d08cd5bea5a08e1150e298ad6a912289cba9b)

<br/>

## Interesting findings

### Sharing data with workers

When sending messages to workers, you have 3 options.

1) Pass by copy

```
const data = new ArrayBuffer(1024)
postMessage({data})
```

2) Pass by reference & transfer ownership

```
const data = new ArrayBuffer(1024)
postMessage({data}, [data])
```

> Note: the value of `data` is mutated by `postMessage` to revoke access (sendee now holds an empty array)

3) Pass by reference

```
const data = new SharedArrayBuffer(1024)
postMessage({data})
```

> Note: to combat race conditions, you can use [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)

### SharedArrayBuffer

In Chrome, the `SharedArrayBuffer` is only available to a page served with the following headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Chrome extensions stealing performance

During this [commit](https://github.com/Jumbub/game-of-life-js/commit/09e3a15157109f31dac01818aa38efd011938f46),
I came to the realisation that the position of the mouse had a dramatic impact on app performance.

~time | mouse state | mouse over
--- | --- | ---
6.7s | moving | chrome window
5.8s | still | chrome window
5.6s | moving | devtools window
5.2s | moving | random window
4.96s | still | devtools window
4.96s | still | random window

> Disabling the mouse listeners in `mouse.ts` had no measurable effect on the results

Later on, during this [commit](https://github.com/Jumbub/game-of-life-js/commit/353d0caf2ef05bda7c8401b3553a3822a0adc5a7),
I decided to re-run these tests, and found that there was no longer a gap in "still mouse" performance.

~time | mouse state | mouse over
--- | --- | ---
3.0s | moving | chrome window
3.0s | moving | devtools window
2.7s | moving | random window
2.5s | still | chrome window
2.5s | still | random window
2.5s | still | devtools window

Being curious, I re-ran the tests on the old commit; and I was still getting crazy results.

So I re-tested the old commit on a Guest account - voila! No more performance issues.

This implied to me that an extension was miss-behaving; so I ran the tests again, but with only a single extension enabled at a time.

~time | enabled extension
--- | ---
4.85s | -
4.93s | adblock
4.95s | honey
5.70s | bitwarden

Found the culprit. Yikes.

After some digging, I realised that the Bitwarden was listening to document title changes, because after removing them, performance was back to base.

This is why it wasn't an issue anymore, because I deleted title changes back in this [commit](https://github.com/Jumbub/game-of-life-js/commit/824092fba80eed0546fde1f77142580844adc340), and now I understand why that change had such a big impact.

### Message via atomics

Communication comparisson between `postMessage` vs `Atomics.notify`

https://github.com/Jumbub/game-of-life-js/compare/2ed12fd...9a52f8e

Messaging is 3.8s, atomics are 3.6s

### Fastest min

[context & fastest solution](https://github.com/Jumbub/game-of-life-js/commit/545195cc7f058f7e577207ac6783e2b3d215ecde)

```
// 2.90s
const tilI = (i + SKIP_MULTIPLYER > endI) * endI + (i + SKIP_MULTIPLYER <= endI) * (i + SKIP_MULTIPLYER);

// 2.75s
let tilI = i + SKIP_MULTIPLYER;
if (tilI > endI) tilI = endI;

// 2.72s
const tilI = Math.min(i + SKIP_MULTIPLYER, endI);

// 2.68s
const min = Math.min // outside loop
...
const tilI = min(i + SKIP_MULTIPLYER, endI);
```

### Fastest floor

```
// 2.95s
const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  const floor = Math.floor;
  outSkip[floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

// 2.84s
const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[Math.floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

// 2.78s
const floor = Math.floor;
const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

// 2.75
const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number, floor: typeof Math.floor) => {
  outSkip[floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

// 2.55s
const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[0 | ((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[0 | ((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[0 | ((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[0 | ((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[0 | ((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[0 | ((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

// 2.55s
const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[~~((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};
```
