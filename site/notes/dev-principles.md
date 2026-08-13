---
tags: [software, engineering, principles, list]
---

# Dev Principles

A running list of principles I keep coming back to. It's a working document,
not a manifesto — additions and refinements welcome.

## Single source of truth

Denormalized or duplicative data — caching derived values, say — is
perfectly fine, so long as it's clear what constitutes the source of
truth. Split-brain kills.

The key word is _clear_. Most split-brain bugs don't come from
deliberate denormalization; they come from someone not realizing which
copy is the source and which is the cache. If you store a derived value,
annotate it: a comment, a name (`cachedFullName`, not `fullName`), a
type wrapper. Make it impossible to mistake the shadow for the thing.

And when the source changes, the cache must change too — immediately,
not eventually. If your cache invalidation is a manual step, it will be
forgotten. If it's a cron job, it's eventually consistent in the worst
sense: there's a window where the cache lies. The best cache is
ecomputed on read, or invalidated by the same transaction that wrote
the source. Everything else is a bug you haven't hit yet.

## Sweat the semantics

Auto-formatters have, hopefully, finally killed the pointless
formatting-and-whitespace debates. Being able to fully grok the
_semantics_ of code is what matters most. It's extremely hard to do this
completely in code — sometimes impossibly so.

Semantics is the gap between what the code _says_ and what it _means_.
`let x = 1` says "a variable that can be reassigned" but means "a
constant the author didn't think about." The type system can catch the
former; only a human (or a very good linter) catches the latter.

This is why I reach for types that encode intent. A `readonly` array
can't be mutated, so the reader knows it won't be. A branded type
(`type UserId = string & { readonly _brand: unique symbol }`) can't be
confused with a `string`, so the reader knows it's not just any string.
The more semantics you can push into the type system, the less the
reader has to hold in their head. The type system is a tool for
_externalizing_ semantics so they can be checked.

## Documentation as user guide

Bad docs are worse than useless — they're actively harmful. The best
docs are completely clear, legible code… or better yet, no code at all
(using the right data structures saves a lot of code). But for many
reasons that isn't always possible.

Every piece of software should come with a user guide of one form or
another: how to get started, what to look out for. This includes software
libraries, and possibly even internal, isolated utilities (these are
analogous to vendored libs).

The test for docs is the same as for code: would a stranger understand
it? The stranger here is the new team member, the future you, the open
source contributor at 2am. Write for them. If the docs explain what the
_code_ does, they're redundant (the code already says that). If they
explain what the code is _for_ — when to use it, when not to, what it
assumes, what it can't handle — they're essential.

## Think in terms of products, work in terms of projects

Personal preference — and an ADHD management strategy. Product
thinking helps make clear where everything fits (the _what_ and _why_).
Project thinking helps set clear objectives, deliverables, and
timelines (the _how_ and _when_).

The product is the thing that exists after the project ends. The
project is the effort to get there. Confusing the two is how you get
"we shipped the project" celebrations over products nobody uses. The
project is a means; the product is the end. Keep them separate in your
head and in your planning.

This also reframes technical debt. A project accumulates debt to ship
on time — that's fine, even smart. But the _product_ inherits that
debt. If you don't have a product view, the debt is invisible until it
isn't, and by then it's the next project's problem. Which is how
systems rot.

## Architecture is the stuff that's hard to change

Via [this talk](https://youtu.be/o-SvvUA7hik?t=282).

Architecture isn't the diagram on the whiteboard. It isn't the framework
you chose or the pattern you applied. Architecture is the decisions you
made that are now expensive to unmake. The database you picked. The
service boundary you drew. The API contract you published. Everything
else is just code — you can change it tomorrow. Architecture is what you
can't change without a migration, a deprecation, or a fight.

This is why the most important architectural decision is usually the one
you don't realize you're making. The choice of identity model. The
first service boundary. The moment you expose an API to a customer.
These decisions calcify fast, and they calcify harder the more people
build on top of them. So spend your architectural attention where the
decisions are irreversible — and don't sweat the ones that aren't. If it
lives behind an interface you control, it's not architecture yet. It's
just code.

## Functional core, imperative shell

Via [this talk](https://youtu.be/rPKohHGPqCY?t=2805), with respect to
Effect-TS.

The idea: push all the side effects — I/O, mutation, randomness, time —
to the edges of your program. The inside is pure: functions that take
values and return values, no surprises. The outside is a thin shell
that orchestrates the effects and feeds data to the core.

Why? Because pure functions are _testable_. You call them with inputs,
you check the outputs, done. No mocks, no setup, no teardown, no flaky
CI. The impure shell is small, so it's easy to test with a few
integration tests. The pure core is large, so it's easy to test with
hundreds of unit tests. You get the best of both worlds by keeping the
boundary sharp.

The hard part is discipline. It's _easier_ to reach for a side effect
mid-function — query the database, log the error, mutate the cache —
than it is to return a value describing what you _want_ done and let the
shell do it. But every side effect you sneak into the core is a test
you'll have to write a mock for. The discipline pays for itself the
first time you refactor the core and the tests don't break.

## Make it work, make it right, make it fast — in that order

Kent Beck's classic, and it's survived because it's true. But the
temptation is always to skip the middle step — to go straight from
"works" to "fast," because fast is fun and "right" feels like gold-
plating.

"Make it right" isn't about aesthetics. It's about the code being
correct _and_ clear enough that you can confidently change it. If you
skip it, you ship working-but-fragile code, and the first bug fix or
feature request cracks it. Then you're making it right anyway, except
now you're also debugging production.

"Make it fast" comes last, and only when you know it's too slow.
Measuring first. The fastest code is the code you didn't write. The
second fastest is the code you wrote once, correctly, and never had to
rewrite.

## Boring technology is a competitive advantage

The boring technology stack — the one everyone knows, the one with
Stack Overflow answers from 2014 that still work — lets you move fast
_on the things that matter_. When you pick boring tech, you spend your
novelty budget on the product, not the platform. When you pick exciting
tech, you spend it on the stack — debugging the framework, working
around the missing feature, being the edge case the maintainers haven't
seen yet.

This isn't anti-innovation. It's _strategic_ innovation. Save the
interesting tools for the parts of the system that are your competitive
advantage — the thing your product does that nobody else's does. For
everything else — the queue, the database, the auth layer — pick the
thing that's been running in production for a decade. It's boring
because it works, and it works because it's been stress-tested by
thousands of people who aren't you.

## The bug you don't have is the best bug

The cheapest bug to fix is the one the type system caught at compile
time. The second cheapest is the one the test caught in CI. The most
expensive is the one the customer caught in production.

Every layer of defense you add — types, tests, linters, code review,
canary deploys — shifts bugs left, from expensive to cheap. The goal
isn't zero bugs; it's catching them as early as possible, when they're
still made of thought and haven't yet become incidents.

This is why static analysis is worth the effort even when it feels
pedantic. A lint rule that prevents a whole class of bug is worth a
thousand tests that catch instances of it. The best bug is the one the
tooling made impossible.

## Optimize for deletion

Code is easier to delete than to fix. A function nobody calls can be
removed in one commit. A function everyone calls has to be maintained
forever. Design so that the things you might want to remove are easy to
remove: small interfaces, few dependencies, clear ownership.

This is the real argument against premature abstraction. An
abstraction is a promise to every caller that the interface won't
change. The more callers, the harder the promise is to keep. If you
abstract too early, you either break the promise (painful) or keep a
bad abstraction forever (worse). Wait until the pattern is repeated
enough that the abstraction is obvious. The duplication that precedes it
is information — it shows you what the abstraction should be.

## Know your invariants

Every system has invariants — things that must always be true. A
user always has exactly one primary email. An order's total is the sum
of its line items. A session token is valid until it expires. The
system works because these hold; it breaks when they don't.

Most bugs are invariant violations. The code that _checks_ the
invariant is your defense. The code that _maintains_ it is your
architecture. If you don't know what your invariants are, you can't
either check or maintain them — you're just hoping. Write them down.
Put them in types where you can. Assert them at the boundaries. When a
bug shows up, ask: which invariant did this violate, and where should we
have caught it?
