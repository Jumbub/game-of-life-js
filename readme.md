# Game of Life (JS)

[![deploy](https://github.com/Jumbub/game-of-life-js/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jumbub/game-of-life-js/actions/workflows/deploy.yml)

Conway's Game of Life, as fast as possible _without hashing_.

This repository documents transpiling (by hand) a [C++ application](https://github.com/Jumbub/game-of-speed) into TypeScript, and comparing its performance.

> At this point the C++ and TypeScript are largely identical (compare [next.ts](https://github.com/Jumbub/game-of-life-js/blob/readme/src/logic/next.ts) with [next.cpp](https://github.com/Jumbub/game-of-speed/blob/main/src/logic/next.cpp))

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

Currently most optimal with 16 workers, but I suspect that number will come back down to 4 once I've optimised more operations.

4 threads: 12.70s
8 threads: 11.74s
16 threads: 11.45s

[97067de019fc6045240d157da1ca130c77dd27dd](https://github.com/Jumbub/game-of-life-js/commit/97067de019fc6045240d157da1ca130c77dd27dd)

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

### Doing C-like integer division

[Benchmark demonstrating 4 different methods.](https://perf.link/#eyJpZCI6IjBoN2Uwa2w5ejM0IiwidGl0bGUiOiJGaW5kaW5nIG51bWJlcnMgaW4gYW4gYXJyYXkgb2YgMTAwMCIsImJlZm9yZSI6ImNvbnN0IGEgPSAyNTYxKjE0NDlcbmNvbnN0IGIgPSA0IiwidGVzdHMiOlt7Im5hbWUiOiJUZXN0IENhc2UiLCJjb2RlIjoiY29uc3QgYyA9IE1hdGguZmxvb3IoYS9iKSIsInJ1bnMiOlsxNTM2MDAwLDQ3MDAwLDQzNDMwMDAsNTQ0MDAwMCw1MTI1MDAwLDIzNTMwMDAsMjkwOTAwMCwzNzI0MDAwLDM4NDIwMDAsNDY1MTAwMCwzMjY3MDAwLDEyODUwMDAsNTM3MTAwMCwxNDUwMDAsMzkyOTAwMCw4NzkwMDAsNTA5NjAwMCw1OTY5MDAwLDIxMjEwMDAsNTQwNzAwMCw0NzUzMDAwLDUxNTQwMDAsMzEzOTAwMCwyOTM2MDAwLDE4MDcwMDAsNzUyNTAwMCwzNzI1MDAwLDM2NDgwMDAsNjY2NzAwMCw1ODExMDAwLDI0MzUwMDAsNjAxMjAwMCw1NzIwMDAsMzU1ODAwMCw2NTczMDAwLDE4MzgwMDAsNDMyNTAwMCw0MTkwMDAwLDcyMTEwMDAsODEzMDAwLDM3MTcwMDAsMjY3MjAwMCwzNDUwMDAwLDI0MjkwMDAsODE2OTAwMCwzMDgxMDAwLDI4MjAwMDAsMTA4ODAwMCwzNzQwMDAwLDE4ODcwMDAsMzMyODAwMCw4MjgwMDAsMzIxMjAwMCwyNjg5MDAwLDQ0MDEwMDAsMTc0NjAwMCw2MzE5MDAwLDU5OTMwMDAsNjIwMDAsNTM1MTAwMCw0MTQzMDAwLDM1NzIwMDAsNzgzMDAwLDkwMDAwLDM3MjQwMDAsMzQyNjAwMCwzMjg4MDAwLDY2NjYwMDAsNTkxNDAwMCw2NTY3MDAwLDE1MTAwMDAsNjkxMzAwMCw4MDQwMDAsMjI5NDAwMCwxMzgwMDAsNTc2ODAwMCw3MDAwMCw4MjgxMDAwLDQ1MDAwMDAsMzUwNjAwMCwxMDQyMDAwLDM0NTUwMDAsMzYxNzAwMCw2NjY2MDAwLDUyNzMwMDAsNjI4OTAwMCw1MTUxMDAwLDMyMjEwMDAsMzk0MDAwLDIwMjQwMDAsNjU0OTAwMCw1NDkwMDAwLDc2NzIwMDAsNjI3NzAwMCwyMTc5MDAwLDY2NjcwMDAsNTczMDAwLDY0MDMwMDAsMzMxNTAwMCw0OTgwMDAwXSwib3BzIjozNzYzMDcwfSx7Im5hbWUiOiJUZXN0IENhc2UiLCJjb2RlIjoiY29uc3QgYyA9IHBhcnNlSW50KGEvYikiLCJydW5zIjpbMjg1MTAwMCwxMjAyMDAwLDQ1MzYwMDAsNDA4MDAwMCw3MDE1MDAwLDM0NDIwMDAsMTA1MzAwMCwzMzk3MDAwLDcxOTMwMDAsNDA5NTAwMCwyMDQ5MDAwLDYzMzUwMDAsNzM5MzAwMCwxNDk1MDAwLDI0NzcwMDAsNzM5MzAwMCwzODk5MDAwLDYxMTUwMDAsMTkwMDAsMzE4MDAwLDY2NDYwMDAsNzM5MzAwMCw1MjQyMDAwLDY1MDcwMDAsMzk3NzAwMCwyOTgyMDAwLDEyMjEwMDAsMjEwNzAwMCw3MTQwMDAwLDUwMjkwMDAsMzQxMDAwMCwyNzMzMDAwLDEzMzAwMCw2MDIwMDAwLDYwNDgwMDAsMjQ2MTAwMCw0NjM5MDAwLDE1MDcwMDAsNTk4NzAwMCwyMTc4MDAwLDM4MzQwMDAsMTI4MTAwMCw4NzEwMDAsNTEwNDAwMCwzMjcwMDAwLDMwMjYwMDAsNDYzMDAwLDQzMDcwMDAsNDA1ODAwMCw3MDY0MDAwLDI2NDEwMDAsODM3MDAwLDY1MzIwMDAsMTMwMDAwLDIyODQwMDAsMTI0ODAwMCw0MDQxMDAwLDYxNjUwMDAsMjEzNTAwMCwxOTYzMDAwLDM4MzAwMCw0ODUzMDAwLDE3NTAwMDAsMTgxMDAwLDY2MzcwMDAsMTEzNDAwMCw3NzA2MDAwLDMwMzAwMDAsNTQ0NzAwMCwzOTgxMDAwLDE1OTAwMCwzMjM5MDAwLDczOTMwMDAsNzM4OTAwMCw1NDQ1MDAwLDM1NDMwMDAsMjcwMzAwMCwzODcxMDAwLDcxOTMwMDAsMjgwMjAwMCwyNjkwMDAsMzU3NDAwMCw4MTc3MDAwLDczOTMwMDAsNjYyNDAwMCw1Mjk2MDAwLDM2NTYwMDAsNjYxNzAwMCw2MjAwMDAsMTkxMzAwMCwyMjY4MDAwLDY1MjAwMCw3MzkzMDAwLDQzNzIwMDAsNjQ1MDAwMCwxMTI3MDAwLDIxNDIwMDAsMTExODAwMCw1OTU3MDAwLDIxNTkwMDBdLCJvcHMiOjM3NzU4NzB9LHsibmFtZSI6IlRlc3QgQ2FzZSIsImNvZGUiOiJjb25zdCBjID0gKGEvYil8MCAvLyBEb2VzIG5vdCBhbHdheXMgcHJvZHVjZSBjb3JyZWN0IHJlc3VsdCIsInJ1bnMiOlsyNjgwMDAwLDE1OTAwMCw3MjcwMDAsNzY0ODAwMCw0MDYxMDAwLDg1MzAwMCw3NjAzMDAwLDI4MDgwMDAsMjU1OTAwMCwyMzg5MDAwLDUwNzcwMDAsOTkzMDAwLDI5MjMwMDAsMzAzMDAwMCwyNzc5MDAwLDc4NjYwMDAsMzEzNTAwMCw2MTA2MDAwLDEzNDkwMDAsMTk3NjAwMCwxNTA1MDAwLDEyMjYwMDAsNjM3MDAwMCwyMDQzMDAwLDI3MDAwLDM0NjUwMDAsNTQzMDAwMCwxMTIxMDAwLDgyMTYwMDAsODYxMjAwMCwyNTc5MDAwLDMwNDcwMDAsNzU0NTAwMCw2NDU0MDAwLDU4NjkwMDAsNzEzNTAwMCw2MTA0MDAwLDE4NzAwMDAsNTExODAwMCwyODQ2MDAwLDgyMTgwMDAsNDE2NjAwMCw3MDAwLDM4NDMwMDAsNTg5NzAwMCwyNzc5MDAwLDI3MTYwMDAsMjg3MDAwMCw0NTE3MDAwLDcwMzkwMDAsNTg4MzAwMCw3OTg3MDAwLDU4MzEwMDAsNzc2MDAwMCwzNzc2MDAwLDM3MDQwMDAsNjg0NTAwMCw2NjE3MDAwLDc3MDAwLDI5MzkwMDAsNDI0OTAwMCwzOTYzMDAwLDc2ODcwMDAsODI5NzAwMCwxNzI2MDAwLDI1MjQwMDAsODc0OTAwMCwxMzAyMDAwLDM5MzAwMCw2NDgwMDAwLDU0MzAwMDAsNDU3NTAwMCw2MzQwMDAwLDY0NzIwMDAsODI5NzAwMCw1NjUxMDAwLDM1NTMwMDAsMzM0NzAwMCwzNzIwMDAsNjQ4NDAwMCwzNzIzMDAwLDEzNDYwMDAsMzI3NzAwMCwxNDgzMDAwLDE3NDUwMDAsNDM3NzAwMCwxMTMxMDAwLDY5MzIwMDAsOTM0MDAwLDYwMDAwLDY0MjMwMDAsMTYyNjAwMCw2MTY1MDAwLDgzMzAwMCw1ODYyMDAwLDY5NjkwMDAsNjAyNDAwMCw3MTc5MDAwLDY0NTQwMDAsMTY3NTAwMF0sIm9wcyI6NDE2ODgzMH0seyJuYW1lIjoiRmluZCBpdGVtIDEwMCIsImNvZGUiOiJjb25zdCBjID0gfn4oYS9iKSAvLyBEb2VzIG5vdCBhbHdheXMgcHJvZHVjZSBjb3JyZWN0IHJlc3VsdCIsInJ1bnMiOlszNTYwMDAwLDcxNjAwMCwyMzA3MDAwLDYyMzAwMDAsNDk2MTAwMCwxMzUxMDAwLDE4NDYwMDAsNTg3NDAwMCwyNzY5MDAwLDU1OTgwMDAsNzk1MDAwLDIxOTYwMDAsODUwMDAsNTQyOTAwMCwxOTE3MDAwLDQ5OTgwMDAsMzM2OTAwMCw2OTYzMDAwLDQ1MTkwMDAsMTU5MTAwMCwxNTM0MDAwLDU1NDAwMCwxMDQ0MDAwLDc3MjQwMDAsMzEwMDAwLDY1NDAwMDAsNDAxMDAwLDM2MjgwMDAsNDkxODAwMCw0OTA2MDAwLDM0MzIwMDAsMzgzMjAwMCw4NDgwMDAsNTc3MTAwMCwxNjUwMDAsMzcxMDAwLDI3NjcwMDAsNDc2OTAwMCw3NDg3MDAwLDU5MTcwMDAsMzc4NjAwMCwyNzg2MDAwLDIwNTMwMDAsODg4NjAwMCw3NDU1MDAwLDM5ODUwMDAsMTg5OTAwMCwyNjgzMDAwLDU0NjUwMDAsNDYyMjAwMCwyMzMwMDAwLDMzMTQwMDAsNTYwMDAwMCwzMzgyMDAwLDQ1MjgwMDAsMjM1OTAwMCwzMjAzMDAwLDYyOTAwMDAsNzQwMDAsNDM2NTAwMCwxNTA2MDAwLDEzMjkwMDAsNTcxMDAwMCwyNTQwMDAwLDU3OTgwMDAsODEzMjAwMCw1NzQyMDAwLDk5NDAwMCw4MDAwLDIzNDAwMDAsNTU0MDAwLDc0NzgwMDAsNTA2MDAwMCwyOTI1MDAwLDIwMjkwMDAsNTkxMzAwMCw0MTAwMDAsMjE1NzAwMCwxOTg5MDAwLDY3OTUwMDAsODEzMjAwMCw0OTU5MDAwLDMzMDMwMDAsNTg2NjAwMCwyMTcwMDAwLDc2MzQwMDAsNTM5NzAwMCw2ODIwMDAsMTQwNDAwMCwyNzAzMDAwLDU0NzAwMCwxNjcwMDAwLDg2MjYwMDAsMzE0NjAwMCw1NjY5MDAwLDY0MzkwMDAsMTE5MjAwMCwzMTA4MDAwLDY3MDMwMDAsMzk4MDAwXSwib3BzIjozNjIyMTQwfV0sInVwZGF0ZWQiOiIyMDIyLTAzLTI2VDA2OjI0OjAyLjA4M1oifQ%3D%3D)

> Results are not consistent enough to make any bold claims about speed, but they're worth considering

### Casting from String 1s and 0s to Numbers

[Benchmark demonstrating ways of casting from an array of string 1s or 0s.](https://perf.link/#eyJpZCI6InUzeXptZW8zZWF1IiwidGl0bGUiOiJGaW5kaW5nIG51bWJlcnMgaW4gYW4gYXJyYXkgb2YgMTAwMCIsImJlZm9yZSI6ImNvbnN0IGRhdGEgPSBbLi4uQXJyYXkoMTAwMDApLmtleXMoKV0ubWFwKGkgPT4gU3RyaW5nKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSkpKSIsInRlc3RzIjpbeyJuYW1lIjoiRmluZCBpdGVtIDEwMCIsImNvZGUiOiJkYXRhLm1hcCh4ID0%2BIHggPT09ICcxJyA%2FIDEgOiAwKSIsInJ1bnMiOlsyMTY2LDM4MzMsMzgzMyw1MzMzLDU4MzMsNTY2Niw1ODMzLDMxNjYsMzgzMyw0MzMzLDQ1MDAsNTUwMCw1ODMzLDMzMzMsNTMzMyw1NTAwLDU1MDAsNjAwMCw1MDAwLDQxNjYsNjUwMCw2MTY2LDU4MzMsNTMzMyw1MTY2LDYzMzMsNDgzMyw1NTAwLDUwMDAsNTAwMCwzMDAwLDUzMzMsNTY2NiwzNTAwLDM2NjYsNTgzMyw1MzMzLDUwMDAsNDUwMCw0MzMzLDU1MDAsNTY2Niw2NTAwLDI4MzMsNTgzMyw0MTY2LDYxNjYsNjMzMyw1MTY2LDM4MzMsNjUwMCwzMzMzLDM4MzMsNTAwMCwyODMzLDU1MDAsNDE2Niw2MTY2LDU1MDAsNTMzMyw1MTY2LDQwMDAsNDY2Niw1MTY2LDM1MDAsNTUwMCw2MzMzLDM2NjYsNDgzMyw1NjY2LDYwMDAsNDAwMCw0ODMzLDYzMzMsNTUwMCw2MTY2LDE1MDAsNTMzMywxNTAwLDU2NjYsNTAwMCw1MDAwLDUwMDAsNjAwMCw1MzMzLDUwMDAsNTUwMCw2MTY2LDM4MzMsMzY2Niw2NTAwLDY1MDAsNTAwMCw1NTAwLDQ1MDAsNTY2Niw0MDAwLDQ2NjYsNTE2Niw1NjY2XSwib3BzIjo0OTU0fSx7Im5hbWUiOiJGaW5kIGl0ZW0gMjAwIiwiY29kZSI6ImRhdGEubWFwKHggPT4gTnVtYmVyKHgpKSIsInJ1bnMiOlsyODMzLDQwMDAsNTY2Niw3MTY2LDY2NjYsNjMzMyw1ODMzLDYzMzMsNTY2Niw1MzMzLDYwMDAsNDgzMyw2MzMzLDQzMzMsNTY2Niw2MzMzLDU1MDAsNTE2Niw2MDAwLDUxNjYsNjMzMyw1NTAwLDQzMzMsNTY2Niw0MzMzLDQxNjYsNjE2Niw1MzMzLDUwMDAsNTUwMCw1NTAwLDU1MDAsNTAwMCw1NjY2LDY4MzMsNTMzMyw0ODMzLDU4MzMsNzAwMCw2MzMzLDY2NjYsNjMzMyw2MDAwLDUwMDAsNjE2Niw2ODMzLDY2NjYsNjUwMCw1MDAwLDYwMDAsNjAwMCw0MDAwLDU1MDAsNTUwMCw2MzMzLDYxNjYsNzAwMCw3MDAwLDUwMDAsNjAwMCw0ODMzLDYwMDAsNTY2Niw1MTY2LDYxNjYsNzE2Niw2MzMzLDI4MzMsNjMzMyw2MTY2LDc1MDAsMTE2Niw1MTY2LDU2NjYsNjE2Niw2MzMzLDUwMDAsNDE2Niw1MTY2LDY1MDAsNTE2Niw1NTAwLDY2NjYsNTUwMCw3MTY2LDUwMDAsNDY2Niw1NTAwLDYxNjYsNDAwMCw2MTY2LDE1MDAsNjgzMyw2MDAwLDYxNjYsNTgzMyw2MTY2LDYzMzMsNTAwMCw2ODMzXSwib3BzIjo1NjI2fSx7Im5hbWUiOiJGaW5kIGl0ZW0gNDAwIiwiY29kZSI6ImRhdGEubWFwKHggPT4gcGFyc2VJbnQoeCkpIiwicnVucyI6WzIxNjYsNTAwMCw2MzMzLDYwMDAsNjUwMCw1NjY2LDQ4MzMsNTMzMyw0MDAwLDUzMzMsNTUwMCw3MTY2LDU2NjYsNzAwMCwzNTAwLDY2NjYsNjY2Niw2MTY2LDYxNjYsNjUwMCw2MDAwLDUwMDAsNzY2Niw0ODMzLDQ1MDAsNTY2Niw2MzMzLDYwMDAsNTAwMCwzMzMzLDY2NjYsMTUwMCw1ODMzLDY4MzMsNjE2Niw0MzMzLDYxNjYsNjMzMyw3MTY2LDQ2NjYsNzE2Niw1NTAwLDUwMDAsNTMzMyw2NTAwLDcwMDAsNjgzMyw2NTAwLDUzMzMsNTY2Niw1MDAwLDYwMDAsNjMzMyw1MTY2LDUzMzMsNDgzMyw2MzMzLDY2NjYsNTMzMyw2ODMzLDYzMzMsNjgzMyw2NTAwLDQ4MzMsNjE2Niw1MzMzLDY1MDAsNTAwMCw2MDAwLDc1MDAsNzE2Niw0MzMzLDYzMzMsNTUwMCw1MTY2LDQwMDAsNzAwMCw2NTAwLDQ4MzMsNTgzMyw2ODMzLDYxNjYsNTMzMyw2NTAwLDY2NjYsNjAwMCw3MzMzLDQ1MDAsNDMzMyw2ODMzLDY1MDAsNjE2Niw1NTAwLDM4MzMsNTAwMCw3MTY2LDY1MDAsNTgzMyw2NjY2LDYwMDBdLCJvcHMiOjU3ODF9XSwidXBkYXRlZCI6IjIwMjItMDMtMjZUMTA6NTM6MjUuNDI3WiJ9)

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

> Note: `data` is now an array buffer of length 0

2) Pass by reference

```
const data = new SharedArrayBuffer(1024)
postMessage({data})
```

> Note: ["a side effect to the block in one agent will **eventually** become visible in the other agent"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#allocating_and_sharing_memory)

### SharedArrayBuffer restrictions

In Chrome, this feature requires the page is loaded with the following headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### The mouse matters

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

> Disabling the mouse listeners in `mouse.ts` had no noticable effect on the results

Doing these tests again [now](https://github.com/Jumbub/game-of-life-js/commit/09e3a15157109f31dac01818aa38efd011938f46), yields a boring new set of results.

~time | mouse state | mouse over
--- | --- | ---
3.0s | moving | chrome window
3.0s | moving | devtools window
2.7s | moving | random window
2.5s | still | chrome window
2.5s | still | random window
2.5s | still | devtools window

I can re-produce the issues with the older commit, and can mitigate them by opening a Guest session in Chrome.

### Chrome user matters

Running benchmarks as the "guest" account will mean you don't have any extensions running in the background, affecting your performance.

On my primary account I was getting a consistent 4.95s (±0.05s), but on the guest account I got 4.85s (±0.05s).

I have quite a few extensions - AdBlock, Bitwarden, Honey, Javascript Switcher, Vimium, React dev tools - did not spend the time to find a specific culprit - I assume this would be the culprit, but I can't be sure.

Disabling all extensions knocked me down to a 4.89s (which I got 4 times in a row), but that still didn't match the performance of the guest account.

### Message via atomics

Communication comparisson between `postMessage` vs `Atomics.notify`

https://github.com/Jumbub/game-of-life-js/compare/2ed12fd...9a52f8e

Messaging is 3.8s, atomics are 3.6s

### Burn legacy files

For some reason, without doing an `rm -rf dist .parcel-cache` before every build, Chrome was still retrieving legacy JS bundles.

This is definitely a cause of a lot of weird benchmark issues, so was a pain to find.

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
