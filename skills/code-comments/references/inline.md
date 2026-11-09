# Inline comments

Read this when writing a branch, a loop, a multi-step flow or temporary compatibility shim.

An inline comment answers **why** and nothing else: why written this way, why the order cannot change, why the shorter form does not work. A comment explaining what the code does gets deleted — clearer names and smaller functions do that job.

## What to write

- Workaround reason: sidestepping a bug, supporting old data, avoiding a platform difference.
- Order dependency: why these two steps cannot swap places.
- Performance tradeoff: why a hand-written loop, why compute ahead, why keep a second copy.
- Temporary compatibility: which version it supports and when it can go.
- Counter-intuitive boundaries: why this subtracts one, why empty is allowed here.

A comment sits above the line it explains, and anything past three lines usually means a function or a constant should be extracted instead.

## Numbered multi-step flows

Number the steps only when the flow has distinct phases, when the order itself is information, or when the list is unreadable without numbers. What follows a number is still the reason and the constraint, not what the step does.

- If replacing each number with plain `//` text changes nothing, drop the numbers. `// 2. iterate the list` just re-states the code with an index attached.
- If the order genuinely matters, say what breaks when it changes, as in "Order dependency" below.
- Two to four steps; beyond that, write the list once in the function header and mark only the steps inside the body that need explaining.
- Keep the numbering alive as the code changes, renumbering when a step is inserted. When you cannot keep up with that, the order was not the point — go back to plain comments.
- When each step's name would say it, extract functions: a name survives edits that numbering does not.

## Cases

Workaround
✗ `// subtract one for the index here`
✓ `// the backend id starts at 0, this converts it to the 1-based value we display`
reason: it looks like a reminder but only says what happens, not where the two sides disagree

Order dependency
✗ `// do not change the order`
✓ `// register reads the default that init writes a moment earlier, so the order cannot change`
reason: it says the order is fixed but not what breaks when it changes

Performance tradeoff
✗ `// a for loop is faster`
✓ `// runs every frame; for avoids the intermediate array map would allocate`
reason: faster is not the information — what it saves and when the conclusion stops holding are

Multi-step flow
✗ `// 1. read the device list` `// 2. split by time window` `// 3. write the results`
✓ `// 1. aggregate by device id first`
  `// 2. then split by time window: boundaries must land on the hour, the other order produces windows that span devices`
reason: numbering carries the phase split and the ordering constraint, while the code already says what each step does

Steps a name can carry
✗ `// 1. parse the arguments` `// 2. build the query` `// 3. assemble the response`
✓ extract parseInput / buildQuery / toResult, leaving only the calls in the body
reason: what a name can say does not belong in a comment, and numbering has to be maintained

Temporary compatibility
✗ `// iOS compatibility, do not delete`
✓ `// Safari 15 lacks this API; delete once the minimum version moves to 16`
reason: it reads like a reminder but never says which version it covers or when it can go

Test narration
✗ `// prepare data` `// call it` `// assert the result is 2`
✓ `// amounts are stored in cents; this checks that bad data does not throw`
reason: the test name and the assertions already say the rest, so the comment only adds the boundary they cannot
