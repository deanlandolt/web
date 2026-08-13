---
tags: [software, style, naming, essay]
---

# Elements of Style, Software Edition

Strunk & White's _Elements of Style_ is a hundred years old and still on
every writer's desk. It's short — forty-odd rules you can read in an
afternoon. It survives because style is about clarity, and clarity
doesn't go out of fashion.

Code has style too. Not the kind auto-formatters settle — tabs vs.
spaces is a debate that deserved to die, and prettier killed it — but
the deeper kind: how you name things, where you put things, what you
choose to make visible and what you choose to hide. The kind of style
that makes the difference between code a stranger can read and code
that only the author can love.

This is my attempt at a Strunk & White for software. Not a complete one
— just the entries I keep coming back to, the ones I find myself
repeating in code reviews. They're language-agnostic in spirit, even if
the examples are in whatever I was writing at the time. Add your own.

## Omit needless code

Strunk's most famous rule: _Omit needless words._ The software version
is the same, and it's the hardest one to follow.

Needless code is the variable that's only used once. The wrapper
function that adds nothing. The interface with one implementation. The
comment that says what the code already says. The abstraction you built
"for later" that never comes.

```js
// needless
const isReady = items.length > 0
if (isReady) { ... }

// better
if (items.length > 0) { ... }
```

But — and this is the hard part — don't omit the code that _explains_.
A well-named variable is documentation. `if (isReady)` is self-documenting
only if `isReady` means something more than `items.length > 0`. If it
does, keep it. If it doesn't, it's noise. The rule isn't "fewer lines";
it's "fewer concepts for the reader to track."

## Name things what they are

I encountered `const matched = value.match(regex)` in a code review.

Since the return value is generally called the "match object," you
should probably say:

```js
const match = value.match(regex)
```

`matched` implies it's a boolean predicate, not a match object. You want
nouns for names when you're talking about objects.

This is the whole game: names should reveal what the thing _is_, not
what you _did with it_. `matched` describes an action — "I matched it."
`match` describes the thing itself. When a reader encounters the name
three screens later, they don't remember your action; they need to know
what the variable _is_.

A few corollaries, collected from years of reviews:

- **Booleans are predicates or questions.** `isValid`, `hasAccess`,
  `canWrite`. Not `valid` (noun-ish) or `validation` (a process).
  `if (valid)` reads wrong; `if (isValid)` reads like English.
- **Collections are plural.** `users`, not `userList` — the type tells
  you it's a list. `userList` is the kind of name that begets
  `userListMap` and `userListMapArray`.
- **Functions are verbs.** `fetchUser`, not `userFetch` (that's a noun)
  and not `user` (that's just a variable).
- **Avoid negated names.** `isNotEmpty` will eventually show up in
  `if (!isNotEmpty(...))` and someone will stare at it for a full
  minute. Invert the logic, name it positively.
- **Don't encode the type in the name.** `userArray`, `countInt`,
  `nameString` — the type system already told us. This is called
  Hungarian notation and it was a solution to a problem we no longer
  have.

The meta-rule: read the name out loud. If it sounds like a sentence
fragment — "the _match_ object" — you're good. If it sounds like a
verb conjugation — "I _matched_" — you've named the action, not the
thing.

## Make the wrong thing hard

Good style doesn't just make the right thing easy; it makes the wrong
thing _visible_ — or better, impossible.

If a function has an optional parameter that must be set in certain
contexts, don't default it to a safe value and hope for the best. Make
it required. Force the caller to think.

```ts
// wrong thing is easy
function deleteUser(id: string, confirm = false) {
  if (confirm) { ... }
}
deleteUser('123') // oops

// wrong thing is impossible
function deleteUser(id: string, confirm: true) { ... }
// TypeError: Argument of type 'false' is not assignable to 'true'
```

This is the Make Illegal States Unrepresentable principle, and it's
the single biggest argument for type safety. If your types can describe
the thing that must be true, the compiler enforces your style for you.
You don't need a comment saying "don't pass null here" — the type
_is_ the comment, and the compiler _reads_ it.

## One function, one job

A function should do one thing. Not two things. Not one thing and a
half — "and also it logs." If you need three lines of comments to
explain what a function does, it does more than one thing.

The test: can you describe what the function does in a single sentence
without using the word "and"? If you can't, you have two functions.

```js
// does two things
function processOrder(order) {
  // validate
  if (!order.items.length) throw new Error('empty order')
  if (!order.email) throw new Error('no email')
  // save
  db.orders.insert(order)
  // notify
  email.send(order.email, 'Order received')
}

// each does one thing
const validateOrder = (order) => { ... }
const saveOrder = (order) => db.orders.insert(order)
const notifyCustomer = (order) => email.send(order.email, ...)

function processOrder(order) {
  validateOrder(order)
  saveOrder(order)
  notifyCustomer(order)
}
```

The composed version is longer in lines but shorter in _understanding_.
Each piece has a name. Each name tells you what it does. The top-level
function reads like a table of contents.

## Comments are apologies

A comment is a confession that the code couldn't speak for itself. A
good comment explains _why_ — the constraint, the business rule, the
gotcha that isn't visible in the code. A bad comment explains _what_ —
and the what is right there, one line above, in a language the computer
can already check.

```js
// bad: restates the code
i++ // increment i

// bad: explains the what, not the why
// Check if user is admin
if (user.role === 'admin') { ... }

// good: explains why this looks weird
// Admins bypass the quota because they need to bulk-import legacy data.
// See ticket #4082. Don't "fix" this without talking to ops.
if (user.role === 'admin') { ... }
```

The best comment is a rename. If you wrote a comment to explain a
variable, you named the variable wrong. If you wrote a comment to
explain a function, split the function. Comments that explain _why_
are precious — they capture knowledge that doesn't live in the code.
Comments that explain _what_ are debt.

## Early return, late surprise

The cleanest control flow reads top-to-bottom: handle the edge cases
first, then the happy path. This is the "guard clause" pattern, and it
flattens the pyramid of doom.

```js
// pyramid
function getuser(id) {
  if (id) {
    const user = db.find(id)
    if (user) {
      if (user.active) {
        return user.profile
      } else {
        return null
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

// flat
function getUser(id) {
  if (!id) return null
  const user = db.find(id)
  if (!user) return null
  if (!user.active) return null
  return user.profile
}
```

The flat version has no nesting, no `else`, no mystery about what
happens in the "other" branch. Each guard is a one-liner that says "if
this isn't true, we're done." The reader's eye slides straight down.

The corollary: never `return` from the middle of a function if you can
help it. One return at the end is easier to reason about — you know
exactly where the function exits. But don't let that push you back into
nesting. If early returns flatten the code, use them. Style is about
clarity, not dogma.

## Couple data, not control

Two functions that always get called together should probably be one
function. Two parameters that always get passed together should
probably be one object.

```js
// coupled parameters
function drawCircle(x, y, radius, color, lineWidth) { ... }
drawCircle(10, 20, 5, 'red', 2)

// coupled data
function drawCircle({ x, y, radius, color, lineWidth }) { ... }
drawCircle({ x: 10, y: 20, radius: 5, color: 'red', lineWidth: 2 })
```

The object version is longer, but every argument is labeled. You'll
never accidentally pass `2` thinking it's the radius when it's the
line width. And when you need to add a `fill` option, you add it to the
type, not to a growing positional argument list that every caller has
to count.

This is the "parameter object" refactor, and it's the single easiest
improvement to any function with more than three arguments. Three
positional arguments is a smell. Four is a bug waiting to happen.

## Consistency is a feature

If the codebase calls it `userId` here, call it `userId` everywhere. Not
`uid` in one file, `user_id` in another, `userid` in a third. Pick one.
Make it the convention. Enforce it with a linter if you have to.

Consistency is the cheapest form of documentation. A reader who has
seen `userId` a hundred times doesn't need to look up what `uid` means
in this one weird file. They already know. You've offloaded
comprehension from the brain to the habit.

This goes beyond names. If you return a `Result` type from one async
function, return it from all of them. If you throw for errors in the
data layer, don't suddenly return `null` in the service layer. Pick a
convention and let the codebase develop an accent — a consistent one,
not a patchwork of personal styles.

## Hide the machinery

Code is read more than it's written, but it's _scanned_ more than
it's read. Most of the time, the reader doesn't want to understand every
line — they want to find the line that matters. Good style hides the
machinery so the interesting bits stand out.

```js
// all machinery, no signal
const users = await db.query(
  'SELECT * FROM users WHERE active = $1 AND last_login > $2',
  [true, cutoffDate]
)

// the interesting bit is visible
const users = await usersRepo.findActive({ since: cutoffDate })
```

The first version forces you to read SQL to understand intent. The
second tells you what the code wants in three words. The SQL still
exists — it lives in `usersRepo`, where it belongs. The caller doesn't
need to know it's SQL, or that there's a database at all.

Abstraction is hiding machinery. The trick is knowing _what_ to hide:
hide the _how_, reveal the _what_. `findActive` reveals the what
(active users since a date) and hides the how (SQL, parameter binding,
connection pooling). That's the right cut. Hide too little and the
reader drowns in detail; hide too much and they can't follow the logic.

## The reader is always a stranger

Every style rule here comes back to one thing: the reader is always a
stranger. Not because they're new to the team, but because _you_ are
new to the code — six months from now, you won't remember writing it.

Write for that person. Name things so they don't have to scroll up.
Structure code so they don't have to scroll down. Hide what doesn't
matter so they can find what does. Leave comments for the things that
only you know right now, because right now is temporary.

Strunk's rule 17: _Omit needless words._ The software version: omit
needless concepts. Every name, every abstraction, every layer is a
concept the reader has to carry. Carry the ones that earn their weight.
Drop the rest.
---

_This is a living document. I'll keep adding entries as I keep having
code reviews. Suggestions welcome — especially the ones that start
"I encountered this in a code review…"_
